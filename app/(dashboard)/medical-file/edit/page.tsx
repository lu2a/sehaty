'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, ChevronRight, User, Activity, Home, FileText } from 'lucide-react';
import Link from 'next/link';

export default function EditMedicalFilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // الحالة المبدئية للنموذج
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    birth_date: '',
    gender: 'male',
    job: '',
    marital_status: 'single',
    family_members_count: 0,
    is_family_head: false,
    has_insurance: false,
    has_fixed_income: false,
    weight: '',
    height: '',
    blood_type: '',
    smoking_status: 'non_smoker',
    is_vaccinated: false,
    chronic_diseases: [] as string[], // مصفوفة للأمراض
    drug_allergies_details: '',
    food_allergies_details: '',
    surgeries_details: '',
    family_medical_history: '',
    has_good_ventilation: true,
    has_clean_water: true,
    has_barn: false,
    has_birds_livestock: false,
  });

  // قائمة الأمراض المزمنة للاختيار منها
  const commonDiseases = ['ضغط الدم', 'السكري', 'القلب', 'الربو', 'الكلى', 'الكبد', 'أورام'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // جلب البيانات الموجودة (إن وجدت)
    const { data } = await (supabase.from('medical_files') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('relation', 'self')
      .maybeSingle();

    if (data) {
      // تحديث النموذج بالبيانات القادمة من قاعدة البيانات
      setFormData({
        ...formData,
        ...data,
        // التأكد من أن chronic_diseases مصفوفة دائماً
        chronic_diseases: Array.isArray(data.chronic_diseases) ? data.chronic_diseases : []
      });
    } else {
        // لو مفيش ملف، نحاول نجيب الاسم من البروفايل كبداية
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if(profile) setFormData(prev => ({ ...prev, full_name: profile.full_name || '' }));
    }
    setLoading(false);
  };

  const handleCheckboxChange = (disease: string) => {
    setFormData(prev => {
      const exists = prev.chronic_diseases.includes(disease);
      if (exists) {
        return { ...prev, chronic_diseases: prev.chronic_diseases.filter(d => d !== disease) };
      } else {
        return { ...prev, chronic_diseases: [...prev.chronic_diseases, disease] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      ...formData,
      user_id: user.id,
      relation: 'self', // إجبار العلاقة تكون "نفسي"
      updated_at: new Date().toISOString(),
    };

    // نتحقق لو الملف موجود نعمل update ولو مش موجود نعمل insert
    // بس عشان التسهيل هنعمل upsert بناءً على user_id و relation (لو الجدول عليه constraint)
    // أو نبحث عن الـ ID الأول. الأسهل هنا البحث عن الـ ID.
    
    const { data: existing } = await (supabase.from('medical_files') as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('relation', 'self')
      .maybeSingle();

    let error;
    if (existing) {
       const res = await (supabase.from('medical_files') as any).update(payload).eq('id', existing.id);
       error = res.error;
    } else {
       const res = await (supabase.from('medical_files') as any).insert(payload);
       error = res.error;
    }

    if (!error) {
      alert('تم حفظ الملف الطبي بنجاح ✅');
      router.push('/medical-file/personal'); // العودة لصفحة العرض
    } else {
      alert('حدث خطأ أثناء الحفظ!');
      console.error(error);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center">جاري تجهيز النموذج...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-cairo dir-rtl pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 max-w-4xl mx-auto">
        <Link href="/medical-file/personal" className="bg-white p-2 rounded-full shadow hover:bg-gray-50">
          <ChevronRight size={20}/>
        </Link>
        <h1 className="text-xl font-bold text-slate-800">تعديل الملف الطبي</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        
        {/* 1. البيانات الشخصية */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
          <h2 className="font-bold text-lg mb-4 text-blue-800 flex items-center gap-2">
            <User size={20}/> البيانات الأساسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">الاسم الرباعي</label>
              <input type="text" className="input" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div>
              <label className="label">الرقم القومي</label>
              <input type="text" className="input" value={formData.national_id} onChange={e => setFormData({...formData, national_id: e.target.value})} />
            </div>
            <div>
              <label className="label">تاريخ الميلاد</label>
              <input type="date" className="input" required value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
            </div>
            <div>
              <label className="label">النوع</label>
              <select className="input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <div>
              <label className="label">المهنة</label>
              <input type="text" className="input" value={formData.job} onChange={e => setFormData({...formData, job: e.target.value})} />
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
            <div>
              <label className="label">عدد أفراد الأسرة</label>
              <input type="number" className="input" value={formData.family_members_count} onChange={e => setFormData({...formData, family_members_count: parseInt(e.target.value)})} />
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.is_family_head} onChange={e => setFormData({...formData, is_family_head: e.target.checked})} />
              <span>رب أسرة</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.has_insurance} onChange={e => setFormData({...formData, has_insurance: e.target.checked})} />
              <span>تأمين صحي</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.has_fixed_income} onChange={e => setFormData({...formData, has_fixed_income: e.target.checked})} />
              <span>دخل ثابت</span>
            </label>
          </div>
        </div>

        {/* 2. القياسات والعادات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
          <h2 className="font-bold text-lg mb-4 text-purple-800 flex items-center gap-2">
            <Activity size={20}/> القياسات والعادات
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="label">الوزن (كجم)</label>
              <input type="number" className="input" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
            </div>
            <div>
              <label className="label">الطول (سم)</label>
              <input type="number" className="input" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
            </div>
            <div>
              <label className="label">فصيلة الدم</label>
              <select className="input" value={formData.blood_type} onChange={e => setFormData({...formData, blood_type: e.target.value})}>
                <option value="">غير محدد</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
             <div>
              <label className="label">التدخين</label>
              <select className="input" value={formData.smoking_status} onChange={e => setFormData({...formData, smoking_status: e.target.value})}>
                <option value="non_smoker">غير مدخن</option>
                <option value="smoker">مدخن</option>
                <option value="ex_smoker">مدخن سابق</option>
              </select>
            </div>
          </div>
          <label className="checkbox-label">
              <input type="checkbox" checked={formData.is_vaccinated} onChange={e => setFormData({...formData, is_vaccinated: e.target.checked})} />
              <span>مستكمل التطعيمات الأساسية</span>
          </label>
        </div>

        {/* 3. السجل الطبي */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
          <h2 className="font-bold text-lg mb-4 text-red-800 flex items-center gap-2">
            <FileText size={20}/> التاريخ المرضي
          </h2>
          
          <div className="mb-4">
            <label className="label mb-2 block">هل تعاني من أمراض مزمنة؟</label>
            <div className="flex flex-wrap gap-3">
              {commonDiseases.map(d => (
                <label key={d} className={`px-3 py-1 rounded-full border cursor-pointer transition select-none ${formData.chronic_diseases.includes(d) ? 'bg-red-500 text-white border-red-600' : 'bg-gray-50 text-gray-600'}`}>
                  <input type="checkbox" className="hidden" checked={formData.chronic_diseases.includes(d)} onChange={() => handleCheckboxChange(d)} />
                  {d}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">حساسية أدوية</label>
              <input type="text" placeholder="اكتب اسم الأدوية..." className="input" value={formData.drug_allergies_details} onChange={e => setFormData({...formData, drug_allergies_details: e.target.value})} />
            </div>
             <div>
              <label className="label">حساسية طعام</label>
              <input type="text" placeholder="اكتب أنواع الطعام..." className="input" value={formData.food_allergies_details} onChange={e => setFormData({...formData, food_allergies_details: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="label">عمليات جراحية سابقة</label>
              <textarea placeholder="اسم العملية وتاريخها..." className="input h-20" value={formData.surgeries_details} onChange={e => setFormData({...formData, surgeries_details: e.target.value})} />
            </div>
             <div className="md:col-span-2">
              <label className="label">تاريخ مرضي للعائلة (وراثة)</label>
              <textarea placeholder="مثل السكري، الضغط، الأورام في العائلة..." className="input h-20" value={formData.family_medical_history} onChange={e => setFormData({...formData, family_medical_history: e.target.value})} />
            </div>
          </div>
        </div>

        {/* 4. البيئة المنزلية */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-100">
          <h2 className="font-bold text-lg mb-4 text-yellow-800 flex items-center gap-2">
            <Home size={20}/> البيئة المنزلية
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.has_good_ventilation} onChange={e => setFormData({...formData, has_good_ventilation: e.target.checked})} />
              <span>تهوية جيدة</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.has_clean_water} onChange={e => setFormData({...formData, has_clean_water: e.target.checked})} />
              <span>مياه نظيفة</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.has_barn} onChange={e => setFormData({...formData, has_barn: e.target.checked})} />
              <span>يوجد حظيرة</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.has_birds_livestock} onChange={e => setFormData({...formData, has_birds_livestock: e.target.checked})} />
              <span>تربية طيور/ماشية</span>
            </label>
          </div>
        </div>

        {/* زر الحفظ */}
        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : <> <Save size={20}/> حفظ البيانات </>}
        </button>

      </form>

      {/* Styles for this page only */}
      <style jsx>{`
        .label {
          @apply block text-sm font-bold text-gray-600 mb-1;
        }
        .input {
          @apply w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50 focus:bg-white transition;
        }
        .checkbox-label {
          @apply flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer p-2 rounded hover:bg-gray-50;
        }
      `}</style>
    </div>
  );
}
