'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { X, UploadCloud, Loader2 } from 'lucide-react';

interface Props {
  // الخصائص الاختيارية لدعم الاستخدام في صفحة الإعدادات (Controlled)
  value?: string[];
  onChange?: (url: string) => void;
  onRemove?: (url: string) => void;
  
  // الخصائص القديمة لدعم الاستخدام في باقي الصفحات (Uncontrolled)
  onUploadComplete?: (urls: string[]) => void;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  onRemove, 
  onUploadComplete 
}: Props) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [internalUrls, setInternalUrls] = useState<string[]>([]);

  // تحديد مصدر الصور للعرض (إما من الخارج via props أو الحالة الداخلية)
  const imagesToDisplay = value || internalUrls;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    const newUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from('consultations') // تأكد أن هذا الـ bucket موجود أو استخدم 'images'
        .upload(filePath, file);

      if (error) {
        alert('فشل رفع الصورة: ' + error.message);
      } else {
        const { data } = supabase.storage
          .from('consultations')
          .getPublicUrl(filePath);
        
        newUrls.push(data.publicUrl);
      }
    }

    // تحديث الحالة الداخلية
    const updatedInternal = [...internalUrls, ...newUrls];
    setInternalUrls(updatedInternal);

    // استدعاء الدوال الخارجية إذا وجدت
    if (onChange && newUrls.length > 0) {
      onChange(newUrls[0]); // إرسال أول رابط (للشعارات والصور الفردية)
    }

    if (onUploadComplete) {
      onUploadComplete(updatedInternal);
    }

    setUploading(false);
  };

  const handleRemove = (urlToRemove: string) => {
    // تحديث الحالة الداخلية
    const updatedInternal = internalUrls.filter(url => url !== urlToRemove);
    setInternalUrls(updatedInternal);

    // استدعاء دالة الحذف الخارجية
    if (onRemove) {
      onRemove(urlToRemove);
    }
  };

  return (
    <div className="space-y-4">
      {/* منطقة الرفع */}
      <div className="flex items-center justify-center w-full">
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition ${uploading ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-300 hover:bg-blue-100'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="w-8 h-8 mb-4 text-blue-500 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 mb-4 text-blue-500" />
            )}
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">{uploading ? 'جاري الرفع...' : 'اضغط لرفع صورة'}</span>
            </p>
            <p className="text-xs text-gray-400">PNG, JPG (MAX. 5MB)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange} 
            disabled={uploading} 
          />
        </label>
      </div>

      {/* معاينة الصور */}
      {imagesToDisplay.length > 0 && (
        <div className="flex gap-3 overflow-x-auto py-2">
          {imagesToDisplay.map((url, idx) => (
            <div key={idx} className="relative flex-shrink-0 group">
              <img 
                src={url} 
                alt="preview" 
                className="h-24 w-24 object-cover rounded-xl border border-gray-200 shadow-sm" 
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
