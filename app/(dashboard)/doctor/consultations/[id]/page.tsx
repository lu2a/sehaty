'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Clock, AlertTriangle, FileText, CheckCircle, 
  Printer, ArrowRight, Stethoscope, Pill, FlaskConical, MessageCircle,
  Share2, ChevronLeft, ChevronRight, Play, AlertOctagon, CornerUpLeft, XCircle
} from 'lucide-react';
import SearchableSelect from '@/components/ui/SearchableSelect';

// --- Types ---
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

// تعريف الواجهات لتسهيل التعامل مع البيانات
interface MedicalFile {
  id: string;
  full_name: string;
  birth_date: string;
  gender: string;
  weight?: number;
  blood_type?: string;
  chronic_diseases?: any;
}

interface Consultation {
  id: string;
  created_at: string;
  content: string;
  status: 'pending' | 'active' | 'referred' | 'passed' | 'closed' | 'reported';
  is_emergency: boolean;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  medical_files?: MedicalFile;
  doctor_reply?: string;
  diagnosis?: string;
}

// --- Components ---

// 1. مكون الروشتة (Prescription A4)
const PrescriptionView = ({ data, centerSettings, onBack }: any) => {
  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg border">
          <ArrowRight size={18} /> عودة للتعديل
        </button>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm">
            <Printer size={18} /> طباعة / PDF
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-sm">
            <Share2 size={18} /> مشاركة واتساب
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

        {/* Diagnosis */}
        {data.diagnosis && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-1">التشخيص (Diagnosis):</h3>
            <p className="text-gray-700 bg-gray-50 p-2 rounded px-4 inline-block">{data.diagnosis}</p>
          </div>
        )}

        {/* Rx */}
        <div className="mb-8">
          <h3 className="text-5xl font-serif font-bold text-blue-600 italic mb-6">Rx</h3>
          <div className="space-y-6">
            {data.medications.map((med: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start border-b border-dashed border-gray-200 pb-4">
                <div className="flex-1">
                  <p className="font-bold text-xl text-gray-800 flex items-center gap-2">
                    <span className="text-gray-400 text-sm w-6">{idx + 1}.</span> 
                    {med.name}
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

        {/* Labs & Rads */}
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

        {/* Messages & Red Flags */}
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

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-[1.5cm] border-t pt-4 flex justify-between items-end">
           <div>
             <p className="text-sm text-gray-600 mb-1"><span className="font-bold">المتابعة:</span> {data.followUp || 'عند اللزوم'}</p>
             <p className="text-xs text-gray-400">Generated by Sehaty AI</p>
           </div>
           <div className="text-center">
             <div className="h-16 w-32 mb-2 flex items-center justify-center opacity-20">
               {/* مكان التوقيع الإلكتروني */}
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

// 2. الصفحة الرئيسية (Logic)
export default function DoctorConsultationPage() {
  const { id } = useParams();
  const supabase = createClient();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [centerSettings, setCenterSettings] = useState<any>(null);
  const [view, setView] = useState<'details' | 'wizard' | 'prescription'>('details');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Lookups (from DB)
  const [lists, setLists] = useState<any>({
    specialty: [], diagnosis: [], medication: [], lab: [], radiology: [], advice: [], red_flag: []
  });

  // Action Modals
  const [actionType, setActionType] = useState<'refer' | 'report' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [targetSpecialty, setTargetSpecialty] = useState('');

  // Wizard Data
  const [step, setStep] = useState(1);
  const [replyData, setReplyData] = useState<ReplyData>({
    diagnosis: '', medications: [], labs: [], radiology: [], advice: '', redFlags: '', followUp: '', notes: ''
  });

  // Fetch Data
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 1. Consultation & File
      // استخدمنا (as any) هنا لتجنب مشاكل TypeScript مع العلاقات
      const { data: consult } = await (supabase.from('consultations') as any)
        .select('*, medical_files(*)')
        .eq('id', id).single();
      
      if (consult) setConsultation(consult as Consultation);

      // 2. Center Settings
      const { data: settings } = await (supabase.from('center_settings') as any).select('*').single();
      setCenterSettings(settings);

      // 3. Medical Lists (Dropdowns)
      const { data: listData } = await supabase.from('medical_lists').select('*');
      if (listData) {
        const grouped = listData.reduce((acc: any, item: any) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item.value);
          return acc;
        }, {});
        setLists((prev: any) => ({ ...prev, ...grouped }));
      }

      setLoading(false);
    };
    init();
  }, [id]);

  // Actions
  const handleStart = async () => {
    if (!currentUser) return;
    
    // 🔴 التصحيح هنا: استخدام (as any) لتجاوز خطأ Type error ومنع التوقف عند never
    await (supabase.from('consultations') as any)
      .update({ status: 'active', doctor_id: currentUser.id })
      .eq('id', id);

    setView('wizard');
  };

  const handleSkip = async () => {
    if (!confirm('هل أنت متأكد من تخطي هذه الحالة؟ ستعود لقائمة الانتظار.')) return;
    
    // 🔴 تصحيح هنا أيضاً
    await (supabase.from('consultations') as any)
      .update({ status: 'pending', doctor_id: null })
      .eq('id', id);

    router.push('/doctor/dashboard');
  };

  const handleSubmitAction = async () => {
    const note = actionType === 'refer' 
      ? `تم التحويل إلى: ${targetSpecialty}. ملاحظات: ${actionNote}` 
      : `سبب الإبلاغ: ${actionNote}`;

    const newStatus = actionType === 'refer' ? 'referred' : 'reported';

    // 🔴 تصحيح هنا أيضاً
    await (supabase.from('consultations') as any)
      .update({ status: newStatus, doctor_reply: note })
      .eq('id', id);
      
    alert('تم تنفيذ الإجراء بنجاح');
    router.push('/doctor/dashboard');
  };

  const handleFinish = async () => {
    // 🔴 تصحيح هنا أيضاً
    await (supabase.from('consultations') as any).update({
      status: 'closed',
      doctor_reply: JSON.stringify(replyData), 
      diagnosis: replyData.diagnosis,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    
    setView('prescription');
  };

  if (loading) return <div className="p-20 text-center"><span className="animate-spin text-2xl">⏳</span></div>;
  if (!consultation) return <div className="p-20 text-center text-red-500">الاستشارة غير موجودة</div>;

  // --- Views ---

  if (view === 'prescription') {
    return (
      <PrescriptionView 
        data={{
          ...replyData,
          patientName: consultation.medical_files?.full_name,
          patientId: consultation.medical_files?.id,
          patientAge: consultation.medical_files?.birth_date ? new Date().getFullYear() - new Date(consultation.medical_files.birth_date).getFullYear() : '--',
          doctorName: 'اسم الطبيب', // يمكن جلبه من البروفايل
          specialty: 'باطنة عامة'
        }}
        centerSettings={centerSettings}
        onBack={() => setView('wizard')}
      />
    );
  }

  if (view === 'wizard') {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8 dir-rtl font-cairo bg-slate-50 min-h-screen">
        {/* Progress */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 px-2">
            <span className={step >= 1 ? 'text-blue-600' : ''}>1. التشخيص</span>
            <span className={step >= 2 ? 'text-blue-600' : ''}>2. الأدوية</span>
            <span className={step >= 3 ? 'text-blue-600' : ''}>3. الفحوصات</span>
            <span className={step >= 4 ? 'text-blue-600' : ''}>4. الأشعة</span>
            <span className={step >= 5 ? 'text-blue-600' : ''}>5. النصائح</span>
            <span className={step >= 6 ? 'text-blue-600' : ''}>6. علامات الخطر</span>
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
              <h2 className="text-xl font-bold flex items-center gap-2"><Stethoscope className="text-blue-600"/> التشخيص (Diagnosis)</h2>
              <SearchableSelect 
                options={lists.diagnosis || []}
                value={replyData.diagnosis}
                onChange={(val) => setReplyData({...replyData, diagnosis: val})}
                placeholder="ابحث عن التشخيص أو اكتبه..."
              />
              <textarea 
                className="w-full p-4 border rounded-xl h-32 mt-4 bg-gray-50"
                placeholder="تفاصيل إضافية للتشخيص (اختياري)..."
              />
            </div>
          )}

          {/* Step 2: Medications */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-8">
              <h2 className="text-xl font-bold flex items-center gap-2"><Pill className="text-green-600"/> الأدوية (Medications)</h2>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                <div className="col-span-2">
                  <label className="text-xs font-bold mb-1 block">اسم الدواء</label>
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
                  <label className="text-xs font-bold mb-1 block">التركيز</label>
                  <input id="med-conc" placeholder="500mg" className="w-full p-2.5 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block">الشكل</label>
                  <select id="med-form" className="w-full p-2.5 rounded-lg border text-sm">
                    <option>أقراص</option><option>شراب</option><option>حقن</option><option>دهان</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block">الجرعة</label>
                  <input id="med-dose" placeholder="1x3 بعد الأكل" className="w-full p-2.5 rounded-lg border text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block">المدة</label>
                  <input id="med-dur" placeholder="5 أيام" className="w-full p-2.5 rounded-lg border text-sm" />
                </div>
                
                <button 
                  className="col-span-2 md:col-span-6 bg-blue-600 text-white py-2 rounded-lg font-bold mt-2 hover:bg-blue-700"
                  onClick={() => {
                    const nameHidden = (document.getElementById('med-name-hidden') as HTMLInputElement).value;
                    const nameSelect = (document.querySelector('div[class*="text-gray-800"]') as HTMLElement)?.innerText;
                    const name = nameHidden || nameSelect || 'دواء';
                    
                    const conc = (document.getElementById('med-conc') as HTMLInputElement).value;
                    const form = (document.getElementById('med-form') as HTMLInputElement).value;
                    const dose = (document.getElementById('med-dose') as HTMLInputElement).value;
                    const dur = (document.getElementById('med-dur') as HTMLInputElement).value;
                    
                    if (name && name !== 'اختر...') {
                      setReplyData({...replyData, medications: [...replyData.medications, { name, concentration: conc, form, dose, duration: dur }]});
                    }
                  }}
                >
                  + إضافة الدواء
                </button>
              </div>

              <div className="space-y-2 mt-4">
                {replyData.medications.map((m, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm">
                    <div>
                      <span className="font-bold text-gray-800">{m.name}</span>
                      <span className="text-xs text-gray-500 mx-2">{m.concentration} - {m.form}</span>
                      <span className="text-blue-600 text-sm font-bold">({m.dose})</span>
                    </div>
                    <button onClick={() => {
                       const newMeds = [...replyData.medications];
                       newMeds.splice(i, 1);
                       setReplyData({...replyData, medications: newMeds});
                    }} className="text-red-500 hover:bg-red-50 p-1 rounded"><XCircle size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Labs */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-8">
              <h2 className="text-xl font-bold flex items-center gap-2"><FlaskConical className="text-purple-600"/> التحاليل الطبية (Labs)</h2>
              <SearchableSelect 
                options={lists.lab || []}
                value=""
                onChange={(val) => setReplyData({...replyData, labs: [...replyData.labs, val]})}
                placeholder="ابحث عن التحليل..."
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {replyData.labs.map((l, i) => (
                  <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                    {l} <button onClick={() => {
                      const newLabs = replyData.labs.filter((_, idx) => idx !== i);
                      setReplyData({...replyData, labs: newLabs});
                    }}><XCircle size={14}/></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Radiology */}
          {step === 4 && (
            <div className="space-y-4 animate-in slide-in-from-right-8">
              <h2 className="text-xl font-bold flex items-center gap-2"><AlertOctagon className="text-indigo-600"/> الأشعة (Radiology)</h2>
              <SearchableSelect 
                options={lists.radiology || []}
                value=""
                onChange={(val) => setReplyData({...replyData, radiology: [...replyData.radiology, val]})}
                placeholder="ابحث عن نوع الأشعة..."
              />
               <div className="flex flex-wrap gap-2 mt-4">
                {replyData.radiology.map((r, i) => (
                  <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                    {r} <button onClick={() => {
                      const newRads = replyData.radiology.filter((_, idx) => idx !== i);
                      setReplyData({...replyData, radiology: newRads});
                    }}><XCircle size={14}/></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Advice */}
          {step === 5 && (
            <div className="space-y-4 animate-in slide-in-from-right-8">
              <h2 className="text-xl font-bold flex items-center gap-2"><MessageCircle className="text-blue-600"/> رسائل وتوجيهات للمريض</h2>
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-500 mb-2 block">رسائل جاهزة:</label>
                <SearchableSelect 
                  options={lists.advice || []}
                  value=""
                  onChange={(val) => setReplyData({...replyData, advice: replyData.advice ? `${replyData.advice}\n- ${val}` : `- ${val}`})}
                  placeholder="اختر رسالة جاهزة..."
                />
              </div>
              <textarea 
                className="w-full p-4 border rounded-xl h-40 focus:ring-2 focus:ring-blue-100 outline-none"
                value={replyData.advice}
                onChange={(e) => setReplyData({...replyData, advice: e.target.value})}
                placeholder="أو اكتب النصائح هنا..."
              />
            </div>
          )}

          {/* Step 6: Red Flags */}
          {step === 6 && (
            <div className="space-y-4 animate-in slide-in-from-right-8">
              <h2 className="text-xl font-bold flex items-center gap-2 text-red-600"><AlertTriangle/> علامات الخطر (Red Flags)</h2>
              <p className="text-sm text-gray-500">تحذيرات تستدعي الذهاب للطوارئ.</p>
              <SearchableSelect 
                options={lists.red_flag || []}
                value=""
                onChange={(val) => setReplyData({...replyData, redFlags: replyData.redFlags ? `${replyData.redFlags}\n- ${val}` : `- ${val}`})}
                placeholder="اختر تحذيراً..."
              />
              <textarea 
                className="w-full p-4 border border-red-200 bg-red-50 rounded-xl h-32 focus:ring-2 focus:ring-red-100 outline-none"
                value={replyData.redFlags}
                onChange={(e) => setReplyData({...replyData, redFlags: e.target.value})}
              />
            </div>
          )}

          {/* Step 7: Finalize */}
          {step === 7 && (
            <div className="space-y-6 text-center py-8 animate-in zoom-in-95">
              <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">جاهز لإصدار الروشتة</h2>
              <div className="bg-gray-50 p-6 rounded-2xl max-w-md mx-auto text-right space-y-2 border">
                <p><strong>التشخيص:</strong> {replyData.diagnosis}</p>
                <p><strong>الأدوية:</strong> {replyData.medications.length} أصناف</p>
                <p><strong>التحاليل:</strong> {replyData.labs.length}</p>
              </div>
              
              <div className="max-w-md mx-auto text-right">
                <label className="font-bold text-sm block mb-1">ميعاد المتابعة:</label>
                <input 
                  type="date" 
                  className="w-full p-3 border rounded-xl mb-4"
                  onChange={(e) => setReplyData({...replyData, followUp: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          <div className="mt-auto pt-6 border-t flex justify-between">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold">
                <ChevronRight size={20} /> السابق
              </button>
            )}
            {step < 7 ? (
              <button onClick={() => setStep(step + 1)} className="mr-auto flex items-center gap-2 px-8 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-lg shadow-blue-200">
                التالي <ChevronLeft size={20} />
              </button>
            ) : (
              <button onClick={handleFinish} className="mr-auto flex items-center gap-2 px-8 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 font-bold shadow-lg shadow-green-200">
                إصدار الروشتة <CheckCircle size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View: Details (Initial)
  return (
    <div className="p-4 md:p-8 dir-rtl font-cairo bg-slate-50 min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Right: Consultation Info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-800">استشارة #{consultation.id.slice(0,6)}</h1>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
              {new Date(consultation.created_at).toLocaleDateString('ar-EG')}
            </span>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed bg-slate-50 p-5 rounded-xl border mb-6">
            {consultation.content}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button onClick={handleStart} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
              <Play size={20} fill="currentColor" /> استلام والرد
            </button>
            <button onClick={() => setActionType('refer')} className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <CornerUpLeft size={18} /> تحويل
            </button>
            <button onClick={handleSkip} className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-orange-600 hover:bg-orange-50 flex items-center gap-2">
              <ArrowRight size={18} /> تخطي
            </button>
            <button onClick={() => setActionType('report')} className="px-6 py-3 border border-red-200 rounded-xl font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
              <AlertOctagon size={18} /> إبلاغ
            </button>
          </div>
        </div>
      </div>

      {/* Left: Patient File & Actions */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><User size={20}/> بيانات المريض</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">الاسم</span>
              <span className="font-bold">{consultation.medical_files?.full_name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">تاريخ الميلاد</span>
              <span className="font-bold">{consultation.medical_files?.birth_date}</span>
            </div>
          </div>
          
          {/* ✅ هذا الرابط الآن يعمل ويفتح الملف في تبويب جديد */}
          <Link 
            href={`/doctor/file/${consultation.medical_files?.id}`} 
            target="_blank"
            className="block w-full text-center bg-gray-100 text-gray-700 font-bold py-3 rounded-xl mt-6 hover:bg-gray-200 transition"
          >
            عرض الملف الطبي الكامل ↗
          </Link>
        </div>
      </div>

      {/* Modal for Refer/Report */}
      {actionType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-4">{actionType === 'refer' ? 'تحويل لمخصص آخر' : 'إبلاغ الإدارة'}</h3>
            
            {actionType === 'refer' && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">اختر التخصص:</label>
                <SearchableSelect 
                  options={lists.specialty || []}
                  value={targetSpecialty}
                  onChange={setTargetSpecialty}
                  placeholder="ابحث عن التخصص..."
                />
              </div>
            )}
            
            <textarea 
              className="w-full border rounded-xl p-3 h-32 mb-4 focus:ring-2 ring-blue-100 outline-none"
              placeholder={actionType === 'refer' ? 'سبب التحويل وملاحظات...' : 'سبب الإبلاغ عن هذه الاستشارة...'}
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
            />
            
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
