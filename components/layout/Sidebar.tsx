'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // روابط المريض
  const clientLinks = [
    { name: 'رئيسية الملف', href: '/dashboard', icon: '🏠' },
    { name: 'استشارة جديدة', href: '/consultations/new', icon: '➕' },
    { name: 'سجل الاستشارات', href: '/consultations', icon: '📂' },
    { name: 'حاسبات طبية', href: '/calculators', icon: '🧮' },
    { name: 'أفراد الأسرة', href: '/family', icon: '👨‍👩‍👧‍👦' },
{ name: 'المواعيد', href: '/appointments', icon: '📅' },
// داخل clientLinks
{ name: 'صحة المرأة', href: '/cycle', icon: '🌸' },
  ];

  // روابط الطبيب
  const doctorLinks = [
    { name: 'غرفة الطبيب', href: '/doctor/dashboard', icon: '🩺' },
    { name: 'الأرشيف الطبي', href: '/doctor/archive', icon: '📚' },
  ];

  // روابط رئيس القسم والمدير
  const adminLinks = [
    { name: 'لوحة الإشراف', href: '/admin/supervision', icon: '🕵️‍♂️' },
    { name: 'الأطباء', href: '/admin/doctors', icon: '👨‍⚕️' },
  ];

  // 👇 المنطق المصحح لاختيار القائمة المناسبة
  let links = clientLinks; // الافتراضي للمريض
  if (userRole === 'doctor') {
    links = doctorLinks;
  } else if (userRole === 'dept_head' || userRole === 'admin') {
    links = adminLinks;
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-l h-screen fixed right-0 top-0 z-40">
      <div className="p-6 border-b flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center font-bold">AI</div>
        <h2 className="text-xl font-bold text-blue-900">صحتي</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <span>🚪</span>
          <span>تسجيل خروج</span>
        </button>
      </div>
    </aside>
  );
}