'use client';
import Link from 'next/link';
import { Bell, ChevronLeft } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-white font-cairo dir-rtl">
      <header className="p-4 border-b sticky top-0 bg-white z-10 flex items-center gap-2">
        <Link href="/"><ChevronLeft size={24} className="text-slate-600"/></Link>
        <h1 className="text-lg font-bold">التنبيهات</h1>
      </header>
      
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Bell size={40} className="text-slate-400" />
        </div>
        <h2 className="font-bold text-slate-700 text-lg">لا توجد تنبيهات جديدة</h2>
        <p className="text-slate-400 text-sm mt-2">سوف نخبرك فور وجود أي تحديث بخصوص استشاراتك أو مواعيدك.</p>
      </div>
    </div>
  );
}
