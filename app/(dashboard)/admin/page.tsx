'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Users, Stethoscope, FileText, Calendar, Settings, 
  Building, MessageSquare, Banknote, Star, Activity 
} from 'lucide-react';

export default function AdminDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    consultations: 0,
    files: 0,
    active_appointments: 0
  });

  useEffect(() => {
    async function getStats() {
      // جلب إحصائيات سريعة
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: doctors } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor');
      const { count: consultations } = await supabase.from('consultations').select('*', { count: 'exact', head: true });
      const { count: files } = await supabase.from('medical_files').select('*', { count: 'exact', head: true });
      const { count: appointments } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed');

      setStats({
        users: users || 0,
        doctors: doctors || 0,
        consultations: consultations || 0,
        files: files || 0,
        active_appointments: appointments || 0
      });
    }
    getStats();
  }, []);

  return (
    <div className="p-6 md:p-8 dir-rtl min-h-screen bg-gray-50 font-cairo">
      
      {/* 1. الترويسة */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
             لوحة القيادة المركزية <Activity className="text-blue-600"/>
          </h1>
          <p className="text-gray-500 mt-1">أهلاً بك، لديك الصلاحيات الكاملة لإدارة المنصة.</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> النظام يعمل
          </span>
        </div>
      </div>

      {/* 2. بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard title="المستخدمين" value={stats.users} icon={<Users size={24}/>} color="blue" />
        <StatCard title="الأطباء" value={stats.doctors} icon={<Stethoscope size={24}/>} color="green" />
        <StatCard title="الاستشارات" value={stats.consultations} icon={<MessageSquare size={24}/>} color="purple" />
        <StatCard title="الملفات الطبية" value={stats.files} icon={<FileText size={24}/>} color="orange" />
        <StatCard title="حجوزات نشطة" value={stats.active_appointments} icon={<Calendar size={24}/>} color="red" />
      </div>

      {/* 3. أقسام الإدارة */}
      <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">التحكم والإدارة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* --- الإضافات الجديدة حسب طلبك --- */}

        {/* 1. إدارة الأسعار (يدوي وإكسيل) */}
        <Link href="/admin/prices" className="admin-card group">
          <div className="icon-box bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white">
            <Banknote size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">قائمة الأسعار</h3>
            <p className="text-sm text-gray-500">إضافة الأسعار يدوياً أو رفع ملف Excel.</p>
          </div>
        </Link>

        {/* 2. الإشراف الفني والجودة (تم الدمج هنا) */}
        <Link href="/admin/quality" className="admin-card group">
          <div className="icon-box bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white">
            <Star size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">الجودة والتقييمات</h3>
            <p className="text-sm text-gray-500">الإشراف الفني ومراقبة تقييمات المرضى.</p>
          </div>
        </Link>

        {/* --- باقي العناصر الأساسية --- */}

        <Link href="/admin/users" className="admin-card group">
          <div className="icon-box bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white">
            <Users size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">إدارة المستخدمين</h3>
            <p className="text-sm text-gray-500">ترقية الحسابات وإدارة الصلاحيات.</p>
          </div>
        </Link>

        <Link href="/admin/clinics" className="admin-card group">
          <div className="icon-box bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white">
            <Building size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">إدارة العيادات</h3>
            <p className="text-sm text-gray-500">إضافة وتعديل التخصصات والأقسام.</p>
          </div>
        </Link>

        <Link href="/admin/doctors" className="admin-card group">
          <div className="icon-box bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white">
            <Stethoscope size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">الأطباء والموظفين</h3>
            <p className="text-sm text-gray-500">سجلات الأطباء وجداول العمل.</p>
          </div>
        </Link>

        <Link href="/admin/settings" className="admin-card group">
          <div className="icon-box bg-gray-100 text-gray-600 group-hover:bg-gray-600 group-hover:text-white">
            <Settings size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">إعدادات النظام</h3>
            <p className="text-sm text-gray-500">بيانات المركز والمعلومات الأساسية.</p>
          </div>
        </Link>

      </div>

      <style jsx>{`
        .admin-card {
          @apply bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer;
        }
        .icon-box {
          @apply w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300;
        }
      `}</style>
    </div>
  );
}

// مكون البطاقة الإحصائية
function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'border-blue-500 text-blue-900 bg-blue-50',
    green: 'border-green-500 text-green-900 bg-green-50',
    purple: 'border-purple-500 text-purple-900 bg-purple-50',
    orange: 'border-orange-500 text-orange-900 bg-orange-50',
    red: 'border-red-500 text-red-900 bg-red-50',
  };
  
  return (
    <div className={`p-4 rounded-xl shadow-sm border-r-4 bg-white flex justify-between items-center ${colors[color].replace('bg-', 'border-')}`}>
      <div>
        <p className="text-gray-500 text-xs font-bold mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}
