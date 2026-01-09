Subject: Ready fixed code pasted

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Calendar, Heart, Save } from 'lucide-react';

// 🟢 تعريف Type لجدول pregnancy_records
type PregnancyRecord = {
id: string;
user_id: string;
last_period_date: string;
expected_due_date?: string;
current_week?: number;
};

export default function PregnancyPage() {
const supabase = createClient();
const db: any = supabase;

const [record, setRecord] = useState<PregnancyRecord | null>(null);
const [lastPeriod, setLastPeriod] = useState('');

useEffect(() => {
fetchRecord();
}, []);

const fetchRecord = async () => {
const { data: { user } } = await supabase.auth.getUser();
if (user) {
const { data } = await db
.from('pregnancy_records')
.select('*')
.eq('user_id', user.id)
.maybeSingle<PregnancyRecord>();

```
  if (data) {
    setRecord(data);
    setLastPeriod(data.last_period_date);
  }
}
```

};

const calculateDueDate = (date: string) => {
if (!date) return '--';
const result = new Date(date);
result.setDate(result.getDate() + 280);
return result.toLocaleDateString('ar-EG');
};

const calculateWeek = (date: string) => {
if (!date) return 0;
const start = new Date(date);
const now = new Date();
const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
return diff > 0 ? diff : 0;
};

const handleSave = async () => {
if (!lastPeriod) return;
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;

```
const payload = {
  user_id: user.id,
  last_period_date: lastPeriod,
  expected_due_date: new Date(new Date(lastPeriod).getTime() + 280 * 24 * 60 * 60 * 1000).toISOString(),
  current_week: calculateWeek(lastPeriod),
};

if (record) {
  await db.from('pregnancy_records').update(payload).eq('id', record.id);
} else {
  await db.from('pregnancy_records').insert(payload);
}

fetchRecord();
alert('تم تحديث البيانات 🤰');
```

};

return ( <div className="p-4 min-h-screen dir-rtl font-cairo max-w-lg mx-auto bg-pink-50/30"> <h1 className="text-xl font-bold mb-6 text-center text-pink-700">متابعة الحمل</h1>

```
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 text-center mb-6">
    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
      <Heart size={40} className="animate-pulse" />
    </div>

    {record ? (
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-1">الأسبوع {calculateWeek(lastPeriod)}</h2>
        <p className="text-gray-500 text-sm">
          أنتِ الآن في الثلث {calculateWeek(lastPeriod) < 13 ? 'الأول' : calculateWeek(lastPeriod) < 27 ? 'الثاني' : 'الثالث'}
        </p>

        <div className="mt-6 bg-pink-50 p-4 rounded-xl border border-pink-100">
          <p className="text-xs font-bold text-pink-600 mb-1">موعد الولادة المتوقع</p>
          <p className="text-xl font-bold text-gray-800">{calculateDueDate(lastPeriod)}</p>
        </div>
      </div>
    ) : (
      <p className="text-gray-500">لم تقومي بتسجيل بيانات الحمل بعد</p>
    )}
  </div>

  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h3 className="font-bold text-sm mb-4 text-gray-700">إعدادات الحمل</h3>
    <label className="text-xs font-bold text-gray-500 block mb-2">تاريخ أول يوم في آخر دورة شهرية</label>
    <input
      type="date"
      value={lastPeriod}
      onChange={(e) => setLastPeriod(e.target.value)}
      className="w-full p-3 border rounded-xl mb-4 text-center bg-gray-50"
    />
    <button
      onClick={handleSave}
      className="w-full bg-pink-600 text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition flex items-center justify-center gap-2"
    >
      <Save size={18}/> حفظ البيانات
    </button>
  </div>
</div>
```

);
}
