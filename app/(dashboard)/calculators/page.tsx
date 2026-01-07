'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function MedicalCalculators() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'bmi' | 'pregnancy'>('bmi');
  const [loading, setLoading] = useState(false);

  // BMI States
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiResult, setBmiResult] = useState<number | null>(null);

  // Pregnancy States
  const [lastPeriod, setLastPeriod] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);

  // دالة حساب BMI
  const calculateBMI = () => {
    if (!weight || !height) return;
    const hInMeters = parseFloat(height) / 100;
    const bmi = parseFloat(weight) / (hInMeters * hInMeters);
    setBmiResult(parseFloat(bmi.toFixed(1)));
  };

  // دالة حساب موعد الولادة (قاعدة نيجيل)
  const calculatePregnancy = () => {
    if (!lastPeriod) return;
    const date = new Date(lastPeriod);
    date.setDate(date.getDate() + 280); // +40 أسبوع
    setDueDate(date.toLocaleDateString('ar-EG'));
  };

  // الحفظ في قاعدة البيانات
  const saveResult = async (title: string, result: string, inputs: any) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // الحل هنا: استخدام as any لتجاوز خطأ TypeScript
    const { error } = await (supabase.from('saved_calculations') as any).insert({
      user_id: user?.id,
      title,
      result,
      inputs
    });

    if (!error) alert('تم حفظ النتيجة في سجلك ✅');
    setLoading(false);
  };

  return (
    <div className="p-6 dir-rtl max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">🧮 الحاسبات الطبية الذكية</h1>

      {/* التبويبات */}
      <div className="flex gap-4 mb-6 border-b">
        <button 
          onClick={() => setActiveTab('bmi')}
          className={`pb-2 px-4 font-bold ${activeTab === 'bmi' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          مؤشر كتلة الجسم (BMI)
        </button>
        <button 
          onClick={() => setActiveTab('pregnancy')}
          className={`pb-2 px-4 font-bold ${activeTab === 'pregnancy' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'}`}
        >
          حاسبة الحمل والولادة
        </button>
      </div>

      {/* 1. حاسبة BMI */}
      {activeTab === 'bmi' && (
        <div className="bg-white p-6 rounded-xl shadow animate-in fade-in">
          <h3 className="font-bold text-lg mb-4">احسب وزنك المثالي</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold mb-1">الوزن (كجم)</label>
              <input type="number" className="w-full p-3 border rounded" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الطول (سم)</label>
              <input type="number" className="w-full p-3 border rounded" value={height} onChange={e => setHeight(e.target.value)} />
            </div>
          </div>
          
          <button onClick={calculateBMI} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">احسب النتيجة</button>

          {bmiResult && (
            <div className="mt-6 text-center bg-blue-50 p-6 rounded-xl border border-blue-100">
              <p className="text-gray-600">مؤشر كتلة الجسم</p>
              <h2 className="text-4xl font-bold text-blue-800 my-2">{bmiResult}</h2>
              <p className={`font-bold ${bmiResult > 25 ? 'text-orange-600' : bmiResult < 18.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                {bmiResult < 18.5 ? 'نحافة' : bmiResult < 25 ? 'وزن مثالي 🌟' : bmiResult < 30 ? 'زيادة وزن' : 'سمنة'}
              </p>
              
              <button 
                onClick={() => saveResult('مؤشر كتلة الجسم (BMI)', `${bmiResult}`, { weight, height })}
                disabled={loading}
                className="mt-4 text-sm text-blue-600 underline hover:text-blue-800"
              >
                حفظ هذه النتيجة في السجل 💾
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. حاسبة الحمل */}
      {activeTab === 'pregnancy' && (
        <div className="bg-white p-6 rounded-xl shadow animate-in fade-in">
          <h3 className="font-bold text-lg mb-4 text-pink-700">موعد الولادة المتوقع</h3>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">تاريخ أول يوم في آخر دورة شهرية</label>
            <input type="date" className="w-full p-3 border rounded" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} />
          </div>

          <button onClick={calculatePregnancy} className="w-full bg-pink-500 text-white py-3 rounded font-bold hover:bg-pink-600">احسب الموعد</button>

          {dueDate && (
            <div className="mt-6 text-center bg-pink-50 p-6 rounded-xl border border-pink-100">
              <p className="text-gray-600">موعد الولادة المتوقع بإذن الله</p>
              <h2 className="text-3xl font-bold text-pink-800 my-2">{dueDate}</h2>
              <p className="text-xs text-gray-500">قد يختلف الموعد الفعلي +/- أسبوعين</p>

              <button 
                onClick={() => saveResult('موعد الولادة المتوقع', dueDate, { lastPeriod })}
                disabled={loading}
                className="mt-4 text-sm text-pink-600 underline hover:text-pink-800"
              >
                حفظ الموعد في السجل 💾
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
