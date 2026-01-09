'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Users, Stethoscope, Calendar, Activity, Building,
  Clock, CheckCircle, Settings, Database, FileText,
  MessageSquare, ArrowLeft, UserPlus, BarChart3,
  Newspaper // أيقونة جديدة للمقالات
} from 'lucide-react';

export default function AdminDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  
  // الإحصائيات
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    clinics: 0,
    pendingConsultations: 0,
    articles: 0 // إحصائية جديدة
  });

  const [recentConsults, setRecentConsults] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        { count: doctors },
        { count: patients },
        { count: clinics },
        { count: pending },
        { count: articles }, // جلب عدد المقالات
        { data: recent }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'doctor').neq('role', 'admin'),
        supabase.from('clinics').select('*', { count: 'exact', head: true }),
        supabase.from('consultations').select('*', { count: 'exact', head: true }).neq('status', 'closed'),
        (supabase.from('articles') as any).select('*', { count: 'exact', head: true }), // تأكد أن الجدول موجود
        (supabase.from('consultations') as any)
          .select('*, medical_files(full_name)')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      setStats({
        doctors: doctors || 0,
        patients: patients || 0,
        clinics: clinics || 0,
        pendingConsultations: pending || 0,
        articles: articles || 0
      });

      if (recent) setRecentConsults(recent);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
    setLoading(false);
  };

  // قائمة وحدات التحكم (تمت إضافة إدارة المقالات)
  const controlModules = [
    {
      title: 'إدارة المقالات والنصائح',
      subtitle: 'إضافة، تعديل، ورفع إكسيل',
      href: '/admin/articles', // رابط الصفحة الجديدة
      icon: Newspaper,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'hover:border-rose-300'
    },
    {
      title: 'إدارة العيادات',
      subtitle: 'إضافة وتعديل التخصصات',
      href: '/admin/clinics',
      icon: Building,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'hover:border-blue-300'
    },
    {
      title: 'الأطباء والمستخدمين',
      subtitle: 'الصلاحيات وإضافة أطباء',
      href: '/admin/doctors',
      icon: UserPlus,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'hover:border-green-300'
    },
    {
      title: 'الاستشارات الطبية',
      subtitle: 'متابعة الردود والحالات',
      href: '/admin/consultations',
      icon: MessageSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'hover:border-purple-300'
    },
    {
      title: 'المواعيد والحجوزات',
      subtitle: 'جدول العيادات اليومي',
      href: '/admin/appointments',
      icon: Calendar,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      border: 'hover:border-pink-300'
    },
    {
      title: 'الملفات الطبية',
      subtitle: 'بحث بالرقم القومي',
      href: '/admin/medical-files',
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'hover:border-orange-300'
    },
    {
      title: 'القوائم الطبية',
      subtitle: 'قواعد بيانات الأدوية',
      href: '/admin/medical-lists',
      icon: Database,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'hover:border-teal-300'
    },
    {
      title: 'الإشراف والمتابعة',
      subtitle: 'سجل النشاط والتقارير',
      href: '/admin/supervision',
      icon: BarChart3,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'hover:border-indigo-300'
    },
    {
      title: 'إعدادات المركز',
      subtitle: 'البيانات الأساسية',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      border: 'hover:border-slate-300'
    },
  ];

  return (
    <div className="p-6 dir-rtl font-cairo bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">لوحة القيادة 🕹️</h1>
          <p className="text-slate-500 text-sm">نظرة عامة وتحكم كامل في أقسام المركز.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border text-sm font-bold text-slate-600 shadow-sm">
             📅 {new Date().toLocaleDateString('ar-EG')}
          </div>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {/* ... (نفس الكروت القديمة مع تعديل الـ Grid إلى 5 أعمدة) ... */}
        {/* سأضع الكرت الجديد للمقالات هنا */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold mb-1">المقالات المنشورة</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.articles}</h3>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
            <Newspaper size={20} />
          </div>
        </div>

        {/* ... بقية الكروت الموجودة في كودك الأصلي (الأطباء، العيادات، إلخ) ... */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold mb-1">إجمالي الأطباء</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.doctors}</h3>
          </div>
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <Stethoscope size={20} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold mb-1">المرضى</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.patients}</h3>
          </div>
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold mb-1">استشارات نشطة</p>
            <h3 className="text-2xl font-bold text-red-600">{stats.pendingConsultations}</h3>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <Activity size={20} />
          </div>
        </div>
        
         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold mb-1">عدد العيادات</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.clinics}</h3>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Building size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Control Grid */}
        <div className="lg:col-span-2">
           <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
             <Settings size={20} className="text-slate-400"/> أقسام الإدارة
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {controlModules.map((mod, idx) => {
               const Icon = mod.icon;
               return (
                 <Link key={idx} href={mod.href} className="group">
                   <div className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-200 transition-all h-full ${mod.border} hover:shadow-md flex items-center gap-4`}>
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${mod.bg} ${mod.color}`}>
                       <Icon size={24} />
                     </div>
                     <div className="flex-1">
                       <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition">{mod.title}</h4>
                       <p className="text-xs text-slate-400">{mod.subtitle}</p>
                     </div>
                     <ArrowLeft size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:-translate-x-1 transition" />
                   </div>
                 </Link>
               );
             })}
           </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
           <div className="p-5 border-b flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="text-blue-500" size={18}/> آخر الاستشارات
            </h3>
            <Link href="/admin/consultations" className="text-xs text-blue-600 hover:underline">عرض الكل</Link>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[400px] p-2">
            {loading ? (
              <div className="text-center p-4 text-gray-400 text-sm">جاري التحميل...</div>
            ) : recentConsults.length === 0 ? (
              <div className="text-center p-8 text-gray-400">
                <MessageSquare size={30} className="mx-auto mb-2 opacity-20"/>
                <p className="text-sm">لا توجد استشارات حديثة</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentConsults.map((item) => (
                  <Link href={`/admin/review/${item.id}`} key={item.id}>
                    <div className="p-3 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-100 group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-slate-700">{item.medical_files?.full_name || 'مجهول'}</span>
                        <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-2">{item.content}</p>
                      <div className="flex items-center gap-2">
                        {item.status === 'closed' ? (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle size={10}/> تم الرد
                          </span>
                        ) : (
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                            <Clock size={10}/> انتظار
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
