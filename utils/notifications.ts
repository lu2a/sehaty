import { createClient } from '@/lib/supabase';

export const sendNotification = async (userId: string, title: string, message: string, link: string) => {
  const supabase = createClient();
  
  // ✅ التصحيح: استخدام (as any) لتجاوز خطأ TypeScript
  await (supabase.from('notifications') as any).insert({
    user_id: userId,
    title,
    message,
    link,
    is_read: false
  });
};
