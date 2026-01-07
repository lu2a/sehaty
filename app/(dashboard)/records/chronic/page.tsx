'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function ChronicLog() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]); // لاختيار الشخص
  
  // Form Data
  const [selectedMember, setSelectedMember] = useState('');
  const [formData, setFormData] = useState({
    systolic: '', diastolic: '', sugar_level: '', sugar_type: 'random', notes: ''
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
        // تصحيح: استخدام as any للوصول للخاصية id
        if(members.length > 0) setSelectedMember((members[0] as any).id); 
    }

    // 2. جلب السجلات
    // تصحيح: استخدام as any مع الجدول
    const { data: logData } = await (supabase.from('health_log_chronic') as any)
      .select(`*, medical_files(full_name)`)
      .eq('user_id', user.id)
      .order('measured_at', { ascending: false });
      
    if (logData) setLogs(logData);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    // تصحيح: استخدام as any عند الإدخال
    const { error } = await (supabase.from('health_log_chronic') as any).insert({
      user_id: user?.id,
      medical_file_id: selectedMember,
      systolic: formData.systolic ? parseInt(formData.systolic) : null,
      diastolic: formData.diastolic ? parseInt(formData.diastolic) : null,
      sugar_level: formData.sugar_level ? parseInt(formData.sugar_level) : null,
      sugar_type: formData.sugar_type,
      notes: formData.notes
    });

    if (!error) {
      setFormData({ systolic: '', diastolic: '', sugar_level: '', sugar_type: 'random', notes: '' });
      fetchData();
      alert('تم تسجيل القياس ✅');
    }
  };

  return (
    <div className="p-6 dir-rtl max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-red-900">🩸 سجل الضغط والسكر</h1>

      {/* نموذج الإضافة */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 border-t-4 border-red-500">
        <h2 className="font-bold mb-4">تسجيل قراءة جديدة</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="col-span-full">
            <label className="block text-sm font-bold mb-1">القياس خاص بـ:</label>
            <select className="input" value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
              {familyMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
          </div>

          {/* قسم الضغط */}
          <div className="bg-red-50 p-4 rounded-lg">
             <h3 className="font-bold text-red-700 mb-2">ضغط الدم (mmHg)</h3>
             <div className="flex gap-2">
               <input type="number" placeholder="120 (الانقباضي)" className="input" value={formData.systolic} onChange={e => setFormData({...formData, systolic: e.target.value})} />
               <span className="self-center">/</span>
               <input type="number" placeholder="80 (الانبساطي)" className="input" value={formData.diastolic} onChange={e => setFormData({...formData, diastolic: e.target.value})} />
             </div>
          </div>

          {/* قسم السكر */}
          <div className="bg-blue-50 p-4 rounded-lg">
             <h3 className="font-bold text-blue-700 mb-2">السكر (mg/dL)</h3>
             <div className="flex gap-2 mb-2">
               <input type="number" placeholder="مثال: 110" className="input" value={formData.sugar_level} onChange={e => setFormData({...formData, sugar_level: e.target.value})} />
             </div>
             <select className="input" value={formData.sugar_type} onChange={e => setFormData({...formData, sugar_type: e.target.value})}>
               <option value="fasting">صائم (Fasting)</option>
               <option value="postprandial">فاطر (بعد الأكل)</option>
               <option value="random">عشوائي (Random)</option>
               <option value="hba1c">تراكمي (HbA1c)</option>
             </select>
          </div>

          <div className="col-span-full">
            <input type="text" placeholder="ملاحظات إضافية..." className="input" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <button className="col-span-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700">حفظ في السجل 💾</button>
        </form>
      </div>

      {/* جدول السجلات */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">التاريخ</th>
              <th className="p-4">الضغط</th>
              <th className="p-4">السكر</th>
              <th className="p-4">ملاحظات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold">{log.medical_files?.full_name}</td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(log.measured_at).toLocaleDateString('ar-EG')} <br/>
                  {new Date(log.measured_at).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                </td>
                <td className="p-4 dir-ltr text-right">
                  {log.systolic ? <span className="font-mono font-bold text-red-700">{log.systolic}/{log.diastolic}</span> : '-'}
                </td>
                <td className="p-4">
                  {log.sugar_level ? (
                    <div>
                      <span className="font-mono font-bold text-blue-700">{log.sugar_level}</span>
                      <span className="text-xs text-gray-500 mr-1">
                        ({log.sugar_type === 'fasting' ? 'صائم' : log.sugar_type === 'random' ? 'عشوائي' : log.sugar_type === 'hba1c' ? 'تراكمي' : 'فاطر'})
                      </span>
                    </div>
                  ) : '-'}
                </td>
                <td className="p-4 text-sm text-gray-500">{log.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .input { @apply w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none; }
      `}</style>
    </div>
  );
}
