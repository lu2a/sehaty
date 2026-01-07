'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function PrescriptionA4() {
  const supabase = createClient();
  const params = useParams();
  const id = params.id as string;
  const [rx, setRx] = useState<any>(null);

  useEffect(() => {
    // جلب الروشتة باستخدام JOIN لكل الجداول المرتبطة
    const getData = async () => {
      const { data } = await (supabase.from('prescriptions') as any)
        .select(`*, doctors(profiles(full_name), specialty), medical_files(*)`)
        .eq('id', id).single();
      setRx(data);
    };
    getData();
  }, [id]);

  if (!rx) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 flex justify-center">
      {/* ورقة A4 */}
      <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-10 flex flex-col dir-rtl relative print:shadow-none print:w-full print:h-full print:m-0">
        
        {/* Header */}
        <div className="border-b-4 border-blue-900 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">منصة صحتي الطبية</h1>
            <p className="text-gray-500">Sehaty AI Medical Platform</p>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold">د. {rx.doctors.profiles.full_name}</h2>
            <p className="text-gray-600">{rx.doctors.specialty}</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="flex justify-between bg-gray-50 p-4 rounded-lg border mb-8">
          <div>
            <span className="text-gray-500 text-sm block">المريض:</span>
            <span className="font-bold text-lg">{rx.medical_files.full_name}</span>
          </div>
          <div>
            <span className="text-gray-500 text-sm block">التاريخ:</span>
            <span className="font-bold">{new Date(rx.created_at).toLocaleDateString('ar-EG')}</span>
          </div>
          <div>
             <span className="text-gray-500 text-sm block">التشخيص:</span>
             <span className="font-bold text-blue-800">{rx.diagnosis || 'غير محدد'}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 space-y-8">
          
          {/* Drugs */}
          {rx.drugs_list?.length > 0 && (
            <div>
              <h3 className="text-2xl font-serif italic text-gray-400 border-b mb-4">Rx</h3>
              <ul className="space-y-4">
                {rx.drugs_list.map((drug: any, i: number) => (
                  <li key={i} className="flex justify-between items-center border-b border-dashed pb-2">
                    <div>
                      <span className="font-bold text-lg block">{drug.name} <small className="text-gray-500">{drug.concentration}</small></span>
                      <span className="text-sm text-gray-600">{drug.form} - {drug.freq}</span>
                    </div>
                    <span className="bg-gray-100 px-2 py-1 rounded text-sm font-bold">لمدة {drug.duration}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Labs & Radiology */}
          {(rx.labs_list?.length > 0 || rx.radiology_list?.length > 0) && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-bold text-yellow-800 mb-2">طلب فحوصات</h4>
              <ul className="list-disc list-inside">
                {rx.labs_list?.map((l: string) => <li key={l}>تحليل: {l}</li>)}
                {rx.radiology_list?.map((r: string) => <li key={r}>أشعة: {r}</li>)}
              </ul>
            </div>
          )}

          {/* Education & Red Flags */}
          <div className="grid grid-cols-2 gap-4">
             {rx.education_list?.length > 0 && (
               <div>
                 <h4 className="font-bold text-green-700 mb-2">💡 تعليمات هامة</h4>
                 <ul className="text-sm list-disc list-inside text-gray-700">
                   {rx.education_list.map((e: string, i: number) => <li key={i}>{e}</li>)}
                 </ul>
               </div>
             )}
             {rx.red_flags_list?.length > 0 && (
               <div>
                 <h4 className="font-bold text-red-700 mb-2">🚩 علامات خطر</h4>
                 <ul className="text-sm list-disc list-inside text-red-600 font-bold">
                   {rx.red_flags_list.map((e: string, i: number) => <li key={i}>{e}</li>)}
                 </ul>
               </div>
             )}
          </div>

        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t flex justify-between items-end">
          {rx.follow_up_date && (
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold">
              ميعاد الاستشارة القادمة: {new Date(rx.follow_up_date).toLocaleDateString('ar-EG')}
            </div>
          )}
          <div className="text-center">
            <div className="h-16 w-32 mb-2 flex items-end justify-center">
               {/* هنا يمكن وضع صورة التوقيع الإلكتروني */}
               <span className="font-handwriting text-2xl text-blue-900">{rx.doctors.profiles.full_name}</span>
            </div>
            <p className="text-xs text-gray-400 border-t pt-1 w-32 mx-auto">توقيع الطبيب</p>
          </div>
        </div>

        {/* Print Button (Hidden when printing) */}
        <button 
          onClick={() => window.print()}
          className="absolute top-4 left-4 bg-gray-900 text-white px-6 py-2 rounded-full shadow-lg hover:bg-black print:hidden"
        >
          🖨️ طباعة
        </button>

      </div>
    </div>
  );
}
