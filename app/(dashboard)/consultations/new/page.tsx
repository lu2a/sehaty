'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ui/ImageUpload';
import ChoiceChips from '@/components/ui/ChoiceChips';
import VoiceRecorder from '@/components/ui/VoiceRecorder';
import AddFamilyMember from '@/components/medical-file/AddFamilyMember';
import Link from 'next/link';
import { sendNotification } from '@/utils/notifications';

// الخيارات الثابتة للأعراض والعلامات
const COMMON_SYMPTOMS = ['سخونة', 'كحة', 'رشح', 'صداع', 'ألم بطن', 'غثيان', 'دوخة', 'إسهال', 'إمساك'];
const COMMON_SIGNS = ['طفح جلدي', 'تورم', 'شحوب', 'ضربات قلب سريعة', 'عرق غزير', 'رعشة'];

export default function NewConsultation() {
  const supabase = createClient();
  const router = useRouter();
  
  // States
  const [step, setStep] = useState(1);
  const [myFiles, setMyFiles] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]); 
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  
  // Form Data
  const [selectedClinicId, setSelectedClinicId] = useState(''); 
  const [symptomsList, setSymptomsList] = useState<string[]>([]);
  const [signsList, setSignsList] = useState<string[]>([]);
  const [complaint, setComplaint] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [voiceUrl, setVoiceUrl] = useState('');
  const [consent, setConsent] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false); 
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Input States
  const [customSymptom, setCustomSymptom] = useState('');
  const [customSign, setCustomSign] = useState('');

  // Load Data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: files } = await supabase
        .from('medical_files')
        .select('*')
        .eq('user_id', user.id);
      if (files) setMyFiles(files);
    }

    const { data: clinicsData } = await supabase
      .from('clinics')
      .select('id, name');
    if (clinicsData) setClinics(clinicsData);
  };

  const handleFileSelect = (file: any) => {
    setSelectedFileId(file.id);
    setSelectedFile(file);
    setStep(2);
  };

  const addCustomItem = (text: string, setText: any, list: string[], setList: any) => {
    if (!text.trim()) return;
    if (!list.includes(text.trim())) setList([...list, text.trim()]);
    setText('');
  };
  const removeItem = (item: string, list: string[], setList: any) => {
    setList(list.filter((i: string) => i !== item));
  };

  const handleSubmit = async () => {
    if (!selectedClinicId || !complaint) {
      alert('الرجاء اختيار التخصص وكتابة الشكوى.');
      return;
    }
    if (!consent) {
      alert('يجب الموافقة على مشاركة الملف الطبي.');
      return;
    }

    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    // إدخال الاستشارة
    const { error } = await (supabase.from('consultations') as any).insert({
      user_id: user?.id,
      medical_file_id: selectedFileId,
      clinic_id: selectedClinicId,
      content: complaint,
      symptoms_list: symptomsList,
      signs_list: signsList,
      images_urls: images,
      voice_url: voiceUrl,
      status: 'pending',
      urgency: isUrgent ? 'high' : 'medium'
    });

    if (!error) {
      // ✅ تصحيح الخطأ هنا: استخدام as any مع profiles وتحديد نوع doc
      const { data: doctors } = await (supabase.from('profiles') as any)
        .select('id')
        .eq('role', 'doctor');

      if (doctors && doctors.length > 0) {
        await Promise.all(doctors.map((doc: any) => 
          sendNotification(
            doc.id,
            `استشارة جديدة ${isUrgent ? '🚨' : ''}`,
            `يوجد طلب استشارة جديد في الانتظار من ${selectedFile?.full_name}.`,
            '/doctor/dashboard'
          )
        ));
      }

      router.push('/consultations?success=true');
    } else {
      alert('حدث خطأ: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const displayVal = (val: any, suffix = '') => val ? `${val} ${suffix}` : '-';

  return (
    <div className="max-w-4xl mx-auto p-4 dir-rtl min-h-screen pb-20">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">طلب استشارة طبية</h1>

      {/* الخطوة 1: اختيار المريض */}
      {step === 1 && (
        <div className="animate-in fade-in">
          <h2 className="text-lg font-bold mb-4">لمن هذه الاستشارة؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myFiles.map((file) => (
              <div 
                key={file.id}
                onClick={() => handleFileSelect(file)}
                className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {file.gender === 'male' ? 'ذكر' : 'أنثى'}
                   </div>
                   <div>
                      <p className="font-bold text-lg">{file.full_name}</p>
                      <p className="text-xs text-gray-500">{file.relation === 'self' ? 'الملف الرئيسي' : file.relation}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowAddFamily(!showAddFamily)} className="mt-4 text-blue-600 hover:underline text-sm">
             {showAddFamily ? 'إلغاء' : '+ إضافة فرد جديد'}
          </button>
          {showAddFamily && <AddFamilyMember onSuccess={() => {setShowAddFamily(false); fetchInitialData();}} onCancel={() => setShowAddFamily(false)} />}
        </div>
      )}

      {/* الخطوة 2: نموذج الاستشارة */}
      {step === 2 && selectedFile && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* 1. ملخص الملف الطبي */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 shadow-inner">
            <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                📄 ملخص الملف الطبي للمريض
              </h3>
              <Link href="/medical-file/edit" className="text-blue-600 hover:underline font-bold bg-white px-2 py-1 rounded border">
                تعديل البيانات ✏️
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4">
              <p><span className="font-bold">الاسم:</span> {selectedFile.full_name}</p>
              <p><span className="font-bold">السن:</span> {selectedFile.birth_date ? new Date().getFullYear() - new Date(selectedFile.birth_date).getFullYear() : '-'} سنة</p>
              <p><span className="font-bold">الوزن:</span> {displayVal(selectedFile.weight, selectedFile.weight_unit)}</p>
              <p><span className="font-bold">الطول:</span> {displayVal(selectedFile.height, 'سم')}</p>
              <p><span className="font-bold">التدخين:</span> {selectedFile.smoking_status === 'smoker' ? 'مدخن' : 'غير مدخن'}</p>
              <p><span className="font-bold">المهنة:</span> {displayVal(selectedFile.job)}</p>
              <p><span className="font-bold">الحالة الاجتماعية:</span> {displayVal(selectedFile.marital_status)}</p>
              <p><span className="font-bold">فصيلة الدم:</span> {displayVal(selectedFile.blood_type)}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2">
               <div>
                 <span className="font-bold block mb-1">أمراض مزمنة:</span>
                 {selectedFile.chronic_diseases?.length > 0 ? (
                   <div className="flex flex-wrap gap-1">
                     {selectedFile.chronic_diseases.map((d:string) => <span key={d} className="bg-red-100 text-red-700 px-1 rounded">{d}</span>)}
                   </div>
                 ) : 'لا يوجد'}
               </div>
               <div>
                 <span className="font-bold block mb-1">حساسية (أدوية/طعام):</span>
                 {selectedFile.drug_allergies_details || selectedFile.food_allergies_details ? (
                    <span className="text-red-600">{selectedFile.drug_allergies_details} / {selectedFile.food_allergies_details}</span>
                 ) : 'لا يوجد'}
               </div>
               <div className="col-span-full">
                 <span className="font-bold">عمليات سابقة:</span> {displayVal(selectedFile.surgeries_details)}
               </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer bg-blue-100 p-2 rounded border border-blue-200">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-blue-800">أوافق على إرسال هذا الملف للطبيب للإطلاع عليه.</span>
              </label>
            </div>
          </div>

          {/* 2. التخصص والحالة الطارئة */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-bold mb-2">التخصص المطلوب <span className="text-red-500">*</span></label>
              <select 
                value={selectedClinicId} 
                onChange={e => setSelectedClinicId(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white"
              >
                <option value="">-- اختر العيادة --</option>
                {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="flex items-end pb-1">
               <label className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition w-full md:w-auto ${isUrgent ? 'bg-red-50 border-red-500 text-red-700' : 'bg-gray-50 border-gray-300'}`}>
                 <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} className="w-5 h-5 text-red-600" />
                 <span className="font-bold">🚨 حالة طارئة</span>
               </label>
            </div>
          </div>

          {/* 3. الأعراض (Symptoms) */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <label className="block font-bold mb-2 text-gray-800">الأعراض (ما تشعر به)</label>
            <ChoiceChips options={COMMON_SYMPTOMS} selected={symptomsList} onChange={setSymptomsList} />
            
            <div className="mt-3 flex gap-2 items-center">
              <input 
                type="text" maxLength={140} placeholder="عرض آخر..." 
                className="flex-1 p-2 border rounded-md text-sm"
                value={customSymptom} onChange={(e) => setCustomSymptom(e.target.value)}
              />
              <button onClick={() => addCustomItem(customSymptom, setCustomSymptom, symptomsList, setSymptomsList)} className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50" disabled={!customSymptom.trim()}>+</button>
            </div>
            {symptomsList.filter(s => !COMMON_SYMPTOMS.includes(s)).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {symptomsList.filter(s => !COMMON_SYMPTOMS.includes(s)).map((item, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                    {item} <button onClick={() => removeItem(item, symptomsList, setSymptomsList)} className="text-red-500 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 4. العلامات (Signs) */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <label className="block font-bold mb-2 text-gray-800">العلامات (ما يظهر عليك)</label>
            <ChoiceChips options={COMMON_SIGNS} selected={signsList} onChange={setSignsList} />
            
            <div className="mt-3 flex gap-2 items-center">
              <input 
                type="text" maxLength={140} placeholder="علامة أخرى..." 
                className="flex-1 p-2 border rounded-md text-sm"
                value={customSign} onChange={(e) => setCustomSign(e.target.value)}
              />
              <button onClick={() => addCustomItem(customSign, setCustomSign, signsList, setSignsList)} className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50" disabled={!customSign.trim()}>+</button>
            </div>
             {signsList.filter(s => !COMMON_SIGNS.includes(s)).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {signsList.filter(s => !COMMON_SIGNS.includes(s)).map((item, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                    {item} <button onClick={() => removeItem(item, signsList, setSignsList)} className="text-red-500 font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 5. نص الشكوى */}
          <div>
            <label className="block font-bold mb-2">نص الشكوى <span className="text-red-500">*</span></label>
            <textarea 
              className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500"
              placeholder="اوصف بالتفصيل ما تعاني منه..."
              value={complaint}
              onChange={e => setComplaint(e.target.value)}
            />
          </div>

          {/* 6. المرفقات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">صور مرفقة</label>
              <ImageUpload onUploadComplete={(urls) => setImages(urls)} />
            </div>
            <div>
              <label className="block font-bold mb-2">تسجيل صوتي</label>
              <VoiceRecorder onRecordingComplete={(url) => setVoiceUrl(url)} />
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-4 pt-4 border-t">
            <button onClick={() => setStep(1)} className="px-6 py-3 border rounded-lg text-gray-600 hover:bg-gray-50">رجوع</button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !consent}
              className={`flex-1 text-white py-3 rounded-lg font-bold shadow-lg transition ${isSubmitting || !consent ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال الاستشارة 🚀'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
