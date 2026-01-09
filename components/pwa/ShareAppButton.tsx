'use client';
import { Share2 } from 'lucide-react';

export default function ShareAppButton() {
  const handleShare = async () => {
    const shareData = {
      title: 'تطبيق صحتي',
      text: 'حمل تطبيق صحتي للتواصل مع أفضل الأطباء ومتابعة حالتك الصحية.',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      alert('تم نسخ الرابط الحافظة!');
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="fixed bottom-20 left-4 z-40 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition animate-bounce"
      title="مشاركة التطبيق"
    >
      <Share2 size={24} />
    </button>
  );
}
