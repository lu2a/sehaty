'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

interface Props {
  onUploadComplete: (urls: string[]) => void;
}

export default function ImageUpload({ onUploadComplete }: Props) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from('consultations')
        .upload(filePath, file);

      if (error) {
        alert('فشل رفع الصورة: ' + error.message);
      } else {
        // الحصول على الرابط العام
        const { data } = supabase.storage
          .from('consultations')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(data.publicUrl);
      }
    }

    setPreviewUrls([...previewUrls, ...uploadedUrls]);
    onUploadComplete([...previewUrls, ...uploadedUrls]);
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">اضغط لرفع صور</span> (تحاليل، أشعة، أعراض)</p>
            <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
          </div>
          <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>

      {uploading && <p className="text-sm text-blue-600 text-center animate-pulse">جاري رفع الملفات...</p>}

      {/* معاينة الصور المرفوعة */}
      {previewUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="relative flex-shrink-0">
              <img src={url} alt="preview" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}