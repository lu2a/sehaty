'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  Home, MessageSquare, Activity, Users, FileText, 
  BookOpen, Info, LogOut, LayoutDashboard, Building2,
  Menu, X
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // للموبايل
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // جلب دور المستخدم عند التحميل
  useEffect(() => {
    async function getUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data) setRole(data.role);
      }
    }
    getUserRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  // 1. القائمة الأساسية الموحدة للجميع
  const baseMenu = [
    { name: 'الرئيسية', href: '/', icon: Home },
    { name: 'استشاراتي', href: '/consultations', icon: MessageSquare },
    { name: 'سجلاتي', href: '/vitals', icon: Activity }, // سجلات الضغط والسكر وغيرها
    { name: 'عائلتي', href: '/medical-file', icon: Users }, // قائمة أفراد الأسرة
    { name: 'الملف الطبي', href: '/medical-file/personal', icon: FileText }, // الملف الشخصي للمستخدم
    { name: 'دليل المركز', href: '/guide', icon: BookOpen },
    { name: 'عن التطبيق', href: '/about', icon: Info },
  ];

  // 2. أزرار خاصة (إدارية)
  const adminButton = { name: 'لوحة القيادة', href: '/admin/dashboard', icon: LayoutDashboard };
  const doctorButton = { name: 'عيادتي', href: '/doctor/clinic', icon: Building2 };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 right-0 h-screen w-64 bg-white border-l shadow-xl z-40 transition-transform duration-300 ease-in-out font-cairo overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo Area */}
        <div className="p-6 border-b flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
             <Activity size={32} />
          </div>
          <h2 className="font-bold text-lg text-slate-800">مركز غرب المطار</h2>
          <p className="text-xs text-slate-500">نعتني بك وبأسرتك</p>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          
          {/* --- المنطقة الإدارية (مميزة) --- */}
          {role === 'admin' && (
            <div className="mb-4 pb-4 border-b border-dashed">
              <p className="text-[10px] text-gray-400 font-bold px-2 mb-2">الإدارة</p>
              <Link 
                href={adminButton.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition shadow-sm border border-purple-100"
              >
                <adminButton.icon size={20} />
                {adminButton.name}
              </Link>
            </div>
          )}

          {role === 'doctor' && (
            <div className="mb-4 pb-4 border-b border-dashed">
              <p className="text-[10px] text-gray-400 font-bold px-2 mb-2">الطبيب</p>
              <Link 
                href={doctorButton.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 transition shadow-sm border border-teal-100"
              >
                <doctorButton.icon size={20} />
                {doctorButton.name}
              </Link>
            </div>
          )}

          {/* --- القائمة العامة --- */}
          {baseMenu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsOpen(false)} // إغلاق القائمة في الموبايل عند الضغط
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-bold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}
                `}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition mt-4 font-bold"
          >
            <LogOut size={20} />
            تسجيل الخروج
          </button>

        </nav>
      </aside>
      
      {/* Overlay for Mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
        />
      )}
    </>
  );
}
