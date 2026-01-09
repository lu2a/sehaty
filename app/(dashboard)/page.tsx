'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Activity, Calendar, Stethoscope, FileText, 
  Search, Bell, Plus, Baby, HeartPulse, Scale,
  ChevronLeft
} from 'lucide-react';

// تأكد من المسارات
import ArticlesFeed from '@/components/articles/ArticlesFeed';
import ShareAppButton from '@/components/pwa/ShareAppButton';

export default function DashboardHomePage() {
  const [showSearch, setShowSearch] = useState(false);

  // قائمة الإجراءات السريعة (موسعة)
  const quickActions = [
    { name: 'استشارة جديدة', href: '/consultations/new', icon: Stethoscope, color: 'bg-blue-600 text-white' },
    { name: 'حجز موعد', href: '/appointments/book', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
    { name: 'ملفاتي الطبية', href: '/medical-file', icon: FileText, color: 'bg-green-100 text-green-600' },
    { name: 'مؤشراتي الحيوية', href: '/vitals', icon: Activity, color: 'bg-red-100 text-red-600' },
    // الإضافات الجديدة
    { name: 'سجل ضغط/سكر', href: '/vitals/pressure', icon: HeartPulse, color: 'bg-rose-100 text-rose-600', isNew: true },
    { name: 'سجل طفل', href: '/medical-file/child', icon: Baby, color: 'bg-orange-100 text-orange-600', isNew: true },
    { name: 'سجل حمل', href: '/medical-file/pregnancy', icon: Scale, color: 'bg-pink-100 text-pink-600', isNew: true },
    { name: 'إضافة أخرى', href: '/more', icon: Plus, color: 'bg-gray-100 text-gray-600', isNew: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-cairo dir-rtl">
      
      {/* --- 1. Header (Fixed) --- */}
      <header className="bg-white px-4 py-3 sticky top-0 z-40 border-b shadow-sm flex justify-between items-center h-16">
        {showSearch ? (
          <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <input 
              autoFocus
              type="text" 
              placeholder="ابحث عن طبيب، تخصص، مقال..." 
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={() => setShowSearch(false)} className="text-slate-500 font-bold text-sm">إلغاء</button>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-lg font-bold text-slate-800">الرئيسية</h1>
              <p className="text-[10px] text-slate-500">مركز غرب المطار الطبي</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowSearch(true)}
                className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-full text-slate-600 hover:bg-slate-200 transition"
              >
                <Search size={18} />
              </button>
              <Link href="/notifications">
                <button className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-full text-slate-600 hover:bg-slate-200 transition relative">
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                </button>
              </Link>
            </div>
          </>
        )}
      </header>

      <main className="space-y-6">
        
        {/* --- 2. Quick Actions Grid (Expanded) --- */}
        <section className="px-4 mt-4">
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, idx) => (
              <Link 
                key={idx} 
                href={action.href} 
                className="flex flex-col items-center gap-1 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 group-active:scale-95 ${action.color}`}>
                  {action.isNew ? <Plus size={14} className="absolute top-1 right-1 opacity-50"/> : null}
                  <action.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                  {action.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* --- 3. Welcome Banner --- */}
        <section className="px-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold mb-1">اهتم بصحتك اليوم ❤️</h2>
                <p className="text-blue-100 text-xs max-w-[200px] leading-relaxed">
                  تابع مقالاتنا الطبية المتجددة يومياً للحصول على نصائح لحياة أفضل.
                </p>
              </div>
              {/* Decorative Circle */}
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Activity className="text-white" size={32} />
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </section>

        {/* --- 4. Articles Section (Sticky Header) --- */}
        <section className="relative min-h-screen bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pt-2 mt-4">
          
          {/* Sticky Header */}
          <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b rounded-t-3xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={20}/> المقالات الطبية
              </h2>
              <Link href="/articles" className="text-xs text-blue-600 font-bold flex items-center">
                عرض الكل <ChevronLeft size={14}/>
              </Link>
            </div>
            
            {/* Filters (Horizontal Scroll) */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {['الكل', 'تغذية', 'أطفال', 'قلب', 'نفسية', 'جلدية'].map((cat, i) => (
                <button 
                  key={i}
                  className={`
                    whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all
                    ${i === 0 ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Content */}
          <div className="px-4 pb-24 pt-4">
             {/* تمرير خاصية compact لمكون المقالات لتصغير الكروت */}
             <ArticlesFeed compact={true} />
          </div>

        </section>

      </main>

      {/* --- 5. Share Button --- */}
      <ShareAppButton />

    </div>
  );
}
