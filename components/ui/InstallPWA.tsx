'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    
    // الاستماع لحدث التثبيت
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (evt: any) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  if (!supportsPWA) {
    return null; // لا تظهر شيئاً إذا كان التطبيق مثبتاً بالفعل أو المتصفح لا يدعم
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-blue-100 p-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-10 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-blue-900">تثبيت تطبيق صحتي 📲</h3>
          <p className="text-xs text-gray-500 mt-1">احصل على تجربة أسرع ووصول مباشر بدون إنترنت.</p>
        </div>
        <button onClick={() => setSupportsPWA(false)} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      
      <button 
        onClick={onClick}
        className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <Download size={16} /> تثبيت التطبيق
      </button>
    </div>
  );
}
