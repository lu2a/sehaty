'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { verifyDoctorIdentity } from '@/app/actions/auth-actions';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [userType, setUserType] = useState<'client' | 'doctor'>('client');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Doctor Verification State
  const [nationalId, setNationalId] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [isVerified, setIsVerified] = useState(false); // هل تم التحقق بنجاح؟

  // Client Email Login
  const [email, setEmail] = useState('');

  // 1. دالة دخول المنتفعين (عادية)
  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: { role: 'client' } // نحدد الدور هنا
      },
    });
    if (error) setErrorMsg(error.message);
    else alert('تم إرسال رابط الدخول لبريدك الإلكتروني 📧');
    setLoading(false);
  };

  // 2. دالة التحقق من الطبيب (المرحلة الأولى)
  const handleDoctorVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // استدعاء السيرفر أكشن
    const result = await verifyDoctorIdentity(nationalId, secretCode);

    if (result.success) {
      setIsVerified(true); // نفتح له خيار التسجيل بجوجل/إيميل
    } else {
      setErrorMsg(result.message);
    }
    setLoading(false);
  };

// 3. دالة دخول الطبيب (بعد التحقق) - نستخدم جوجل للسهولة
  const handleDoctorGoogleLogin = async () => {
    setLoading(true);
    
    // نجهز الرابط ونضيف البيانات فيه كـ Query Params
    const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
    redirectUrl.searchParams.set('next_role', 'doctor'); // سميناها next_role لتمييزها
    redirectUrl.searchParams.set('verified_national_id', nationalId);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl.toString(), // نمرر الرابط المعدل
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        // قمنا بحذف data من هنا لأنها سبب الخطأ
      },
    });
    if (error) setErrorMsg(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dir-rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* الهيدر */}
        <div className="bg-blue-600 p-6 text-center text-white">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            AI
          </div>
          <h1 className="text-2xl font-bold">منصة صحتي</h1>
          <p className="text-blue-100 text-sm mt-1">بوابتك للرعاية الصحية الذكية</p>
        </div>

        {/* التبويبات (أنا منتفع / أنا مقدم خدمة) */}
        <div className="flex border-b">
          <button
            onClick={() => { setUserType('client'); setIsVerified(false); setErrorMsg(''); }}
            className={`flex-1 py-4 text-sm font-bold transition ${userType === 'client' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            👤 أنا منتفع
          </button>
          <button
            onClick={() => { setUserType('doctor'); setIsVerified(false); setErrorMsg(''); }}
            className={`flex-1 py-4 text-sm font-bold transition ${userType === 'doctor' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            👨‍⚕️ أنا مقدم خدمة
          </button>
        </div>

        <div className="p-8">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          {/* ============ نموذج المنتفع ============ */}
          {userType === 'client' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">تسجيل الدخول للمرضى</h2>
              
<button 
   onClick={() => {
     // نجهز الرابط ونضيف فيه next_role=client
     const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
     redirectUrl.searchParams.set('next_role', 'client');
     
     supabase.auth.signInWithOAuth({ 
       provider: 'google', 
       options: { 
         redirectTo: redirectUrl.toString()
         // حذفنا data من هنا
       } 
     });
   }}
   className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
>
  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
  دخول باستخدام Google
</button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">أو عبر البريد</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <form onSubmit={handleClientLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'جاري الإرسال...' : 'إرسال رابط الدخول ✨'}
                </button>
              </form>
            </div>
          )}

          {/* ============ نموذج مقدم الخدمة ============ */}
          {userType === 'doctor' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              {!isVerified ? (
                // المرحلة 1: التحقق من الهوية
                <form onSubmit={handleDoctorVerification} className="space-y-4">
                  <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200 mb-4">
                    لأغراض أمنية، يرجى إدخال بياناتك الوظيفية للتحقق من هويتك قبل الدخول.
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">الرقم القومي</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                      placeholder="أدخل الرقم القومي المسجل"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">الكود السري (6 رموز)</label>
                    <input 
                      type="password" 
                      required 
                      maxLength={6}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-center tracking-widest text-lg"
                      placeholder="******"
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                    />
                  </div>

                  <button disabled={loading} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? 'جاري التحقق...' : 'تحقق من الهوية 🛡️'}
                  </button>
                </form>
              ) : (
                // المرحلة 2: التسجيل بعد النجاح
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl animate-bounce">
                    ✅
                  </div>
                  <h2 className="text-xl font-bold text-green-800 mb-2">تم التحقق من هويتك بنجاح!</h2>
                  <p className="text-gray-600 mb-6 text-sm">
                    أهلاً بك يا دكتور. يرجى الآن ربط حسابك ببريدك الإلكتروني أو جوجل لإتمام الدخول.
                  </p>

                  <button 
                    onClick={handleDoctorGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium mb-3"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                    إكمال الدخول بـ Google
                  </button>
                  
                  <p className="text-xs text-gray-400 mt-4">سيتم توجيهك لملفك الشخصي مباشرة بعد الدخول.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
