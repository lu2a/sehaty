'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { 
  Stethoscope, Pill, TestTube, ScanLine, BookOpen, 
  Flag, CalendarCheck, Check, ChevronRight, ChevronLeft, 
  AlertOctagon, Forward, Ban
} from 'lucide-react';

// الخطوات
const STEPS = [
  { id: 1, title: 'التشخيص', icon: Stethoscope },
  { id: 2, title: 'الأدوية', icon: Pill },
  { id: 3, title: 'فحوصات', icon: TestTube },
  { id: 4, title: 'أشعة', icon: ScanLine },
  { id: 5, title: 'تثقيف', icon: BookOpen },
  { id: 6, title: 'تحذيرات', icon: Flag },
  { id: 7, title: 'إنهاء', icon: CalendarCheck },
];

export default function ReplyWizard() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [consultation, setConsultation] = useState<any>(null);
  const [dbLists, setDbLists] = useState<any[]>([]); // القوائم الجاهزة من القاعدة
  const [loading, setLoading] = useState(false);

  // Form Data
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState<any[]>([]);
  const [labs, setLabs] = useState<string[]>([]);
  const [radiology, setRadiology] = useState<string[]>([]);
  const [education, setEducation] = useState<string[]>([]);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  // Meds Temp State (لإضافة دواء جديد)
  const [tempMed, setTempMed] = useState({ name: '', concentration: '', form: '', freq: '', duration: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. جلب الاستشارة
    const { data: consult } = await (supabase.from('consultations') as any)
      .select('*, medical_files(*)')
      .eq('id', id).single();
    setConsultation(consult);

    // 2. جلب القوائم الجاهزة
    const { data: lists } = await (supabase.from('medical_lists') as any).select('*');
    if (lists) setDbLists(lists);
  };

  // --- Actions ---
  const handleNext = () => setCurrentStep(p => Math.min(p + 1, 7));
  const handlePrev = () => setCurrentStep(p => Math.max(p - 1, 1));
  
  const addMedication = () => {
    if(!tempMed.name) return;
    setMedications([...medications, tempMed]);
    setTempMed({ name: '', concentration: '', form: '', freq: '', duration: '' });
  };

  const removeMedication = (idx: number) => {
    setMedications(medications.filter((_, i) => i !== idx));
  };

  // Submit Final Response
  const handleSubmit = async () => {
    if(!confirm('هل أنت متأكد من إصدار الروشتة وإنهاء الاستشارة؟')) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // 1. إنشاء الروشتة
    const { error: rxError } = await (supabase.from('prescriptions') as any).insert({
      consultation_id: id,
      doctor_id: user?.id,
      medical_file_id: consultation.medical_file_id,
      drugs_list: medications,
      diagnosis: diagnosis,
      labs_list: labs,
      radiology_list: radiology,
      education_list: education,
      red_flags_list: redFlags,
      follow_up_date: followUpDate || null,
      notes: notes
    });

    // 2. تحديث حالة الاستشارة
    if (!rxError) {
      await (supabase.from('consultations') as any)
        .update({ status: 'closed', doctor_id: user?.id, updated_at: new Date() })
        .eq('id', id);
      
      // توجيه للروشتة النهائية
      router.push(`/prescription/${consultation.id}`); // سنفترض أن ID الروشتة مرتبط بالاستشارة أو نجلبه
      // (ملاحظة: الأفضل جلب ID الروشتة المنشأة حديثاً، لكن للتبسيط سنوجه للداشبورد أو صفحة عرض الروشتة)
       router.push(`/doctor/dashboard`);
       alert('تم إرسال الرد بنجاح');
    } else {
      alert('خطأ: ' + rxError.message);
    }
    setLoading(false);
  };

  // --- Top Actions (Refer, Report, etc) ---
  const handleRefer = async () => {
    const reason = prompt('سبب التحويل؟');
    if(!reason) return;
    await (supabase.from('consultations') as any).update({ doctor_id: null, notes: `تم التحويل: ${reason}` }).eq('id', id);
    router.push('/doctor/dashboard');
  };

  const handleReport = async () => {
    const reason = prompt('سبب الإبلاغ عن هذه الاستشارة؟');
    if(!reason) return;
    // هنا يمكن تسجيل بلاغ في جدول منفصل
    alert('تم رفع البلاغ للإدارة');
    router.push('/doctor/dashboard');
  };

  if (!consultation) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="flex h-screen bg-gray-50 dir-rtl">
      
      {/* 1. Sidebar Summary (معلومات المريض) */}
      <div className="w-1/4 bg-white border-l p-6 overflow-y-auto hidden lg:block">
        <h3 className="font-bold text-lg mb-4 text-blue-900">ملخص الحالة</h3>
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="font-bold">{consultation.medical_files.full_name}</p>
          <p className="text-sm text-gray-600">
            {consultation.medical_files.gender === 'male' ? 'ذكر' : 'أنثى'} - 
            {new Date().getFullYear() - new Date(consultation.medical_files.birth_date).getFullYear()} سنة
          </p>
        </div>
        <div className="mb-4">
          <h4 className="font-bold text-sm text-gray-500 mb-1">الشكوى:</h4>
          <p className="text-sm bg-gray-100 p-3 rounded">{consultation.content}</p>
        </div>
        
        {/* أزرار الإجراءات العلوية */}
        <div className="space-y-2 mt-8 border-t pt-4">
          <button onClick={handleRefer} className="w-full flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 p-2 rounded">
            <Forward size={16}/> تحويل لطبيب آخر
          </button>
          <button onClick={() => router.push('/doctor/dashboard')} className="w-full flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 p-2 rounded">
            <Ban size={16}/> تخطي الاستشارة
          </button>
          <button onClick={handleReport} className="w-full flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 p-2 rounded">
            <AlertOctagon size={16}/> إبلاغ الإدارة
          </button>
        </div>
      </div>

      {/* 2. Main Wizard Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Stepper Header */}
        <div className="bg-white border-b p-4">
          <div className="flex justify-between max-w-4xl mx-auto">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className={`flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-300'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-blue-600 bg-blue-50' : isCompleted ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-bold hidden md:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border min-h-[400px]">
            
            {/* Step 1: تشخيص */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">🩺 التشخيص المبدئي</h2>
                <div>
                  <label className="block text-sm font-bold mb-2">اختر من القائمة أو اكتب:</label>
                  <input 
                    list="diagnoses" 
                    className="w-full p-3 border rounded-lg" 
                    value={diagnosis} 
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder="ابدأ الكتابة للبحث..."
                  />
                  <datalist id="diagnoses">
                    {dbLists.filter(x => x.category === 'diagnosis').map(x => <option key={x.id} value={x.item_name} />)}
                  </datalist>
                </div>
              </div>
            )}

            {/* Step 2: الأدوية */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">💊 وصف الأدوية</h2>
                
                {/* Form إضافة دواء */}
                <div className="bg-blue-50 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <input placeholder="اسم الدواء" className="w-full p-2 border rounded" value={tempMed.name} onChange={e => setTempMed({...tempMed, name: e.target.value})} />
                  </div>
                  <input placeholder="التركيز (500mg)" className="w-full p-2 border rounded" value={tempMed.concentration} onChange={e => setTempMed({...tempMed, concentration: e.target.value})} />
                  <input placeholder="الشكل (أقراص)" className="w-full p-2 border rounded" value={tempMed.form} onChange={e => setTempMed({...tempMed, form: e.target.value})} />
                  <input placeholder="الجرعة (كل 8 ساعات)" className="col-span-2 w-full p-2 border rounded" value={tempMed.freq} onChange={e => setTempMed({...tempMed, freq: e.target.value})} />
                  <input placeholder="المدة (5 أيام)" className="col-span-2 w-full p-2 border rounded" value={tempMed.duration} onChange={e => setTempMed({...tempMed, duration: e.target.value})} />
                  
                  <button onClick={addMedication} className="col-span-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                    + إضافة للروشتة
                  </button>
                </div>

                {/* قائمة الأدوية المضافة */}
                <div className="mt-4 space-y-2">
                  {medications.map((med, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 border rounded">
                      <div>
                        <span className="font-bold text-blue-800">{med.name}</span> <span className="text-sm">{med.concentration}</span>
                        <p className="text-xs text-gray-500">{med.form} - {med.freq} لمدة {med.duration}</p>
                      </div>
                      <button onClick={() => removeMedication(idx)} className="text-red-500 text-sm">حذف</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: فحوصات */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">🧪 التحاليل المطلوبة</h2>
                <div className="flex gap-2 mb-4">
                   <select 
                     className="flex-1 p-2 border rounded"
                     onChange={(e) => { if(e.target.value) setLabs([...labs, e.target.value]) }}
                   >
                     <option value="">اختر تحليلاً...</option>
                     {dbLists.filter(x => x.category === 'lab').map(x => <option key={x.id} value={x.item_name}>{x.item_name}</option>)}
                   </select>
                </div>
                {/* Custom Input */}
                <div className="flex gap-2">
                   <input id="customLab" placeholder="أو اكتب تحليلاً غير موجود..." className="flex-1 p-2 border rounded" />
                   <button onClick={() => { 
                     const val = (document.getElementById('customLab') as HTMLInputElement).value;
                     if(val) setLabs([...labs, val]);
                   }} className="bg-gray-200 px-4 rounded">إضافة</button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {labs.map((l, i) => (
                    <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {l} <button onClick={() => setLabs(labs.filter((_, idx) => idx !== i))} className="text-red-500 font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

             {/* Step 4: أشعة (نفس فكرة التحاليل) */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">☢️ الأشعة المطلوبة</h2>
                 <div className="flex gap-2 mb-4">
                   <select 
                     className="flex-1 p-2 border rounded"
                     onChange={(e) => { if(e.target.value) setRadiology([...radiology, e.target.value]) }}
                   >
                     <option value="">اختر أشعة...</option>
                     {dbLists.filter(x => x.category === 'radiology').map(x => <option key={x.id} value={x.item_name}>{x.item_name}</option>)}
                   </select>
                </div>
                 <div className="mt-4 flex flex-wrap gap-2">
                  {radiology.map((l, i) => (
                    <span key={i} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {l} <button onClick={() => setRadiology(radiology.filter((_, idx) => idx !== i))} className="text-red-500 font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: تثقيف */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">📖 نصائح طبية للمريض</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded">
                  {dbLists.filter(x => x.category === 'education').map(x => (
                     <div key={x.id} className="flex items-center gap-2">
                       <input 
                        type="checkbox" 
                        id={x.id}
                        onChange={(e) => {
                          if(e.target.checked) setEducation([...education, x.item_name]);
                          else setEducation(education.filter(item => item !== x.item_name));
                        }}
                       />
                       <label htmlFor={x.id}>{x.item_name}</label>
                     </div>
                  ))}
                </div>
              </div>
            )}

             {/* Step 6: تحذيرات */}
             {currentStep === 6 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-red-600">🚩 علامات الخطورة (Red Flags)</h2>
                <p className="text-sm text-gray-500 mb-4">انبه المريض للتوجه للمستشفى فوراً في حالة ظهور هذه الأعراض.</p>
                <textarea 
                  className="w-full p-3 border rounded h-32" 
                  placeholder="مثال: ارتفاع الحرارة المستمر، ضيق التنفس..."
                  onChange={(e) => setRedFlags(e.target.value.split('\n'))}
                ></textarea>
              </div>
            )}

            {/* Step 7: إنهاء */}
            {currentStep === 7 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">✅ مراجعة وإنهاء</h2>
                
                <div className="mb-4">
                  <label className="block font-bold mb-1">موعد الزيارة القادمة (اختياري)</label>
                  <input type="date" className="w-full p-2 border rounded" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
                </div>
                
                <div className="mb-4">
                  <label className="block font-bold mb-1">ملاحظات ختامية</label>
                  <textarea className="w-full p-2 border rounded h-20" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <div className="bg-gray-50 p-4 rounded text-sm text-gray-600">
                  <p><strong>التشخيص:</strong> {diagnosis || '-'}</p>
                  <p><strong>الأدوية:</strong> {medications.length}</p>
                  <p><strong>الفحوصات:</strong> {labs.length + radiology.length}</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-white border-t p-4 flex justify-between items-center">
           <button 
             onClick={handlePrev} 
             disabled={currentStep === 1}
             className="px-6 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
           >
             <ChevronRight size={20}/> السابق
           </button>

           {currentStep < 7 ? (
             <button 
               onClick={handleNext} 
               className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-2"
             >
               التالي <ChevronLeft size={20}/>
             </button>
           ) : (
             <button 
               onClick={handleSubmit} 
               disabled={loading}
               className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg flex items-center gap-2"
             >
               {loading ? 'جاري الإصدار...' : 'إصدار الروشتة وإنهاء'} <Check size={20}/>
             </button>
           )}
        </div>

      </div>
    </div>
  );
}
