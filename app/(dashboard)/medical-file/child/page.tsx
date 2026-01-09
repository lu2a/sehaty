'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Baby, Save, Ruler, Weight, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ChildGrowthPage() {
  const supabase = createClient();
  const db: any = supabase; // لتجاوز أخطاء التايب

  const [childrenFiles, setChildrenFiles] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [records, setRecords] = useState<any[]>([]);
  
  // Form Inputs
  const [formData, setFormData] = useState({
    height_cm: '',
    weight_kg: '',
    head_circumference_cm: '',
    vaccinations: '',
    notes: ''
  });

  // 1. جلب قائمة الأطفال من ملفات الأسرة
  useEffect(() => {
    async function getChildren() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await db.from('medical_files')
        .select('id, full_name, birth_date')
        .eq('user_id', user.id)
        .in('relation', ['son', 'daughter']); // نختار الأبناء فقط
      
      if (data) {
        setChildrenFiles(data);
        if (data.length > 0) setSelectedChild(data[0].id); // اختيار أول طفل تلقائياً
      }
    }
    getChildren();
  }, []);

  // 2. جلب سجلات الطفل المحدد
  useEffect(() => {
    if (selectedChild) fetchRecords();
  }, [selectedChild]);

  async function fetchRecords() {
    const { data } = await db.from('child_growth_records')
      .select('*')
      .eq('medical_file_id', selectedChild)
      .order('record_date', { ascending: true });
    if (data) setRecords(data);
  }

  // 3. الحفظ
  async function handleSave() {
    if (!selectedChild || !formData.weight_kg) return alert('البيانات الأساسية مطلوبة');
    const { data: { user } } = await supabase.auth.getUser();

    await db.from('child_growth_records').insert({
      medical_file_id: selectedChild,
      user_id: user?.id,
      ...formData
    });

    alert('تم حفظ بيانات النمو ✅');
    setFormData({ height_cm: '', weight_kg: '', head_circumference_cm: '', vaccinations: '', notes: '' });
    fetchRecords();
  }

  return (
    <div className="p-4 min-h-screen dir-rtl font-cairo max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center text-blue-800 flex justify-center gap-2">
        <Baby /> سجل نمو الأطفال
      </h1>

      {/* اختيار الطفل */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <label className="block font-bold mb-2">اختر الطفل:</label>
        <select 
          className="w-full p-3 border rounded-lg bg-gray-50"
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
        >
          {childrenFiles.map(child => (
            <option key={child.id} value={child.id}>{child.full_name}</option>
          ))}
        </select>
        {childrenFiles.length === 0 && <p className="text-red-500 text-sm mt-2">لا يوجد أطفال مسجلين في "ملفاتي الطبية"</p>}
      </div>

      {selectedChild && (
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* نموذج الإدخال */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 h-fit">
            <h3 className="font-bold mb-4 text-blue-700">تسجيل قراءة جديدة</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500">الطول (سم)</label>
                  <input type="number" className="w-full p-2 border rounded" value={formData.height_cm} onChange={e => setFormData({...formData, height_cm: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500">الوزن (كجم)</label>
                  <input type="number" className="w-full p-2 border rounded" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: e.target.value})} />
                </div>
              </div>
              <div>
                 <label className="text-xs font-bold text-gray-500">محيط الرأس (سم)</label>
                 <input type="number" className="w-full p-2 border rounded" value={formData.head_circumference_cm} onChange={e => setFormData({...formData, head_circumference_cm: e.target.value})} />
              </div>
              <div>
                 <label className="text-xs font-bold text-gray-500">تطعيمات جديدة</label>
                 <input type="text" className="w-full p-2 border rounded" placeholder="مثال: شلل الأطفال" value={formData.vaccinations} onChange={e => setFormData({...formData, vaccinations: e.target.value})} />
              </div>
              <textarea 
                className="w-full p-2 border rounded h-20" 
                placeholder="ملاحظات..." 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
              ></textarea>
              <button onClick={handleSave} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">حفظ السجل</button>
            </div>
          </div>

          {/* الرسم البياني والجدول */}
          <div className="space-y-6">
            
            {/* Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm border h-80">
               <h3 className="font-bold mb-2 text-sm text-gray-600">منحنى النمو (الوزن والطول)</h3>
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={records}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="record_date" tickFormatter={(str) => new Date(str).toLocaleDateString('ar-EG')} />
                   <YAxis yAxisId="left" />
                   <YAxis yAxisId="right" orientation="right" />
                   <Tooltip />
                   <Legend />
                   <Line yAxisId="left" type="monotone" dataKey="weight_kg" name="الوزن" stroke="#8884d8" activeDot={{ r: 8 }} />
                   <Line yAxisId="right" type="monotone" dataKey="height_cm" name="الطول" stroke="#82ca9d" />
                 </LineChart>
               </ResponsiveContainer>
            </div>

            {/* History List */}
            <div className="bg-white p-4 rounded-xl shadow-sm border max-h-60 overflow-y-auto">
               <h3 className="font-bold mb-2 text-sm text-gray-600">السجلات السابقة</h3>
               {records.map((rec: any) => (
                 <div key={rec.id} className="text-sm border-b py-2">
                   <div className="flex justify-between font-bold">
                     <span>📅 {new Date(rec.record_date).toLocaleDateString('ar-EG')}</span>
                     <span>{rec.weight_kg} كجم</span>
                   </div>
                   {rec.vaccinations && <p className="text-green-600 text-xs mt-1">💉 {rec.vaccinations}</p>}
                 </div>
               ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
