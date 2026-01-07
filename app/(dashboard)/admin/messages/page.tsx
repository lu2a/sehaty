'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function AdminMessages() {
  const supabase = createClient();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setMessages(data);
    }
    load();
  }, []);

  return (
    <div className="p-6 dir-rtl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">📩 صندوق الرسائل والدعم</h1>
      
      <div className="grid gap-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">صندوق الوارد فارغ.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`bg-white p-4 rounded-lg shadow border-r-4 ${msg.is_read ? 'border-gray-300' : 'border-blue-500'}`}>
              <div className="flex justify-between mb-2">
                <h3 className="font-bold text-lg">{msg.subject || 'بدون عنوان'}</h3>
                <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600 mb-2">{msg.message}</p>
              <div className="text-sm text-gray-500 flex gap-4 mt-2 border-t pt-2">
                <span>👤 {msg.sender_name}</span>
                <span>📧 {msg.sender_email}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}