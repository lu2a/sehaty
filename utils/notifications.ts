import { createClient } from '@/lib/supabase';

export const sendNotification = async (userId: string, title: string, message: string, link: string) => {
  const supabase = createClient();
  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    link,
  });
};
