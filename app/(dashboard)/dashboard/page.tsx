'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // تأكد من استيراده

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    async function checkMedicalFile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // التحقق من وجود ملف طبي من نوع 'self'
      const { data: files, error } = await supabase
        .from('medical_files')
        .select('id, full_name')
        .eq('user_id', user.id)
        .eq('relation', 'self')
        .single();

      if (error || !files) {
        // لا يوجد ملف طبي -> توجيه إجباري
        router.push('/create-medical-file');
      } else {
        setProfileName(files.full_name);
        setLoading(false);
      }
    }

    checkMedicalFile();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl">جاري تحميل بياناتك الصحية...</p>
      </div>
    );
  }

  return (
    <div className="p-8 dir-rtl">
      <h1 className="text-2xl font-bold mb-6">أهلاً بك، {profileName}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* بطاقة طلب استشارة */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500 cursor-pointer hover:shadow-lg transition">
          <h3 className="text-lg font-bold mb-2">استشارة طبية جديدة</h3>
          <p className="text-gray-600 text-sm">تحدث مع طبيب أو احصل على تحليل بالذكاء الاصطناعي.</p>
          <button className="mt-4 text-blue-600 font-semibold text-sm">ابدأ الآن &larr;</button>
        </div>
{/* أزرار الوصول السريع */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  
  {/* زر الملف الطبي (الذي طلبته) */}
  <Link href="/medical-file" className="block group">
    <div className="bg-white p-6 rounded-xl shadow border-r-4 border-blue-600 hover:shadow-lg transition flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition">📂</div>
      <div>
        <h3 className="font-bold text-gray-800">ملفي الطبي</h3>
        <p className="text-gray-500 text-xs">عرض وتعديل بياناتي الأساسية</p>
      </div>
    </div>
  </Link>

  {/* زر السجلات الصحية (الجديد) */}
  <Link href="/records" className="block group">
    <div className="bg-white p-6 rounded-xl shadow border-r-4 border-green-600 hover:shadow-lg transition flex items-center gap-4">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition">📈</div>
      <div>
        <h3 className="font-bold text-gray-800">السجلات والمتابعة</h3>
        <p className="text-gray-500 text-xs">الضغط، السكر، الحمل، الأطفال</p>
      </div>
    </div>
  </Link>

  {/* زر ملفات الأسرة */}
  <Link href="/medical-file/family" className="block group">
    <div className="bg-white p-6 rounded-xl shadow border-r-4 border-purple-600 hover:shadow-lg transition flex items-center gap-4">
      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition">👨‍👩‍👧‍👦</div>
      <div>
        <h3 className="font-bold text-gray-800">أفراد الأسرة</h3>
        <p className="text-gray-500 text-xs">إدارة ملفات الأبناء والزوجة</p>
      </div>
    </div>
  </Link>
</div>
        {/* بطاقة الملفات العائلية */}
<Link href="/family" className="block">
  <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500 cursor-pointer hover:shadow-lg transition h-full">
    <h3 className="text-lg font-bold mb-2">ملفات الأسرة</h3>
    <p className="text-gray-600 text-sm">أضف ملفاً لابنك أو زوجتك لطلب استشارة لهم.</p>
  </div>
</Link>

        {/* بطاقة الحاسبات الطبية (متاحة للجميع كما طلبت) */}
<Link href="/calculators" className="block">
  <div className="bg-white p-6 rounded-lg shadow border-t-4 border-purple-500 cursor-pointer hover:shadow-lg transition h-full">
    <h3 className="text-lg font-bold mb-2">الحاسبات الطبية</h3>
    <p className="text-gray-600 text-sm">مؤشر كتلة الجسم، الحمل، وغيرها.</p>
  </div>
</Link>
      </div>
    </div>
  );
}