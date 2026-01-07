import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar'; // تأكد أن المسار صحيح حسب مكان الملف

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

  // 2. معرفة دور المستخدم (يمكنك تمرير هذا للسايدبار لاحقاً إذا أردت تخصيص الروابط)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'client';

  return (
    // استخدام Flexbox لتقسيم الشاشة
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dir-rtl font-cairo">
      
      {/* القائمة الجانبية (ثابتة في الكمبيوتر، منسدلة في الموبايل) */}
      {/* ملاحظة: قمنا بتضمين شريط الموبايل داخل هذا المكون */}
      <Sidebar />

      {/* المحتوى الرئيسي */}
      <main className="flex-1 w-full overflow-y-auto h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
