'use client';

import { 
  HeartPulse, Baby, Brain, Eye, 
  Thermometer, Scissors, Activity, Truck 
} from 'lucide-react';

export default function ServicesPage() {
  
  const clinics = [
    { name: 'عيادة الباطنة', icon: Activity, desc: 'تشخيص وعلاج الأمراض المزمنة والسكر والضغط.' },
    { name: 'عيادة الأطفال', icon: Baby, desc: 'رعاية شاملة للأطفال وحديثي الولادة والتطعيمات.' },
    { name: 'عيادة القلب', icon: HeartPulse, desc: 'رسم قلب، إيكو، ومتابعة حالات القلب.' },
    { name: 'الجراحة العامة', icon: Scissors, desc: 'العمليات الصغرى والمتوسطة والجروح.' },
    { name: 'المخ والأعصاب', icon: Brain, desc: 'علاج الصداع والجلطات ومشاكل الأعصاب.' },
    { name: 'الرمد والعيون', icon: Eye, desc: 'فحص قاع العين وقياس النظر.' },
    { name: 'المعمل والتحاليل', icon: Thermometer, desc: 'كافة التحاليل الطبية بأحدث الأجهزة.' },
    { name: 'الطوارئ 24/7', icon: Truck, desc: 'استقبال الحالات الحرجة والإسعافات الأولية.' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto dir-rtl font-cairo">
      <h1 className="text-2xl font-bold mb-8 text-center text-purple-700 border-b pb-4">
        العيادات والخدمات الطبية
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clinics.map((clinic, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border hover:border-purple-300 transition group">
            <div className="flex items-start gap-4">
              <div className="bg-purple-50 p-3 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition duration-300">
                <clinic.icon size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">{clinic.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{clinic.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
