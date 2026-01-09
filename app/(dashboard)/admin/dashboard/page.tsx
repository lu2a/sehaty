'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Users, Stethoscope, FileText, Calendar, Settings, 
  Building, MessageSquare, Banknote, Star, Activity,
  ShieldCheck, Mail, Database
} from 'lucide-react';

export default function AdminDashboard() {
  const supabase = createClient();
  
  // حالة الإحصائيات
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    consultations: 0,
    files: 0,
    active_appointments: 0
  });

  // جلب البيانات عند التحميل
  useEffect(() => {
    async function getStats() {
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      // نفترض أن الأطباء مميزين بـ role في جدول profiles
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

  // قائمة المهام الإدارية (لجعل الكود أنظف)
  const adminSections = [
    {
      title: 'إدارة المستخدمين',
      desc: 'ترقية الحسابات وإدارة الصلاحيات',
      icon: Users,
      href: '/admin/users',
      color: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600'
    },
    {
      title: 'الأطباء والموظفين',
      desc: 'سجلات الأطباء وجداول العمل',
      icon: Stethoscope,
      href: '/admin/doctors',
      color: 'bg-green-100 text-green-600 group-hover:bg-green-600'
    },
    {
      title: 'إدارة العيادات',
      desc: 'إضافة وتعديل التخصصات والأقسام',
      icon: Building,
      href: '/admin/clinics',
      color: 'bg-orange-100 text-orange-600 group-hover:bg-orange-600'
    },
    {
      title: 'إعدادات النظام',
      desc: 'بيانات المركز والمعلومات الأساسية',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-100 text-gray-600 group-hover:bg-gray-600'
    },
    {
      title: 'قائمة الأسعار',
      desc: 'إضافة الأسعار يدوياً أو رفع ملف Excel',
      icon: Banknote,
      href: '/admin/prices', // ✅ الرابط الجديد
      color: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600'
    },
    {
      title: 'الجودة والإشراف الفني',
      desc: 'مراقبة الجودة وتقييمات المرضى', // ✅ تم دمج صفحة الإشراف هنا
      icon: Star,
      href: '/admin/quality', 
      color: 'bg-rose-100 text-rose-600 group-hover:bg-rose-600'
    },
    {
      title: 'جدول المواعيد',
      desc: 'استعراض الحجوزات وفلترتها',
      icon: Calendar,
      href: '/admin/appointments',
      color: 'bg-red-100 text-red-600 group-hover:bg-red-600'
    },
    {
      title: 'الاستشارات الطبية',
      desc: 'متابعة الحالات والردود',
      icon: MessageSquare,
      href: '/admin/consultations',
      color: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600'
    },
    {
      title: 'سجلات المرضى',
      desc: 'بحث في الملفات الطبية',
      icon: Database,
      href: '/admin/medical-files',
      color: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600'
    },
    {
      title: 'صندوق الرسائل',
      desc: 'التواصل والدعم الفني',
      icon: Mail,
      href: '/admin/messages',
      color: 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-600'
    },
  ];

  return (
    <div className="p-6 md:p-8 dir-rtl min-h-screen bg-gray-50 font-cairo">
      
      {/* 1. الترويسة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
             لوحة القيادة المركزية <ShieldCheck className="text-blue-600"/>
          </h1>
          <p className="text-gray-500 mt-1">أهلاً بك، لديك الصلاحيات الكاملة لإدارة المنصة.</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> النظام يعمل بكفاءة
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

      {/* 3. شبكة روابط الإدارة */}
      <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2 flex items-center gap-2">
        <Activity size={20} className="text-blue-600"/> التحكم والإدارة
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section, idx) => (
          <Link key={idx} href={section.href} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 group-hover:text-white ${section.color}`}>
              <section.icon size={28} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition-colors">{section.title}</h3>
              <p className="text-sm text-gray-500">{section.desc}</p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}

// مكون البطاقة الإحصائية (تم تحسينه)
function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'border-blue-500 text-blue-900 bg-blue-50',
    green: 'border-green-500 text-green-900 bg-green-50',
    purple: 'border-purple-500 text-purple-900 bg-purple-50',
    orange: 'border-orange-500 text-orange-900 bg-orange-50',
    red: 'border-red-500 text-red-900 bg-red-50',
  };
  
  return (
    <div className={`p-4 rounded-xl shadow-sm border-r-4 bg-white flex justify-between items-center transition-transform hover:scale-105 ${colors[color].replace('bg-', 'border-')}`}>
      <div>
        <p className="text-gray-500 text-xs font-bold mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}
