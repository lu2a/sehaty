'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function PrescriptionView() {
  const supabase = createClient();
  const params = useParams();
  const id = params.id as string;
  const [rx, setRx] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRx() {
      // جلب الروشتة مع بيانات الطبيب، العيادة، والمريض
      const { data } = await supabase
        .from('prescriptions')
        .select(`
          *,
          doctors (
            specialty,
            profiles(full_name),
            clinics(name, description)
          ),
          medical_files (full_name, birth_date, gender)
        `)
        .eq('id', id)
        .single();
      
      if (data) setRx(data);
      setLoading(false);
    }
    getRx();
  }, [id]);

  if (loading) return <div className="text-center p-10">جاري تحميل الروشتة...</div>;
  if (!rx) return <div className="text-center p-10 text-red-500">الروشتة غير موجودة</div>;

  return (
    <div className="max-w-3xl mx-auto my-10 bg-white shadow-2xl min-h-[800px] flex flex-col dir-rtl print:shadow-none print:my-0 print:w-full">
      
      {/* 1. ترويسة الروشتة (Header) */}
      <div className="bg-blue-900 text-white p-8 print:bg-white print:text-black print:border-b-2 print:border-black">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{rx.doctors.clinics?.name || 'منصة صحتي AI'}</h1>
            <h2 className="text-xl">د. {rx.doctors.profiles.full_name}</h2>
            <p className="opacity-80 mt-1">{rx.doctors.specialty}</p>
          </div>
          <div className="text-left">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl print:border print:text-black">
              ⚕️
            </div>
          </div>
        </div>
      </div>

      {/* 2. بيانات المريض */}
      <div className="p-8 border-b">
        <div className="flex justify-between text-sm">
          <p><span className="font-bold text-gray-500">اسم المريض:</span> {rx.medical_files.full_name}</p>
          <p><span className="font-bold text-gray-500">التاريخ:</span> {new Date(rx.created_at).toLocaleDateString('ar-EG')}</p>
          <p><span className="font-bold text-gray-500">العمر:</span> {new Date().getFullYear() - new Date(rx.medical_files.birth_date).getFullYear()} سنة</p>
        </div>
      </div>

      {/* 3. جسم الروشتة (الأدوية) */}
      <div className="p-8 flex-1">
        <div className="text-6xl font-serif text-gray-300 mb-6 italic print:text-black">Rx</div>
        
        <ul className="space-y-6">
          {rx.drugs_list?.map((drug: any, index: number) => (
            <li key={index} className="border-b border-dashed pb-4 last:border-0">
              <div className="flex justify-between items-end mb-1">
                <h3 className="font-bold text-xl text-black">{drug.drug_name}</h3>
                <span className="text-sm font-bold bg-gray-100 px-2 rounded">{drug.concentration}</span>
              </div>
              <p className="text-gray-600">{drug.dose} - {drug.frequency} - لمدة {drug.duration}</p>
              {drug.notes && <p className="text-sm text-gray-500 mt-1 italic">({drug.notes})</p>}
            </li>
          ))}
        </ul>

        {rx.notes && (
          <div className="mt-10 p-4 bg-yellow-50 rounded border border-yellow-100 print:border print:bg-transparent">
            <h4 className="font-bold text-sm mb-1">ملاحظات الطبيب:</h4>
            <p className="text-gray-700">{rx.notes}</p>
          </div>
        )}
      </div>

      {/* 4. التذييل (Footer) */}
      <div className="p-8 mt-auto border-t bg-gray-50 print:bg-white">
        <div className="flex justify-between items-end">
          <div className="text-center">
            <p className="font-serif italic mb-4 text-gray-400">التوقيع</p>
            <div className="h-0.5 w-32 bg-gray-300"></div>
          </div>
          <div className="text-left text-xs text-gray-400">
             <p>تم الإصدار إلكترونياً عبر منصة صحتي</p>
             <p>رقم الروشتة: {rx.id.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* زر الطباعة (يختفي عند الطباعة) */}
      <div className="p-6 text-center print:hidden bg-gray-800 text-white mt-4">
        <button 
          onClick={() => window.print()} 
          className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 shadow-lg flex items-center gap-2 mx-auto"
        >
          <span>🖨️</span> طباعة الروشتة / حفظ PDF
        </button>
      </div>

    </div>
  );
}