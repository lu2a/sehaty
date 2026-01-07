'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

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
      // جلب إحصائيات سريعة للوحة القيادة
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: doctors } = await supabase.from('doctors').select('*', { count: 'exact', head: true });
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
    <div className="p-8 dir-rtl min-h-screen bg-gray-50">
      
      {/* 1. الترويسة */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم المركزية 🦅</h1>
          <p className="text-gray-500 mt-1">أهلاً بك، لديك صلاحيات المدير العام للتحكم في المنصة.</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
            ● النظام يعمل
          </span>
        </div>
      </div>

      {/* 2. بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard title="المستخدمين" value={stats.users} icon="👥" color="blue" />
        <StatCard title="الأطباء" value={stats.doctors} icon="👨‍⚕️" color="green" />
        <StatCard title="الاستشارات" value={stats.consultations} icon="💬" color="purple" />
        <StatCard title="الملفات الطبية" value={stats.files} icon="📂" color="orange" />
        <StatCard title="حجوزات نشطة" value={stats.active_appointments} icon="📅" color="red" />
      </div>

      {/* 3. روابط الإدارة (تلبية طلباتك الستة) */}
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">أقسام الإدارة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* الطلب 1: الإعدادات العامة والعيادات */}
        <Link href="/admin/settings" className="admin-card group">
          <div className="icon-box bg-gray-100 group-hover:bg-gray-600">⚙️</div>
          <div>
            <h3 className="font-bold text-lg">الإعدادات العامة</h3>
            <p className="text-sm text-gray-500">اسم الموقع، العيادات، التخصصات.</p>
          </div>
        </Link>
        <Link href="/admin/clinics" className="admin-card group">
          <div className="icon-box bg-orange-100 group-hover:bg-orange-600">🏥</div>
          <div>
            <h3 className="font-bold text-lg">إدارة العيادات</h3>
            <p className="text-sm text-gray-500">إضافة وتعديل أقسام المستشفى.</p>
          </div>
        </Link>

        {/* الطلب 2: المواعيد والداشبورد */}
        <Link href="/admin/appointments" className="admin-card group">
          <div className="icon-box bg-red-100 group-hover:bg-red-600">📅</div>
          <div>
            <h3 className="font-bold text-lg">جدول المواعيد</h3>
            <p className="text-sm text-gray-500">استعراض الحجوزات وفلترتها.</p>
          </div>
        </Link>

        {/* الطلب 3: الأطباء */}
        <Link href="/admin/doctors" className="admin-card group">
          <div className="icon-box bg-green-100 group-hover:bg-green-600">👨‍⚕️</div>
          <div>
            <h3 className="font-bold text-lg">إدارة الأطباء</h3>
            <p className="text-sm text-gray-500">إضافة أطباء، تعديل الورديات.</p>
          </div>
        </Link>

        {/* الطلب 4: الاستشارات */}
        <Link href="/admin/consultations" className="admin-card group">
          <div className="icon-box bg-purple-100 group-hover:bg-purple-600">💬</div>
          <div>
            <h3 className="font-bold text-lg">الاستشارات الطبية</h3>
            <p className="text-sm text-gray-500">متابعة الحالات، الفلترة والتقييم.</p>
          </div>
        </Link>

        {/* الطلب 5: الملفات الطبية */}
        <Link href="/admin/medical-files" className="admin-card group">
          <div className="icon-box bg-blue-100 group-hover:bg-blue-600">📂</div>
          <div>
            <h3 className="font-bold text-lg">سجلات المرضى</h3>
            <p className="text-sm text-gray-500">بحث برقم الملف، الرقم القومي.</p>
          </div>
        </Link>

        {/* الطلب 6: الرسائل */}
        <Link href="/admin/messages" className="admin-card group">
          <div className="icon-box bg-yellow-100 group-hover:bg-yellow-600">📩</div>
          <div>
            <h3 className="font-bold text-lg">صندوق الرسائل</h3>
            <p className="text-sm text-gray-500">التواصل مع الطاقم والمستخدمين.</p>
          </div>
        </Link>

         {/* إدارة المستخدمين (إضافي للترقية) */}
         <Link href="/admin/users" className="admin-card group">
          <div className="icon-box bg-indigo-100 group-hover:bg-indigo-600">👥</div>
          <div>
            <h3 className="font-bold text-lg">المستخدمين والصلاحيات</h3>
            <p className="text-sm text-gray-500">ترقية الأعضاء وتعيين الأدوار.</p>
          </div>
        </Link>

      </div>

      <style jsx>{`
        .admin-card {
          @apply bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer;
        }
        .icon-box {
          @apply w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors text-gray-700 group-hover:text-white;
        }
      `}</style>
    </div>
  );
}

// مكون بسيط للبطاقة
function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'border-blue-500 text-blue-900',
    green: 'border-green-500 text-green-900',
    purple: 'border-purple-500 text-purple-900',
    orange: 'border-orange-500 text-orange-900',
    red: 'border-red-500 text-red-900',
  };
  
  return (
    <div className={`bg-white p-4 rounded-xl shadow border-r-4 ${colors[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-xs font-bold mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}