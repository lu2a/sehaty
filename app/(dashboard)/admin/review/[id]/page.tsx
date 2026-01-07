'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';

export default function ReviewConsultation() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [consultantNote, setConsultantNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      const { data: consultation } = await supabase
        .from('consultations')
        .select(`
          *,
          medical_files (full_name),
          doctors (profiles(full_name))
        `)
        .eq('id', id)
        .single();

      if (consultation) {
        setData(consultation);
        
        const safeData = consultation as any; 
        
        setRating(safeData.doctor_rate || 0);
        setConsultantNote(safeData.consultant_note || '');
      }
      setLoading(false);
    }
    getData();
  }, [id]);

  const handleSaveReview = async () => {
    const updatePayload = {
        doctor_rate: rating,
        consultant_note: consultantNote,
        is_locked: true
    };

    // @ts-ignore
    const { error } = await supabase
      .from('consultations')
      .update(updatePayload) // هذا السطر هو الذي كان يسبب المشكلة
      .eq('id', id);

    if (!error) {
      alert('تم حفظ المراجعة بنجاح ✅');
      router.push('/admin/consultations');
    } else {
      alert(error.message);
    }
  };

  if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;
  if (!data) return <div className="p-10 text-center">الاستشارة غير موجودة</div>;

  return (
    <div className="p-6 dir-rtl max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">مراجعة وتقييم الاستشارة</h1>
      
      <div className="bg-white p-6 rounded-xl shadow mb-6 border">
        <div className="flex justify-between mb-4">
           <div>
             <span className="text-gray-500 text-sm">الطبيب المعالج</span>
             <p className="font-bold">{data.doctors?.profiles?.full_name}</p>
           </div>
           <div>
             <span className="text-gray-500 text-sm">المريض</span>
             <p className="font-bold">{data.medical_files?.full_name}</p>
           </div>
        </div>
        <div className="bg-gray-50 p-4 rounded text-sm mb-4">
          <strong>تشخيص الطبيب:</strong>
          <p className="mt-1">{data.diagnosis || 'لم يتم تسجيل تشخيص'}</p>
        </div>
      </div>

      <div className="bg-yellow-50 p-6 rounded-xl shadow border border-yellow-200">
        <h3 className="font-bold text-lg mb-4 text-yellow-800">تقييم الجودة (للمشرفين)</h3>
        
        <div className="mb-4">
          <label className="block font-bold mb-2">تقييم أداء الطبيب (من 5)</label>
          <div className="flex gap-2 text-2xl cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} onClick={() => setRating(star)}>
                {star <= rating ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-bold mb-2">ملاحظات المشرف / الاستشاري</label>
          <textarea 
            className="w-full p-3 border rounded-lg h-24"
            placeholder="اكتب ملاحظاتك للطبيب هنا..."
            value={consultantNote}
            onChange={(e) => setConsultantNote(e.target.value)}
          />
        </div>

        <button 
          onClick={handleSaveReview}
          className="w-full bg-yellow-600 text-white py-3 rounded-lg font-bold hover:bg-yellow-700"
        >
          حفظ التقييم وإغلاق المراجعة
        </button>
      </div>
    </div>
  );
}
