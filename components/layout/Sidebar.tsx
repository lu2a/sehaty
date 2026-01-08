'use client';

import { useState, useEffect } from 'react'; // تأكد من استيراد useEffect
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FileText, Calculator, Users, Stethoscope, 
  Menu, X, LogOut, Settings, Database, ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// ... (نفس القوائم MENU_ITEMS و ADMIN_ITEMS) ...
const MENU_ITEMS = [
  { name: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard },
  { name: 'استشاراتي', href: '/consultations', icon: Stethoscope },
  { name: 'السجلات الطبية', href: '/records', icon: FileText },
  { name: 'الحاسبات', href: '/calculators', icon: Calculator },
  { name: 'العائلة', href: '/family', icon: Users },
  { name: 'الملف الطبي', href: '/medical-file', icon: Settings },
];

const ADMIN_ITEMS = [
  { name: 'إدارة القوائم الطبية', href: '/admin/medical-lists', icon: Database },
  { name: 'إدارة المستخدمين', href: '/admin/users', icon: ShieldCheck },
];

export default function Sidebar({ userRole = 'client' }: { userRole?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // 🔴🔴 كود التشخيص (DEBUGGING) 🔴🔴
  useEffect(() => {
    const debugUser = async () => {
      console.log("%c 🔥 بدء فحص المشكلة 🔥", "background: #222; color: #bada55; font-size: 16px;");
      
      // 1. فحص القيمة القادمة من السيرفر
      console.log("1. Role received from Layout (Server):", userRole);

      // 2. محاولة جلب المستخدم والبروفايل من المتصفح مباشرة
      const { data: { user } } = await supabase.auth.getUser();
      console.log("2. Current User ID:", user?.id);

      if (user) {
        // محاولة قراءة البروفايل
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("3. ❌ خطأ في قراءة قاعدة البيانات:", error.message);
          console.error("تفاصيل الخطأ:", error);
          if (error.code === 'PGRST116') console.warn("⚠️ الجدول فارغ أو لا يوجد صف لهذا المستخدم");
          if (error.code === '42501') console.warn("⛔ مشكلة صلاحيات (RLS): السياسات تمنع القراءة");
        } else {
          console.log("3. ✅ القراءة من المتصفح ناجحة، القيمة هي:", data);
        }
      }
      console.log("%c 🔥 انتهى الفحص 🔥", "background: #222; color: #bada55; font-size: 16px;");
    };

    debugUser();
  }, [userRole]);
  // 🔴🔴 نهاية كود التشخيص 🔴🔴

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
       {/* ... (نفس كود التصميم السابق بدون تغيير) ... */}
       {/* تأكد فقط من وجود شرط عرض الأدمن */}
       <div className={`fixed inset-y-0 right-0 z-40 w-64 bg-white border-l ...`}>
         {/* ... */}
         <nav className="p-4 space-y-2 ...">
            {MENU_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 ...">
                 <item.icon size={20} /> <span>{item.name}</span>
              </Link>
            ))}

            {/* شرط ظهور الأدمن */}
            {userRole === 'admin' && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="px-4 text-xs font-bold text-gray-400 mb-3">لوحة الإدارة (Admin)</p>
                {ADMIN_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 text-red-600 ...">
                    <item.icon size={20} /> <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
         </nav>
         {/* ... */}
       </div>
       {/* ... */}
    </>
  );
}
