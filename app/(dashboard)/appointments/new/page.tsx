'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewAppointment() {
  const supabase = createClient();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 1. جلب العيادات عند التحميل
  useEffect(() => {
    async function fetchClinics() {
      const { data } = await supabase.from('clinics').select('*');
      if (data) setClinics(data);
    }
    fetchClinics();
  }, []);

  // 2. جلب الأطباء عند اختيار العيادة
  const handleClinicSelect = async (clinicId: string) => {
    setSelectedClinic(clinicId);
    const { data } = await supabase
      .from('doctors')
      .select('*, profiles(full_name, avatar_url)')
      .eq('clinic_id', clinicId)
      .eq('is_active', true);
    
    if (data) setDoctors(data);
    setStep(2);
  };

  // 3. توليد المواعيد المتاحة (محاكاة بسيطة)
  const generateSlots = () => {
    const slots = [];
    const startHour = 9; // بداية الدوام 9 صباحاً
    const endHour = 17; // نهاية الدوام 5 مساءً
    
    for (let i = startHour; i < endHour; i++) {
      slots.push(`${i}:00`);
      slots.push(`${i}:30`);
    }
    return slots;
  };

  const handleBook = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !selectedDoctor) return;

    // الحل هنا: تحويل الجدول إلى any لتجاوز خطأ TypeScript الصارم
    const { error } = await (supabase.from('appointments') as any).insert({
      user_id: user.id,
      clinic_id: selectedClinic,
      doctor_id: selectedDoctor.id,
      specialty: selectedDoctor.specialty,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      status: 'confirmed', // حجز مؤكد مبدئياً
      notes: 'حجز عبر التطبيق'
    });

    if (!error) {
      alert('تم حجز الموعد بنجاح! ✅');
      router.push('/dashboard');
    } else {
      alert('خطأ: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 dir-rtl min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-blue-900">حجز موعد في العيادة</h1>

      {/* شريط التقدم */}
      <div className="flex justify-between mb-8 text-sm font-bold text-gray-500 relative">
        <div className={`z-10 bg-gray-50 px-2 ${step >= 1 ? 'text-blue-600' : ''}`}>1. العيادة</div>
        <div className={`z-10 bg-gray-50 px-2 ${step >= 2 ? 'text-blue-600' : ''}`}>2. الطبيب</div>
        <div className={`z-10 bg-gray-50 px-2 ${step >= 3 ? 'text-blue-600' : ''}`}>3. الموعد</div>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>
      </div>

      {/* الخطوة 1: اختيار العيادة */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
          {clinics.map((clinic) => (
            <div 
              key={clinic.id}
              onClick={() => handleClinicSelect(clinic.id)}
              className="p-6 border rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition shadow-sm bg-white"
            >
              <h3 className="font-bold text-lg text-gray-800">{clinic.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{clinic.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* الخطوة 2: اختيار الطبيب */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in">
          <button onClick={() => setStep(1)} className="text-sm text-gray-500 mb-4 hover:underline">Running &larr; العودة للعيادات</button>
          
          {doctors.length === 0 ? (
             <p className="text-center text-gray-500 py-10">عفواً، لا يوجد أطباء متاحين في هذه العيادة حالياً.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <div 
                  key={doctor.id}
                  onClick={() => { setSelectedDoctor(doctor); setStep(3); }}
                  className="p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition flex items-center gap-4 bg-white"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 className="font-bold">{doctor.profiles.full_name}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                    <p className="text-xs text-green-600 mt-1">متاح للحجز</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* الخطوة 3: اختيار التاريخ والوقت */}
      {step === 3 && (
        <div className="animate-in fade-in space-y-6">
          <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:underline">&larr; تغيير الطبيب</button>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <p>أنت تحجز موعداً مع: <strong>{selectedDoctor?.profiles.full_name}</strong></p>
          </div>

          <div>
            <label className="block font-bold mb-2">تاريخ الزيارة</label>
            <input 
              type="date" 
              className="w-full p-3 border rounded-lg"
              min={new Date().toISOString().split('T')[0]} // منع اختيار تاريخ قديم
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {selectedDate && (
            <div>
              <label className="block font-bold mb-2">الوقت المتاح</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {generateSlots().map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded border text-sm transition ${
                      selectedTime === time 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white hover:border-blue-400'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            disabled={!selectedDate || !selectedTime || loading}
            onClick={handleBook}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 shadow-lg mt-8"
          >
            {loading ? 'جاري الحجز...' : 'تأكيد وحجز الموعد ✅'}
          </button>
        </div>
      )}
    </div>
  );
}
