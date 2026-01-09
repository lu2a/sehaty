'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ArticlesFeed from '@/components/articles/ArticlesFeed';

export default function AllArticlesPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-cairo dir-rtl">
      <header className="bg-white p-4 sticky top-0 z-50 border-b shadow-sm flex items-center gap-2">
        <Link href="/"><ChevronLeft size={24} className="text-slate-600"/></Link>
        <h1 className="text-lg font-bold">المكتبة الطبية</h1>
      </header>
      
      <div className="p-4 pb-20">
        {/* نمرر compact={false} لتعرض المقالات بحجمها الكامل */}
        <ArticlesFeed compact={false} />
      </div>
    </div>
  );
}
