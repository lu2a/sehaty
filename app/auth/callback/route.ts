import { createServerClient, type CookieOptions } from '@supabase/ssr'
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
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    // استبدال الكود بجلسة مستخدم حقيقية
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // إذا نجح، وجهه للصفحة الرئيسية (التي ستوجهه لإنشاء الملف الطبي)
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // في حالة وجود خطأ، أعده لصفحة الدخول
  return NextResponse.redirect(`${origin}/login`)
}