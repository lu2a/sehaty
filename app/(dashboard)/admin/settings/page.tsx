'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function AdminSettings() {
  const supabase = createClient();
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('system_settings').select('*').order('key');
    if (data) setSettings(data);
  };

  const handleUpdate = async (key: string, value: string) => {
    const { error } = await supabase.from('system_settings').update({ value }).eq('key', key);
    if (!error) alert('تم الحفظ');
  };

  return (
    <div className="p-6 dir-rtl max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">⚙️ إعدادات النظام</h1>
      
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {settings.map((setting) => (
          <div key={setting.key} className="p-4 border-b last:border-0 flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="font-bold text-gray-700">{setting.description}</label>
              <span className="text-xs text-gray-400 font-mono">{setting.key}</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                defaultValue={setting.value} 
                className="flex-1 p-2 border rounded bg-gray-50"
                id={`input-${setting.key}`}
              />
              <button 
                onClick={() => {
                  const val = (document.getElementById(`input-${setting.key}`) as HTMLInputElement).value;
                  handleUpdate(setting.key, val);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
              >
                حفظ
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
        <h2 className="font-bold text-blue-900 mb-2">📩 رسائل الإدارة</h2>
        <p className="text-gray-600 mb-4">هنا يمكنك استعراض رسائل الدعم الفني أو التواصل الداخلي.</p>
        <button className="w-full bg-white border border-blue-200 py-3 rounded text-blue-600 font-bold">
          فتح صندوق الوارد (قريباً)
        </button>
      </div>
    </div>
  );
}