'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Send, Smile, Clock, Power, Lock } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_system_message?: boolean; // لتمييز رسائل النظام
}

interface ChatProps {
  consultationId: string;
  currentUserId: string;
  doctorName: string; // اسم الطبيب للرسالة الأوتوماتيكية
  isClosed: boolean;
  createdAt: string; // تاريخ بدء الاستشارة للتايمر
  onEndChat: () => void; // دالة الإنهاء من الصفحة الرئيسية
}

export default function ChatArea({ consultationId, currentUserId, doctorName, isClosed, createdAt, onEndChat }: ChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // التايمر
  const [timer, setTimer] = useState('00:00:00');

  // حساب الوقت المنقضي
  useEffect(() => {
    const interval = setInterval(() => {
      const start = new Date(createdAt).getTime();
      const now = new Date().getTime();
      const diff = now - start;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimer(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  // جلب الرسائل
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await (supabase.from('messages') as any)
        .select('*')
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase.channel(`chat_${consultationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `consultation_id=eq.${consultationId}` }, 
      (payload) => setMessages((prev) => [...prev, payload.new as Message]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [consultationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isClosed) return;

    await (supabase.from('messages') as any).insert({
      consultation_id: consultationId,
      sender_id: currentUserId,
      content: newMessage,
    });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border shadow-sm overflow-hidden">
      
      {/* 1. شريط أدوات الشات */}
      <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
          <Clock size={16} className="text-blue-600"/>
          <span>مدة الجلسة: <span className="font-mono text-blue-700">{timer}</span></span>
        </div>
        
        {!isClosed && (
          <button 
            onClick={onEndChat}
            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1 transition"
          >
            <Power size={14} /> إنهاء المحادثة
          </button>
        )}
        {isClosed && (
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <Lock size={14} /> المحادثة مغلقة
          </span>
        )}
      </div>

      {/* 2. منطقة الرسائل */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          // تمييز رسائل النظام
          if (msg.content.includes('SYSTEM_MSG:')) {
             return (
               <div key={msg.id} className="flex justify-center my-4">
                 <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">{msg.content.replace('SYSTEM_MSG:', '')}</span>
               </div>
             )
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm relative shadow-sm ${
                isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'
              }`}>
                {msg.content}
                <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute:'2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. حقل الإدخال */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2 items-center">
        <input
          type="text"
          disabled={isClosed}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isClosed ? "تم إنهاء المحادثة، لا يمكن الإرسال." : "اكتب رسالتك هنا..."}
          className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim() || isClosed}
          className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition"
        >
          <Send size={20} className={isClosed ? "" : "ml-1"} />
        </button>
      </form>
    </div>
  );
}
