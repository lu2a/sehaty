'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  Building,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';

export default function AdminDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    pendingConsultations: 0,
    completedConsultations: 0,
    totalConsultations: 0
  });
  const [recentConsults, setRecentConsults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // 1. جلب إحصائيات المستخدمين
    const { count: doctorsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor');
    const { count: patientsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'doctor').neq('role', 'admin');
    
    // 2. جلب إحصائيات الاستشارات
    const { count: pendingCount } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).neq('status', 'closed');
    const { count: closedCount } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('status', 'closed');

    // 3. جلب آخر 5 استشارات
    const { data: recent } = await (supabase.from('consultations') as any)
      .select('*, medical_files(full_name), profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    setStats({
      doctors: doctorsCount || 0,
      patients: patientsCount || 0,
      pendingConsultations: pendingCount || 0,
      completedConsultations: closedCount || 0,
      totalConsultations: (pendingCount || 0) + (closedCount || 0)
    });

    if (recent) setRecentConsults(recent);
    setLoading(false);
  };

  return (
    <div className="p-6 dir-rtl font-cairo bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">لوحة التحكم المركزية 📊</h1>
        <p className="text-slate-500">مرحباً بك، لديك <span className="text-blue-600 font-bold">{stats.pendingConsultations}</span> استشارات تحتاج لمتابعة اليوم.</p>
      </div>

      {/* 1. Stats Cards (الإحصائيات) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Doctors Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-bold mb-1">الأطباء</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.doctors}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Stethoscope size={24} />
          </div>
        </div>

        {/* Patients Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-bold mb-1">المرضى المسجلين</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.patients}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* Pending Consultations */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-1 h-full bg-orange-500"></div>
          <div>
            <p className="text-slate-500 text-sm font-bold mb-1">استشارات نشطة</p>
            <h3 className="text-3xl font-bold text-orange-600">{stats.pendingConsultations}</h3>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
            <Activity size={24} />
          </div>
        </div>

        {/* Total Appointments (Mock for now) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-bold mb-1">حجوزات العيادات</p>
            <h3 className="text-3xl font-bold text-purple-600">--</h3>
            <p className="text-xs text-gray-400">قريباً</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Recent Consultations Table (الاستشارات الأخيرة) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Clock className="text-blue-500" size={20}/> آخر الاستشارات الواردة
            </h3>
            <Link href="/doctor/dashboard" className="text-sm text-blue-600 hover:underline">عرض الكل</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="p-4">المريض</th>
                  <th className="p-4">الشكوى</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">التوقيت</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {recentConsults.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-400">لا توجد استشارات حديثة</td></tr>
                ) : (
                  recentConsults.map((consult) => (
                    <tr key={consult.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-700">{consult.medical_files?.full_name}</td>
                      <td className="p-4 text-slate-600 truncate max-w-[150px]">{consult.content}</td>
                      <td className="p-4">
                        {consult.status === 'closed' ? 
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle size={10}/> تم الرد</span> : 
                          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold"><Clock size={10}/> قيد الانتظار</span>
                        }
                      </td>
                      <td className="p-4 text-slate-400">{new Date(consult.created_at).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Quick Actions & Management Links (إدارة النظام) */}
        <div className="space-y-6">
          
          {/* Management Menu */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">⚙️ إدارة النظام</h3>
            <div className="space-y-3">
              <Link href="/admin/users" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition group">
                <span className="flex items-center gap-3 font-bold">
                  <div className="bg-white p-2 rounded-lg shadow-sm"><Users size={18}/></div>
                  إدارة الأطباء والمستخدمين
                </span>
                <ArrowLeft size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link href="/admin/medical-lists" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-green-50 hover:text-green-600 transition group">
                <span className="flex items-center gap-3 font-bold">
                  <div className="bg-white p-2 rounded-lg shadow-sm"><Activity size={18}/></div>
                  قوائم الأدوية والتحاليل
                </span>
                <ArrowLeft size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Clinics & Appointments (Future Features UI) */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Building size={20} className="text-blue-300"/> العيادات والمواعيد
            </h3>
            <p className="text-blue-100 text-sm mb-6">
              التحكم في مواعيد العيادات، إضافة عيادات جديدة، وجدولة مناوبات الأطباء.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold backdrop-blur-sm border border-white/10 transition">
                + إضافة عيادة
              </button>
              <button className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-xs font-bold backdrop-blur-sm border border-white/10 transition">
                📅 جدول المناوبات
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
