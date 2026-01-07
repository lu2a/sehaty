'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import PrescriptionBuilder, { DrugItem } from '@/components/doctor/PrescriptionBuilder';
import ChatArea from '@/components/consultation/ChatArea';

export default function DoctorConsultationView() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);

  // جلب البيانات
  useEffect(() => {
    async function getData() {
      const { data } = await supabase
        .from('consultations')
        .select(`*, medical_files (*)`)
        .eq('id', id)
        .single();
      
      if (data) setConsultation(data);
      setLoading(false);
    }
    getData();
  }, [id]);

  const handleClaim = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    // الحل: تحويل الجدول إلى any لتجاوز خطأ التحديث
    await (supabase.from('consultations') as any)
      .update({ doctor_id: user?.id, status: 'active' })
      .eq('id', id);
    window.location.reload();
  };

  const handleCloseConsultation = async () => {
    if (!confirm('هل أنت متأكد من إنهاء هذه الاستشارة وإغلاقها؟')) return;
    setActionLoading(true);
    // الحل: استخدام as any هنا أيضاً
    const { error } = await (supabase.from('consultations') as any)
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) router.push('/doctor/dashboard');
    else alert('خطأ: ' + error.message);
    setActionLoading(false);
  };

  const handleCreatePrescription = async (drugs: DrugItem[], notes: string) => {
    setActionLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // الحل: استخدام as any لجدول الوصفات أيضاً
    const { error } = await (supabase.from('prescriptions') as any).insert({
      consultation_id: id,
      doctor_id: user?.id,
      medical_file_id: consultation.medical_file_id,
      drugs_list: drugs,
      notes: notes
    });

    if (!error) alert('✅ تم إصدار الوصفة وحفظها.');
    else alert('خطأ: ' + error.message);
    setActionLoading(false);
  };

  if (loading) return <div className="p-10 text-center">جاري تحميل الحالة...</div>;
  if (!consultation) return <div className="p-10 text-center">الاستشارة غير موجودة</div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 dir-rtl overflow-hidden">
      
      {/* ================= القسم الأيمن: البيانات الطبية ================= */}
      <div className="w-full lg:w-2/3 p-6 overflow-y-auto h-full scrollbar-thin">
        
        {/* بطاقة المريض */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border-r-4 border-blue-600 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              المريض: {consultation.medical_files.full_name}
            </h2>
            <p className="text-sm text-gray-500">
              {consultation.medical_files.gender === 'male' ? 'ذكر' : 'أنثى'} | 
              العمر: {new Date().getFullYear() - new Date(consultation.medical_files.birth_date).getFullYear()} سنة
            </p>
          </div>
          <div className="text-left">
             <span className={`px-3 py-1 rounded-full text-sm font-bold ${consultation.urgency === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              {consultation.urgency === 'high' ? 'عاجل' : 'عادي'}
            </span>
            <div className="mt-2 text-xs text-gray-400">
               {new Date(consultation.created_at).toLocaleString('ar-EG')}
            </div>
          </div>
        </div>

        {/* 1. الأعراض والعلامات (الجديد) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-red-50">
            <h3 className="text-red-800 font-bold mb-2 flex items-center gap-2">🔥 الأعراض (Symptoms)</h3>
            <div className="flex flex-wrap gap-2">
              {/* @ts-ignore */}
              {consultation.symptoms_list?.length > 0 ? consultation.symptoms_list.map((s, i) => (
                <span key={i} className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm border border-red-100">{s}</span>
              )) : <span className="text-gray-400 text-sm">لم يحدد المريض أعراضاً</span>}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-50">
            <h3 className="text-purple-800 font-bold mb-2 flex items-center gap-2">👀 العلامات (Signs)</h3>
            <div className="flex flex-wrap gap-2">
              {/* @ts-ignore */}
              {consultation.signs_list?.length > 0 ? consultation.signs_list.map((s, i) => (
                <span key={i} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-sm border border-purple-100">{s}</span>
              )) : <span className="text-gray-400 text-sm">لم يحدد المريض علامات</span>}
            </div>
          </div>
        </div>

        {/* 2. نص الشكوى والتسجيل الصوتي */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h3 className="text-gray-500 text-sm font-bold mb-3 uppercase">📝 تفاصيل الشكوى</h3>
          <p className="text-gray-800 leading-relaxed text-lg bg-gray-50 p-4 rounded-lg border mb-4">
            {consultation.content}
          </p>
          
          {/* مشغل الصوت (الجديد) */}
          {consultation.voice_url && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-3">
              <span className="text-2xl">🎙️</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-800 mb-1">تسجيل صوتي من المريض</p>
                <audio controls src={consultation.voice_url} className="w-full h-8" />
              </div>
            </div>
          )}
        </div>

        {/* 3. المرفقات والصور */}
        {consultation.images_urls && consultation.images_urls.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h3 className="text-gray-500 text-sm font-bold mb-3 uppercase">📸 المرفقات والأشعة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {/* @ts-ignore */}
              {consultation.images_urls.map((url, idx) => (
                <a key={idx} href={url} target="_blank" className="block h-32 rounded-lg overflow-hidden border hover:opacity-80">
                  <img src={url} alt="attachment" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 4. تحليل الذكاء الاصطناعي */}
        {consultation.ai_preliminary_analysis && (
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm mb-6">
            <h3 className="text-indigo-800 text-sm font-bold mb-2 flex items-center gap-2">🤖 رأي المساعد الذكي</h3>
            <p className="text-indigo-900 text-sm leading-relaxed">{consultation.ai_preliminary_analysis}</p>
          </div>
        )}

        {/* 5. الملف الطبي المختصر */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-bold mb-4 uppercase">📂 التاريخ الطبي</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-red-50 rounded border border-red-100">
              <span className="block text-xs text-red-500 font-bold mb-1">أمراض مزمنة</span>
              <p className="text-sm">{consultation.medical_files.chronic_diseases?.join('، ') || 'لا يوجد'}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded border border-yellow-100">
              <span className="block text-xs text-yellow-600 font-bold mb-1">حساسية</span>
              <p className="text-sm">{consultation.medical_files.allergies?.join('، ') || 'لا يوجد'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= القسم الأيسر: الشات والإجراءات ================= */}
      <div className="w-full lg:w-1/3 bg-white border-r border-gray-200 shadow-xl flex flex-col h-full">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-800">غرفة العمليات والتواصل</h3>
        </div>

        {!consultation.doctor_id ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4">🩺</div>
            <p className="mb-6 text-gray-600">هذه الاستشارة متاحة. هل تود استلامها؟</p>
            <button onClick={handleClaim} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 w-full shadow-lg transition">استلام الحالة</button>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-hidden bg-slate-50 relative">
               <ChatArea consultationId={id} currentUserId={consultation.doctor_id} />
            </div>

            <div className="p-4 border-t bg-white z-10 max-h-[40%] overflow-y-auto">
              <div className="flex gap-2 mb-4">
                 <button onClick={handleCloseConsultation} disabled={actionLoading} className="flex-1 bg-gray-800 text-white py-2 rounded-lg font-bold text-sm hover:bg-gray-900">✅ إنهاء الاستشارة</button>
                 <button onClick={() => setShowReferModal(true)} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg font-bold text-sm border border-blue-200 hover:bg-blue-100">↪ تحويل</button>
              </div>
              <div className="border-t pt-2">
                <details className="group">
                  <summary className="cursor-pointer text-blue-600 font-bold text-sm flex items-center gap-2 p-2 hover:bg-blue-50 rounded">
                    <span>💊 كتابة وصفة طبية (Rx)</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <div className="mt-2">
                    <PrescriptionBuilder onSave={handleCreatePrescription} loading={actionLoading} />
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* مودال التحويل (مبسط) */}
      {showReferModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">تحويل الاستشارة</h3>
            <p className="text-gray-500 mb-4">هذه الميزة ستقوم بنقل ملكية الاستشارة لطبيب آخر.</p>
            <button onClick={() => setShowReferModal(false)} className="bg-gray-200 px-4 py-2 rounded">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}
