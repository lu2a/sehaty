'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import ChatArea from '@/components/consultation/ChatArea';
import Link from 'next/link';

export default function ConsultationDetail() {
  const supabase = createClient();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // جلب الاستشارة
      const { data: consultation } = await supabase
        .from('consultations')
        .select('*, medical_files(*)')
        .eq('id', id)
        .single();
        
      setData(consultation);

      // البحث عن وصفة طبية مرتبطة
      const { data: rx } = await supabase
        .from('prescriptions')
        .select('id')
        .eq('consultation_id', id)
        .single();
      
      if (rx) setPrescriptionId(rx.id);
    }
    load();
  }, [id]);

  if (!data || !currentUser) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto dir-rtl pb-20">
      
      {/* رأس الصفحة والحالة */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">تفاصيل الاستشارة</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
          data.status === 'closed' ? 'bg-gray-200 text-gray-700' : 
          data.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
        }`}>
          {data.status === 'closed' ? 'منتهية' : data.status === 'pending' ? 'قيد الانتظار' : 'جارية'}
        </span>
      </div>

      {/* تنبيه وجود وصفة طبية */}
      {prescriptionId && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💊</span>
            <div>
              <h3 className="font-bold text-green-800">وصفة طبية متاحة</h3>
              <p className="text-green-600 text-sm">أصدر الطبيب وصفة طبية لهذه الاستشارة.</p>
            </div>
          </div>
          <Link 
            href={`/prescription/${prescriptionId}`} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow"
          >
            عرض وطباعة الوصفة
          </Link>
        </div>
      )}

      {/* تفاصيل الشكوى (للتذكير) */}
      <div className="bg-white p-6 rounded-lg shadow mb-6 border-t-4 border-blue-600">
        <p className="text-gray-600 mb-2">المريض: <strong>{data.medical_files.full_name}</strong></p>
        <div className="bg-gray-50 p-4 rounded text-gray-800 border">
          <strong>نص الشكوى:</strong> {data.content}
        </div>
      </div>

      {/* منطقة الدردشة */}
      {data.status !== 'pending' && data.doctor_id ? (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">💬 المحادثة مع الطبيب</h2>
          <ChatArea consultationId={id} currentUserId={currentUser.id} />
        </div>
      ) : (
        <div className="bg-yellow-50 p-8 rounded-lg text-center border border-yellow-200">
          <div className="text-4xl mb-2">⏳</div>
          <h3 className="font-bold text-yellow-800 text-lg">الاستشارة في قائمة الانتظار</h3>
          <p className="text-yellow-700">سيقوم أحد أطبائنا بمراجعة حالتك والرد عليك قريباً.</p>
        </div>
      )}
    </div>
  );
}