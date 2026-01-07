import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/BottomNav'; // تأكد من استيراد الملف الجديد

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dir-rtl font-cairo">
      
      {/* 1. القائمة الجانبية (تظهر فقط في الشاشات الكبيرة) */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* 2. المحتوى الرئيسي */}
      {/* pb-20: لإضافة مساحة سفلية حتى لا يغطي الشريط السفلي على المحتوى في الموبايل */}
      <main className="flex-1 w-full overflow-y-auto h-screen p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* 3. الشريط السفلي (يظهر فقط في الموبايل) */}
      <div className="md:hidden">
        <BottomNav />
      </div>

    </div>
  );
}
