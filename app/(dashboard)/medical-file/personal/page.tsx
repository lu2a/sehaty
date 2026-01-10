'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { FileText, User } from 'lucide-react';
import Link from 'next/link';

export default function PersonalFilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // نجلب الملف الطبي الخاص بالمستخدم نفسه (relation = self)
        const { data } = await (supabase.from('medical_files') as any)
          .select('*')
          .eq('user_id', user.id)
          .eq('relation', 'self')
          .single();
        setProfile(data);
      }
    }
    getData();
  }, []);

  if (!profile) return (
    <div className="p-8 text-center">
      <p className="mb-4">لم يتم العثور على ملف شخصي.</p>
      <Link href="/medical-file/new" className="text-blue-600 underline">إنشاء ملف جديد</Link>
    </div>
  );

  return (
    <div className="p-6 font-cairo dir-rtl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText className="text-blue-600"/> ملفي الطبي الشخصي
      </h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
            {profile.full_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.full_name}</h2>
            <p className="text-gray-500 text-sm">فصيلة الدم: {profile.blood_type || 'غير محدد'}</p>
          </div>
        </div>
        
        {/* يمكن إضافة باقي التفاصيل هنا (الأمراض المزمنة، إلخ) */}
        <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-gray-400">تاريخ الميلاد</p>
                <p className="font-bold">{profile.birth_date || '-'}</p>
             </div>
             <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-gray-400">النوع</p>
                <p className="font-bold">{profile.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
             </div>
        </div>
      </div>
    </div>
  );
}
