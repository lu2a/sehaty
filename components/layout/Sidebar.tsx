'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  MoreHorizontal
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
  { name: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard },
  { name: 'استشاراتي', href: '/consultations', icon: Stethoscope },
  { name: 'السجلات الطبية', href: '/records', icon: FileText },
  { name: 'الحاسبات', href: '/calculators', icon: Calculator },
  { name: 'العائلة', href: '/family', icon: Users },
  { name: 'الملف الطبي', href: '/medical-file', icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // حالة القائمة للموبايل
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
      {/* 1. شريط علوي للموبايل فقط (Mobile Header) */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-xl text-blue-600">Sehaty AI</div>
        <button 
          onClick={toggleMenu} 
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 2. القائمة الجانبية (Overlay للموبايل + Sidebar للكمبيوتر) */}
      <div className={`
        fixed inset-y-0 right-0 z-40 w-64 bg-white border-l shadow-lg transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        {/* الشعار (يظهر في الكمبيوتر فقط) */}
        <div className="hidden md:flex items-center justify-center h-20 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Sehaty AI</h1>
        </div>

        {/* روابط القائمة */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={closeMenu} // إغلاق القائمة عند الضغط على رابط في الموبايل
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

      {/* 3. خلفية سوداء شفافة (Overlay) تظهر عند فتح القائمة في الموبايل */}
      {isOpen && (
        <div 
          onClick={closeMenu}
          className="fixed inset-0 bg-black/50 z-30 md:hidden glass-effect"
        />
      )}
    </>
  );
}
