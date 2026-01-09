'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Activity, Calendar, Stethoscope, FileText, 
  Search, Bell, ArrowLeft 
} from 'lucide-react';

// تأكد من أن هذه المسارات صحيحة لمكوناتك
import ArticlesFeed from '@/components/articles/ArticlesFeed';
import ShareAppButton from '@/components/pwa/ShareAppButton';

export default function DashboardHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-cairo dir-rtl">
      
      {/* --- 1. Header --- */}
      <header className="bg-white p-4 sticky top-0 z-30 border-b shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">الرئيسية</h1>
          <p className="text-xs text-slate-500">أهلاً بك في تطبيق صحتي</p>
        </div>
        <div className="flex gap-3">
          <button className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition">
            <Search size={20} />
          </button>
          <button className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <main className="p-4 space-y-8 max-w-7xl mx-auto">
        
        {/* --- 2. Quick Actions --- */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* عدل الروابط (href) حسب مساراتك الفعلية */}
          <Link href="/consultations/new" className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-200 flex flex-col items-center justify-center gap-2 hover:bg-blue-700 transition transform hover:scale-105">
            <div className="bg-white/20 p-3 rounded-full"><Stethoscope size={24} /></div>
            <span className="font-bold text-sm">استشارة جديدة</span>
          </Link>
          
          <Link href="/appointments" className="bg-white text-slate-700 p-4 rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-2 hover:border-blue-300 transition">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-full"><Calendar size={24} /></div>
            <span className="font-bold text-sm">حجز موعد</span>
          </Link>

          <Link href="/medical-files" className="bg-white text-slate-700 p-4 rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-2 hover:border-blue-300 transition">
            <div className="bg-green-100 text-green-600 p-3 rounded-full"><FileText size={24} /></div>
            <span className="font-bold text-sm">ملفاتي الطبية</span>
          </Link>

          <Link href="/vitals" className="bg-white text-slate-700 p-4 rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-2 hover:border-blue-300 transition">
            <div className="bg-red-100 text-red-600 p-3 rounded-full"><Activity size={24} /></div>
            <span className="font-bold text-sm">مؤشراتي الحيوية</span>
          </Link>
        </section>

        {/* --- 3. Welcome Banner --- */}
        <section className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">اهتم بصحتك اليوم</h2>
            <p className="text-blue-100 text-sm mb-4 max-w-md">تابع مقالاتنا الطبية المتجددة يومياً للحصول على نصائح لحياة صحية أفضل.</p>
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </section>

        {/* --- 4. Articles Section --- */}
        <section>
          <div className="flex justify-between items-end mb-4 border-b pb-2">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600"/> المقالات الطبية والنصائح
              </h2>
              <p className="text-slate-500 text-xs mt-1">مقالات موثوقة من أطبائنا المتخصصين</p>
            </div>
          </div>

          {/* استدعاء مكون المقالات */}
          <ArticlesFeed />
        </section>

      </main>

      {/* --- 5. Share Button (PWA) --- */}
      <ShareAppButton />

    </div>
  );
}
