'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Stethoscope, 
  FileText, 
  Calculator, 
  Menu, 
  X, 
  Users, 
  Settings, 
  LogOut,
  Activity 
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [userRole, setUserRole] = useState('client');
  const supabase = createClient();
  const router = useRouter();

  // جلب الدور (Role) مع تجاوز فحص TypeScript
  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 🔴 استخدام (as any) لتجنب خطأ Type error: Property 'role' does not exist on type 'never'
        const { data } = await (supabase.from('profiles') as any)
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (data) setUserRole(data.role);
      }
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // تعريف الروابط الرئيسية
  const mainLinks = [
    { name: 'الرئيسية', href: '/', icon: Home },
    { name: 'استشاراتي', href: '/consultations', icon: Stethoscope },
    { name: 'السجلات', href: '/records', icon: FileText },
    // إذا كان طبيب، نعرض "عيادتي" بدلاً من الحاسبات في الشريط الرئيسي
    ...(userRole === 'doctor' 
      ? [{ name: 'عيادتي', href: '/doctor/dashboard', icon: Activity }] 
      : [{ name: 'الحاسبات', href: '/calculators', icon: Calculator }]
    ),
  ];

  // تعريف الروابط الإضافية (زر المزيد)
  const moreLinks = [
    { name: 'العائلة', href: '/family', icon: Users },
    { name: 'الملف الطبي', href: '/medical-file', icon: Settings },
    // إذا كان طبيب، نضع الحاسبات هنا (لأننا أزلناها من الرئيسي)
    ...(userRole === 'doctor' ? [{ name: 'الحاسبات', href: '/calculators', icon: Calculator }] : []),
  ];

  return (
    <>
      {/* 1. القائمة المنبثقة لزر "المزيد" */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMoreOpen(false)}>
          <div 
            className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 animate-in slide-in-from-bottom-10 fade-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 gap-2">
              <h3 className="text-gray-400 text-xs font-bold px-2 mb-1">قوائم إضافية</h3>
              {moreLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-gray-700"
                  >
                    <Icon size={20} className="text-blue-600" />
                    <span className="font-bold">{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="border-t my-1"></div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl text-red-600 w-full"
              >
                <LogOut size={20} />
                <span className="font-bold">تسجيل خروج</span>
              </button>
            </div>
            
            {/* سهم صغير يشير للأسفل */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
          </div>
        </div>
      )}

      {/* 2. الشريط السفلي الثابت */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center justify-around z-50 md:hidden pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        
        {mainLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}

        {/* زر المزيد */}
        <button 
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isMoreOpen ? 'text-blue-600' : 'text-gray-400'}`}
        >
          {isMoreOpen ? <X size={22} /> : <Menu size={22} />}
          <span className="text-[10px] font-bold">المزيد</span>
        </button>

      </div>
    </>
  );
}
