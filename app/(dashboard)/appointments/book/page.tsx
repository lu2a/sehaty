'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Calendar, User, FileText, Phone, AlertCircle } from 'lucide-react';
import SearchableSelect from '@/components/ui/SearchableSelect';

export default function BookAppointmentPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    medical_file_id: '',
    specialty: '',
    visit_date: '',
    reason: '',
    phone: ''
  });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // جلب أفراد الأسرة
      const { data: files } = await supabase.from('medical_files').select('id, full_name').eq('user_id', user.id);
      if (files) setFamilyMembers(files);

      // جلب التخصصات
      const { data: list } = await supabase.from('medical_lists').select('value').eq('category', 'specialty');
      if (list) setSpecialties(list.map(i => i.value));
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    // التحقق من تاريخ اليوم (لا يسمح بحجز تاريخ سابق)
    if (new Date(formData.visit_date) < new Date(new Date().setHours(0,0,0,0))) {
      alert('لا يمكن حجز موعد في تاريخ سابق');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from('appointments').insert({
        user_id: user?.id,
        ...formData
      });

      if (error) {
        if (error.code === '23505') { // كود خطأ التكرار (Unique Violation)
          alert('عفواً، لا يمكن حجز أكثر من موعد لنفس الفرد في نفس اليوم.');
        } else {
          alert('حدث خطأ: ' + error.message);
        }
      } else {
        alert('تم حجز الموعد بنجاح! يرجى إحضار الأوراق الثبوتية عند الحضور.');
        router.push('/appointments'); // توجيه لصفحة عرض المواعيد
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 font-cairo dir-rtl">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <Calendar className="text-blue-600"/> حجز موعد عيادة
      </h1>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6 flex items-start gap-3">
        <AlertCircle className="text-yellow-600 shrink-0 mt-1" size={20} />
        <div>
          <p className="font-bold text-yellow-800 text-sm">تنبيه هام</p>
          <p className="text-yellow-700 text-xs mt-1">
            يرجى إحضار الأوراق الثبوتية (بطاقة الهوية / التأمين) عند الحضور للكشف.
            يسمح بحجز موعد واحد فقط لكل فرد في اليوم.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
        
        {/* اختيار الفرد */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">اسم المريض (من أفراد الأسرة)</label>
          <div className="grid grid-cols-2 gap-3">
            {familyMembers.map(member => (
              <div 
                key={member.id}
                onClick={() => setFormData({...formData, medical_file_id: member.id})}
                className={`p-3 border rounded-xl cursor-pointer transition text-center text-sm ${
                  formData.medical_file_id === member.id 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {member.full_name}
              </div>
            ))}
          </div>
        </div>

        {/* التخصص */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">العيادة / التخصص</label>
          <SearchableSelect 
            options={specialties}
            value={formData.specialty}
            onChange={(val) => setFormData({...formData, specialty: val})}
            placeholder="اختر التخصص..."
          />
        </div>

        {/* التاريخ */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الزيارة</label>
          <input 
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={formData.visit_date}
            onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
            className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        {/* سبب الزيارة */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">سبب الزيارة (الشكوى)</label>
          <textarea 
            required
            rows={3}
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            placeholder="اشرح باختصار سبب طلب الكشف..."
            className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        {/* الهاتف */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف (اختياري)</label>
          <input 
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="01xxxxxxxxx"
            className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !formData.medical_file_id || !formData.specialty}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'جاري الحجز...' : 'تأكيد الحجز'}
        </button>

      </form>
    </div>
  );
}
