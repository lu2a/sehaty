'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, FileText, Activity, HeartPulse, Weight, ArrowRight, Calendar, AlertCircle
} from 'lucide-react';

export default function PatientFileView() {
  const { id } = useParams(); // هذا هو ID الملف الطبي (medical_file_id)
  const supabase = createClient();
  const router = useRouter();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFile = async () => {
      // جلب الملف الطبي
      const { data, error } = await supabase
        .from('medical_files')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setFile(data);
      setLoading(false);
    };
    fetchFile();
  }, [id]);

  if (loading) return <div className="p-10 text-center">جاري تحميل الملف...</div>;
  if (!file) return <div className="p-10 text-center text-red-500">الملف غير موجود</div>;

  return (
    <div className="p-6 dir-rtl font-cairo max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="bg-white p-2 rounded-xl border hover:bg-gray-50">
          <ArrowRight />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">الملف الطبي: {file.full_name}</h1>
      </div>

      {/* Basic Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4">
          <div className="bg-white p-3 rounded-full text-blue-600 shadow-sm"><User size={24}/></div>
          <div>
            <p className="text-sm text-blue-600 font-bold">السن والجنس</p>
            <p className="text-xl font-bold text-slate-800">
               {new Date().getFullYear() - new Date(file.birth_date).getFullYear()} سنة - {file.gender === 'male' ? 'ذكر' : 'أنثى'}
            </p>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-4">
          <div className="bg-white p-3 rounded-full text-green-600 shadow-sm"><Weight size={24}/></div>
          <div>
            <p className="text-sm text-green-600 font-bold">الوزن والطول</p>
            <p className="text-xl font-bold text-slate-800">{file.weight || '--'} كجم / {file.height || '--'} سم</p>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 flex items-center gap-4">
          <div className="bg-white p-3 rounded-full text-purple-600 shadow-sm"><HeartPulse size={24}/></div>
          <div>
            <p className="text-sm text-purple-600 font-bold">فصيلة الدم</p>
            <p className="text-xl font-bold text-slate-800">{file.blood_type || 'غير محدد'}</p>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* الأمراض المزمنة */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-600">
            <AlertCircle size={20}/> الأمراض المزمنة والحساسية
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">أمراض مزمنة:</label>
              <p className="font-medium">{file.chronic_diseases ? 'يوجد سجل مرضي' : 'لا يوجد'}</p>
              {file.chronic_diseases_details && <p className="text-sm bg-red-50 p-2 rounded mt-1 text-red-700">{file.chronic_diseases_details}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">حساسية:</label>
              <p className="font-medium">{file.allergies ? 'يوجد حساسية' : 'لا يوجد'}</p>
              {file.allergies_details && <p className="text-sm bg-orange-50 p-2 rounded mt-1 text-orange-700">{file.allergies_details}</p>}
            </div>
          </div>
        </div>

        {/* العمليات والتدخين */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
            <Activity size={20}/> التاريخ الجراحي والعادات
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">عمليات جراحية سابقة:</label>
              <p className="font-medium">{file.surgeries || 'لا يوجد'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">التدخين:</label>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${file.smoking ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {file.smoking ? 'مدخن' : 'غير مدخن'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
