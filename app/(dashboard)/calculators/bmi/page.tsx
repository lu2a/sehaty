'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Activity, Save, RotateCcw } from 'lucide-react';

export default function BMICalculator() {
  const supabase = createClient();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // تحويل لـ متر
    if (!w || !h) return;

    const bmi = (w / (h * h)).toFixed(1);
    let status = '';
    let color = '';

    if (Number(bmi) < 18.5) { status = 'نحافة'; color = 'text-blue-600 bg-blue-50'; }
    else if (Number(bmi) < 25) { status = 'وزن مثالي'; color = 'text-green-600 bg-green-50'; }
    else if (Number(bmi) < 30) { status = 'زيادة وزن'; color = 'text-orange-600 bg-orange-50'; }
    else { status = 'سمنة'; color = 'text-red-600 bg-red-50'; }

    setResult({ bmi, status, color });
  };

  const saveResult = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && result) {
      await (supabase.from('saved_calculations') as any).insert({
        user_id: user.id,
        title: 'مؤشر كتلة الجسم (BMI)',
        result: `${result.bmi} - ${result.status}`,
        input_data: { weight, height }
      });
      alert('تم حفظ النتيجة بنجاح ✅');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto dir-rtl font-cairo">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Activity className="text-blue-600" /> حاسبة كتلة الجسم (BMI)
      </h1>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 space-y-4">
        <div>
          <label className="block font-bold mb-1">الوزن (كجم)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="75" />
        </div>
        <div>
          <label className="block font-bold mb-1">الطول (سم)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="175" />
        </div>

        <button onClick={calculateBMI} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">احسب النتيجة</button>
      </div>

      {result && (
        <div className={`mt-6 p-6 rounded-xl text-center border-2 ${result.color} border-current`}>
          <p className="text-lg">مؤشر الكتلة لديك</p>
          <h2 className="text-5xl font-bold my-2">{result.bmi}</h2>
          <p className="text-xl font-bold">{result.status}</p>
          
          <button onClick={saveResult} disabled={loading} className="mt-4 flex items-center justify-center gap-2 mx-auto text-sm bg-white/50 px-4 py-2 rounded hover:bg-white">
            <Save className="w-4 h-4" /> {loading ? 'جاري الحفظ...' : 'حفظ في السجل'}
          </button>
        </div>
      )}
    </div>
  );
}
