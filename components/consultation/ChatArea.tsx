'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Send, Mic, Image as ImageIcon, Paperclip, X, 
  Zap, Clock, Power, Lock, Loader2, StopCircle
} from 'lucide-react';

// --- Interfaces ---
interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  type: 'text' | 'image' | 'audio' | 'system';
  attachment_url?: string;
}

interface ChatProps {
  consultationId: string;
  currentUserId: string;
  isClosed: boolean;
  isResolved?: boolean; // لفترة السماح
  createdAt: string;
  doctorName?: string;
  onEndChat?: () => void;
}

// --- Quick Replies Templates (يمكن تعديلها) ---
const QUICK_REPLIES = [
  "أهلاً بك، كيف يمكنني مساعدتك اليوم؟",
  "يرجى إرسال صورة واضحة لمكان الألم.",
  "هل تتناول أي أدوية أخرى حالياً؟",
  "يرجى الالتزام بالجرعة المحددة في الروشتة.",
  "هل لديك حساسية من أي دواء؟",
  "شكراً لك، وأتمنى لك الشفاء العاجل."
];

export default function ChatArea({ 
  consultationId, currentUserId, isClosed, isResolved, createdAt, onEndChat 
}: ChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // States للمميزات الجديدة
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [timer, setTimer] = useState('00:00:00');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Timer Logic ---
  useEffect(() => {
    const interval = setInterval(() => {
      const start = new Date(createdAt).getTime();
      const now = new Date().getTime();
      const diff = now - start;
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      setTimer(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  // --- 2. Realtime & Fetching ---
  useEffect(() => {
    // Fetch Messages
    const fetchMessages = async () => {
      const { data } = await (supabase.from('messages') as any)
        .select('*')
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to Messages & Typing Events
    const channel = supabase.channel(`chat_${consultationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `consultation_id=eq.${consultationId}` }, 
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          // عند وصول رسالة جديدة، نوقف مؤشر الكتابة
          if (payload.new.sender_id !== currentUserId) setOtherUserTyping(false);
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== currentUserId) {
          setOtherUserTyping(true);
          // إخفاء تلقائي بعد 3 ثواني
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [consultationId, currentUserId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  // --- 3. Typing Logic ---
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      supabase.channel(`chat_${consultationId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId }
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  };

  // --- 4. Main Send Function ---
  const sendMessage = async (content: string, type: 'text' | 'image' | 'audio' = 'text', attachmentUrl: string | null = null) => {
    if (isClosed) return;

    await (supabase.from('messages') as any).insert({
      consultation_id: consultationId,
      sender_id: currentUserId,
      content: content,
      type: type,
      attachment_url: attachmentUrl
    });
    setNewMessage('');
    setShowQuickReplies(false);
    
    // هنا يمكن استدعاء API خارجي لإرسال Push Notification
    // await sendPushNotification(otherUserId);
  };

  // --- 5. File Upload (Images) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${consultationId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('chat-attachments').upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
      await sendMessage('صورة مرفقة', 'image', data.publicUrl);
    } else {
      alert('فشل رفع الملف');
    }
    setIsUploading(false);
  };

  // --- 6. Voice Recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const fileName = `${consultationId}/${Date.now()}.webm`;
        
        setIsUploading(true); // نستخدم نفس مؤشر التحميل
        const { error } = await supabase.storage.from('chat-attachments').upload(fileName, blob);
        
        if (!error) {
          const { data } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
          await sendMessage('رسالة صوتية', 'audio', data.publicUrl);
        }
        setIsUploading(false);
        stream.getTracks().forEach(track => track.stop()); // إغلاق المايك
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert('الرجاء السماح بالوصول للميكروفون');
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  // --- Render ---
  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border shadow-sm overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
          <Clock size={16} className="text-blue-600"/>
          <span className="font-mono text-blue-700">{timer}</span>
          {isResolved && !isClosed && <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded-[4px] text-[10px]">فترة سماح</span>}
        </div>
        
        {!isClosed && onEndChat && (
          <button onClick={onEndChat} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1 transition">
            <Power size={14} /> إنهاء
          </button>
        )}
        {isClosed && (
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <Lock size={14} /> مغلقة
          </span>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isSystem = msg.type === 'system' || msg.content.includes('SYSTEM_MSG:');

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="bg-gray-200 text-gray-600 text-[10px] px-3 py-1 rounded-full shadow-sm">
                  {msg.content.replace('SYSTEM_MSG:', '')}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl text-sm relative shadow-sm ${
                isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'
              }`}>
                {/* Text Message */}
                {msg.type === 'text' && <p>{msg.content}</p>}
                
                {/* Image Message */}
                {msg.type === 'image' && msg.attachment_url && (
                  <div>
                    <img 
                      src={msg.attachment_url} 
                      alt="attachment" 
                      className="rounded-lg max-h-48 cursor-pointer hover:opacity-90 transition" 
                      onClick={() => window.open(msg.attachment_url, '_blank')} 
                    />
                  </div>
                )}

                {/* Audio Message */}
                {msg.type === 'audio' && msg.attachment_url && (
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <audio controls src={msg.attachment_url} className="w-full h-8" />
                  </div>
                )}

                <span className={`text-[9px] block mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute:'2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-100 text-gray-500 text-xs px-3 py-2 rounded-2xl rounded-bl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input */}
      <div className="p-3 bg-white border-t relative">
        
        {/* Quick Replies Popup */}
        {showQuickReplies && (
          <div className="absolute bottom-16 right-4 bg-white border shadow-xl rounded-xl p-2 w-64 z-10 space-y-1 animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center pb-2 border-b mb-1">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Zap size={12}/> ردود جاهزة</span>
              <button onClick={() => setShowQuickReplies(false)} className="hover:bg-red-50 p-1 rounded text-red-500"><X size={14}/></button>
            </div>
            {QUICK_REPLIES.map((reply, i) => (
              <button 
                key={i} 
                onClick={() => sendMessage(reply)}
                className="block w-full text-right text-xs p-2 hover:bg-blue-50 rounded text-gray-700 transition"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {isClosed ? (
          <div className="text-center text-gray-400 text-sm py-2 bg-gray-50 rounded-xl flex items-center justify-center gap-2">
            <Lock size={16}/> تم إغلاق المحادثة
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            
            {/* Attachment Button */}
            <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-blue-600 transition p-2 rounded-full hover:bg-gray-100" disabled={isUploading} title="إرفاق صورة">
              <Paperclip size={20} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

            {/* Quick Replies Button (Only for Doctor usually, but checking onEndChat implies doctor role here or we can check role prop) */}
            {onEndChat && (
              <button onClick={() => setShowQuickReplies(!showQuickReplies)} className={`transition p-2 rounded-full hover:bg-gray-100 ${showQuickReplies ? 'text-yellow-500' : 'text-gray-400'}`} title="ردود جاهزة">
                <Zap size={20} />
              </button>
            )}

            {/* Input Field */}
            <div className="flex-1 relative">
                <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(newMessage)}
                placeholder={isUploading ? "جاري الرفع..." : isRecording ? "جاري التسجيل..." : "اكتب رسالة..."}
                disabled={isUploading || isRecording}
                className={`w-full p-3 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50 transition ${isRecording ? 'border-red-500 bg-red-50 text-red-600 placeholder-red-400' : ''}`}
                />
            </div>

            {/* Voice / Send Button */}
            {newMessage.trim() === '' && !isUploading ? (
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title={isRecording ? "إيقاف وإرسال" : "تسجيل صوتي"}
              >
                {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
              </button>
            ) : (
              <button 
                onClick={() => sendMessage(newMessage)}
                disabled={isUploading}
                className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} className="ml-1" />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
