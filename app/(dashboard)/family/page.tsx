'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import AddFamilyMember from '@/components/medical-file/AddFamilyMember';

export default function FamilyPage() {
  const supabase = createClient();
  const [family, setFamily] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchFamily();
  }, []);

  const fetchFamily = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // تصحيح: تحويل الجدول لـ any
      const { data } = await (supabase.from('medical_files') as any)
        .select('*')
        .eq('user_id', user.id)
        .neq('relation', 'self'); // استبعاد الملف الشخصي
      if (data) setFamily(data);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ملفات الأسرة</h1>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          {showAdd ? 'إلغاء' : '+ إضافة فرد'}
        </button>
      </div>

      {showAdd && (
        <div className="mb-8 p-4 bg-white rounded shadow">
          <AddFamilyMember onSuccess={() => { setShowAdd(false); fetchFamily(); }} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {family.length === 0 && !showAdd && <p className="text-gray-500">لا يوجد أفراد مضافين.</p>}
        
        {family.map((member) => (
          <div key={member.id} className="bg-white p-4 rounded-lg shadow border-r-4 border-green-500">
            <h3 className="font-bold text-lg">{member.full_name}</h3>
            <p className="text-gray-600 text-sm">الصلة: {member.relation}</p>
            <p className="text-gray-400 text-xs mt-2">تاريخ الميلاد: {member.birth_date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
