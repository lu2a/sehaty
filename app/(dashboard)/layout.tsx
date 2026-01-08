import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  
  // 1. إعداد Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  );

  // 2. التحقق من المستخدم الحالي
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 3. جلب بيانات البروفايل لمعرفة الصلاحية (Admin/Doctor/Client)
  // نستخدم maybeSingle لتجنب تحطم الموقع إذا لم يتم العثور على البروفايل
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  // تحديد الدور (الافتراضي client في حالة عدم وجود بيانات)
  const userRole = profile?.role || 'client';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dir-rtl font-cairo">
      
      {/* 4. القائمة الجانبية (للكمبيوتر فقط) */}
      {/* نمرر userRole هنا ليتم إظهار روابط الإدارة */}
      <div className="hidden md:block w-64 flex-shrink-0 transition-all duration-300">
        <Sidebar userRole={userRole} />
      </div>

      {/* 5. المحتوى الرئيسي */}
      <main className="flex-1 w-full h-screen overflow-y-auto">
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* 6. الشريط السفلي (للموبايل فقط) */}
      <div className="md:hidden">
        <BottomNav />
      </div>

    </div>
  );
}
