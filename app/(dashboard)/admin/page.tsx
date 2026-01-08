'use client';

import Link from 'next/link';
import { Database, ShieldCheck, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="p-8 dir-rtl min-h-screen bg-slate-50 font-cairo">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">لوحة التحكم الرئيسية ⚙️</h1>
      <p className="text-slate-500 mb-8">مرحباً بك في لوحة إدارة Sehaty AI</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* كارت إدارة المستخدمين */}
        <Link href="/admin/users" className="group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition h-full">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition">إدارة المستخدمين</h3>
            <p className="text-slate-500 text-sm">عرض قائمة المستخدمين، ترقية الأطباء، وتعيين المديرين.</p>
          </div>
        </Link>

        {/* كارت القوائم الطبية */}
        <Link href="/admin/medical-lists" className="group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-green-200 transition h-full">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-green-600 transition">القوائم الطبية</h3>
            <p className="text-slate-500 text-sm">تحديث قواعد بيانات الأدوية، التحاليل، والأشعة (يدوياً أو Excel).</p>
          </div>
        </Link>

        {/* كارت إحصائيات (قادم قريباً) */}
        <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 opacity-70">
          <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-600 mb-2">الإحصائيات والتقارير</h3>
          <p className="text-slate-500 text-sm">قريباً.. متابعة عدد الاستشارات والحالات النشطة.</p>
        </div>

      </div>
    </div>
  );
}
