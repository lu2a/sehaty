import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

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

  // --- جلب الصلاحية ---
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // 🕵️‍♂️ تشخيص المشكلة: انظر في الـ Terminal في VS Code
  console.log('--- DEBUG START ---');
  console.log('User ID:', user.id);
  console.log('Profile Data:', profile);
  console.log('Profile Error:', error);
  console.log('--- DEBUG END ---');

  const userRole = profile?.role || 'client';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dir-rtl font-cairo">
      
      {/* 1. القائمة الجانبية */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar userRole={userRole} />
      </div>

      {/* 2. المحتوى الرئيسي */}
      <main className="flex-1 w-full overflow-y-auto h-screen p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* 3. الشريط السفلي */}
      <div className="md:hidden">
        <BottomNav />
      </div>

    </div>
  );
}
