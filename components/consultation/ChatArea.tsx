'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Send, Mic, Image as ImageIcon, Paperclip, X, 
  MoreHorizontal, Clock, Zap, Loader2 
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
  isClosed: boolean;      // True = مغلق نهائياً
  isResolved?: boolean;   // True = فترة سماح (الشات مفتوح)
  createdAt: string;
  doctorName?: string;
  onEndChat?: () => void;
}

// --- Quick Replies Templates ---
const QUICK_REPLIES = [
  "أهلاً بك، كيف يمكنني مساعدتك اليوم؟",
  "يرجى إرسال صورة توضيحية لمكان الألم.",
  "هل تعاني من أي أمراض مزمنة أو حساسية؟",
  "يرجى الالتزام بالجرعات المحددة في الروشتة.",
  "شكراً لك، نتمنى لك الشفاء العاجل.",
  "يرجى إجراء التحاليل المطلوبة وإرسالها هنا."
];

export default function ChatArea({ 
  consultationId, currentUserId, isClosed, isResolved, createdAt, onEndChat 
}: ChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Realtime & Fetching ---
  useEffect(() => {
    // جلب الرسائل
    const fetchMessages = async () => {
      const { data } = await (supabase.from('messages') as any)
        .select('*')
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // الاشتراك في القنوات (رسائل + مؤشر الكتابة)
    const channel = supabase.channel(`chat_${consultationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `consultation_id=eq.${consultationId}` }, 
        (payload) => setMessages((prev) => [...prev, payload.new as Message]))
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== currentUserId) {
          setOtherUserTyping(true);
          // إخفاء المؤشر بعد 3 ثواني من التوقف
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [consultationId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  // --- 2. Typing Indicator Logic ---
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

    // Debounce to stop typing status
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  };

  // --- 3. Sending Messages (Text, Image, Audio) ---
  const sendMessage = async (content: string, type: 'text' | 'image' | 'audio' = 'text', attachmentUrl: string | null = null) => {
    if (isClosed) return;

    await (supabase.from('messages') as any).insert({
      consultation_id: consultationId,
      sender_id: currentUserId,
      content: content, // للنص أو وصف الملف
      type: type,
      attachment_url: attachmentUrl
    });
    setNewMessage('');
    setShowQuickReplies(false);
  };

  // --- 4. File Upload (Images) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${consultationId}/${fileName}`;

    const { error } = await supabase.storage.from('chat-files').upload(filePath, file);

    if (!error) {
      const { data } = supabase.storage.from('chat-files').getPublicUrl(filePath);
      await sendMessage('صورة مرفقة', 'image', data.publicUrl);
    } else {
      alert('فشل رفع الصورة');
    }
    setIsUploading(false);
  };

  // --- 5. Voice Recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const fileName = `${consultationId}/${Date.now()}.webm`;
        
        setIsUploading(true);
        const { error } = await supabase.storage.from('chat-files').upload(fileName, blob);
        
        if (!error) {
          const { data } = supabase.storage.from('chat-files').getPublicUrl(fileName);
          await sendMessage('تسجيل صوتي', 'audio', data.publicUrl);
        }
        setIsUploading(false);
        stream.getTracks().forEach(track => track.stop()); // Stop mic
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert('لا يمكن الوصول للميكروفون');
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  // --- UI Render ---
  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border shadow-sm overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
          {isResolved && !isClosed && <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded text-xs">فترة سماح (1 ساعة)</span>}
          {isClosed && <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs">مغلقة نهائياً</span>}
        </div>
        
        {!isClosed && onEndChat && (
          <button onClick={onEndChat} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-bold border border-red-200">
            إنهاء الآن
          </button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isSystem = msg.type === 'system' || msg.content.includes('SYSTEM_MSG');

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="bg-gray-200 text-gray-600 text-[10px] px-3 py-1 rounded-full">
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
                {/* Content based on Type */}
                {msg.type === 'text' && <p>{msg.content}</p>}
                
                {msg.type === 'image' && msg.attachment_url && (
                  <div>
                    <img src={msg.attachment_url} alt="attachment" className="rounded-lg max-h-48 cursor-pointer" onClick={() => window.open(msg.attachment_url, '_blank')} />
                  </div>
                )}

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
        
        {otherUserTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-100 text-gray-500 text-xs px-3 py-2 rounded-2xl rounded-bl-none">
              جاري الكتابة...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t relative">
        {/* Quick Replies Popup */}
        {showQuickReplies && (
          <div className="absolute bottom-16 left-4 bg-white border shadow-xl rounded-xl p-2 w-64 z-10 space-y-1">
            <div className="flex justify-between items-center pb-2 border-b mb-1">
              <span className="text-xs font-bold text-gray-500">ردود جاهزة</span>
              <button onClick={() => setShowQuickReplies(false)}><X size={14}/></button>
            </div>
            {QUICK_REPLIES.map((reply, i) => (
              <button 
                key={i} 
                onClick={() => sendMessage(reply)}
                className="block w-full text-right text-xs p-2 hover:bg-blue-50 rounded text-gray-700"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {isClosed ? (
          <div className="text-center text-gray-400 text-sm py-3 bg-gray-50 rounded-xl">
            تم إغلاق المحادثة
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            {/* Attachments */}
            <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-blue-600 transition p-2" disabled={isUploading}>
              <Paperclip size={20} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

            {/* Quick Replies Toggle */}
            <button onClick={() => setShowQuickReplies(!showQuickReplies)} className="text-gray-400 hover:text-yellow-500 transition p-2">
              <Zap size={20} />
            </button>

            {/* Input */}
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(newMessage)}
              placeholder={isUploading ? "جاري الرفع..." : "اكتب رسالة..."}
              disabled={isUploading || isRecording}
              className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50"
            />

            {/* Voice Note */}
            {newMessage.trim() === '' ? (
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                {isRecording ? <div className="w-3 h-3 bg-white rounded-sm" /> : <Mic size={20} />}
              </button>
            ) : (
              <button 
                onClick={() => sendMessage(newMessage)}
                className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition"
              >
                <Send size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
