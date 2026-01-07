'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ConsultationsList() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get('success');
  
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // التعديل هنا: أزلنا specialty لأنها لم تعد موجودة
      // واعتمدنا على clinics(name)
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          id, created_at, status, urgency,
          clinics (name),
          medical_files (full_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching consultations:", error.message);
      } else {
        setConsultations(data || []);
      }
      setLoading(false);
    }
    getData();
  }, []);

  return (
    <div className="p-6 dir-rtl max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">سجل استشاراتي</h1>
        <Link href="/consultations/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow">
          + استشارة جديدة
        </Link>
      </div>

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">تم بنجاح! </strong>
          <span className="block sm:inline">تم إرسال طلب الاستشارة للطبيب.</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">جاري تحميل السجل...</div>
      ) : consultations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-300">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-500 mb-4">لا توجد استشارات سابقة.</p>
          <Link href="/consultations/new" className="text-blue-600 hover:underline">
            ابدأ أول استشارة طبية الآن
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {consultations.map((item) => (
            <Link key={item.id} href={`/consultations/${item.id}`} className="block group">
              <div className="bg-white p-5 rounded-xl shadow-sm border hover:border-blue-400 transition flex justify-between items-center relative overflow-hidden">
                
                <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${
                  item.status === 'closed' ? 'bg-gray-400' : 
                  item.status === 'pending' ? 'bg-yellow-400' : 'bg-green-500'
                }`}></div>

                <div className="pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-800">
                      {/* هنا نعرض اسم العيادة بدلاً من التخصص النصي */}
                      {item.clinics?.name || 'استشارة عامة'}
                    </h3>
                    {item.urgency === 'high' && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">طارئة 🔥</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    المريض: {item.medical_files?.full_name} | منذ: {new Date(item.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'closed' ? 'bg-gray-100 text-gray-600' : 
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {item.status === 'pending' ? 'قيد الانتظار ⏳' : 
                     item.status === 'active' ? 'جارية 👨‍⚕️' : 'مغلقة ✅'}
                  </span>
                  <span className="text-gray-300 group-hover:text-blue-600 text-xl">➜</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}