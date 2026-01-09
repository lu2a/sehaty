'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { 
  Clock, Calendar, Stethoscope, FileText, MessageCircle, 
  CornerUpLeft, AlertOctagon, ArrowRight, CheckCircle, 
  Baby, Cigarette, Activity, Pill, Scissors, X, Mic, Image as ImageIcon,
  ChevronDown, Phone
} from 'lucide-react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import ChatArea from '@/components/consultation/ChatArea';
import MedicalFileModal from '@/components/consultation/MedicalFileModal';
import { sendNotification } from '@/utils/notifications';

// --- Interfaces ---
interface Consultation {
  id: string;
  user_id: string;
  created_at: string;
  content: string;
  symptoms_list?: string[];
  signs_list?: string[];
  images_urls?: string[];
  voice_url?: string;
  status: 'pending' | 'active' | 'referred' | 'passed' | 'closed' | 'reported' | 'resolved';
  is_emergency: boolean;
  clinic_id?: string;
  clinics?: { name: string };
  medical_files?: any; // تفاصيل الملف الطبي
  doctor_reply?: string;
  diagnosis?: string;
}

interface ReplyData {
  diagnosis: string;
  medications: any[];
  labs: string[];
  radiology: string[];
  advice: string;
  redFlags: string;
  followUp: string;
  notes: string;
}

// --- Component: Prescription View (A4) ---
// (نفس المكون السابق للروشتة، يتم عرضه عند الانتهاء)
const PrescriptionView = ({ data, centerSettings, onBack, onExit }: any) => {
  const handlePrint = () => window.print();
  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in bg-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg border">عودة للتعديل</button>
        <div className="flex gap-2">
          <button onClick={onExit} className="bg-slate-800 text-white px-6 py-2 rounded-lg flex items-center gap-2">إنهاء</button>
          <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">طباعة</button>
        </div>
      </div>
      {/* ... (محتوى الروشتة A4 كما هو في الكود السابق) ... */}
      <div className="bg-white shadow-xl print:shadow-none w-full max-w-[21cm] min-h-[29.7cm] mx-auto p-[1cm] relative text-right dir-rtl font-cairo border print:border-none">
         <h1 className="text-2xl font-bold text-center mb-4">وصفة طبية</h1>
         <div className="border-b pb-4 mb-4">
            <p><strong>المريض:</strong> {data.patientName}</p>
            <p><strong>التشخيص:</strong> {data.diagnosis}</p>
         </div>
         <ul className="space-y-4">
            {data.medications.map((m:any, i:number) => (
                <li key={i} className="font-bold text-lg">• {m.name} <span className="text-sm font-normal text-gray-600">({m.dose})</span></li>
            ))}
         </ul>
         <div className="mt-10 pt-4 border-t text-sm text-gray-500">
             <p>تعليمات: {data.advice}</p>
         </div>
      </div>
    </div>
  );
};

export default function DoctorConsultationPage() {
  const params = useParams();
  const id = params?.id as string;
  const supabase = createClient();
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  
  // UI States
  const [view, setView] = useState<'details' | 'wizard' | 'prescription'>('details');
  const [showChat, setShowChat] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Action States
  const [actionType, setActionType] = useState<'refer' | 'report' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [targetSpecialty, setTargetSpecialty] = useState('');
  const [lists, setLists] = useState<any>({});
  
  // Wizard Data
  const [replyData, setReplyData] = useState<ReplyData>({
    diagnosis: '', medications: [], labs: [], radiology: [], advice: '', redFlags: '', followUp: '', notes: ''
  });

  // Helper: Time Ago
  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} يوم`;
    if (hours > 0) return `${hours} ساعة`;
    return `${minutes} دقيقة`;
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await (supabase.from('profiles') as any).select('*').eq('id', user.id).single();
        setDoctorProfile(profile);
      }

      // 1. جلب بيانات الاستشارة مع العلاقات
      const { data: consult } = await (supabase.from('consultations') as any)
        .select(`
          *,
          medical_files (*),
          clinics (name)
        `)
        .eq('id', id).single();
      
      if (consult) {
        setConsultation(consult as Consultation);
        // تحديث الحالة إلى active عند الفتح
        if (consult.status === 'pending' && user) {
           await (supabase.from('consultations') as any).update({ status: 'active', doctor_id: user.id }).eq('id', id);
           
           // تنبيه للمريض ببدء المراجعة
           if (consult.user_id) {
             await sendNotification(consult.user_id, 'جاري المراجعة 👨‍⚕️', 'بدأ الطبيب في مراجعة ملفك.', `/consultations/${id}`);
           }
        }
      }

      // 2. جلب القوائم الطبية (للوصفة)
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

      // 3. مراقبة الرسائل الجديدة للعداد (Badge)
      const channel = supabase.channel(`badge_${id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `consultation_id=eq.${id}` }, 
        (payload) => {
          if (payload.new.sender_id !== user?.id) {
            setUnreadCount(prev => prev + 1);
          }
        })
        .subscribe();
        
      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, [id]);

  // --- Handlers ---
  const handleSkip = async () => {
    if(!confirm('هل أنت متأكد من تخطي الحالة؟')) return;
    await (supabase.from('consultations') as any).update({ status: 'passed', doctor_id: null }).eq('id', id);
    router.push('/doctor/dashboard');
  };

  const handleFinish = async () => {
    const now = new Date();
    await (supabase.from('consultations') as any).update({
      status: 'resolved',
      doctor_reply: JSON.stringify(replyData),
      diagnosis: replyData.diagnosis,
      updated_at: now.toISOString()
    }).eq('id', id);

    // تنبيه للمريض
    if (consultation?.user_id) {
        await sendNotification(consultation.user_id, 'تم الرد ✅', 'تم إصدار الروشتة الطبية.', `/consultations/${id}`);
    }
    setView('prescription');
  };

  const handleEndChat = async () => {
    if(!confirm('إنهاء المحادثة؟')) return;
    await (supabase.from('consultations') as any).update({status: 'closed'}).eq('id', id);
    setConsultation(prev => prev ? {...prev, status: 'closed'} : null);
    if (consultation?.user_id) await sendNotification(consultation.user_id, 'تم الإغلاق 🔒', 'تم إنهاء المحادثة.', `/consultations/${id}`);
  };

  // --- Render ---
  if (loading) return <div className="flex h-screen items-center justify-center text-blue-600 bg-slate-50">جاري التحميل...</div>;
  if (!consultation) return <div className="p-10 text-center bg-slate-50 h-screen">الاستشارة غير موجودة</div>;

  if (view === 'prescription') {
    return <PrescriptionView 
        data={{...replyData, patientName: consultation.medical_files?.full_name, doctorName: doctorProfile?.full_name}} 
        onBack={() => setView('wizard')} 
        onExit={() => router.push('/doctor/dashboard')} 
    />;
  }

  const mf = consultation.medical_files;
  const isFemale = mf?.gender === 'female';

  return (
    <div className="bg-slate-50 min-h-screen dir-rtl font-cairo pb-24 text-slate-800">
      
      {/* 1. Sticky Header Bar (معلومات الاستشارة) */}
      <div className="bg-white border-b px-3 py-2 text-[10px] text-gray-500 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex gap-3 items-center">
          <span className="flex items-center gap-1 font-bold text-gray-600"><Calendar size={10}/> {new Date(consultation.created_at).toLocaleDateString('ar-EG')}</span>
          <span className="flex items-center gap-1"><Clock size={10}/> {new Date(consultation.created_at).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
             منذ {getTimeAgo(consultation.created_at)}
          </span>
        </div>
        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
            {consultation.clinics?.name || 'عام'}
        </span>
      </div>

      {/* 2. Sub-Header (اسم المريض وملخص) */}
      <div className="px-3 py-3 bg-white border-b shadow-sm mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-gray-100 text-gray-500 px-1 rounded text-[10px]">#{consultation.id.slice(0,4)}</span> 
              {mf?.full_name?.split(' ').slice(0, 2).join(' ')}
            </h1>
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
              {consultation.content.substring(0, 35)}...
            </p>
          </div>
          {consultation.is_emergency && (
            <span className="animate-pulse bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
              <AlertOctagon size={10}/> طارئة
            </span>
          )}
        </div>
      </div>

      <div className="px-3 space-y-3">
        
        {/* 3. Patient Compact Card (معلومات طبية مختصرة) */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
          
          <div className="grid grid-cols-3 gap-y-2 gap-x-1 text-slate-700 mb-2">
            <div className="flex items-center gap-1">
              <span className="text-gray-400">السن:</span> 
              <span className="font-bold">{mf?.birth_date ? new Date().getFullYear() - new Date(mf.birth_date).getFullYear() : '-'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">النوع:</span> 
              <span className="font-bold">{mf?.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Cigarette size={12} className={mf?.smoking_status === 'smoker' ? 'text-red-500' : 'text-gray-300'}/>
              <span className="font-bold">{mf?.smoking_status === 'smoker' ? 'مدخن' : 'غير'}</span>
            </div>
            
            {isFemale && (
              <div className="col-span-3 flex gap-3 border-t border-blue-100 pt-2 mt-1">
                <span className={`flex items-center gap-1 ${mf?.pregnancy_status ? 'text-pink-600 font-bold' : ''}`}><Baby size={12}/> حمل: {mf?.pregnancy_status ? 'نعم' : 'لا'}</span>
                <span className={`flex items-center gap-1 ${mf?.lactation_status ? 'text-pink-600 font-bold' : ''}`}>رضاعة: {mf?.lactation_status ? 'نعم' : 'لا'}</span>
              </div>
            )}
          </div>

          <div className="border-t border-blue-200/50 pt-2 space-y-1.5">
             <div className="flex gap-1 items-start">
               <Pill size={12} className="text-blue-400 mt-0.5 shrink-0"/>
               <span className="truncate text-gray-600">{mf?.chronic_diseases_details || 'لا أمراض مزمنة'}</span>
             </div>
             <div className="flex gap-1 items-start">
               <Scissors size={12} className="text-blue-400 mt-0.5 shrink-0"/>
               <span className="truncate text-gray-600">{mf?.surgeries || 'لا عمليات سابقة'}</span>
             </div>
          </div>
          
          <button 
            onClick={() => setShowFileModal(true)}
            className="absolute top-2 left-2 bg-white border border-blue-200 shadow-sm text-blue-600 px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-50 flex items-center gap-1"
          >
            <Activity size={10}/> الملف الكامل
          </button>
        </div>

        {/* 4. Consultation Details (المحتوى الرئيسي) */}
        <div className={`bg-white rounded-xl shadow-sm border p-4 transition-all ${view === 'wizard' ? 'hidden' : 'block'}`}>
          <h3 className="font-bold text-sm text-slate-800 mb-3 border-b pb-2 flex items-center gap-2">
            <FileText size={16} className="text-blue-600"/> تفاصيل الشكوى
          </h3>
          
          {/* النص */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm leading-7 text-gray-800 whitespace-pre-wrap mb-4">
            {consultation.content}
          </div>

          {/* Tags (الأعراض والعلامات) */}
          <div className="space-y-3">
            {(consultation.symptoms_list?.length || 0) > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {consultation.symptoms_list?.map((s, i) => (
                    <span key={i} className="bg-yellow-50 text-yellow-700 border border-yellow-100 px-2 py-1 rounded-md text-[11px] font-medium">{s}</span>
                    ))}
                </div>
            )}
            
            {(consultation.signs_list?.length || 0) > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {consultation.signs_list?.map((s, i) => (
                    <span key={i} className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded-md text-[11px] font-medium">{s}</span>
                    ))}
                </div>
            )}
          </div>

          {/* Media Attachments */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {consultation.images_urls?.map((img, idx) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border h-28 bg-gray-100 cursor-pointer" onClick={() => window.open(img, '_blank')}>
                <img src={img} alt="attached" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 bg-black/60 text-white px-2 py-1 rounded-tl-lg text-[10px] flex items-center gap-1"><ImageIcon size={10}/> صورة</div>
              </div>
            ))}
            
            {consultation.voice_url && (
              <div className="col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-full shadow-sm shadow-blue-200"><Mic size={16}/></div>
                <div className="flex-1">
                    <p className="text-[10px] text-blue-800 font-bold mb-1">تسجيل صوتي مرفق</p>
                    <audio controls src={consultation.voice_url} className="w-full h-6" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Reply Wizard (مدمج في الصفحة) */}
        {view === 'wizard' && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-4 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-green-700 flex items-center gap-2"><Stethoscope size={18}/> الرد والروشتة</h3>
                <button onClick={() => setView('details')} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold block mb-1">التشخيص المبدئي</label>
                    <SearchableSelect options={lists.diagnosis || []} value={replyData.diagnosis} onChange={(v) => setReplyData({...replyData, diagnosis: v})} placeholder="اكتب التشخيص..." />
                </div>
                
                {/* Simplified Input for Mobile */}
                <textarea 
                    className="w-full border p-3 rounded-lg h-32 text-sm bg-gray-50 focus:bg-white transition" 
                    placeholder="اكتب تفاصيل العلاج والملاحظات هنا..."
                    onChange={(e) => setReplyData({...replyData, advice: e.target.value})}
                ></textarea>

                <button onClick={handleFinish} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-green-700 flex justify-center gap-2">
                    <CheckCircle size={18}/> إصدار الروشتة وإنهاء
                </button>
            </div>
          </div>
        )}

      </div>

      {/* 6. Sticky Bottom Action Bar (ثابت بالأسفل) */}
      {view !== 'prescription' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 pb-safe safe-area-bottom">
            <div className="grid grid-cols-6 gap-1 p-2 text-[10px] font-bold text-gray-500">
            
            <button 
                onClick={() => setView('wizard')}
                className={`flex flex-col items-center justify-center py-1 rounded-lg transition ${view === 'wizard' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
            >
                <FileText size={20} className="mb-1" />
                الرد
            </button>

            <button 
                onClick={() => setShowChat(true)}
                className="flex flex-col items-center justify-center py-1 rounded-lg hover:bg-gray-50 relative transition"
            >
                <div className="relative">
                <MessageCircle size={20} className="mb-1 text-blue-600" />
                {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center rounded-full border-2 border-white animate-bounce">{unreadCount}</span>}
                </div>
                المحادثة
            </button>

            <button 
                onClick={() => setShowFileModal(true)}
                className="flex flex-col items-center justify-center py-1 rounded-lg hover:bg-gray-50 transition"
            >
                <Activity size={20} className="mb-1" />
                الملف
            </button>

            <button 
                onClick={handleSkip}
                className="flex flex-col items-center justify-center py-1 rounded-lg hover:bg-orange-50 text-orange-600 transition"
            >
                <ArrowRight size={20} className="mb-1" />
                تخطي
            </button>

            <button 
                onClick={() => setActionType('refer')}
                className="flex flex-col items-center justify-center py-1 rounded-lg hover:bg-gray-50 transition"
            >
                <CornerUpLeft size={20} className="mb-1" />
                تحويل
            </button>

            <button 
                onClick={() => setActionType('report')}
                className="flex flex-col items-center justify-center py-1 rounded-lg hover:bg-red-50 text-red-600 transition"
            >
                <AlertOctagon size={20} className="mb-1" />
                إبلاغ
            </button>

            </div>
        </div>
      )}

      {/* --- Modals --- */}

      {/* 1. Chat Bottom Sheet */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full sm:w-[500px] h-[85vh] sm:h-[600px] sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div>
                  <h3 className="font-bold text-sm text-gray-800">المحادثة المباشرة</h3>
                  <p className="text-[10px] text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> متصل الآن</p>
              </div>
              <button onClick={() => {setShowChat(false); setUnreadCount(0);}} className="bg-white p-1.5 border rounded-full hover:bg-gray-100 shadow-sm"><ChevronDown size={18}/></button>
            </div>
            <div className="flex-1 overflow-hidden relative bg-slate-100">
               <ChatArea 
                 consultationId={id} 
                 currentUserId={currentUser?.id}
                 doctorName={doctorProfile?.full_name}
                 isClosed={consultation.status === 'closed'}
                 isResolved={consultation.status === 'resolved'}
                 createdAt={consultation.created_at}
                 onEndChat={handleEndChat}
               />
            </div>
          </div>
        </div>
      )}

      {/* 2. Patient File Modal */}
      {showFileModal && <MedicalFileModal file={mf} onClose={() => setShowFileModal(false)} />}

      {/* 3. Action Modal */}
      {actionType && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm animate-in zoom-in-95 shadow-2xl">
            <h3 className="font-bold mb-4 text-lg text-gray-800">{actionType === 'refer' ? 'تحويل الاستشارة' : 'إبلاغ عن محتوى'}</h3>
            {actionType === 'refer' && (
               <div className="mb-3">
                   <label className="text-xs font-bold block mb-1">التخصص المحول إليه</label>
                   <SearchableSelect options={lists.specialty || []} value={targetSpecialty} onChange={setTargetSpecialty} placeholder="اختر التخصص..." />
               </div>
            )}
            <textarea 
              className="w-full border p-3 rounded-xl h-24 text-sm mb-4 bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-100" 
              placeholder="اكتب ملاحظاتك..."
              onChange={(e) => setActionNote(e.target.value)}
            />
            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700">تأكيد</button>
              <button onClick={() => setActionType(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
