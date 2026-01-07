import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  
  // 1. التحقق من الجلسة في السيرفر
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

  // 2. معرفة دور المستخدم (طبيب أم مريض)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'client';

  return (
    <div className="min-h-screen bg-gray-50 dir-rtl">
      {/* القائمة الجانبية للكمبيوتر */}
      <Sidebar userRole={userRole} />

      {/* المحتوى الرئيسي */}
      <main className="md:mr-64 pb-20 md:pb-0 transition-all duration-200">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* القائمة السفلية للموبايل */}
      <BottomNav userRole={userRole} />
    </div>
  );
}