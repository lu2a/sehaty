'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ui/ImageUpload'; // سنستخدمه للأفاتار

export default function ComprehensiveMedicalFile() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // الحالة الافتراضية لكل البيانات
  const [formData, setFormData] = useState({
    // أساسي
    full_name: '',
    address: '',
    national_id: '',
    phone_number: '',
    job: '',
    gender: 'male',
    birth_date: '',
    marital_status: 'single',
    
    // اجتماعي
    family_members_count: 1,
    is_family_head: false,
    has_insurance: false,
    has_fixed_income: false,
    income_amount: '',
    has_disability: false,

    // طبي وعادات
    drug_allergies_details: '', // فارغ يعني لا يوجد
    food_allergies_details: '',
    smoking_status: 'non_smoker',
    smoking_amount: '',
    current_diseases_details: '',
    tumors_details: '',
    chronic_diseases: [] as string[], // مصفوفة للأمراض المزمنة
    surgeries_details: '', // عمليات سابقة
    
    // بيئة وتاريخ عائلي
    has_barn: false,
    has_good_ventilation: true,
    has_clean_water: true,
    has_birds_livestock: false,
    family_medical_history: '',
    family_death_history: '',
    
    // قياسات
    is_vaccinated: true,
    height: '',
    weight: '',
    weight_unit: 'kg',
    avatar_url: ''
  });

  // قائمة الأمراض المزمنة للاختيار
  const CHRONIC_OPTIONS = ['ضغط الدم', 'السكري', 'فشل قلبي', 'قصور عضلة القلب', 'ربو', 'فشل كلوي', 'كبد'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // تحديد الأفاتار الافتراضي إذا لم يرفع صورة
    let finalAvatar = formData.avatar_url;
    if (!finalAvatar) {
      finalAvatar = formData.gender === 'male' 
        ? 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' 
        : 'https://cdn-icons-png.flaticon.com/512/3135/3135789.png';
    }

    const { error } = await supabase.from('medical_files').upsert({
      user_id: user?.id,
      relation: 'self', // أو حسب المنطق
      ...formData,
      chronic_diseases: formData.chronic_diseases, // يحفظ كـ jsonb
      avatar_url: finalAvatar
    });

    if (!error) {
      alert('تم حفظ الملف الطبي الشامل بنجاح ✅');
      router.push('/dashboard');
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  const toggleChronic = (disease: string) => {
    if (formData.chronic_diseases.includes(disease)) {
      setFormData({...formData, chronic_diseases: formData.chronic_diseases.filter(d => d !== disease)});
    } else {
      setFormData({...formData, chronic_diseases: [...formData.chronic_diseases, disease]});
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 dir-rtl bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-blue-900 text-center">الملف الطبي الشامل 📋</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* القسم 1: البيانات الشخصية */}
        <div className="bg-white p-6 rounded-xl shadow border-t-4 border-blue-500">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">👤 البيانات الشخصية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">الاسم الكامل</label>
              <input type="text" className="input" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div>
              <label className="label">الرقم القومي</label>
              <input type="text" className="input" value={formData.national_id} onChange={e => setFormData({...formData, national_id: e.target.value})} />
            </div>
            <div>
              <label className="label">العنوان</label>
              <input type="text" className="input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div>
              <label className="label">رقم التليفون</label>
              <input type="text" className="input" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
            </div>
            <div>
              <label className="label">المهنة</label>
              <input type="text" className="input" value={formData.job} onChange={e => setFormData({...formData, job: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">النوع</label>
                <select className="input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
              <div>
                <label className="label">الحالة الاجتماعية</label>
                <select className="input" value={formData.marital_status} onChange={e => setFormData({...formData, marital_status: e.target.value})}>
                  <option value="single">أعزب/ة</option>
                  <option value="married">متزوج/ة</option>
                  <option value="divorced">مطلق/ة</option>
                  <option value="widowed">أرمل/ة</option>
                </select>
              </div>
            </div>
             <div>
              <label className="label">تاريخ الميلاد</label>
              <input type="date" className="input" required value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
            </div>
          </div>
        </div>

        {/* القسم 2: البيانات الاجتماعية والاقتصادية */}
        <div className="bg-white p-6 rounded-xl shadow border-t-4 border-green-500">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">💰 البيانات الاجتماعية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">عدد أفراد الأسرة</label>
              <input type="number" className="input" value={formData.family_members_count} onChange={e => setFormData({...formData, family_members_count: parseInt(e.target.value)})} />
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" className="w-5 h-5" checked={formData.is_family_head} onChange={e => setFormData({...formData, is_family_head: e.target.checked})} />
              <label>هل أنت رب الأسرة؟</label>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" className="w-5 h-5" checked={formData.has_insurance} onChange={e => setFormData({...formData, has_insurance: e.target.checked})} />
              <label>هل لديك تأمين صحي شامل؟</label>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" className="w-5 h-5" checked={formData.has_disability} onChange={e => setFormData({...formData, has_disability: e.target.checked})} />
              <label>هل يوجد إعاقة؟</label>
            </div>

            <div className="col-span-full border p-3 rounded bg-gray-50">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-5 h-5" checked={formData.has_fixed_income} onChange={e => setFormData({...formData, has_fixed_income: e.target.checked})} />
                <label>هل لديك دخل ثابت؟</label>
              </div>
              {formData.has_fixed_income && (
                <input 
                  type="text" 
                  placeholder="قيمة الدخل (اختياري)" 
                  className="input mt-2" 
                  value={formData.income_amount} 
                  onChange={e => setFormData({...formData, income_amount: e.target.value})} 
                />
              )}
            </div>
          </div>
        </div>

        {/* القسم 3: التاريخ المرضي والعادات */}
        <div className="bg-white p-6 rounded-xl shadow border-t-4 border-red-500">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🩺 التاريخ المرضي</h2>
          
          <div className="space-y-4">
            {/* التدخين */}
            <div>
               <label className="label">حالة التدخين</label>
               <select className="input" value={formData.smoking_status} onChange={e => setFormData({...formData, smoking_status: e.target.value})}>
                 <option value="non_smoker">غير مدخن</option>
                 <option value="smoker">مدخن</option>
                 <option value="ex_smoker">مدخن سابق</option>
               </select>
               {formData.smoking_status !== 'non_smoker' && (
                 <input type="text" placeholder="الكمية / المدة" className="input mt-2" value={formData.smoking_amount} onChange={e => setFormData({...formData, smoking_amount: e.target.value})} />
               )}
            </div>

            {/* الحساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">حساسية أدوية (اكتب الاسم إن وجد)</label>
                <textarea className="input" placeholder="لا يوجد" value={formData.drug_allergies_details} onChange={e => setFormData({...formData, drug_allergies_details: e.target.value})} />
              </div>
              <div>
                <label className="label">حساسية أطعمة (اكتب الاسم إن وجد)</label>
                <textarea className="input" placeholder="لا يوجد" value={formData.food_allergies_details} onChange={e => setFormData({...formData, food_allergies_details: e.target.value})} />
              </div>
            </div>

            {/* الأمراض والأورام والعمليات */}
            <div>
               <label className="label">أمراض حالية أخرى</label>
               <textarea className="input" placeholder="لا يوجد" value={formData.current_diseases_details} onChange={e => setFormData({...formData, current_diseases_details: e.target.value})} />
            </div>
             <div>
               <label className="label">أورام (لا قدر الله)</label>
               <textarea className="input" placeholder="لا يوجد" value={formData.tumors_details} onChange={e => setFormData({...formData, tumors_details: e.target.value})} />
            </div>
            <div>
               <label className="label">عمليات سابقة</label>
               <textarea className="input" placeholder="لا يوجد" value={formData.surgeries_details} onChange={e => setFormData({...formData, surgeries_details: e.target.value})} />
            </div>

            {/* الأمراض المزمنة (اختيار متعدد) */}
            <div>
              <label className="label font-bold mb-2 block">أمراض مزمنة (اختر كل ما ينطبق)</label>
              <div className="flex flex-wrap gap-2">
                {CHRONIC_OPTIONS.map(opt => (
                  <button 
                    key={opt}
                    type="button"
                    onClick={() => toggleChronic(opt)}
                    className={`px-3 py-1 rounded-full border transition ${formData.chronic_diseases.includes(opt) ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* القسم 4: البيئة والتاريخ العائلي */}
        <div className="bg-white p-6 rounded-xl shadow border-t-4 border-yellow-500">
          <h2 className="text-xl font-bold mb-4">🏠 البيئة والتاريخ العائلي</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
             <label className="flex items-center gap-2"><input type="checkbox" checked={formData.has_barn} onChange={e => setFormData({...formData, has_barn: e.target.checked})} /> يوجد حظيرة</label>
             <label className="flex items-center gap-2"><input type="checkbox" checked={formData.has_good_ventilation} onChange={e => setFormData({...formData, has_good_ventilation: e.target.checked})} /> تهوية جيدة</label>
             <label className="flex items-center gap-2"><input type="checkbox" checked={formData.has_clean_water} onChange={e => setFormData({...formData, has_clean_water: e.target.checked})} /> مياه نظيفة</label>
             <label className="flex items-center gap-2"><input type="checkbox" checked={formData.has_birds_livestock} onChange={e => setFormData({...formData, has_birds_livestock: e.target.checked})} /> طيور/ماشية</label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="label">تاريخ مرضي للعائلة</label>
               <textarea className="input" placeholder="هل يعاني الأب/الأم من أمراض وراثية؟" value={formData.family_medical_history} onChange={e => setFormData({...formData, family_medical_history: e.target.value})} />
             </div>
             <div>
               <label className="label">حالات وفاة بالعائلة</label>
               <textarea className="input" placeholder="سبب الوفاة إن وجد" value={formData.family_death_history} onChange={e => setFormData({...formData, family_death_history: e.target.value})} />
             </div>
          </div>
        </div>

        {/* القسم 5: القياسات والصورة */}
        <div className="bg-white p-6 rounded-xl shadow border-t-4 border-purple-500">
           <h2 className="text-xl font-bold mb-4">📏 القياسات والملف</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             <div>
               <label className="label">الطول (سم)</label>
               <input type="number" className="input" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
             </div>
             <div className="flex gap-2">
               <div className="flex-1">
                 <label className="label">الوزن</label>
                 <input type="number" className="input" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
               </div>
               <div className="w-20">
                 <label className="label">الوحدة</label>
                 <select className="input" value={formData.weight_unit} onChange={e => setFormData({...formData, weight_unit: e.target.value})}>
                   <option value="kg">كجم</option>
                   <option value="gram">جم</option>
                 </select>
               </div>
             </div>
             <div className="flex items-center gap-2 pt-6">
               <input type="checkbox" className="w-5 h-5" checked={formData.is_vaccinated} onChange={e => setFormData({...formData, is_vaccinated: e.target.checked})} />
               <label>مستكمل التطعيمات</label>
             </div>
           </div>
           
           <div>
             <label className="label mb-2 block">صورة الملف (أفاتار)</label>
             <ImageUpload onUploadComplete={(urls) => setFormData({...formData, avatar_url: urls[0]})} />
           </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-800 shadow-xl"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ الملف الطبي 💾'}
        </button>

      </form>
      
      {/* تنسيق الحقول */}
      <style jsx>{`
        .label { @apply block text-sm font-bold text-gray-700 mb-1; }
        .input { @apply w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none; }
      `}</style>
    </div>
  );
}