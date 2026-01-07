'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function ChildLog() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  
  // Form Data
  const [selectedMember, setSelectedMember] = useState('');
  const [formData, setFormData] = useState({
    height: '', weight: '', head_circumference: '', vaccinations: '', anemia_level: '', notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. جلب أفراد الأسرة
    const { data: members } = await supabase.from('medical_files').select('id, full_name').eq('user_id', user.id);
    if (members) {
        setFamilyMembers(members);
        // الحل هنا: استخدام as any للوصول للخاصية id
        if(members.length > 0) setSelectedMember((members[0] as any).id);
    }

    // 2. جلب السجلات (تحويل الجدول لـ any للأمان)
    const { data: logData } = await (supabase
      .from('health_log_child') as any)
      .select(`*, medical_files(full_name)`)
      .eq('user_id', user.id)
      .order('measured_at', { ascending: false });
      
    if (logData) setLogs(logData);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    // الحل هنا: استخدام as any عند الإدخال
    const { error } = await (supabase.from('health_log_child') as any).insert({
      user_id: user?.id,
      medical_file_id: selectedMember,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      head_circumference: formData.head_circumference ? parseFloat(formData.head_circumference) : null,
      vaccinations: formData.vaccinations,
      anemia_level: formData.anemia_level ? parseFloat(formData.anemia_level) : null,
      notes: formData.notes
    });

    if (!error) {
      setFormData({ height: '', weight: '', head_circumference: '', vaccinations: '', anemia_level: '', notes: '' });
      fetchData();
      alert('تم حفظ بيانات الطفل ✅');
    }
  };

  return (
    <div className="p-6 dir-rtl max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">👶 سجل صحة الطفل والنمو</h1>

      {/* نموذج الإضافة */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 border-t-4 border-pink-400">
        <h2 className="font-bold mb-4">تسجيل متابعة جديدة</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="col-span-full">
            <label className="block text-sm font-bold mb-1">اسم الطفل:</label>
            <select className="input" value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
              {familyMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
          </div>

          <div>
             <label className="block text-sm font-bold mb-1">الطول (سم)</label>
             <input type="number" className="input" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-bold mb-1">الوزن (كجم)</label>
             <input type="number" className="input" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-bold mb-1">محيط الرأس (سم)</label>
             <input type="number" className="input" value={formData.head_circumference} onChange={e => setFormData({...formData, head_circumference: e.target.value})} />
          </div>

          <div className="col-span-full md:col-span-2">
             <label className="block text-sm font-bold mb-1">تطعيمات (تم أخذها اليوم)</label>
             <input type="text" placeholder="مثل: شلل الأطفال، الثلاثي..." className="input" value={formData.vaccinations} onChange={e => setFormData({...formData, vaccinations: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-bold mb-1">تحليل أنيميا (HB)</label>
             <input type="number" className="input" value={formData.anemia_level} onChange={e => setFormData({...formData, anemia_level: e.target.value})} />
          </div>

          <div className="col-span-full">
            <textarea placeholder="ملاحظات أخرى عن صحة الطفل..." className="input h-20" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <button className="col-span-full bg-pink-500 text-white py-3 rounded-lg font-bold hover:bg-pink-600">حفظ المتابعة 💾</button>
        </form>
      </div>

      {/* جدول السجلات */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-right whitespace-nowrap">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-4">الطفل</th>
              <th className="p-4">التاريخ</th>
              <th className="p-4">القياسات (طول/وزن/رأس)</th>
              <th className="p-4">تطعيمات</th>
              <th className="p-4">أنيميا</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold">{log.medical_files?.full_name}</td>
                <td className="p-4 text-sm text-gray-500">{new Date(log.measured_at).toLocaleDateString('ar-EG')}</td>
                <td className="p-4 text-sm">
                  {log.height && <span className="ml-2 bg-blue-50 px-1 rounded text-blue-700">{log.height} سم</span>}
                  {log.weight && <span className="ml-2 bg-green-50 px-1 rounded text-green-700">{log.weight} كجم</span>}
                  {log.head_circumference && <span className="bg-yellow-50 px-1 rounded text-yellow-700">{log.head_circumference} سم</span>}
                </td>
                <td className="p-4 text-sm">{log.vaccinations || '-'}</td>
                <td className="p-4 text-sm font-bold text-red-600">{log.anemia_level || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <style jsx>{`
        .input { @apply w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 outline-none; }
      `}</style>
    </div>
  );
}
