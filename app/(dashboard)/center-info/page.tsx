'use client';

import Link from 'next/link';
import { 
  Phone, MapPin, FileText, Banknote, Users, 
  Stethoscope, ShieldCheck, ChevronLeft, Mail, Clock
} from 'lucide-react';

export default function CenterInfoHub() {
  
  const sections = [
    {
      title: 'أطباء المركز',
      description: 'تعرف على نخبة الأطباء والاستشاريين لدينا وتخصصاتهم.',
      icon: Users,
      href: '/center-info/doctors',
      color: 'bg-blue-100 text-blue-600',
      border: 'hover:border-blue-500'
    },
    {
      title: 'العيادات والخدمات',
      description: 'استعرض كافة التخصصات الطبية والخدمات العلاجية المتاحة.',
      icon: Stethoscope,
      href: '/center-info/services',
      color: 'bg-purple-100 text-purple-600',
      border: 'hover:border-purple-500'
    },
    {
      title: 'لائحة الأسعار',
      description: 'قائمة محدثة بأسعار الكشوفات والخدمات والتحاليل.',
      icon: Banknote,
      href: '/center-info/prices',
      color: 'bg-green-100 text-green-600',
      border: 'hover:border-green-500'
    },
    {
      title: 'سياسات المركز',
      description: 'حقوق المريض، سياسة الخصوصية، وقواعد الزيارة.',
      icon: ShieldCheck,
      href: '/center-info/policies',
      color: 'bg-orange-100 text-orange-600',
      border: 'hover:border-orange-500'
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto dir-rtl font-cairo min-h-screen">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">دليل المركز الطبي</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          كل ما تحتاج معرفته عن مركزنا في مكان واحد. نحن هنا لخدمتكم وتوفير أفضل رعاية طبية.
        </p>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
        {sections.map((item, idx) => (
          <Link 
            key={idx} 
            href={item.href}
            className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md flex items-start gap-4 group ${item.border}`}
          >
            <div className={`p-4 rounded-xl ${item.color}`}>
              <item.icon size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.description}
              </p>
            </div>
            <div className="self-center bg-gray-50 p-2 rounded-full text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition">
              <ChevronLeft size={20} />
            </div>
          </Link>
        ))}
      </div>

      {/* Contact Section (Always Visible) */}
      <div className="bg-slate-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute right-[-100px] top-[-100px] w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
           <div className="absolute left-[-100px] bottom-[-100px] w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-right flex-1">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Phone className="text-blue-400" /> تواصل معنا
            </h2>
            <div className="space-y-4 text-slate-300">
              <p className="flex items-center gap-3">
                <span className="bg-white/10 p-2 rounded-lg"><MapPin size={18}/></span>
                شارع الصحة، مبنى الأطباء، الدور الرابع - القاهرة
              </p>
              <p className="flex items-center gap-3">
                <span className="bg-white/10 p-2 rounded-lg"><Phone size={18}/></span>
                <span dir="ltr">+20 123 456 7890</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="bg-white/10 p-2 rounded-lg"><Mail size={18}/></span>
                info@sehaty-center.com
              </p>
              <p className="flex items-center gap-3">
                <span className="bg-white/10 p-2 rounded-lg"><Clock size={18}/></span>
                يومياً من 9 صباحاً حتى 10 مساءً
              </p>
            </div>
          </div>

          <div className="w-full md:w-1/2 h-64 bg-slate-700 rounded-xl overflow-hidden border border-slate-600 relative group">
            {/* هنا يمكنك وضع Google Maps Iframe */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.1537233816!2d31.2357!3d30.0444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAyJzM5LjgiTiAzMcKwMTQnMDguNSJF!5e0!3m2!1sen!2seg!4v1620000000000!5m2!1sen!2seg" 
              width="100%" 
              height="100%" 
              style={{border:0}} 
              allowFullScreen={true} 
              loading="lazy"
              className="grayscale group-hover:grayscale-0 transition duration-500"
            ></iframe>
          </div>
        </div>
      </div>

    </div>
  );
}
