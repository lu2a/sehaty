'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function SavedCalculations() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if(!user) return;
      
      // تصحيح: استخدام as any
      const { data } = await (supabase.from('saved_calculations') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if(data) setItems(data);
    }
    load();
  }, []);

  return (
    <div className="p-6 dir-rtl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">🧮 نتائج الحاسبات الطبية المحفوظة</h1>
      
      {items.length === 0 ? (
        <p className="text-gray-500">لا توجد نتائج محفوظة.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
               <h3 className="font-bold text-lg">{item.title}</h3>
               <p className="text-2xl font-bold text-blue-600 my-2">{item.result}</p>
               <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('ar-EG')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
