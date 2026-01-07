'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { calculateCycle } from '@/lib/cycle-calculator';

export default function CycleTracking() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [cycleData, setCycleData] = useState<any>(null); // البيانات المخزنة
  const [calculations, setCalculations] = useState<any>(null); // الحسابات الحالية
  
  // لنموذج التسجيل الجديد
  const [newDate, setNewDate] = useState('');
  const [mood, setMood] = useState('normal');

  useEffect(() => {
    checkGenderAndFetch();
  }, []);

  const checkGenderAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. التحقق من الجنس من الملف الطبي الرئيسي
    const { data: profile } = await supabase
      .from('medical_files')
      .select('gender')
      .eq('user_id', user.id)
      .eq('relation', 'self')
      .single();

    // تعديل 1: استخدام as any لتجاوز خطأ قراءة الجنس
    if (!profile || (profile as any).gender !== 'female') {
      alert('هذه الميزة متاحة فقط للإناث.');
      router.push('/dashboard');
      return;
    }

    // 2. جلب آخر سجل للدورة
    const { data: lastCycle } = await supabase
      .from('menstrual_cycle_tracking')
      .select('*')
      .eq('user_id', user.id)
      .order('cycle_start_date', { ascending: false })
      .limit(1)
      .single();

    if (lastCycle) {
      // تعديل 2: تحويل البيانات لـ any لقراءتها بأمان
      const safeCycle = lastCycle as any;
      
      setCycleData(safeCycle);
      // حساب التوقعات
      const calcs = calculateCycle(safeCycle.cycle_start_date, safeCycle.cycle_length || 28);
      setCalculations(calcs);
    }
    setLoading(false);
  };

  const handleLogNewCycle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!newDate || !user) return;

    // حساب التوقعات لتخزينها
    const calcs = calculateCycle(newDate, 28);

    // تعديل 3: استخدام as any عند الإدخال
    const { error } = await (supabase.from('menstrual_cycle_tracking') as any).insert({
      user_id: user.id,
      cycle_start_date: newDate,
      cycle_length: 28, // افتراضي ويمكن تعديله
      mood: mood,
      next_period_prediction: calcs.nextPeriodDate,
      ovulation_prediction: calcs.ovulationDate
    });

    if (!error) {
      alert('تم تسجيل الدورة بنجاح 🌸');
      window.location.reload();
    } else {
      alert(error.message);
    }
  };

  if (loading) return <div className="p-10 text-center">جاري التحميل... 🌸</div>;

  return (
    <div className="p-6 max-w-md mx-auto dir-rtl min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-pink-700">تتبع صحة المرأة 🌸</h1>

      {!cycleData ? (
        // حالة: مستخدمة جديدة لم تسجل من قبل
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-pink-100 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">أهلاً بكِ آنستي/سيدتي</h2>
          <p className="text-gray-500 mb-6">سجلي تاريخ آخر دورة شهرية لنبدأ في تتبع صحتك وتوقع مواعيدك القادمة.</p>
          
          <input 
            type="date" 
            className="w-full p-3 border rounded-xl mb-4 text-center bg-pink-50 border-pink-200"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <button 
            onClick={handleLogNewCycle}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold hover:bg-pink-600 shadow-md transition"
          >
            حفظ وبدء التتبع
          </button>
        </div>
      ) : (
        // حالة: العرض اليومي
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* 1. الدائرة الرئيسية */}
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 text-white text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            
            <p className="opacity-80 text-sm mb-2">اليوم الحالي</p>
            <div className="text-6xl font-extrabold mb-1">{calculations.currentDay}</div>
            <p className="text-sm">من دورة مدتها {cycleData.cycle_length} يوم</p>

            <div className="mt-6 flex justify-between bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <div>
                <span className="block text-xs opacity-70">باقي على الدورة</span>
                <span className="font-bold text-lg">{calculations.daysLeft} يوم</span>
              </div>
              <div className="border-r border-white/20"></div>
              <div>
                <span className="block text-xs opacity-70">الحالة</span>
                <span className="font-bold text-lg">{calculations.isLate ? 'تأخرت ⚠️' : 'منتظمة ✅'}</span>
              </div>
            </div>
          </div>

          {/* 2. التوقعات */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🔮 التوقعات القادمة</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                <span className="text-gray-600">الدورة القادمة</span>
                <span className="font-bold text-pink-700">{new Date(calculations.nextPeriodDate).toLocaleDateString('ar-EG')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-600">يوم التبويض</span>
                <span className="font-bold text-purple-700">{new Date(calculations.ovulationDate).toLocaleDateString('ar-EG')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">نافذة الخصوبة</span>
                <span className="font-bold text-green-700 dir-ltr">{calculations.fertileWindow}</span>
              </div>
            </div>
          </div>

          {/* 3. زر تسجيل دورة جديدة */}
          <button 
            onClick={() => setCycleData(null)} // إعادة تعيين لإظهار الفورم
            className="w-full py-3 text-pink-600 font-bold hover:bg-pink-50 rounded-xl border-2 border-dashed border-pink-200"
          >
            + تسجيل بداية دورة جديدة
          </button>
        </div>
      )}
    </div>
  );
}
