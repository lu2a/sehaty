'use client';

import { useEffect, useState } from 'react';

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
    if (!promptInstall) return;
    
    promptInstall.prompt();
  };

  if (!supportsPWA) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={onClick}
        className="bg-blue-900 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce hover:bg-blue-800 transition"
      >
        <span className="text-xl">📲</span>
        <span className="font-bold text-sm">تثبيت التطبيق</span>
      </button>
    </div>
  );
}