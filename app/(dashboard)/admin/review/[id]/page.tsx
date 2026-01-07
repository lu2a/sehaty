'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import ChatArea from '@/components/consultation/ChatArea';

export default function ReviewConsultation() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [data, setData] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [consultantNote, setConsultantNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: consultation } = await supabase
        .from('consultations')
        .select(`*, medical_files(*), doctors(profiles(full_name))`)
        .eq('id', id)
        .single();
      
      if (consultation) {
        setData(consultation);
        setRating(consultation.doctor_rate || 0);
        setConsultantNote(consultation.consultant_note || '');
      }
    }
    load();
  }, [id]);

  const handleSaveEvaluation = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('consultations')
      .update({
        doctor_rate: rating,
        consultant_note: consultantNote
      })
      .eq('id', id);

    if (!error) {
      alert('تم حفظ التقييم بنجاح ✅');
      router.push('/admin/supervision');
    } else {
      alert(error.message);
    }
    setSaving(false);
  };

  if (!data) return <div>جاري التحميل...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 dir-rtl">
      
      {/* 1. عرض تفاصيل الاستشارة (أرشيف) */}
      <div className="w-full lg:w-2/3 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">مراجعة الاستشارة # {id.slice(0,6)}</h1>
        
        {/* بيانات المريض والطبيب */}
        <div className="bg-white p-4 rounded-lg shadow mb-4 grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500 text-sm">المريض</span>
            <p className="font-bold">{data.medical_files.full_name}</p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">الطبيب المعالج</span>
            <p className="font-bold text-blue-700">{data.doctors?.profiles?.full_name || '---'}</p>
          </div>
        </div>

        {/* أرشيف المحادثة (للقراءة فقط) */}
        <div className="bg-white rounded-lg shadow border p-4 h-[500px] overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 bg-yellow-100 text-yellow-800 text-center text-xs p-1 z-10">
            وضع المراجعة (للقراءة فقط)
          </div>
          {/* نمرر معرف المستخدم كـ 'admin' لكي لا تظهر رسائله كأنها رسائل الطبيب */}
          <ChatArea consultationId={id} currentUserId="admin-viewer" />
        </div>
      </div>

      {/* 2. لوحة التقييم (على اليسار) */}
      <div className="w-full lg:w-1/3 bg-white border-r p-6 shadow-xl">
        <h2 className="text-xl font-bold text-blue-900 mb-6">📝 تقييم الأداء</h2>
        
        <div className="space-y-6">
          {/* النجوم */}
          <div>
            <label className="block font-bold mb-2">تقييم الطبيب</label>
            <div className="flex gap-2 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`transition hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {rating === 5 ? 'ممتاز' : rating === 1 ? 'سيء جداً' : rating > 0 ? 'تم التحديد' : 'لم يتم التقييم'}
            </p>
          </div>

          {/* الملاحظات */}
          <div>
            <label className="block font-bold mb-2">ملاحظات الاستشاري / رئيس القسم</label>
            <textarea
              className="w-full p-3 border rounded-lg h-40 focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="اكتب ملاحظاتك للطبيب هنا (ستظهر له في التقرير الشهري)..."
              value={consultantNote}
              onChange={(e) => setConsultantNote(e.target.value)}
            />
          </div>

          <button
            onClick={handleSaveEvaluation}
            disabled={saving}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 shadow-lg"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التقييم وإغلاق المراجعة'}
          </button>
        </div>
      </div>
    </div>
  );
}