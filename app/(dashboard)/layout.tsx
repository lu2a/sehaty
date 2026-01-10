import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  
  // 1. إعداد Supabase Client (للسيرفر)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  );

  // 2. التحقق من المستخدم الحالي (حماية الراوت)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/app/auth/login'); // تأكد أن مسار الدخول صحيح لديك
  }

  // 🏁 التغيير هنا:
  // لم نعد بحاجة لجلب بيانات البروفايل أو userRole هنا
  // لأن الـ Sidebar أصبح مكون (Client Component) ويجلب البيانات داخلياً

  return (
    <div className="min-h-screen bg-slate-50 dir-rtl font-cairo">
      
      {/* 4. القائمة الجانبية */}
      {/* لا نمرر أي props، ولا نضعه داخل div للعرض لأن السايدبار أصبح fixed */}
      <Sidebar />

      {/* 5. المحتوى الرئيسي */}
      {/* lg:pr-64:
         بما أن السايدبار مثبت على اليمين وعرضه 64 (w-64)، 
         يجب أن نعطي المحتوى padding من اليمين بنفس المقدار في الشاشات الكبيرة 
         حتى لا يختفي المحتوى خلف السايدبار.
      */}
      <main className="lg:pr-64 min-h-screen w-full transition-all duration-300">
        {/* pb-24: مسافة سفلية للموبايل عشان الشريط السفلي */}
        <div className="p-4 md:p-8 pb-24 lg:pb-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* 6. الشريط السفلي (للموبايل فقط) */}
      <div className="lg:hidden">
        <BottomNav />
      </div>

    </div>
  );
}
