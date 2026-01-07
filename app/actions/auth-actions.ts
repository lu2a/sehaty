
'use server';

import { createClient } from '@supabase/supabase-js';

// نستخدم Service Role Key هنا للوصول للدالة الأمنية
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // تأكد من وجود هذا المتغير في .env.local
);

export async function verifyDoctorIdentity(nationalId: string, secretCode: string) {
  const { data, error } = await supabaseAdmin.rpc('verify_doctor_credentials', {
    p_national_id: nationalId,
    p_secret_code: secretCode
  });

  if (error) {
    return { success: false, message: 'حدث خطأ في النظام' };
  }

  return data; // { success: boolean, message?: string, doctor_id?: string }
}