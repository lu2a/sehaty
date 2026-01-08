'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  LayoutDashboard, FileText, Calculator, Users, Stethoscope, 
  Menu, X, LogOut, Settings, Database, ShieldCheck, 
  BarChart3, Calendar, Building, MessageSquare, UserPlus,
  ClipboardList, History
} from 'lucide-react';

// قوائم المريض (Client)
const MENU_ITEMS = [
  { name: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard },
  { name: 'استشاراتي', href: '/consultations', icon: Stethoscope },
  { name: 'السجلات الطبية', href: '/records', icon: FileText },
  { name: 'الحاسبات', href: '/calculators', icon: Calculator },
  { name: 'العائلة', href: '/family', icon: Users },
  { name: 'الملف الطبي', href: '/medical-file', icon: Settings },
];

// قوائم الطبيب (Doctor) - جديد ✅
const DOCTOR_ITEMS = [
  { name: 'عيادتي (لوحة التحكم)', href: '/doctor/dashboard', icon: Stethoscope },
  { name: 'جميع الاستشارات', href: '/doctor/consultations', icon: ClipboardList }, // لاستعراض الكل
];

// قوائم المدير (Admin)
const ADMIN_ITEMS = [
  { name: 'لوحة القيادة', href: '/admin', icon: BarChart3 },
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

  // دالة مساعدة لتحديد القوائم بناءً على الدور
  const getNavItems = () => {
    if (userRole === 'admin') return ADMIN_ITEMS;
    if (userRole === 'doctor') return DOCTOR_ITEMS;
    return MENU_ITEMS; // الافتراضي للمريض
  };

  const currentItems = getNavItems();

  return (
    <>
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-xl text-blue-600">Sehaty AI</div>
        <button onClick={toggleMenu} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`fixed inset-y-0 right-0 z-40 w-64 bg-white border-l shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:shadow-none ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="hidden md:flex items-center justify-center h-20 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Sehaty AI</h1>
          {userRole === 'doctor' && <span className="mr-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">طبيب</span>}
          {userRole === 'admin' && <span className="mr-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">مدير</span>}
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {currentItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
            return (
              <Link key={item.href} href={item.href} onClick={closeMenu} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition font-bold">
            <LogOut size={20} />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </div>
      
      {isOpen && <div onClick={closeMenu} className="fixed inset-0 bg-black/50 z-30 md:hidden glass-effect" />}
    </>
  );
}
