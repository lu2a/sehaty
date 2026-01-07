'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';

interface Props {
  onRecordingComplete: (url: string) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: Props) {
  const supabase = createClient();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        
        // التحقق من الحجم (أقل من 2 دقيقة تقريباً أو بالحجم)
        // سنرفع الملف مباشرة
        uploadAudio(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('لا يمكن الوصول للميكروفون');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // إيقاف الميكروفون
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const uploadAudio = async (blob: Blob) => {
    setUploading(true);
    const fileName = `voice_${Date.now()}.webm`;
    
    const { error } = await supabase.storage
      .from('consultations')
      .upload(fileName, blob);

    if (error) {
      alert('فشل رفع التسجيل');
    } else {
      const { data } = supabase.storage.from('consultations').getPublicUrl(fileName);
      setAudioUrl(data.publicUrl);
      onRecordingComplete(data.publicUrl);
    }
    setUploading(false);
  };

  return (
    <div className="border p-4 rounded-lg bg-gray-50 flex items-center gap-4">
      {!isRecording ? (
        <button 
          type="button"
          onClick={startRecording}
          disabled={uploading || !!audioUrl}
          className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition"
        >
          🎙️
        </button>
      ) : (
        <button 
          type="button"
          onClick={stopRecording}
          className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center animate-pulse"
        >
          ⏹
        </button>
      )}

      <div className="flex-1">
        {isRecording && <p className="text-red-600 text-sm font-bold">جاري التسجيل... (تحدث الآن)</p>}
        {uploading && <p className="text-blue-600 text-sm">جاري المعالجة والرفع...</p>}
        {audioUrl && (
          <div className="w-full">
            <audio controls src={audioUrl} className="w-full h-8" />
            <p className="text-xs text-green-600 mt-1">تم حفظ التسجيل ✅</p>
          </div>
        )}
        {!isRecording && !uploading && !audioUrl && <p className="text-gray-500 text-sm">اضغط الميكروفون لبدء التسجيل (حد أقصى 2 دقيقة)</p>}
      </div>
    </div>
  );
}