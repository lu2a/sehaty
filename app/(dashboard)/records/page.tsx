'use client';
import Link from 'next/link';

export default function RecordsHub() {
  return (
    <div className="p-6 dir-rtl">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">📊 سجلات المتابعة الصحية</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* سجل الأمراض المزمنة */}
        <Link href="/records/chronic" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
          <div className="text-4xl mb-3">🩸</div>
          <h3 className="font-bold text-lg mb-1">الضغط والسكر</h3>
          <p className="text-gray-500 text-sm">تسجيل قراءات الضغط، السكر التراكمي والعشوائي.</p>
        </Link>

        {/* سجل الطفل */}
        <Link href="/records/child" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
          <div className="text-4xl mb-3">👶</div>
          <h3 className="font-bold text-lg mb-1">صحة الطفل والنمو</h3>
          <p className="text-gray-500 text-sm">متابعة الطول، الوزن، التطعيمات ومحيط الرأس.</p>
        </Link>

        {/* سجل الحمل */}
        <Link href="/records/pregnancy" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
          <div className="text-4xl mb-3">🤰</div>
          <h3 className="font-bold text-lg mb-1">متابعة الحمل</h3>
          <p className="text-gray-500 text-sm">زيارات الطبيب، الأدوية، التحاليل وتطور الجنين.</p>
        </Link>

        {/* الروشتات (موجودة بالفعل) */}
        <Link href="/dashboard/consultations" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
          <div className="text-4xl mb-3">💊</div>
          <h3 className="font-bold text-lg mb-1">الروشتات والاستشارات</h3>
          <p className="text-gray-500 text-sm">أرشيف لكل الروشتات المصدرة من الأطباء.</p>
        </Link>

        {/* الحاسبات المحفوظة (سنقوم بعمل صفحتها لاحقاً إذا أردت) */}
         <Link href="/calculators" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100">
          <div className="text-4xl mb-3">🧮</div>
          <h3 className="font-bold text-lg mb-1">الحاسبات الطبية</h3>
          <p className="text-gray-500 text-sm">نتائج مؤشر الكتلة وغيرها.</p>
        </Link>
      </div>
    </div>
  );
}