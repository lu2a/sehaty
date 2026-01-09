'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Calendar, Droplet, User, Save, Trash2 } from 'lucide-react';

export default function MenstrualCyclePage() {
  const supabase = createClient();
  const db: any = supabase; // لتجاوز قيود TypeScript

  const [females, setFemales] = useState<any[]>([]);
  const [selectedFemale, setSelectedFemale] = useState('');
  const [cycles, setCycles] = useState<any[]>([]);

  // Form Data
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    pain_level: '1', // 1 to 10
    flow_intensity: 'medium', // light, medium, heavy
    notes: ''
  });

  // 1. جلب الإناث فقط من الأسرة
  useEffect(() => {
    async function getFemales() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await db.from('medical_files')
        .select('id, full_name')
        .eq('user_id', user.id)
        .in('gender', ['female']); // فلترة الإناث فقط
      
      if (data) {
        setFemales(data);
        if (data.length > 0) setSelectedFemale(data[0].id);
      }
    }
    getFemales();
  }, []);

  // 2. جلب السجلات
  useEffect(() => {
    if (selectedFemale) fetchCycles();
  }, [selectedFemale]);

  async function fetchCycles() {
    const { data } = await db.from('menstrual_cycles')
      .select('*')
      .eq('medical_file_id', selectedFemale)
      .order('start_date', { ascending: false });
    if (data) setCycles(data);
  }

  // 3. الحفظ
  async function handleSave() {
    if (!selectedFemale || !formData.start_date) return alert('تاريخ البدء مطلوب');
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await db.from('menstrual_cycles').insert({
      medical_file_id: selectedFemale,
      user_id: user?.id,
      ...formData
    });

    if (!error) {
      alert('تم حفظ السجل 🌸');
      setFormData({ start_date: '', end_date: '', pain_level: '1', flow_intensity: 'medium', notes: '' });
      fetchCycles();
    }
  }

  // 4. الحذف
  async function handleDelete(id: string) {
    if(!confirm('حذف هذا السجل؟')) return;
    await db.from('menstrual_cycles').delete().eq('id', id);
    setCycles(cycles.filter(c => c.id !== id));
  }

  return (
    <div className="p-4 min-h-screen dir-rtl font-cairo max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center text-rose-700 flex justify-center gap-2">
        <Droplet className="fill-rose-600 text-rose-600" /> سجل الدورة الشهرية
      </h1>

      {/* اختيار الفرد */}
      <div className="bg-white p-4 rounded-xl border border-rose-100">
        <label className="flex items-center gap-2 font-bold mb-2 text-gray-700">
           <User size={18}/> اختر الاسم:
        </label>
        <select 
          className="w-full p-3 border rounded-lg bg-rose-50/30 focus:ring-rose-200"
          value={selectedFemale}
          onChange={(e) => setSelectedFemale(e.target.value)}
        >
          {females.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
        </select>
        {females.length === 0 && <p className="text-gray-400 text-sm mt-2">لا يوجد إناث مسجلات في ملف العائلة.</p>}
      </div>

      {selectedFemale && (
        <div className="grid gap-6">
          
          {/* نموذج الإضافة */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-rose-100">
            <h3 className="font-bold text-rose-800 mb-4 text-sm">تسجيل دورة جديدة</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">تاريخ البدء</label>
                <input type="date" className="w-full p-2 border rounded-lg" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">تاريخ الانتهاء (اختياري)</label>
                <input type="date" className="w-full p-2 border rounded-lg" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                 <label className="text-xs font-bold text-gray-500 mb-1 block">شدة الألم (1-10)</label>
                 <select className="w-full p-2 border rounded-lg" value={formData.pain_level} onChange={e => setFormData({...formData, pain_level: e.target.value})}>
                   {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                 </select>
              </div>
              <div>
                 <label className="text-xs font-bold text-gray-500 mb-1 block">غزارة الدم</label>
                 <select className="w-full p-2 border rounded-lg" value={formData.flow_intensity} onChange={e => setFormData({...formData, flow_intensity: e.target.value})}>
                   <option value="light">خفيف</option>
                   <option value="medium">متوسط</option>
                   <option value="heavy">غزير</option>
                 </select>
              </div>
            </div>

            <textarea 
              className="w-full p-2 border rounded-lg h-20 mb-4" 
              placeholder="ملاحظات وأعراض..." 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})}
            ></textarea>

            <button onClick={handleSave} className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200">
              حفظ البيانات
            </button>
          </div>

          {/* السجل السابق */}
          <div className="space-y-3">
             <h3 className="font-bold text-gray-600 text-sm">السجلات السابقة</h3>
             {cycles.length === 0 && <p className="text-center text-gray-400 py-4">لا توجد سجلات سابقة</p>}
             
             {cycles.map((cycle) => (
               <div key={cycle.id} className="bg-white p-4 rounded-xl border border-rose-50 shadow-sm flex justify-between items-center group">
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <Calendar size={16} className="text-rose-400"/>
                     <span className="font-bold text-gray-800">{new Date(cycle.start_date).toLocaleDateString('ar-EG')}</span>
                     {cycle.end_date && <span className="text-xs text-gray-400">إلى {new Date(cycle.end_date).toLocaleDateString('ar-EG')}</span>}
                   </div>
                   <div className="flex gap-2 text-xs">
                     <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded">ألم: {cycle.pain_level}/10</span>
                     <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                       {cycle.flow_intensity === 'heavy' ? 'غزير' : cycle.flow_intensity === 'medium' ? 'متوسط' : 'خفيف'}
                     </span>
                   </div>
                 </div>
                 <button onClick={() => handleDelete(cycle.id)} className="text-gray-300 hover:text-red-500 transition">
                   <Trash2 size={18} />
                 </button>
               </div>
             ))}
          </div>

        </div>
      )}
    </div>
  );
}
