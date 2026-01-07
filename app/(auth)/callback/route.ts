import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// هذا السطر هو الحل السحري لمشكلة Edge Runtime
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // استلام البيانات الإضافية
  const nextRole = searchParams.get('next_role')
  const verifiedNationalId = searchParams.get('verified_national_id')
  
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
      // منطق ربط الطبيب
      if (nextRole === 'doctor' && verifiedNationalId) {
        
        await supabase
          .from('profiles')
          .update({ role: 'doctor' })
          .eq('id', data.user.id);
          
        await supabase
          .from('doctors')
          .update({ id: data.user.id }) 
          .eq('national_id', verifiedNationalId)
          .is('id', null); 
      }
      
      // التوجيه النهائي
      if (nextRole === 'doctor') {
        return NextResponse.redirect(`${origin}/doctor/dashboard`)
      } else {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}
