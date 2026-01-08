'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, Clock, AlertTriangle, FileText, CheckCircle, 
  Printer, ArrowRight, Stethoscope, Pill, FlaskConical, MessageCircle,
  Share2, ChevronLeft, ChevronRight, Play, AlertOctagon, CornerUpLeft, XCircle, Ban, Activity, Calendar
} from 'lucide-react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import ChatArea from '@/components/consultation/ChatArea';
import MedicalFileModal from '@/components/consultation/MedicalFileModal';

// --- Interfaces ---
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

interface MedicalFile {
  id: string;
  full_name: string;
  birth_date: string;
  gender: string;
  weight?: number;
  blood_type?: string;
  chronic_diseases?: any;
  chronic_diseases_details?: string;
  surgeries?: string;
  height?: number;
}

interface Consultation {
  id: string;
  created_at: string;
  content: string;
  status: 'pending' | 'active' | 'referred' | 'passed' | 'closed' | 'reported';
  is_emergency: boolean;
  medical_files?: MedicalFile;
  doctor_reply?: string;
  diagnosis?: string;
}

// --- Component: Prescription View (A4) ---
const PrescriptionView = ({ data, centerSettings, onBack, onExit }: any) => {
  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg border w-full md:w-auto justify-center">
          <ArrowRight size={18} /> عودة للتعديل
        </button>
        
        <div className="flex gap-2 w-full md:w-auto flex-wrap justify-center">
          <button onClick={onExit} className="bg-slate-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-900 shadow-md font-bold transition-all">
            <CheckCircle size={18} /> إنهاء والعودة للاستشارات
          </button>
          <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm">
            <Printer size={18} /> طباعة
          </button>
        </div>
      </div>

      {/* A4 Paper */}
      <div className="bg-white shadow-xl print:shadow-none w-full max-w-[21cm] min-h-[29.7cm] mx-auto p-[1cm] md:p-[1.5cm] relative text-right dir-rtl font-cairo border print:border-none">
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-blue-600 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-800 mb-2">{centerSettings?.center_name || 'مركز صحتي الطبي'}</h1>
            <p className="text-gray-600 flex items-center gap-2"><span className="font-bold">العنوان:</span> {centerSettings?.address}</p>
            <p className="text-gray-600 flex items-center gap-2"><span className="font-bold">تليفون:</span> {centerSettings?.phone}</p>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-900">د. {data.doctorName}</h2>
            <p className="text-gray-500">استشاري {data.specialty || 'الطب العام'}</p>
          </div>
        </div>

        {/* Patient Bar */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="font-bold text-blue-800">المريض:</span> {data.patientName}</div>
          <div><span className="font-bold text-blue-800">العمر:</span> {data.patientAge} سنة</div>
          <div><span className="font-bold text-blue-800">التاريخ:</span> {new Date().toLocaleDateString('ar-EG')}</div>
          <div><span className="font-bold text-blue-800">رقم الملف:</span> #{data.patientId?.slice(0, 5)}</div>
        </div>

        {/* Content */}
        {data.diagnosis && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-1">التشخيص (Diagnosis):</h3>
            <p className="text-gray-700 bg-gray-50 p-2 rounded px-4 inline-block">{data.diagnosis}</p>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-5xl font-serif font-bold text-blue-600 italic mb-6">Rx</h3>
          <div className="space-y-6">
            {data.medications.map((med: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start border-b border-dashed border-gray-200 pb-4">
                <div className="flex-1">
                  <p className="font-bold text-xl text-gray-800 flex items-center gap-2">
                    <span className="text-gray-400 text-sm w-6">{idx + 1}.</span> {med.name}
                  </p>
                  <div className="text-sm text-gray-600 mr-8 mt-1 flex gap-4">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">{med.concentration}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">{med.form}</span>
                  </div>
                </div>
                <div className="text-left w-1/3">
                  <p className="font-bold text-blue-700 text-lg mb-1">{med.dose}</p>
                  <p className="text-sm text-gray-500">لمدة: {med.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(data.labs.length > 0 || data.radiology.length > 0) && (
          <div className="grid grid-cols-2 gap-8 mb-8">
             {data.labs.length > 0 && (
               <div className="border p-4 rounded-xl">
                 <h4 className="font-bold text-purple-700 mb-2 border-b pb-1">تحاليل مطلوبة</h4>
                 <ul className="list-disc list-inside text-sm space-y-1">{data.labs.map((l:string, i:number) => <li key={i}>{l}</li>)}</ul>
               </div>
             )}
             {data.radiology.length > 0 && (
               <div className="border p-4 rounded-xl">
                 <h4 className="font-bold text-indigo-700 mb-2 border-b pb-1">أشعة مطلوبة</h4>
                 <ul className="list-disc list-inside text-sm space-y-1">{data.radiology.map((r:string, i:number) => <li key={i}>{r}</li>)}</ul>
               </div>
             )}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {data.advice && (
            <div className="flex gap-3 bg-blue-50 p-4 rounded-xl border-r-4 border-blue-500">
              <MessageCircle className="text-blue-500 shrink-0 mt-1" size={20} />
              <div>
                <strong className="block text-blue-900 mb-1">تعليمات طبية:</strong>
                <p className="text-blue-800 text-sm leading-relaxed">{data.advice}</p>
              </div>
            </div>
          )}
          {data.redFlags && (
            <div className="flex gap-3 bg-red-50 p-4 rounded-xl border-r-4 border-red-500">
              <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20} />
              <div>
                <strong className="block text-red-900 mb-1">علامات الخطر (توجه للطوارئ فوراً):</strong>
                <p className="text-red-800 text-sm leading-relaxed">{data.redFlags}</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-[1.5cm] border-t pt-4 flex justify-between items-end">
           <div>
             <p className="text-sm text-gray-600 mb-1"><span className="font-bold">المتابعة:</span> {data.followUp || 'عند اللزوم'}</p>
             <p className="text-xs text-gray-400">Generated by Sehaty AI</p>
           </div>
           <div className="text-center">
             <div className="h-16 w-32 mb-2 flex items-center justify-center opacity-20">
               <span className="font-script text-2xl">Dr. Signature</span>
             </div>
             <p className="text-sm font-bold text-gray-800">توقيع الطبيب</p>
           </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          .max-w-4xl { max-w-none !important; margin: 0 !important; padding: 0 !important; }
          .bg-white { box-shadow: none !important; border: none !important; }
          @page { margin: 0; }
        }
      `}</style>
    </div>
  );
};

// --- Main Page Component ---
export default function DoctorConsultationPage() {
  const params = useParams();
  // تأكد من أن ID هو نص
  const id = params?.id as string;
  
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [centerSettings, setCenterSettings] = useState<any>(null);
  const [view, setView] = useState<'details' | 'wizard' | 'prescription'>('details');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [lists, setLists] = useState<any>({});
  
  // Modal State
  const [showFileModal, setShowFileModal] = useState(false);

  // Actions State
  const [actionType, setActionType] = useState<'refer' | 'report' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [targetSpecialty, setTargetSpecialty] = useState('');

  // Wizard Data
  const [step, setStep] = useState(1);
  const [replyData, setReplyData] = useState<ReplyData>({
    diagnosis: '', medications: [], labs: [], radiology: [], advice: '', redFlags: '', followUp: '', notes: ''
  });

  // Time Ago Logic
  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    return `منذ ${minutes} دقيقة`;
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await (supabase.from('profiles') as any).select('*').eq('id', user.id).single();
        setDoctorProfile(profile);
      }

      // Fetch Consultation
      const { data: consult } = await (supabase.from('consultations') as any)
        .select('*, medical_files(*)')
        .eq('id', id).single();
      
      if (consult) setConsultation(consult as Consultation);

      // Fetch Settings & Lists
      const { data: settings } = await (supabase.from('center_settings') as any).select('*').single();
      setCenterSettings(settings);

      const { data: listData } = await supabase.from('medical_lists').select('*');
      if (listData) {
        const grouped = listData.reduce((acc: any, item: any) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item.value);
          return acc;
        }, {});
        setLists(grouped);
      }

      setLoading(false);
    };
    init();
  }, [id]);

  // --- Handlers ---

  const handleStart = async () => {
    if (!currentUser) return;
    const { error } = await (supabase.from('consultations') as any)
      .update({ status: 'active', doctor_id: currentUser.id })
      .eq('id', id);

    if (error) {
      alert('خطأ: ' + error.message);
      return;
    }
    setView('wizard');
  };

  const handleSkip = async () => {
    if (!confirm('هل أنت متأكد؟')) return;
    await (supabase.from('consultations') as any).update({ status: 'pending', doctor_id: null }).eq('id', id);
    router.push('/doctor/dashboard');
  };

  // ✅ إنهاء المحادثة (الدردشة فقط)
// ✅ دالة إنهاء المحادثة (إغلاق فوري ونهائي بطلب الطبيب)
  const handleEndChatWithAutoMessage = async () => {
    if (!confirm('هل أنت متأكد من إنهاء المحادثة وإغلاقها نهائياً؟')) return;

    const doctorName = doctorProfile?.full_name || 'الطبيب';
    const now = new Date();
    
    // 1. رسالة الوداع
    const autoMessage = `أنا د. ${doctorName}، سعدت جداً بالتحدث معك. أنا في انتظارك دائماً. نتمنى لك دوام الصحة والسعادة.`;
    // 2. رسالة النظام
    const systemMessage = `SYSTEM_MSG: تم إنهاء المحادثة وإغلاق التذكرة في ${now.toLocaleTimeString('ar-EG')}`;

    try {
      // إرسال الرسائل (لاحظ النوع system)
      await (supabase.from('messages') as any).insert([
        { consultation_id: id, sender_id: currentUser.id, content: autoMessage, type: 'text' },
        { consultation_id: id, sender_id: currentUser.id, content: systemMessage, type: 'system' }
      ]);

      // تحديث الحالة إلى مغلقة نهائياً
      await (supabase.from('consultations') as any)
        .update({ status: 'closed', updated_at: now.toISOString() })
        .eq('id', id);

      setConsultation((prev: any) => ({ ...prev, status: 'closed' }));
      
    } catch (error: any) {
      alert('حدث خطأ: ' + error.message);
    }
  };

  // ✅ تحديث handleFinish (عند إصدار الروشتة - تفعيل فترة السماح)
  const handleFinish = async () => {
    const now = new Date();
    
    // هنا نجعل الحالة resolved بدلاً من closed لإعطاء فترة سماح
    // سنستخدم closed في الكود الحالي للتبسيط حسب طلبك الأخير بالإغلاق، 
    // ولكن لتوفر خيار الرد، يمكنك تغيير status: 'resolved'
    
    const { error } = await (supabase.from('consultations') as any).update({
      status: 'resolved', // تغيير الحالة إلى "تم الحل" (فترة سماح)
      doctor_reply: JSON.stringify(replyData),
      diagnosis: replyData.diagnosis,
      updated_at: now.toISOString()
    }).eq('id', id);

    if (error) { alert('خطأ: ' + error.message); return; }
    
    // إرسال تنبيه بالشات
    const systemMessage = `SYSTEM_MSG: تم إصدار الروشتة الطبية. يمكنك الاستفسار لمدة ساعة قبل إغلاق الملف نهائياً.`;
    await (supabase.from('messages') as any).insert({ 
       consultation_id: id, sender_id: currentUser.id, content: systemMessage, type: 'system' 
    });

    setView('prescription');
  };

  const handleSubmitAction = async () => {
    const note = actionType === 'refer' ? `تحويل إلى: ${targetSpecialty}. ملاحظات: ${actionNote}` : `سبب الإبلاغ: ${actionNote}`;
    const newStatus = actionType === 'refer' ? 'referred' : 'reported';

    await (supabase.from('consultations') as any).update({ status: newStatus, doctor_reply: note }).eq('id', id);
    alert('تم تنفيذ الإجراء بنجاح');
    router.push('/doctor/dashboard');
  };


  const handleExit = () => {
    alert('تم الرد وحفظ الروشتة ✅');
    router.push('/doctor/dashboard');
  };

  if (loading) return <div className="p-20 text-center">جار التحميل...</div>;
  if (!consultation) return <div className="p-20 text-center text-red-500">الاستشارة غير موجودة</div>;

  // --- Views ---

  if (view === 'prescription') {
    return (
      <PrescriptionView 
        data={{
          ...replyData,
          patientName: consultation.medical_files?.full_name,
          patientId: consultation.medical_files?.id,
          // ✅ تصحيح: إضافة التحقق من وجود birth_date لتجنب الخطأ
          patientAge: consultation.medical_files?.birth_date ? new Date().getFullYear() - new Date(consultation.medical_files.birth_date).getFullYear() : '--',
          doctorName: doctorProfile?.full_name || 'طبيب',
          specialty: 'باطنة عامة'
        }}
        centerSettings={centerSettings}
        onBack={() => setView('wizard')}
        onExit={handleExit}
      />
    );
  }

  if (view === 'wizard') {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8 dir-rtl font-cairo bg-slate-50 min-h-screen">
        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 px-2">
            <span className={step >= 1 ? 'text-blue-600' : ''}>1. التشخيص</span>
            <span className={step >= 2 ? 'text-blue-600' : ''}>2. الأدوية</span>
            <span className={step >= 3 ? 'text-blue-600' : ''}>3. الفحوصات</span>
            <span className={step >= 4 ? 'text-blue-600' : ''}>4. الأشعة</span>
            <span className={step >= 5 ? 'text-blue-600' : ''}>5. النصائح</span>
            <span className={step >= 6 ? 'text-blue-600' : ''}>6. المخاطر</span>
            <span className={step >= 7 ? 'text-blue-600' : ''}>7. إنهاء</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 7) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[500px] flex flex-col">
          {/* Step 1: Diagnosis */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-8">
              <h2 className="text-xl font-bold flex items-center gap-2"><Stethoscope className="text-blue-600"/> التشخيص</h2>
              <SearchableSelect 
                options={lists.diagnosis || []}
                value={replyData.diagnosis}
                onChange={(val) => setReplyData({...replyData, diagnosis: val})}
                placeholder="ابحث عن التشخيص..."
              />
              <textarea 
                className="w-full p-4 border rounded-xl h-32 mt-4 bg-gray-50"
                placeholder="ملاحظات التشخيص..."
              />
            </div>
          )}

          {/* Step 2: Medications */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-8">
              <h2 className="text-xl font-bold flex items-center gap-2"><Pill className="text-green-600"/> الأدوية</h2>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                <div className="col-span-2">
                  <label className="text-xs font-bold mb-1">الدواء</label>
                  <SearchableSelect 
                    options={lists.medication || []} 
                    value="" 
                    onChange={(val) => {
                      const input = document.getElementById('med-name-input') as HTMLInputElement;
                      if(input) input.value = val;
                      (document.getElementById('med-name-hidden') as HTMLInputElement).value = val;
                    }}
                    placeholder="بحث..."
                  />
                  <input id="med-name-hidden" className="hidden" />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1">التركيز</label>
                  <input id="med-conc" placeholder="500mg" className="w-full p-2.5 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1">الشكل</label>
                  <select id="med-form" className="w-full p-2.5 rounded-lg border text-sm">
                    <option>أقراص</option><option>شراب</option><option>حقن</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold mb-1">الجرعة</label>
                  <input id="med-dose" placeholder="1x3" className="w-full p-2.5 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1">المدة</label>
                  <input id="med-dur" placeholder="5 أيام" className="w-full p-2.5 rounded-lg border text-sm" />
                </div>
                <button 
                  className="col-span-2 md:col-span-6 bg-blue-600 text-white py-2 rounded-lg font-bold mt-2"
                  onClick={() => {
                    const name = (document.getElementById('med-name-hidden') as HTMLInputElement).value || 'دواء';
                    const conc = (document.getElementById('med-conc') as HTMLInputElement).value;
                    const form = (document.getElementById('med-form') as HTMLInputElement).value;
                    const dose = (document.getElementById('med-dose') as HTMLInputElement).value;
                    const dur = (document.getElementById('med-dur') as HTMLInputElement).value;
                    setReplyData({...replyData, medications: [...replyData.medications, { name, concentration: conc, form, dose, duration: dur }]});
                  }}
                >
                  + إضافة
                </button>
              </div>
              <div className="space-y-2 mt-4">
                {replyData.medications.map((m, i) => (
                  <div key={i} className="flex justify-between p-3 border rounded-lg bg-white shadow-sm">
                    <span>{m.name} ({m.concentration})</span>
                    <button onClick={() => {
                       const newMeds = [...replyData.medications];
                       newMeds.splice(i, 1);
                       setReplyData({...replyData, medications: newMeds});
                    }} className="text-red-500"><XCircle size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps 3,4,5,6 (Simplified for brevity, same logic as before) */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><FlaskConical className="text-purple-600"/> التحاليل</h2>
              <SearchableSelect 
                options={lists.lab || []} value="" 
                onChange={(val) => setReplyData({...replyData, labs: [...replyData.labs, val]})} 
                placeholder="بحث..."
              />
              <div className="flex flex-wrap gap-2">{replyData.labs.map((l, i) => <span key={i} className="bg-purple-100 px-3 py-1 rounded-full text-sm">{l}</span>)}</div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><AlertOctagon className="text-indigo-600"/> الأشعة</h2>
              <SearchableSelect 
                options={lists.radiology || []} value="" 
                onChange={(val) => setReplyData({...replyData, radiology: [...replyData.radiology, val]})} 
                placeholder="بحث..."
              />
              <div className="flex flex-wrap gap-2">{replyData.radiology.map((r, i) => <span key={i} className="bg-indigo-100 px-3 py-1 rounded-full text-sm">{r}</span>)}</div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2"><MessageCircle className="text-blue-600"/> النصائح</h2>
              <SearchableSelect 
                options={lists.advice || []} value="" 
                onChange={(val) => setReplyData({...replyData, advice: replyData.advice ? `${replyData.advice}\n- ${val}` : `- ${val}`})}
                placeholder="اختر نصيحة..."
              />
              <textarea className="w-full p-4 border rounded-xl h-40 mt-2" value={replyData.advice} onChange={e => setReplyData({...replyData, advice: e.target.value})} />
            </div>
          )}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-red-600"><AlertTriangle/> علامات الخطر</h2>
              <SearchableSelect 
                options={lists.red_flag || []} value="" 
                onChange={(val) => setReplyData({...replyData, redFlags: replyData.redFlags ? `${replyData.redFlags}\n- ${val}` : `- ${val}`})}
                placeholder="اختر تحذيراً..."
              />
              <textarea className="w-full p-4 border rounded-xl h-32 mt-2 border-red-200 bg-red-50" value={replyData.redFlags} onChange={e => setReplyData({...replyData, redFlags: e.target.value})} />
            </div>
          )}

          {/* Step 7: Finalize */}
          {step === 7 && (
            <div className="space-y-6 text-center py-8">
              <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">جاهز لإصدار الروشتة</h2>
              <div className="max-w-md mx-auto text-right">
                <label className="font-bold text-sm block mb-1">ميعاد المتابعة:</label>
                <input type="date" className="w-full p-3 border rounded-xl mb-4" onChange={(e) => setReplyData({...replyData, followUp: e.target.value})} />
              </div>
            </div>
          )}

          <div className="mt-auto pt-6 border-t flex justify-between">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="px-6 py-2 rounded-xl text-gray-600 font-bold hover:bg-gray-100">السابق</button>}
            {step < 7 ? (
              <button onClick={() => setStep(step + 1)} className="mr-auto px-8 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">التالي</button>
            ) : (
              <button onClick={handleFinish} className="mr-auto px-8 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700">إصدار الروشتة</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View: Main Details
  return (
    <div className="p-4 md:p-8 dir-rtl font-cairo bg-slate-50 min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Right Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-1 h-full ${consultation.status === 'closed' ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">استشارة #{consultation.id.slice(0,6)}</h1>
                {consultation.is_emergency && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><AlertTriangle size={12}/> طارئة</span>}
              </div>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                <Calendar size={14}/> {new Date(consultation.created_at).toLocaleDateString('ar-EG')}
                <span className="bg-gray-100 px-2 rounded-full text-xs">{getTimeAgo(consultation.created_at)}</span>
              </p>
            </div>
            <span className={`px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${consultation.status === 'closed' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
              {consultation.status === 'closed' ? <CheckCircle size={16}/> : <Activity size={16}/>}
              {consultation.status === 'closed' ? 'مغلقة' : 'مفتوحة'}
            </span>
          </div>
          <p className="text-lg text-gray-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{consultation.content}</p>
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b font-bold flex items-center gap-2 text-slate-800">
            <User size={20} className="text-blue-600" /> غرفة المحادثة
          </div>
          <ChatArea 
            consultationId={id} 
            currentUserId={currentUser?.id}
            doctorName={doctorProfile?.full_name}
            // نعتبره مغلقاً فقط إذا كانت الحالة closed، أما resolved فهي مفتوحة
            isClosed={consultation.status === 'closed'} 
            isResolved={consultation.status === 'resolved'}
            createdAt={consultation.created_at}
            onEndChat={handleEndChatWithAutoMessage}
          />
        </div>
      </div>

      {/* Left Column */}
      <div className="space-y-6">
        {/* Actions */}
        {consultation.status !== 'closed' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-3">
            <button onClick={handleStart} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
              <Play size={20} fill="currentColor" /> استلام والرد (روشتة)
            </button>
            <button onClick={() => setActionType('refer')} className="w-full py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
              <CornerUpLeft size={18} /> تحويل
            </button>
            <button onClick={handleSkip} className="w-full py-3 border border-gray-300 rounded-xl font-bold text-orange-600 hover:bg-orange-50 flex items-center justify-center gap-2">
              <ArrowRight size={18} /> تخطي
            </button>
            <button onClick={() => setActionType('report')} className="w-full py-3 border border-red-200 rounded-xl font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-2">
              <AlertOctagon size={18} /> إبلاغ
            </button>
          </div>
        )}

        {/* Patient Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">{consultation.medical_files?.full_name.charAt(0)}</div>
            <div>
              <h3 className="font-bold text-gray-800">{consultation.medical_files?.full_name}</h3>
              <p className="text-xs text-gray-500">#{consultation.medical_files?.id.slice(0,6)}</p>
            </div>
          </div>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">الجنس</span> <b>{consultation.medical_files?.gender === 'male' ? 'ذكر' : 'أنثى'}</b></div>
            {/* ✅ تصحيح: إضافة التحقق هنا أيضاً */}
            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">العمر</span> <b>{consultation.medical_files?.birth_date ? new Date().getFullYear() - new Date(consultation.medical_files.birth_date).getFullYear() : '--'} سنة</b></div>
          </div>
          <button onClick={() => setShowFileModal(true)} className="w-full bg-blue-50 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2 border border-blue-200">
            <FileText size={18} /> عرض الملف الطبي
          </button>
        </div>
      </div>

      {/* Modals */}
      {showFileModal && <MedicalFileModal file={consultation.medical_files} onClose={() => setShowFileModal(false)} />}
      
      {actionType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-4">{actionType === 'refer' ? 'تحويل' : 'إبلاغ'}</h3>
            {actionType === 'refer' && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">التخصص:</label>
                <SearchableSelect options={lists.specialty || []} value={targetSpecialty} onChange={setTargetSpecialty} placeholder="اختر..." />
              </div>
            )}
            <textarea className="w-full border rounded-xl p-3 h-32 mb-4" placeholder="ملاحظات..." value={actionNote} onChange={e => setActionNote(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={handleSubmitAction} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold">تأكيد</button>
              <button onClick={() => setActionType(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
