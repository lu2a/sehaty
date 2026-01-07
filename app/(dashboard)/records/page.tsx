'use client';

import Link from 'next/link';
import { 
  Activity, 
  Baby, 
  Stethoscope, 
  Calculator, 
  ArrowRight,
  HeartPulse,
  Ruler
} from 'lucide-react';

export default function RecordsMenu() {
  
  const records = [
    {
      title: 'الأمراض المزمنة',
      description: 'سجل قياسات الضغط والسكر لمتابعة حالتك الصحية بانتظام.',
      href: '/records/chronic',
      icon: Activity,
      color: 'bg-red-50 text-red-600',
      border: 'border-red-200'
    },
    {
      title: 'متابعة الحمل',
      description: 'سجلي زيارات الطبيب، الوزن، وتطورات الحمل أسبوعاً بأسبوع.',
      href: '/records/pregnancy',
      icon: Baby,
      color: 'bg-purple-50 text-purple-600',
      border: 'border-purple-200'
    },
    {
      title: 'نمو وصحة الطفل',
      description: 'متابعة الطول، الوزن، التطعيمات، ومحيط الرأس لأطفالك.',
      href: '/records/child',
      icon: Ruler,
      color: 'bg-green-50 text-green-600',
      border: 'border-green-200'
    },
    {
      title: 'نتائج الحاسبات المحفوظة',
      description: 'الرجوع لنتائج حاسبات مؤشر الكتلة والحمل التي حفظتها سابقاً.',
      href: '/records/calculations', // تأكد أن هذا المسار يطابق الملف الذي أصلحناه
      icon: Calculator,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-200'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 dir-rtl font-cairo">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="p-3 bg-white rounded-full shadow-sm text-slate-500 hover:text-blue-600 transition">
           <ArrowRight />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">السجلات والمتابعة الطبية 📈</h1>
          <p className="text-slate-500">اختر السجل الذي تود إضافة بيانات جديدة إليه أو مراجعته</p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {records.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={index} href={item.href} className="group">
              <div className={`bg-white p-6 rounded-2xl shadow-sm border-2 ${item.border} hover:shadow-lg transition-all duration-300 flex items-start gap-4 h-full hover:-translate-y-1`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="self-center">
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* نصيحة طبية سريعة */}
      <div className="max-w-4xl mx-auto mt-10 bg-blue-600 text-white p-6 rounded-2xl shadow-lg flex items-center gap-6">
        <div className="bg-white/20 p-4 rounded-full">
          <HeartPulse className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-1">لماذا التسجيل مهم؟</h3>
          <p className="text-blue-100 text-sm">
            الاحتفاظ بسجل منتظم لقياساتك يساعد الطبيب بشكل كبير في تشخيص حالتك بدقة ومتابعة استجابتك للعلاج. أنت شريك أساسي في رحلة علاجك!
          </p>
        </div>
      </div>

    </div>
  );
}
