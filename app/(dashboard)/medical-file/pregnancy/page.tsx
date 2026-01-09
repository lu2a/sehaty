'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Heart, Save } from 'lucide-react';

export default function PregnancyPage() {
  const supabase = createClient();
  const db: any = supabase;

  const [females, setFemales] = useState<any[]>([]);
  const [selectedFemale, setSelectedFemale] = useState('');
  const [visits, setVisits] = useState<any[]>([]);

  // Form
  const [form, setForm] = useState({
    weight_kg: '',
    gestational_week: '',
    blood_pressure: '',
    hemoglobin: '',
    urine_analysis: '',
    medications: '',
    ultrasound_notes: '',
    general_notes: ''
  });

  useEffect(() => {
    async function getFemales() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // نختار الزوجة أو النفس (إذا كانت المستخدمة أنثى) أو البنات
      const { data } = await db.from('medical_files')
        .select('id, full_name')
        .eq('user_id', user.id)
        .in('gender', ['female']); 
      
      if (data) {
        setFemales(data);
        if (data.length > 0) setSelectedFemale(data[0].id);
      }
    }
    getFemales();
  }, []);

  useEffect(() => {
    if (selectedFemale) {
      db.from('pregnancy_visits')
        .select('*')
        .eq('medical_file_id', selectedFemale)
        .order('visit_date', { ascending: false })
        .then(({ data }: any) => setVisits(data || []));
    }
  }, [selectedFemale]);

  async function handleSave() {
    if (!selectedFemale || !form.gestational_week) return alert('الرجاء إدخال البيانات الأساسية');
    const { data: { user } } = await supabase.auth.getUser();

    await db.from('pregnancy_visits').insert({
      medical_file_id: selectedFemale,
      user_id: user?.id,
      ...form
    });

    alert('تم حفظ الزيارة ✅');
    // Reload visits
    const { data } = await db.from('pregnancy_visits').select('*').eq('medical_file_id', selectedFemale).order('visit_date', { ascending: false });
    setVisits(data);
    // Reset necessary fields
    setForm({...form, ultrasound_notes: '', general_notes: ''});
  }

  return (
    <div className="p-4 min-h-screen dir-rtl font-cairo max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center text-pink-700 flex justify-center gap-2">
        <Heart className="fill-pink-600" /> سجل متابعة الحمل
      </h1>

      <div className="bg-white p-4 rounded-xl border">
        <label className="block font-bold mb-2">اسم الأم:</label>
        <select 
          className="w-full p-3 border rounded-lg"
          value={selectedFemale}
          onChange={(e) => setSelectedFemale(e.target.value)}
        >
          {females.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
        </select>
      </div>

      {selectedFemale && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* نموذج الزيارة */}
          <div className="md:col-span-1 bg-pink-50/50 p-6 rounded-xl border border-pink-200 h-fit">
            <h3 className="font-bold text-pink-800 mb-4">تسجيل زيارة / متابعة</h3>
            <div className="space-y-3">
              <input type="number" placeholder="عمر الحمل (بالأسبوع)" className="w-full p-2 rounded border" value={form.gestational_week} onChange={e => setForm({...form, gestational_week: e.target.value})} />
              <input type="number" placeholder="الوزن (كجم)" className="w-full p-2 rounded border" value={form.weight_kg} onChange={e => setForm({...form, weight_kg: e.target.value})} />
              <input type="text" placeholder="الضغط (مثال 120/80)" className="w-full p-2 rounded border" value={form.blood_pressure} onChange={e => setForm({...form, blood_pressure: e.target.value})} />
              <input type="number" placeholder="الهيموجلوبين" className="w-full p-2 rounded border" value={form.hemoglobin} onChange={e => setForm({...form, hemoglobin: e.target.value})} />
              <input type="text" placeholder="تحليل البول (زلال/سكر)" className="w-full p-2 rounded border" value={form.urine_analysis} onChange={e => setForm({...form, urine_analysis: e.target.value})} />
              <textarea placeholder="الأدوية الحالية..." className="w-full p-2 rounded border h-16" value={form.medications} onChange={e => setForm({...form, medications: e.target.value})}></textarea>
              <textarea placeholder="ملاحظات السونار..." className="w-full p-2 rounded border h-16" value={form.ultrasound_notes} onChange={e => setForm({...form, ultrasound_notes: e.target.value})}></textarea>
              
              <button onClick={handleSave} className="w-full bg-pink-600 text-white py-2 rounded font-bold hover:bg-pink-700">حفظ الزيارة</button>
            </div>
          </div>

          {/* سجل الزيارات */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-700">سجل الزيارات السابقة</h3>
            {visits.length === 0 && <p className="text-gray-400">لا توجد زيارات مسجلة.</p>}
            {visits.map((v: any) => (
              <div key={v.id} className="bg-white p-4 rounded-xl border shadow-sm hover:border-pink-300 transition">
                <div className="flex justify-between items-start mb-2 border-b pb-2">
                  <span className="font-bold text-pink-700">الأسبوع {v.gestational_week}</span>
                  <span className="text-xs text-gray-500">{new Date(v.visit_date).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">الوزن:</span> {v.weight_kg || '-'} كجم</p>
                  <p><span className="text-gray-500">الضغط:</span> {v.blood_pressure || '-'}</p>
                  <p><span className="text-gray-500">Hb:</span> {v.hemoglobin || '-'}</p>
                  <p><span className="text-gray-500">البول:</span> {v.urine_analysis || '-'}</p>
                </div>
                {(v.ultrasound_notes || v.medications) && (
                  <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                    {v.ultrasound_notes && <p><strong>📺 سونار:</strong> {v.ultrasound_notes}</p>}
                    {v.medications && <p><strong>💊 أدوية:</strong> {v.medications}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
