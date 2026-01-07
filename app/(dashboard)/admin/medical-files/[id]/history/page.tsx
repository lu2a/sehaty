'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function PatientHistory() {
  const supabase = createClient();
  const params = useParams();
  const fileId = params.id as string;
  
  const [file, setFile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. جلب بيانات الملف
      const { data: fileData } = await supabase.from('medical_files').select('*').eq('id', fileId).single();
      setFile(fileData);

      if (fileData) {
        // 2. جلب الاستشارات
        const { data: consults } = await supabase
          .from('consultations')
          .select('id, created_at, specialty, status, doctor_id, content')
          .eq('medical_file_id', fileId);

        // 3. جلب المواعيد (نحتاج user_id للمواعيد، لذا نجلبها عبر صاحب الملف)
        const { data: appts } = await supabase
          .from('appointments')
          .select('id, appointment_date, appointment_time, specialty, status, doctor_id')
          .eq('user_id', fileData.user_id);

        // 4. دمج وتوحيد البيانات
        const combined = [
          ...(consults || []).map((c: any) => ({
            type: 'consultation',
            date: c.created_at,
            title: 'استشارة طبية',
            details: c.content,
            specialty: c.specialty,
            status: c.status,
            id: c.id
          })),
          ...(appts || []).map((a: any) => ({
            type: 'appointment',
            date: `${a.appointment_date}T${a.appointment_time}:00`,
            title: 'زيارة عيادة',
            details: `موعد الساعة ${a.appointment_time}`,
            specialty: a.specialty,
            status: a.status,
            id: a.id
          }))
        ];

        // ترتيب حسب التاريخ (الأحدث أولاً)
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(combined);
      }
      setLoading(false);
    }
    fetchData();
  }, [fileId]);

  if (loading) return <div className="p-8 text-center">جاري تحميل السجل...</div>;

  return (
    <div className="p-6 dir-rtl max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow mb-8 border-r-4 border-purple-600">
        <h1 className="text-2xl font-bold text-gray-800">سجل التردد والزيارات</h1>
        <p className="text-gray-500">للمريض: <span className="font-bold text-black">{file?.full_name}</span> (رقم الملف: {file?.file_number})</p>
      </div>

      <div className="relative border-r-2 border-gray-200 mr-4 space-y-8">
        {history.length === 0 && <p className="mr-6 text-gray-500">لا يوجد سجل زيارات لهذا المريض.</p>}
        
        {history.map((item, idx) => (
          <div key={idx} className="relative mr-6">
            {/* النقطة على الخط */}
            <div className={`absolute -right-[33px] top-1 w-4 h-4 rounded-full border-2 border-white ${
              item.type === 'consultation' ? 'bg-blue-500' : 'bg-green-500'
            }`}></div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                    item.type === 'consultation' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {item.title}
                  </span>
                  <h3 className="font-bold mt-2 text-lg">{item.specialty || 'عام'}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.details}</p>
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold text-gray-400">
                    {new Date(item.date).toLocaleDateString('ar-EG')}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <div className="mt-2">
                     <span className="text-xs border px-2 py-1 rounded">{item.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}