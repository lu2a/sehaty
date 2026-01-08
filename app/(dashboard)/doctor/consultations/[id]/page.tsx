'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, Calendar, Clock, AlertTriangle, FileText, CheckCircle, 
  XCircle, Send, ArrowRight, ArrowLeft, Printer, Share2, 
  Stethoscope, Pill, FlaskConical, AlertOctagon, MessageCircle, ChevronDown
} from 'lucide-react';

// --- واجهة الروشتة A4 ---
const PrescriptionView = ({ data, centerSettings, onBack }: any) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowRight size={20} /> عودة للتعديل
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Printer size={18} /> طباعة / PDF
          </button>
        </div>
      </div>

      {/* A4 Paper Design */}
      <div ref={printRef} className="bg-white shadow-2xl print:shadow-none w-full max-w-[21cm] min-h-[29.7cm] mx-auto p-[1cm] md:p-[1.5cm] relative text-right dir-rtl font-cairo">
        
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-4 mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-blue-800 mb-1">{centerSettings?.center_name || 'مركز صحتي الطبي'}</h1>
            <p className="text-sm text-gray-500">{centerSettings?.address}</p>
            <p className="text-sm text-gray-500">{centerSettings?.phone}</p>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-800">د. {data.doctorName}</h2>
            <p className="text-sm text-gray-500">استشاري {data.specialty}</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8 flex flex-wrap gap-6 text-sm">
          <div><span className="font-bold text-gray-700">المريض:</span> {data.patientName}</div>
          <div><span className="font-bold text-gray-700">التاريخ:</span> {new Date().toLocaleDateString('ar-EG')}</div>
          <div><span className="font-bold text-gray-700">رقم الملف:</span> #{data.patientId?.slice(0, 8)}</div>
          <div><span className="font-bold text-gray-700">التشخيص:</span> {data.diagnosis}</div>
        </div>

        {/* Rx Symbol */}
        <div className="mb-6">
          <h3 className="text-4xl font-serif font-bold text-blue-600 italic mb-4">Rx</h3>
          
          {/* Medications */}
          <div className="space-y-4 mb-8">
            {data.medications.map((med: any, idx: number) => (
              <div key={idx} className="flex justify-between items-baseline border-b border-dashed border-gray-200 pb-2">
                <div>
                  <p className="font-bold text-lg text-gray-800">
                    {idx + 1}. {med.name} <span className="text-sm font-normal text-gray-500">({med.concentration})</span>
                  </p>
                  <p className="text-sm text-gray-600 mr-4">{med.form} - {med.dose}</p>
                </div>
                <div className="text-sm font-bold text-blue-600">{med.duration}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lab & Radiology */}
        {(data.labs.length > 0 || data.radiology.length > 0) && (
          <div className="mb-8 p-4 border border-gray-200 rounded-xl">
            <h4 className="font-bold text-gray-800 mb-3 border-b pb-1 w-fit">المطلوب (فحوصات وأشعة)</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {data.labs.map((item: string, i: number) => <li key={`l-${i}`}>تحليل: {item}</li>)}
              {data.radiology.map((item: string, i: number) => <li key={`r-${i}`}>أشعة: {item}</li>)}
            </ul>
          </div>
        )}

        {/* Red Flags & Advice */}
        <div className="mb-8">
          {data.redFlags && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-3 text-sm text-red-700">
              <strong>⚠ علامات الخطر (يرجى التوجه للطوارئ فوراً عند حدوثها):</strong>
              <p className="mt-1">{data.redFlags}</p>
            </div>
          )}
          {data.advice && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-700">
              <strong>💡 نصائح طبية:</strong>
              <p className="mt-1">{data.advice}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-[1.5cm] border-t border-gray-200">
          <div className="flex justify-between items-end">
             <div className="text-center">
               <p className="text-sm font-bold text-gray-400 mb-2">الختم</p>
               <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-full mx-auto"></div>
             </div>
             <div className="text-left text-sm text-gray-500">
               <p>تاريخ المتابعة: {data.followUp || 'عند اللزوم'}</p>
               <p>تم الإنشاء بواسطة: Sehaty AI</p>
             </div>
          </div>
        </div>

      </div>
      
      {/* CSS للطباعة */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          .max-w-4xl { max-w-none !important; margin: 0 !important; padding: 0 !important; }
          .bg-white { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

// --- الصفحة الرئيسية للاستشارة ---
export default function DoctorConsultationPage() {
  const { id } = useParams();
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<any>(null);
  const [medicalFile, setMedicalFile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [centerSettings, setCenterSettings] = useState<any>(null);
  const [view, setView] = useState<'details' | 'wizard' | 'prescription'>('details');

  // Wizard State
  const [step, setStep] = useState(1);
  const [replyData, setReplyData] = useState({
    diagnosis: '',
    medications: [] as any[],
    labs: [] as string[],
    radiology: [] as string[],
    advice: '',
    redFlags: '',
    followUp: '',
    notes: ''
  });

  // Action State (Refer/Report)
  const [actionModal, setActionModal] = useState<'refer' | 'report' | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      // 1. Consultation Data
      const { data: consult } = await supabase
        .from('consultations')
        .select('*, medical_files(*)')
        .eq('id', id)
        .single();

      if (consult) {
        setConsultation(consult);
        
        // 2. Full Medical History
        if (consult.medical_files?.id) {
          const { data: file } = await supabase
            .from('medical_files')
            .select('*')
            .eq('id', consult.medical_files.id)
            .single();
          setMedicalFile(file);

          const { data: prevConsults } = await supabase
            .from('consultations')
            .select('*')
            .eq('medical_file_id', consult.medical_files.id)
            .neq('id', id) // Exclude current
            .order('created_at', { ascending: false });
          setHistory(prevConsults || []);
        }
      }

      // 3. Center Settings
      const { data: settings } = await supabase.from('center_settings').select('*').single();
      setCenterSettings(settings);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  // --- Handlers ---

  const handleAccept = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // تحديث الحالة إلى قيد التنفيذ وربطها بالطبيب
    await supabase.from('consultations').update({ 
      status: 'in_progress', 
      doctor_id: user.id 
    }).eq('id', id);

    setView('wizard');
  };

  const handleSubmitAction = async () => {
    if (!actionModal) return;
    
    // منطق التحويل أو الإبلاغ (تحديث قاعدة البيانات)
    const updateData = actionModal === 'refer' 
      ? { status: 'referred', notes: actionReason } 
      : { status: 'reported', notes: actionReason };

    await supabase.from('consultations').update(updateData).eq('id', id);
    alert(actionModal === 'refer' ? 'تم تحويل الحالة بنجاح' : 'تم إبلاغ الإدارة');
    router.push('/doctor/dashboard');
  };

  const handleFinishWizard = async () => {
    // حفظ الرد في قاعدة البيانات
    await supabase.from('consultations').update({
      status: 'closed',
      reply_content: JSON.stringify(replyData), // تخزين البيانات كـ JSON
      updated_at: new Date()
    }).eq('id', id);

    setView('prescription');
  };

  // --- Render ---

  if (loading) return <div className="flex justify-center p-20"><span className="animate-spin text-2xl">⏳</span></div>;
  if (!consultation) return <div className="p-10 text-center text-red-500">الاستشارة غير موجودة</div>;

  // 3. عرض الروشتة النهائية
  if (view === 'prescription') {
    return (
      <PrescriptionView 
        data={{
          ...replyData,
          patientName: consultation.medical_files?.full_name,
          patientId: consultation.medical_files?.id,
          doctorName: 'اسم الطبيب هنا' // يمكن جلبه من البروفايل
        }} 
        centerSettings={centerSettings} 
        onBack={() => setView('wizard')}
      />
    );
  }

  // 2. معالج الرد (Wizard)
  if (view === 'wizard') {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 dir-rtl font-cairo">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>التشخيص</span>
            <span>العلاج</span>
            <span>الفحوصات</span>
            <span>النصائح</span>
            <span>النهاية</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 6) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px] flex flex-col">
          
          {/* Step 1: Diagnosis */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold flex items-center gap-2"><Stethoscope className="text-blue-600"/> التشخيص المبدئي</h2>
              <textarea 
                className="w-full p-4 border rounded-xl h-40 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="اكتب تشخيص الحالة هنا..."
                value={replyData.diagnosis}
                onChange={e => setReplyData({...replyData, diagnosis: e.target.value})}
              />
            </div>
          )}

          {/* Step 2: Medications */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold flex items-center gap-2"><Pill className="text-green-600"/> وصف الأدوية</h2>
              
              {/* Add Med Form */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-gray-50 p-4 rounded-xl">
                <input id="med-name" placeholder="اسم الدواء" className="p-2 rounded border col-span-2" />
                <input id="med-conc" placeholder="التركيز" className="p-2 rounded border" />
                <input id="med-dose" placeholder="الجرعة (1x3)" className="p-2 rounded border" />
                <button 
                  onClick={() => {
                    const name = (document.getElementById('med-name') as HTMLInputElement).value;
                    const conc = (document.getElementById('med-conc') as HTMLInputElement).value;
                    const dose = (document.getElementById('med-dose') as HTMLInputElement).value;
                    if(name) {
                      setReplyData({
                        ...replyData, 
                        medications: [...replyData.medications, { name, concentration: conc, dose, form: 'Tablet', duration: '5 days' }]
                      });
                      (document.getElementById('med-name') as HTMLInputElement).value = '';
                    }
                  }}
                  className="bg-green-600 text-white rounded font-bold"
                >
                  +
                </button>
              </div>

              {/* Meds List */}
              <div className="space-y-2">
                {replyData.medications.map((m, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                    <span>{m.name} ({m.concentration}) - {m.dose}</span>
                    <button onClick={() => {
                      const newMeds = [...replyData.medications];
                      newMeds.splice(i, 1);
                      setReplyData({...replyData, medications: newMeds});
                    }} className="text-red-500">حذف</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 & 4: Labs & Radiology */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold flex items-center gap-2"><FlaskConical className="text-purple-600"/> الفحوصات والأشعة</h2>
              
              <div>
                <label className="block font-bold mb-2">تحاليل مطلوبة</label>
                <input 
                  placeholder="اكتب اسم التحليل واضغط Enter" 
                  className="w-full p-3 border rounded-xl"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setReplyData({...replyData, labs: [...replyData.labs, e.currentTarget.value]});
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {replyData.labs.map((l, i) => <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">{l}</span>)}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">أشعة مطلوبة</label>
                <input 
                  placeholder="اكتب نوع الأشعة واضغط Enter" 
                  className="w-full p-3 border rounded-xl"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setReplyData({...replyData, radiology: [...replyData.radiology, e.currentTarget.value]});
                      e.currentTarget.value = '';
                    }
                  }}
                />
                 <div className="flex flex-wrap gap-2 mt-2">
                  {replyData.radiology.map((l, i) => <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{l}</span>)}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Advice & Red Flags */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold flex items-center gap-2"><MessageCircle className="text-orange-600"/> النصائح وعلامات الخطر</h2>
              
              <div>
                <label className="font-bold block mb-1">نصائح طبية للمريض</label>
                <textarea 
                  className="w-full p-3 border rounded-xl h-24"
                  value={replyData.advice}
                  onChange={e => setReplyData({...replyData, advice: e.target.value})}
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-red-600">علامات الخطر (Red Flags)</label>
                <textarea 
                  className="w-full p-3 border border-red-200 bg-red-50 rounded-xl h-24 placeholder-red-300"
                  placeholder="أعراض تستدعي الذهاب للطوارئ فوراً..."
                  value={replyData.redFlags}
                  onChange={e => setReplyData({...replyData, redFlags: e.target.value})}
                />
              </div>
            </div>
          )}

           {/* Step 6: Finalize */}
           {step === 5 && (
            <div className="space-y-6 animate-in fade-in text-center py-10">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">مراجعة نهائية</h2>
              <p className="text-gray-500">تم إكمال جميع البيانات. اضغط على "إصدار الروشتة" لإنهاء الاستشارة وعرض الملف للطباعة.</p>
              
              <div className="bg-gray-50 p-4 rounded-xl text-right text-sm max-w-md mx-auto">
                <p><strong>التشخيص:</strong> {replyData.diagnosis}</p>
                <p><strong>عدد الأدوية:</strong> {replyData.medications.length}</p>
                <p><strong>الفحوصات:</strong> {replyData.labs.length + replyData.radiology.length}</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-auto pt-6 flex justify-between border-t">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-bold">
                سابق
              </button>
            )}
            {step < 5 ? (
              <button onClick={() => setStep(step + 1)} className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold mr-auto">
                التالي
              </button>
            ) : (
              <button onClick={handleFinishWizard} className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-bold mr-auto flex items-center gap-2">
                <CheckCircle size={18} /> إصدار الروشتة وإنهاء
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 1. العرض المبدئي (قبل القبول)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-8 dir-rtl font-cairo bg-slate-50 min-h-screen">
      
      {/* العمود الأيمن: بيانات المريض والاستشارة */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* كارت الاستشارة الحالية */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-slate-800">استشارة جديدة #{consultation.id.slice(0,6)}</h1>
              {consultation.is_emergency && <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><AlertTriangle size={14}/> طارئة</span>}
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {consultation.content}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"><User size={16} /> {consultation.medical_files?.full_name}</div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"><Clock size={16} /> {new Date(consultation.created_at).toLocaleString('ar-EG')}</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-gray-50 p-4 border-t flex flex-wrap gap-3">
            <button 
              onClick={handleAccept}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex justify-center items-center gap-2"
            >
              <CheckCircle size={20} /> استلام الحالة والرد
            </button>
            
            <button 
              onClick={() => setActionModal('refer')}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border hover:bg-gray-50 transition"
            >
              تحويل
            </button>
            
            <button 
              onClick={() => setActionModal('report')}
              className="px-6 py-3 rounded-xl font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 transition"
            >
              إبلاغ
            </button>
          </div>
        </div>

        {/* كارت التاريخ المرضي (Medical History) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
            <FileText className="text-gray-500" /> السجل الطبي والزيارات السابقة
          </h3>
          
          {/* Quick Stats from Medical File */}
          {medicalFile && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <span className="block text-xs text-gray-400">السن</span>
                <span className="font-bold">{new Date().getFullYear() - new Date(medicalFile.birth_date).getFullYear()} سنة</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <span className="block text-xs text-gray-400">الوزن</span>
                <span className="font-bold">{medicalFile.weight || '--'} كجم</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <span className="block text-xs text-gray-400">فصيلة الدم</span>
                <span className="font-bold">{medicalFile.blood_type || '--'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-center">
                <span className="block text-xs text-gray-400">أمراض مزمنة</span>
                <span className="font-bold text-red-500">{medicalFile.chronic_diseases ? 'يوجد' : 'لا يوجد'}</span>
              </div>
            </div>
          )}

          {/* Previous Consultations List */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {history.length === 0 ? (
              <p className="text-gray-400 text-center py-4">لا توجد زيارات سابقة</p>
            ) : (
              history.map((hist) => (
                <div key={hist.id} className="p-4 border rounded-xl hover:bg-gray-50 transition cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-400">{new Date(hist.created_at).toLocaleDateString('ar-EG')}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${hist.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {hist.status === 'closed' ? 'منتهية' : 'معلقة'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{hist.content}</p>
                </div>
              ))
            )}
          </div>
          
          <button className="w-full mt-4 text-blue-600 text-sm font-bold hover:underline">
            عرض الملف الطبي الكامل ↗
          </button>
        </div>
      </div>

      {/* العمود الأيسر: الملفات المرفقة (صور/تحاليل) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit sticky top-4">
        <h3 className="font-bold text-lg mb-4 text-slate-800">المرفقات</h3>
        <div className="grid grid-cols-2 gap-2">
           {/* هنا نعرض الصور المرفوعة مع الاستشارة إذا وجدت */}
           <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center text-gray-400 text-xs">لا توجد مرفقات</div>
        </div>
      </div>

      {/* Modal for Refer/Report */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95">
            <h3 className="font-bold text-xl mb-4">
              {actionModal === 'refer' ? 'تحويل الاستشارة' : 'إبلاغ الإدارة'}
            </h3>
            <textarea 
              className="w-full border rounded-xl p-3 h-32 mb-4"
              placeholder={actionModal === 'refer' ? 'سبب التحويل / اسم الطبيب المحول إليه...' : 'سبب الإبلاغ...'}
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={handleSubmitAction} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold">تأكيد</button>
              <button onClick={() => setActionModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
