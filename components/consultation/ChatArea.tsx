'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  reactions: any;
}

const REACTION_ICONS = ['❤️', '😄', '😂', '👏', '👍'];

export default function ChatArea({ consultationId, currentUserId }: { consultationId: string, currentUserId: string }) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. جلب الرسائل السابقة والاشتراك في القناة
  useEffect(() => {
    fetchMessages();

    // الاشتراك في Realtime
    const channel = supabase
      .channel(`chat_${consultationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `consultation_id=eq.${consultationId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new as Message : m));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [consultationId]);

  // التمرير لأسفل عند وصول رسالة جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    // تصحيح: استخدام as any لتجاوز فحص TypeScript
    const { data } = await (supabase.from('messages') as any)
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // تصحيح: استخدام as any هنا هو حل المشكلة الرئيسية في الـ Build
    const { error } = await (supabase.from('messages') as any).insert({
      consultation_id: consultationId,
      sender_id: currentUserId,
      content: newMessage,
    });

    if (!error) setNewMessage('');
  };

  const toggleReaction = async (messageId: string, emoji: string, currentReactions: any) => {
    const reactions = currentReactions || {};
    const usersWhoReacted = reactions[emoji] || [];
    
    let newUsersList;
    if (usersWhoReacted.includes(currentUserId)) {
      // إزالة التفاعل
      newUsersList = usersWhoReacted.filter((id: string) => id !== currentUserId);
    } else {
      // إضافة التفاعل
      newUsersList = [...usersWhoReacted, currentUserId];
    }

    const updatedReactions = { ...reactions, [emoji]: newUsersList };

    // تصحيح: استخدام as any للتحديث
    await (supabase.from('messages') as any)
      .update({ reactions: updatedReactions })
      .eq('id', messageId);
  };

  return (
    <div className="flex flex-col h-[500px] bg-gray-50 rounded-lg border">
      {/* منطقة الرسائل */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 my-10">بداية المحادثة... كن ودوداً 😊</p>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] relative group`}>
                <div 
                  className={`p-3 rounded-2xl text-sm ${
                    isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
                
                {/* شريط التفاعلات (يظهر عند التمرير) */}
                <div className={`absolute -bottom-8 ${isMe ? 'right-0' : 'left-0'} hidden group-hover:flex bg-white shadow-lg rounded-full px-2 py-1 gap-1 z-10 border`}>
                  {REACTION_ICONS.map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => toggleReaction(msg.id, emoji, msg.reactions)}
                      className="hover:scale-125 transition text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* عرض التفاعلات الموجودة */}
                {msg.reactions && Object.keys(msg.reactions).some(k => msg.reactions[k]?.length > 0) && (
                  <div className={`absolute -bottom-3 ${isMe ? 'left-0' : 'right-0'} flex gap-1 bg-white border rounded-full px-1 shadow-sm text-xs`}>
                    {Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => (
                      users.length > 0 && <span key={emoji}>{emoji} <span className="text-[10px] text-gray-500">{users.length}</span></span>
                    ))}
                  </div>
                )}
                
                <span className="text-[10px] text-gray-400 mt-1 block px-1">
                  {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute:'2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* حقل الإرسال */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 p-2 border rounded-full focus:outline-none focus:border-blue-500 bg-gray-50"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 rotate-180"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
