'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  LayoutDashboard, FileText, Calculator, Users, Activity, 
  Menu, X, LogOut, Calendar, ShieldCheck, PlusCircle, Stethoscope
} from 'lucide-react';

// 1. قوائم المريض (تظهر للجميع)
const PATIENT_ITEMS = [
  { name: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard },
  { name: 'طلب استشارة', href: '/consultations/new', icon: PlusCircle },
  { name: 'استشاراتي', href: '/consultations', icon: FileText },
  { name: 'حجز موعد', href: '/appointments/book', icon: Calendar },
  { name: 'مواعيدي', href: '/appointments', icon: Calendar },
  { name: 'ملفي الطبي', href: '/medical-file', icon: Activity },
  { name: 'العائلة', href: '/family', icon: Users },
  { name: 'الحاسبات', href: '/calculators', icon: Calculator },
];

// 2. قوائم الطبيب
const DOCTOR_ITEMS = [
  { name: 'لوحة الطبيب', href: '/doctor/dashboard', icon: Stethoscope },
  { name: 'جدول المواعيد', href: '/admin/appointments', icon: Calendar },
];

// 3. عنصر لوحة الإدارة (زر واحد فقط كما طلبت)
const ADMIN_DASHBOARD_ITEM = { name: 'لوحة القيادة (إدارة)', href: '/admin/dashboard', icon: ShieldCheck };

// ✅ الحل: نستقبل userRole هنا ليختفي الخطأ في layout.tsx
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

  // منطق دمج القوائم
  const getNavItems = () => {
    if (userRole === 'admin') {
      // ✅ المدير يرى: زر الإدارة + قوائم المريض العادية
      return [ADMIN_DASHBOARD_ITEM, ...PATIENT_ITEMS];
    }
    if (userRole === 'doctor') {
      // الطبيب يرى: قوائم الطبيب + قوائم المريض
      return [...DOCTOR_ITEMS, ...PATIENT_ITEMS];
    }
    // المريض يرى قوائم المريض فقط
    return PATIENT_ITEMS;
  };

  const currentItems = getNavItems();

  return (
    <>
      {/* شريط الموبايل العلوي */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-xl text-blue-600 flex items-center gap-2">
            <Activity className="text-blue-500" /> صحتي
        </div>
        <button onClick={toggleMenu} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* القائمة الجانبية */}
      <div className={`
        fixed inset-y-0 right-0 z-40 w-64 bg-white border-l shadow-xl 
        transform transition-transform duration-300 ease-in-out 
        md:translate-x-0 md:static md:h-screen md:shadow-none 
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        {/* الشعار */}
        <div className="hidden md:flex items-center justify-center h-20 border-b">
          <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <Activity className="text-blue-500" /> صحتي
          </h1>
        </div>

        {/* الروابط */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)] scrollbar-thin">
          {currentItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            
            // تمييز الروابط الإدارية والطبية بلون مختلف قليلاً
            const isSpecialLink = item.href.includes('/admin') || item.href.includes('/doctor');

            return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={closeMenu} 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : isSpecialLink 
                        ? 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* زر تسجيل الخروج */}
        <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-bold text-sm">
            <LogOut size={20} />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </div>
      
      {/* خلفية معتمة للموبايل */}
      {isOpen && <div onClick={closeMenu} className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" />}
    </>
  );
}
