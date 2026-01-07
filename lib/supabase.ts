import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

// دالة لإنشاء عميل Supabase للاستخدام داخل المتصفح (Client Components)
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// نسخة جاهزة للاستخدام السريع (Optional Utility)
export const supabase = createClient()