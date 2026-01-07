// app/auth/callback/route.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: any) { cookieStore.delete({ name, ...options }) },
        },
      }
    )
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // التحقق من الميتا داتا لمعرفة هل هو طبيب تم التحقق منه؟
      const role = data.user.user_metadata.role;
      const verifiedNationalId = data.user.user_metadata.verified_national_id;

      if (role === 'doctor' && verifiedNationalId) {
        // نستخدم Service Role لربط حساب الطبيب بالمستخدم الجديد
        // ملاحظة: في بيئة الإنتاج يفضل فصل هذا المنطق
        // هنا سنفترض أننا نملك الصلاحية أو نستخدم دالة RPC
        
        // تحديث جدول profiles
        await supabase.from('profiles').update({ role: 'doctor' }).eq('id', data.user.id);
        
        // تحديث جدول doctors (ربط الرقم القومي بالـ ID الجديد)
        // هذا يتطلب دالة RPC إذا كانت RLS تمنع التعديل
        // لكن للتبسيط، سنفترض أن الطبيب يمكنه تعديل صفه إذا كان الرقم القومي يطابقه (صعب بدون ID)
        
        // الحل الأفضل: Trigger في قاعدة البيانات
        // أو Server Action بعد الدخول.
      }
      
      // التوجيه
      if (role === 'doctor') return NextResponse.redirect(`${origin}/doctor/dashboard`);
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}