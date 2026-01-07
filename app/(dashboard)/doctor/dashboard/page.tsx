'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DoctorDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // جلب الاستشارات: إما مسندة لي، أو مفتوحة (بدون طبيب)
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        id, created_at, urgency, status, content,
        medical_files (full_name, gender, birth_date)
      `)
      .or(`doctor_id.eq.${user.id},doctor_id.is.null`)
      .neq('status', 'closed') // لا نريد المنتهية في اللوحة الرئيسية
      .order('created_at', { ascending: true }); // الأقدم أولاً مبدئياً

    if (error) console.error(error);
    
    if (data) {
      // تطبيق منطق الفرز الذكي: الطوارئ أولاً، ثم الزمن
      const urgencyWeight = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
      
      const sorted = data.sort((a: any, b: any) => {
        const scoreA = urgencyWeight[a.urgency as keyof typeof urgencyWeight];
        const scoreB = urgencyWeight[b.urgency as keyof typeof urgencyWeight];
        
        // إذا اختلفت الأهمية، الأهم يظهر أولاً
        if (scoreA !== scoreB) return scoreB - scoreA;
        
        // إذا تساوت الأهمية، الأقدم يظهر أولاً
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      setConsultations(sorted);
    }
    setLoading(false);
  };

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'critical': return <span className="bg-red-600 text-white px-2 py-1 rounded text-xs animate-pulse">حالة حرجة</span>;
      case 'high': return <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">عاجل</span>;
      case 'medium': return <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">متوسط</span>;
      default: return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">عادي</span>;
    }
  };

  if (loading) return <div className="p-8 text-center">جاري تحميل الحالات...</div>;

  return (
    <div className="p-6 dir-rtl bg-gray-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">غرفة الطبيب</h1>
          <p className="text-gray-500 text-sm">لديك {consultations.length} استشارات تتطلب الانتباه</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchConsultations} className="text-blue-600 hover:underline text-sm">تحديث القائمة</button>
        </div>
      </header>

      <div className="grid gap-4">
        {consultations.length === 0 && (
          <div className="bg-white p-12 text-center rounded-lg shadow">
            <p className="text-xl text-gray-400">لا توجد حالات معلقة حالياً. وقت الراحة! ☕</p>
          </div>
        )}

        {consultations.map((item) => (
          <Link href={`/doctor/consultations/${item.id}`} key={item.id}>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition flex justify-between items-start cursor-pointer relative overflow-hidden group">
              {/* شريط جانبي لوني حسب الحالة */}
              <div className={`absolute top-0 right-0 bottom-0 w-1 ${item.urgency === 'critical' ? 'bg-red-600' : item.urgency === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
              
              <div className="flex gap-4 pr-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg">
                   {/* @ts-ignore */}
                  {item.medical_files?.full_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 text-lg">
                       {/* @ts-ignore */}
                      {item.medical_files?.full_name}
                    </h3>
                    {getUrgencyBadge(item.urgency)}
                    {!item.doctor_id && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">متاحة للجميع</span>}
                  </div>
                  <p className="text-gray-600 line-clamp-2 text-sm ml-4">{item.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    منذ: {new Date(item.created_at).toLocaleTimeString('ar-EG')} - {new Date(item.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>

              <div className="self-center">
                <span className="text-gray-400 group-hover:text-blue-600 text-2xl transition">➜</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}