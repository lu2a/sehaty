'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import ChatArea from '@/components/consultation/ChatArea';
import { 
  Printer, Share2, FileText, CheckCircle, 
  Pill, Activity
} from 'lucide-react';

// --- واجهات البيانات ---
interface Medication {
  name: string;
  concentration: string;
  form: string;
  dose: string;
  duration: string;
}

interface ReplyData {
  diagnosis: string;
  medications: Medication[];
  labs: string[];
  radiology: string[];
  advice: string;
  redFlags: string;
  followUp: string;
  notes: string;
}

export default function ConsultationDetail() {
  const supabase = createClient();
  const params = useParams();
  const id = params.id as string;
  
  const [data, setData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [report, setReport] = useState<ReplyData | null>(null);
  const [centerSettings, setCenterSettings] = useState<any>(null);
  const [showPrescription, setShowPrescription] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 1. جلب بيانات المركز (للترويسة)
      // نستخدم (as any) هنا أيضاً احتياطاً
      const { data: settings } = await (supabase.from('center_settings') as any).select('*').single();
      setCenterSettings(settings);

      // 2. جلب الاستشارة مع البيانات المرتبطة
      // 🔴 التصحيح: استخدام (as any) لتجاوز خطأ 'never' عند استخدام joins معقدة
      const { data: consultation } = await (supabase
        .from('consultations') as any)
        .select('*, medical_files(*), doctors(*, profiles(full_name))')
        .eq('id', id)
        .single();
        
      setData(consultation);

      // 3. تحليل الرد إذا كانت الاستشارة مغلقة
      if (consultation?.doctor_reply && consultation.status === 'closed') {
        try {
          // محاولة فك التشفير إذا كان نص JSON
          const parsed = typeof consultation.doctor_reply === 'string' 
            ? JSON.parse(consultation.doctor_reply) 
            : consultation.doctor_reply;
            
          setReport(parsed);
        } catch (e) {
          console.error("Error parsing doctor reply", e);
        }
      }
    }
    load();
  }, [id]);

  const handlePrint = () => {
    setShowPrescription(true);
    setTimeout(() => {
      window.print();
      setShowPrescription(false);
    }, 100);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تقرير طبي',
          text: `تقرير طبي للمريض ${data.medical_files.full_name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      alert('المشاركة غير مدعومة في هذا المتصفح');
    }
  };

  if (!data || !currentUser) return <div className="p-8 text-center animate-pulse">جاري تحميل الاستشارة...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto dir-rtl pb-20 font-cairo">
      
      {/* --- 1. رأس الصفحة والحالة (يختفي عند الطباعة) --- */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-slate-800">تفاصيل الاستشارة</h1>
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
          data.status === 'closed' ? 'bg-green-100 text-green-700' : 
          data.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {data.status === 'closed' ? <CheckCircle size={16}/> : null}
          {data.status === 'closed' ? 'تم الرد (مغلقة)' : data.status === 'pending' ? 'قيد الانتظار' : 'جارية'}
        </span>
      </div>

      {/* --- 2. كارت الرد النهائي (يظهر للمريض في الواجهة) --- */}
      {data.status === 'closed' && report && (
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden mb-8 print:hidden animate-in slide-in-from-top-4">
          <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
            <h2 className="font-bold text-green-800 flex items-center gap-2">
              <FileText size={20} /> التقرير الطبي والروشتة
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="bg-white text-green-700 p-2 rounded-lg hover:bg-green-100 border border-green-200 transition" title="طباعة">
                <Printer size={18} />
              </button>
              <button onClick={handleShare} className="bg-white text-blue-600 p-2 rounded-lg hover:bg-blue-50 border border-blue-200 transition" title="مشاركة">
                <Share2 size={18} />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* التشخيص */}
            <div>
              <p className="text-sm text-gray-500 font-bold mb-1">التشخيص:</p>
              <p className="text-lg text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{report.diagnosis}</p>
            </div>

            {/* الأدوية */}
            {report.medications?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 font-bold mb-2 flex items-center gap-1"><Pill size={16}/> الأدوية الموصوفة:</p>
                <div className="grid gap-3">
                  {report.medications.map((med, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <div>
                        <span className="font-bold text-blue-900 block">{med.name}</span>
                        <span className="text-xs text-blue-600">{med.concentration} - {med.form}</span>
                      </div>
                      <span className="bg-white px-3 py-1 rounded-lg text-sm font-bold text-blue-700 shadow-sm">{med.dose}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* التعليمات */}
            {report.advice && (
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <p className="text-orange-800 font-bold text-sm mb-1">تعليمات الطبيب:</p>
                <p className="text-orange-900 text-sm leading-relaxed">{report.advice}</p>
              </div>
            )}

            <button 
              onClick={() => setShowPrescription(!showPrescription)}
              className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition flex justify-center items-center gap-2"
            >
              <FileText size={18} /> {showPrescription ? 'إخفاء الروشتة الرسمية' : 'عرض الروشتة الرسمية (A4)'}
            </button>
          </div>
        </div>
      )}

      {/* --- 3. تصميم الروشتة A4 (يظهر عند الطباعة أو الضغط على الزر) --- */}
      {(showPrescription || (typeof window !== 'undefined' && window.matchMedia('print').matches)) && report && (
        <div className={`bg-white p-8 mb-8 border shadow-2xl mx-auto print:shadow-none print:border-none print:w-full print:absolute print:top-0 print:left-0 print:z-50 ${showPrescription ? 'block' : 'hidden print:block'}`} style={{ maxWidth: '210mm', minHeight: '297mm' }}>
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-blue-600 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-800 mb-2">{centerSettings?.center_name || 'مركز صحتي الطبي'}</h1>
              <p className="text-gray-600 text-sm flex items-center gap-2">العنوان: {centerSettings?.address}</p>
              <p className="text-gray-600 text-sm flex items-center gap-2">تليفون: {centerSettings?.phone}</p>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-900">د. {data.doctors?.profiles?.full_name || 'طبيب المركز'}</h2>
              <p className="text-gray-500 text-sm">{data.doctors?.specialty || 'عام'}</p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 text-sm">
            <div><span className="font-bold">المريض:</span> {data.medical_files.full_name}</div>
            <div><span className="font-bold">التاريخ:</span> {new Date(data.updated_at).toLocaleDateString('ar-EG')}</div>
            <div><span className="font-bold">رقم الملف:</span> #{data.medical_files.id.slice(0, 6)}</div>
          </div>

          {/* Rx Content */}
          <div className="space-y-8">
            <div>
              <h3 className="text-4xl font-serif font-bold text-blue-600 italic mb-4">Rx</h3>
              <ul className="space-y-4">
                {report.medications?.map((med, i) => (
                  <li key={i} className="border-b border-dashed pb-2 flex justify-between">
                    <div>
                      <span className="font-bold text-lg block">{med.name} <span className="text-sm font-normal text-gray-500">({med.concentration})</span></span>
                      <span className="text-sm text-gray-600">{med.form}</span>
                    </div>
                    <span className="font-bold text-lg">{med.dose}</span>
                  </li>
                ))}
              </ul>
            </div>

            {(report.labs?.length > 0 || report.radiology?.length > 0) && (
              <div className="border p-4 rounded-xl mt-4">
                <h4 className="font-bold mb-2">المطلوب (فحوصات/أشعة):</h4>
                <ul className="list-disc list-inside text-sm">
                  {report.labs?.map((l, i) => <li key={i}>{l}</li>)}
                  {report.radiology?.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t flex justify-between items-end text-sm text-gray-500">
            <div>
              <p>المتابعة: {report.followUp || 'عند اللزوم'}</p>
              <p className="text-xs mt-1">Generated by Sehaty AI</p>
            </div>
            <div className="text-center w-32">
              <div className="h-12 border-b border-dashed border-gray-300 mb-2"></div>
              <p>توقيع الطبيب</p>
            </div>
          </div>
        </div>
      )}

      {/* --- 4. تفاصيل الشكوى (للتذكير) --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-slate-100 print:hidden">
        <p className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wide">الشكوى الأصلية</p>
        <p className="text-gray-800 leading-relaxed">{data.content}</p>
      </div>

      {/* --- 5. منطقة الدردشة (تظهر دائماً للتاريخ) --- */}
      <div className="print:hidden">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
          <Activity className="text-blue-600"/> سجل المحادثة
        </h2>
        {/* نمرر isReadOnly إذا كانت الحالة مغلقة لمنع الكتابة، أو نتركها مفتوحة للمتابعة حسب رغبتك */}
        <ChatArea consultationId={id} currentUserId={currentUser.id} />
      </div>

      {/* CSS للطباعة */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:block { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
