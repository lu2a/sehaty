import Link from 'next/link';
import InstallPWA from '@/components/ui/InstallPWA';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dir-rtl flex flex-col">
      {/* 1. الهيدر والشعار */}
      <header className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            AI
          </div>
          <span className="text-2xl font-bold text-blue-900">صحتي</span>
        </div>
        <Link 
          href="/login" 
          className="px-6 py-2 rounded-full bg-white text-blue-600 font-semibold shadow-sm hover:shadow-md border border-blue-100 transition"
        >
          دخول الأعضاء
        </Link>
      </header>

      {/* 2. قسم البطل (Hero Section) */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="max-w-3xl space-y-6">
          <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            ✨ الرعاية الصحية للمستقبل
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            طبيبك الذكي.. <br/>
            <span className="text-blue-600">لأسرة بصحة أفضل</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            منصة طبية متكاملة مدعومة بالذكاء الاصطناعي. أنشئ ملفك الطبي، احصل على تشخيص مبدئي فوري، واستشر أفضل الأطباء، كل ذلك في تطبيق واحد لعائلتك.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link 
              href="/login" 
              className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1"
            >
              ابدأ الآن مجاناً 🚀
            </Link>
            <button className="px-8 py-4 rounded-xl bg-white text-slate-700 font-bold text-lg shadow hover:bg-gray-50 transition border border-gray-200">
              كيف يعمل؟
            </button>
          </div>
        </div>
      </section>

      {/* 3. الميزات الرئيسية */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ميزة 1 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl mb-4">
              🤖
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">ذكاء اصطناعي طبي</h3>
            <p className="text-slate-600">
              تحليل فوري للأعراض وتوجيهك للتخصص المناسب قبل زيارة الطبيب.
            </p>
          </div>

          {/* ميزة 2 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-4">
              👨‍👩‍👧‍👦
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">لكل العائلة</h3>
            <p className="text-slate-600">
              ملفات طبية مستقلة لكل فرد من أفراد أسرتك تحت حساب واحد.
            </p>
          </div>

          {/* ميزة 3 */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">
              📄
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">وصفات إلكترونية</h3>
            <p className="text-slate-600">
              احصل على وصفات طبية PDF قابلة للطباعة والمشاركة مع الصيدلية.
            </p>
          </div>
        </div>
      </section>

      {/* تذييل الصفحة */}
      <footer className="py-6 text-center text-slate-400 text-sm border-t">
        © 2024 صحتي AI - جميع الحقوق محفوظة
      </footer>
    </main>
  );
}