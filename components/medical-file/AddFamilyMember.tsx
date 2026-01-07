'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { X, Save, User, Activity, AlertCircle } from 'lucide-react';

export default function AddFamilyMember({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    relation: 'son',
    gender: 'male',
    birth_date: '',
    height: '',
    weight: '',
    chronic_diseases_text: '', // سيتم تحويلها لمصفوفة عند الحفظ
    drug_allergies_details: '',
    food_allergies_details: '',
    surgeries_details: '',
    family_medical_history: '',
    has_disability: false,
    disability_details: '',
    smoking_status: 'non_smoker',
    is_pregnant: false,
    is_breastfeeding: false
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // تحضير البيانات للمعالجة
    const finalData = {
      user_id: user.id,
      full_name: formData.full_name,
      relation: formData.relation,
      gender: formData.gender,
      birth_date: formData.birth_date,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      // تحويل النص إلى مصفوفة للأمراض المزمنة
      chronic_diseases: formData.chronic_diseases_text ? formData.chronic_diseases_text.split('،').map(s => s.trim()) : [],
      drug_allergies_details: formData.drug_allergies_details,
      food_allergies_details: formData.food_allergies_details,
      surgeries_details: formData.surgeries_details,
      family_medical_history: formData.family_medical_history,
      has_disability: formData.has_disability,
      disability_details: formData.has_disability ? formData.disability_details : null,
      smoking_status: formData.smoking_status,
      // التأكد من تصفير بيانات النساء إذا كان ذكراً
      is_pregnant: formData.gender === 'female' ? formData.is_pregnant : false,
      is_breastfeeding: formData.gender === 'female' ? formData.is_breastfeeding : false,
    };

    // استخدام as any لتجاوز التايب سكريبت
    const { error } = await (supabase.from('medical_files') as any).insert(finalData);

    if (!error) {
      onSuccess();
    } else {
      alert('حدث خطأ: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg mt-4 max-w-4xl mx-auto dir-rtl">
      
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          إضافة فرد جديد للعائلة
        </h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-red-500">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. البيانات الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full">
            <label className="label">الاسم رباعي *</label>
            <input name="full_name" type="text" required className="input" value={formData.full_name} onChange={handleChange} />
          </div>
          
          <div>
            <label className="label">النوع *</label>
            <select name="gender" className="input" value={formData.gender} onChange={handleChange}>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          <div>
            <label className="label">صلة القرابة *</label>
            <select name="relation" className="input" value={formData.relation} onChange={handleChange}>
              <option value="son">ابن</option>
              <option value="daughter">ابنة</option>
              <option value="wife">زوجة</option>
              <option value="husband">زوج</option>
              <option value="father">أب</option>
              <option value="mother">أم</option>
              <option value="brother">أخ</option>
              <option value="sister">أخت</option>
            </select>
          </div>

          <div>
            <label className="label">تاريخ الميلاد *</label>
            <input name="birth_date" type="date" required className="input" value={formData.birth_date} onChange={handleChange} />
          </div>

          <div>
             <label className="label">التدخين</label>
             <select name="smoking_status" className="input" value={formData.smoking_status} onChange={handleChange}>
               <option value="non_smoker">غير مدخن</option>
               <option value="smoker">مدخن</option>
               <option value="ex_smoker">مدخن سابق</option>
               <option value="passive_smoker">تدخين سلبي</option>
             </select>
          </div>
        </div>

        {/* 2. القياسات الجسمانية */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h5 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Activity className="w-4 h-4"/> القياسات الجسمانية</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">الطول (سم)</label>
              <input name="height" type="number" placeholder="مثال: 170" className="input" value={formData.height} onChange={handleChange} />
            </div>
            <div>
              <label className="label">الوزن (كجم)</label>
              <input name="weight" type="number" placeholder="مثال: 75" className="input" value={formData.weight} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* 3. الحالة الصحية */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h5 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> السجل المرضي</h5>
          
          <div className="space-y-3">
            <div>
              <label className="label">الأمراض الحالية (افصل بينها بفاصلة)</label>
              <input name="chronic_diseases_text" type="text" placeholder="مثال: سكري، ضغط، ربو" className="input" value={formData.chronic_diseases_text} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">حساسية من الأدوية</label>
                <textarea name="drug_allergies_details" rows={2} className="input" placeholder="لا يوجد" value={formData.drug_allergies_details} onChange={handleChange} />
              </div>
              <div>
                <label className="label">حساسية من الأطعمة</label>
                <textarea name="food_allergies_details" rows={2} className="input" placeholder="لا يوجد" value={formData.food_allergies_details} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="label">عمليات جراحية سابقة</label>
              <textarea name="surgeries_details" rows={2} className="input" placeholder="اذكر اسم العملية وتاريخها التقريبي" value={formData.surgeries_details} onChange={handleChange} />
            </div>

            <div>
              <label className="label">تاريخ مرضي للعائلة (أمراض وراثية)</label>
              <textarea name="family_medical_history" rows={2} className="input" placeholder="مثل: سكري، أمراض قلب..." value={formData.family_medical_history} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* 4. حالات خاصة (إعاقة) */}
        <div className="border p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <input type="checkbox" id="has_disability" name="has_disability" checked={formData.has_disability} onChange={handleChange} className="w-5 h-5 accent-blue-600" />
            <label htmlFor="has_disability" className="font-bold text-gray-700 cursor-pointer">هل توجد أي إعاقة؟</label>
          </div>
          {formData.has_disability && (
            <input name="disability_details" type="text" placeholder="يرجى توضيح نوع الإعاقة..." className="input mt-2" value={formData.disability_details} onChange={handleChange} />
          )}
        </div>

        {/* 5. خاص بالإناث فقط */}
        {formData.gender === 'female' && (
          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_pregnant" name="is_pregnant" checked={formData.is_pregnant} onChange={handleChange} className="w-5 h-5 accent-pink-600" />
              <label htmlFor="is_pregnant" className="font-bold text-pink-700 cursor-pointer">حامل حالياً 🤰</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_breastfeeding" name="is_breastfeeding" checked={formData.is_breastfeeding} onChange={handleChange} className="w-5 h-5 accent-pink-600" />
              <label htmlFor="is_breastfeeding" className="font-bold text-pink-700 cursor-pointer">مرضعة 🤱</label>
            </div>
          </div>
        )}

        {/* أزرار التحكم */}
        <div className="flex gap-3 pt-4 border-t">
          <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow flex justify-center items-center gap-2">
            {loading ? 'جاري الحفظ...' : <><Save className="w-5 h-5" /> حفظ البيانات</>}
          </button>
          <button type="button" onClick={onCancel} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">
            إلغاء
          </button>
        </div>

      </form>

      <style jsx>{`
        .label { @apply block text-sm font-bold text-gray-700 mb-1; }
        .input { @apply w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm; }
      `}</style>
    </div>
  );
}
