'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// استيراد الأيقونات الحديثة
import { 
  FileText, 
  Activity, 
  Users, 
  Calculator, 
  Stethoscope, 
  ArrowLeft 
} from 'lucide-react';

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

      const { data: files, error } = await supabase
        .from('medical_files')
        .select('id, full_name')
        .eq('user_id', user.id)
        .eq('relation', 'self')
        .single();

      if (error || !files) {
        router.push('/create-medical-file');
      } else {
        // (files as any) لتجنب أخطاء التايب سكريبت
        setProfileName((files as any).full_name);
        setLoading(false);
      }
    }

    checkMedicalFile();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-bold text-slate-600">جاري تحميل بياناتك الصحية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 dir-rtl min-h-screen bg-slate-50 font-cairo">
      
      {/* ترويسة الصفحة */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-1">أهلاً بك، {profileName} 👋</h1>
          <p className="text-slate-500">نتمنى لك دوام الصحة والعافية. ماذا تود أن تفعل اليوم؟</p>
        </div>
        <Link href="/consultations/new" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition flex items-center gap-2">
          <Stethoscope className="w-5 h-5" />
          <span>طلب استشارة جديدة</span>
        </Link>
      </header>
      
      {/* شبكة البطاقات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. كارت السجلات والمتابعة (الجديد) */}
        <Link href="/records" className="block group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-green-200 transition-all h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">السجلات والمتابعة</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              سجل قراءات الضغط، السكر، متابعة الحمل، ونمو أطفالك في مكان واحد.
            </p>
          </div>
        </Link>

        {/* 2. كارت الحاسبات الطبية */}
        <Link href="/calculators" className="block group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6" />
              </div>
              <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">الحاسبات الطبية</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              أدوات ذكية لحساب مؤشر الكتلة، موعد الولادة، وجرعات أدوية الأطفال.
            </p>
          </div>
        </Link>

        {/* 3. كارت ملفات الأسرة */}
        <Link href="/family" className="block group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-purple-200 transition-all h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">ملفات الأسرة</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              إدارة الملفات الطبية لأفراد عائلتك لسهولة طلب الاستشارات لهم.
            </p>
          </div>
        </Link>

        {/* 4. كارت الملف الشخصي (عرض عريض) */}
        <Link href="/medical-file" className="block group md:col-span-2 lg:col-span-3">
          <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg hover:bg-slate-900 transition-all relative overflow-hidden">
            {/* زخرفة خلفية */}
            <FileText className="absolute -left-6 -bottom-6 w-40 h-40 text-white opacity-5" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">ملفي الطبي الشامل</h3>
                <p className="text-slate-300 text-sm">عرض وتحديث بياناتك الشخصية، التاريخ المرضي، والحساسية.</p>
              </div>
              <div className="mr-auto">
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
