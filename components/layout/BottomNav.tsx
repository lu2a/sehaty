'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  const clientLinks = [
    { name: 'الرئيسية', href: '/dashboard', icon: '🏠' },
    { name: 'استشارة', href: '/consultations/new', icon: '➕' },
    { name: 'سجلاتي', href: '/consultations', icon: '📂' },
{ name: 'حاسبات طبية', href: '/calculators', icon: '🧮' },
  ];

  const doctorLinks = [
    { name: 'الحالات', href: '/doctor/dashboard', icon: '🩺' },
    { name: 'الأرشيف', href: '/doctor/archive', icon: '📚' },
  ];

  const links = userRole === 'doctor' ? doctorLinks : clientLinks;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-xs font-medium">{link.name}</span>
            </Link>
          );
        })}
        {/* زر القائمة الإضافية */}
        <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400">
          <span className="text-xl">☰</span>
          <span className="text-xs font-medium">المزيد</span>
        </button>
      </div>
    </div>
  );
}