'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyMedicalFile() {
  const supabase = createClient();
  const router = useRouter();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyFile();
  }, []);

  const fetchMyFile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // الحل هنا: تحويل الجدول إلى any
    const { data } = await (supabase.from('medical_files') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('relation', 'self') // نتأكد أنه ملفه الشخصي
      .single();

    if (data) {
      setFile(data);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-10 text-center">جاري تحميل ملفك الطبي... 📂</div>;

  if (!file) {
    return (
      <div className="p-10 text-center max-w-lg mx-auto mt-10 bg-white rounded-xl shadow-lg border border-red-100">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">لم تقم بإنشاء ملفك الطبي بعد</h2>
        <p className="text-gray-500 mb-6">للاستفادة من خدمات الاستشارات والذكاء الاصطناعي، يجب استكمال بياناتك الصحية أولاً.</p>
        <Link href="/medical-file/edit" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
          إنشاء الملف الطبي الآن
        </Link>
      </div>
    );
  }

  // دالة مساعدة لعرض نعم/لا
  const YesNo = (val: boolean) => val ? <span className="text-green-600 font-bold">نعم</span> : <span className="text-gray-500">لا</span>;

  return (
    <div className="p-6 max-w-4xl mx-auto dir-rtl min-h-screen pb-20">
      
      {/* رأس الصفحة */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 mb-1">ملفي الطبي 📋</h1>
          <p className="text-gray-500 text-sm">آخر تحديث: {new Date(file.updated_at).toLocaleDateString('ar-EG')}</p>
        </div>
        <Link 
          href="/medical-file/edit" 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow flex items-center gap-2"
        >
          <span>✏️</span> تعديل البيانات
        </Link>
      </div>

      {/* 1. البطاقة الشخصية */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 shadow-md flex-shrink-0">
          <img 
            src={file.avatar_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
            alt="avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-right w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{file.full_name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 bg-gray-50 p-4 rounded-xl">
            <div>
              <span className="block text-gray-500 text-xs">الرقم القومي</span>
              <span className="font-bold">{file.national_id || '-'}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs">السن</span>
              <span className="font-bold">
                {file.birth_date ? `${new Date().getFullYear() - new Date(file.birth_date).getFullYear()} سنة` : '-'}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs">النوع</span>
              <span className="font-bold">{file.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs">المهنة</span>
              <span className="font-bold">{file.job || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 2. الحالة الاجتماعية والاقتصادية */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-green-500">
          <h3 className="font-bold text-lg mb-4 text-green-800 flex items-center gap-2">💰 الحالة الاجتماعية</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">الحالة الاجتماعية:</span>
              <span className="font-bold">
                {file.marital_status === 'married' ? 'متزوج/ة' : file.marital_status === 'single' ? 'أعزب/ة' : file.marital_status}
              </span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">أفراد الأسرة:</span>
              <span className="font-bold">{file.family_members_count}</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">رب أسرة:</span>
              {YesNo(file.is_family_head)}
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">تأمين صحي:</span>
              {YesNo(file.has_insurance)}
            </li>
             <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">دخل ثابت:</span>
              {YesNo(file.has_fixed_income)}
            </li>
          </ul>
        </div>

        {/* 3. القياسات والعادات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-purple-500">
          <h3 className="font-bold text-lg mb-4 text-purple-800 flex items-center gap-2">📏 القياسات والعادات</h3>
          <div className="grid grid-cols-2 gap-4 mb-4 text-center">
            <div className="bg-purple-50 p-3 rounded-lg">
              <span className="block text-xs text-purple-600">الوزن</span>
              <span className="font-bold text-xl">{file.weight || '-'} <small>{file.weight_unit}</small></span>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <span className="block text-xs text-purple-600">الطول</span>
              <span className="font-bold text-xl">{file.height || '-'} <small>سم</small></span>
            </div>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">التدخين:</span>
              <span className={`font-bold ${file.smoking_status === 'smoker' ? 'text-red-600' : 'text-green-600'}`}>
                {file.smoking_status === 'smoker' ? 'مدخن 🚬' : file.smoking_status === 'ex_smoker' ? 'مدخن سابق' : 'غير مدخن'}
              </span>
            </li>
             <li className="flex justify-between border-b pb-2">
              <span className="text-gray-600">مستكمل التطعيمات:</span>
              {YesNo(file.is_vaccinated)}
            </li>
          </ul>
        </div>

        {/* 4. الحالة الصحية (الأهم) */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border-t-4 border-red-500">
          <h3 className="font-bold text-lg mb-4 text-red-800 flex items-center gap-2">🩺 السجل الطبي</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">أمراض مزمنة</h4>
              <div className="flex flex-wrap gap-2">
                {file.chronic_diseases && file.chronic_diseases.length > 0 ? (
                  file.chronic_diseases.map((d: string) => (
                    <span key={d} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm border border-red-200">{d}</span>
                  ))
                ) : (
                   <span className="text-gray-400 text-sm">لا يوجد</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">الحساسية</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">أدوية:</span> {file.drug_allergies_details || 'لا يوجد'}</p>
                <p><span className="text-gray-500">أطعمة:</span> {file.food_allergies_details || 'لا يوجد'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">عمليات سابقة</h4>
              <p className="text-sm bg-gray-50 p-2 rounded">{file.surgeries_details || 'لا يوجد'}</p>
            </div>
            
             <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">تاريخ عائلي</h4>
              <p className="text-sm bg-gray-50 p-2 rounded">{file.family_medical_history || 'لا يوجد'}</p>
            </div>
          </div>
        </div>
        
        {/* 5. البيئة المنزلية */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border-t-4 border-yellow-500">
          <h3 className="font-bold text-lg mb-4 text-yellow-800 flex items-center gap-2">🏠 البيئة المحيطة</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
             <div className="flex items-center gap-2">
               {YesNo(file.has_good_ventilation)} <span>تهوية جيدة</span>
             </div>
             <div className="flex items-center gap-2">
               {YesNo(file.has_clean_water)} <span>مياه نظيفة</span>
             </div>
              <div className="flex items-center gap-2">
               {YesNo(file.has_barn)} <span>يوجد حظيرة</span>
             </div>
              <div className="flex items-center gap-2">
               {YesNo(file.has_birds_livestock)} <span>طيور/ماشية</span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
