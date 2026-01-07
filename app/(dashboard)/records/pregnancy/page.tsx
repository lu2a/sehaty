'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function PregnancyLog() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  
  const [selectedMember, setSelectedMember] = useState('');
  const [formData, setFormData] = useState({
    gestational_week: '', weight: '', medications: '', urine_analysis: '', anemia_level: '', visit_date: '', notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // جلب الإناث فقط من الملفات
    const { data: members } = await supabase
      .from('medical_files')
      .select('id, full_name')
      .eq('user_id', user.id)
      .eq('gender', 'female'); // فلتر للإناث فقط

    if (members) {
        setFamilyMembers(members);
        if(members.length > 0) setSelectedMember(members[0].id);
    }

    const { data: logData } = await supabase
      .from('health_log_pregnancy')
      .select(`*, medical_files(full_name)`)
      .eq('user_id', user.id)
      .order('visit_date', { ascending: false });
    if (logData) setLogs(logData);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('health_log_pregnancy').insert({
      user_id: user?.id,
      medical_file_id: selectedMember,
      gestational_week: formData.gestational_week ? parseInt(formData.gestational_week) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      medications: formData.medications,
      urine_analysis: formData.urine_analysis,
      anemia_level: formData.anemia_level ? parseFloat(formData.anemia_level) : null,
      visit_date: formData.visit_date || new Date(),
      notes: formData.notes
    });

    if (!error) {
      setFormData({ gestational_week: '', weight: '', medications: '', urine_analysis: '', anemia_level: '', visit_date: '', notes: '' });
      fetchData();
      alert('تم حفظ بيانات المتابعة 🤰');
    }
  };

  return (
    <div className="p-6 dir-rtl max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-purple-900">🤰 سجل متابعة الحمل</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-8 border-t-4 border-purple-500">
        <h2 className="font-bold mb-4">بيانات زيارة الطبيب / المتابعة</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="col-span-full">
            <label className="block text-sm font-bold mb-1">الاسم:</label>
            <select className="input" value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
              {familyMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
          </div>

          <div>
             <label className="block text-sm font-bold mb-1">تاريخ الزيارة</label>
             <input type="date" className="input" value={formData.visit_date} onChange={e => setFormData({...formData, visit_date: e.target.value})} />
          </div>
           <div>
             <label className="block text-sm font-bold mb-1">عمر الحمل (بالأسبوع)</label>
             <input type="number" className="input" value={formData.gestational_week} onChange={e => setFormData({...formData, gestational_week: e.target.value})} />
          </div>

          <div>
             <label className="block text-sm font-bold mb-1">الوزن الحالي (كجم)</label>
             <input type="number" className="input" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
          </div>
           <div>
             <label className="block text-sm font-bold mb-1">نسبة الهيموجلوبين (Anemia)</label>
             <input type="number" className="input" value={formData.anemia_level} onChange={e => setFormData({...formData, anemia_level: e.target.value})} />
          </div>

          <div className="col-span-full">
             <label className="block text-sm font-bold mb-1">تحليل البول (زلال/صديد)</label>
             <input type="text" className="input" value={formData.urine_analysis} onChange={e => setFormData({...formData, urine_analysis: e.target.value})} />
          </div>
          
           <div className="col-span-full">
             <label className="block text-sm font-bold mb-1">الأدوية الموصوفة</label>
             <textarea className="input" value={formData.medications} onChange={e => setFormData({...formData, medications: e.target.value})} />
          </div>

          <button className="col-span-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700">حفظ 💾</button>
        </form>
      </div>

       {/* جدول السجلات */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-right whitespace-nowrap">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-4">التاريخ</th>
              <th className="p-4">الأسبوع</th>
              <th className="p-4">الوزن</th>
              <th className="p-4">التحاليل (دم/بول)</th>
              <th className="p-4">ملاحظات/أدوية</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-bold">{new Date(log.visit_date).toLocaleDateString('ar-EG')}</td>
                <td className="p-4 text-purple-700 font-bold">{log.gestational_week} أسبوع</td>
                <td className="p-4">{log.weight} كجم</td>
                <td className="p-4 text-sm">
                   {log.anemia_level && <span className="block text-red-600">HB: {log.anemia_level}</span>}
                   {log.urine_analysis && <span className="block text-gray-500">{log.urine_analysis}</span>}
                </td>
                <td className="p-4 text-sm max-w-xs truncate">{log.medications || log.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <style jsx>{`
        .input { @apply w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none; }
      `}</style>
    </div>
  );
}