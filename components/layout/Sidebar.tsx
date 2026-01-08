'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  FileText, 
  Calculator, 
  Users, 
  Stethoscope, 
  Menu, 
  X, 
  LogOut,
  Settings,
  Database,
  ShieldCheck,
  BarChart3 // أيقونة جديدة للوحة تحكم الأدمن
} from 'lucide-react';

// 1. القوائم العامة (تظهر للجميع: مريض، طبيب، مدير)
const MENU_ITEMS = [
  { name: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard },
  { name: 'استشاراتي', href: '/consultations', icon: Stethoscope },
  { name: 'السجلات الطبية', href: '/records', icon: FileText },
  { name: 'الحاسبات', href: '/calculators', icon: Calculator },
  { name: 'العائلة', href: '/family', icon: Users },
  { name: 'الملف الطبي', href: '/medical-file', icon: Settings },
];

// 2. قوائم الأدمن (تظهر فقط للمدير)
const ADMIN_ITEMS = [
  { name: 'لوحة التحكم', href: '/admin', icon: BarChart3 }, // الرابط الجديد للرئيسية
  { name: 'إدارة المستخدمين', href: '/admin/users', icon: ShieldCheck },
  { name: 'إدارة القوائم الطبية', href: '/admin/medical-lists', icon: Database },
];

export default function Sidebar({ userRole = 'client' }: { userRole?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* --- شريط الموبايل العلوي (يظهر فقط في الشاشات الصغيرة) --- */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-xl text-blue-600">Sehaty AI</div>
        <button 
          onClick={toggleMenu} 
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- القائمة الجانبية (Sidebar Container) --- */}
      <div className={`
        fixed inset-y-0 right-0 z-40 w-64 bg-white border-l shadow-lg transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen md:shadow-none
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        {/* الشعار (للكمبيوتر) */}
        <div className="hidden md:flex items-center justify-center h-20 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Sehaty AI</h1>
        </div>

        {/* روابط التنقل */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          
          {/* عرض الروابط الأساسية */}
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            // التحقق من الرابط النشط
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* عرض روابط الأدمن (بشرط أن يكون userRole === 'admin') */}
          {userRole === 'admin' && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-right-4">
              <p className="px-4 text-xs font-bold text-gray-400 mb-3">إعدادات المدير</p>
              {ADMIN_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-1 ${
                      isActive 
                        ? 'bg-red-50 text-red-600 shadow-sm' 
                        : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

        </nav>

        {/* زر تسجيل الخروج */}
        <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition font-bold"
          >
            <LogOut size={20} />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </div>

      {/* خلفية سوداء (Overlay) للموبايل عند فتح القائمة */}
      {isOpen && (
        <div 
          onClick={closeMenu}
          className="fixed inset-0 bg-black/50 z-30 md:hidden glass-effect"
        />
      )}
    </>
  );
}
