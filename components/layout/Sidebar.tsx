'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Calendar, 
  Activity, 
  LogOut, 
  User, 
  Stethoscope,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false); // للموبايل

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setRole(data?.role || 'patient');
      }
      setLoading(false);
    };
    getUserRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- تعريف القوائم ---

  // 1. قائمة المستخدم العادي (المنتفع)
  const patientLinks = [
    { name: 'الرئيسية', href: '/dashboard', icon: LayoutDashboard },
    { name: 'طلب استشارة', href: '/consultations/new', icon: PlusCircle },
    { name: 'استشاراتي', href: '/consultations', icon: FileText },
    { name: 'حجز موعد', href: '/appointments/book', icon: Calendar },
    { name: 'مواعيدي', href: '/appointments', icon: Calendar },
    { name: 'ملفي الطبي', href: '/medical-file', icon: Activity },
  ];

  // 2. قائمة الطبيب
  const doctorLinks = [
    { name: 'لوحة الطبيب', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'الاستشارات الواردة', href: '/doctor/dashboard', icon: FileText }, // يمكن توجيهها لنفس المكان أو صفحة خاصة
    { name: 'جدول المواعيد', href: '/admin/appointments', icon: Calendar },
  ];

  // 3. قائمة المدير (المعدلة حسب طلبك)
  // تحتوي فقط على "لوحة الإدارة" + "روابط المستخدم العادي"
  const adminLinks = [
    { name: 'لوحة القيادة (إدارة)', href: '/admin/dashboard', icon: ShieldCheck }, // زر مميز للمدير
    ...patientLinks // دمج روابط المستخدم العادي
  ];

  // تحديد القائمة التي سيتم عرضها بناءً على الدور
  let linksToRender = patientLinks; // الافتراضي
  if (role === 'admin') linksToRender = adminLinks;
  if (role === 'doctor') linksToRender = doctorLinks;

  return (
    <>
      {/* زر القائمة للموبايل */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* القائمة الجانبية */}
      <aside className={`
        fixed top-0 right-0 h-full bg-white border-l shadow-xl z-40 transition-transform duration-300 ease-in-out w-64 overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
        md:translate-x-0 md:static md:shadow-none
      `}>
        
        {/* الشعار */}
        <div className="p-6 border-b flex items-center justify-center">
          <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <Activity className="text-blue-500" /> صحتي
          </h1>
        </div>

        {/* الروابط */}
        <nav className="p-4 space-y-2">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl"></div>)}
            </div>
          ) : (
            linksToRender.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={idx} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold text-sm
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}
                  `}
                >
                  <link.icon size={20} />
                  {link.name}
                </Link>
              );
            })
          )}
        </nav>

        {/* الفوتر (تسجيل الخروج) */}
        <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-bold text-sm"
          >
            <LogOut size={20} />
            تسجيل خروج
          </button>
        </div>

      </aside>

      {/* خلفية معتمة للموبايل */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
