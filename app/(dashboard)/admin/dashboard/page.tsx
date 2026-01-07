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
    clinics: 0
  });

  useEffect(() => {
    async function getStats() {
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: doctors } = await supabase.from('doctors').select('*', { count: 'exact', head: true });
      const { count: consultations } = await supabase.from('consultations').select('*', { count: 'exact', head: true });
      const { count: clinics } = await supabase.from('clinics').select('*', { count: 'exact', head: true });

      setStats({
        users: users || 0,
        doctors: doctors || 0,
        consultations: consultations || 0,
        clinics: clinics || 0
      });
    }
    getStats();
  }, []);

  return (
    <div className="p-8 dir-rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">لوحة القيادة (المدير العام) 🦅</h1>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow border-r-4 border-blue-600">
          <p className="text-gray-500 text-sm font-bold">إجمالي المستخدمين</p>
          <h3 className="text-4xl font-bold text-blue-900 mt-2">{stats.users}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-r-4 border-green-600">
          <p className="text-gray-500 text-sm font-bold">عدد الأطباء</p>
          <h3 className="text-4xl font-bold text-green-900 mt-2">{stats.doctors}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-r-4 border-purple-600">
          <p className="text-gray-500 text-sm font-bold">الاستشارات الطبية</p>
          <h3 className="text-4xl font-bold text-purple-900 mt-2">{stats.consultations}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-r-4 border-orange-600">
          <p className="text-gray-500 text-sm font-bold">العيادات النشطة</p>
          <h3 className="text-4xl font-bold text-orange-900 mt-2">{stats.clinics}</h3>
        </div>
      </div>

      {/* روابط سريعة للإدارة */}
      <h2 className="text-xl font-bold mb-4 text-gray-700">إدارة النظام</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4 group">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition">👥</div>
          <div>
            <h3 className="font-bold text-lg">إدارة المستخدمين</h3>
            <p className="text-gray-500 text-sm">ترقية الحسابات وإضافة أطباء</p>
          </div>
        </Link>

        <Link href="/admin/clinics" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4 group">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-orange-600 group-hover:text-white transition">🏥</div>
          <div>
            <h3 className="font-bold text-lg">إدارة العيادات</h3>
            <p className="text-gray-500 text-sm">إضافة وتعديل التخصصات</p>
          </div>
        </Link>

        <Link href="/admin/supervision" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4 group">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-purple-600 group-hover:text-white transition">🔍</div>
          <div>
            <h3 className="font-bold text-lg">الإشراف الفني</h3>
            <p className="text-gray-500 text-sm">مراقبة الجودة والتقييمات</p>
          </div>
        </Link>
      </div>
    </div>
  );
}