'use client';

import { Shield, Clock, FileWarning, Info } from 'lucide-react';

export default function PoliciesPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto dir-rtl font-cairo bg-white min-h-screen">
      
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 mb-8 text-center">
        <Shield size={48} className="mx-auto text-orange-500 mb-3" />
        <h1 className="text-2xl font-bold text-orange-800">سياسات وقواعد المركز</h1>
        <p className="text-orange-700/80 text-sm mt-2">حرصاً منا على سلامتكم وراحتكم، يرجى الالتزام بالتعليمات التالية</p>
      </div>

      <div className="space-y-8">
        
        {/* Section 1 */}
        <section>
          <h2 className="flex items-center gap-2 font-bold text-xl text-slate-800 mb-3">
            <Clock className="text-blue-500" /> مواعيد الزيارة والعمل
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm leading-7 bg-gray-50 p-4 rounded-lg">
            <li>العمل بالعيادات الخارجية يبدأ من الساعة 9 صباحاً وحتى 10 مساءً.</li>
            <li>قسم الطوارئ يعمل على مدار 24 ساعة طوال أيام الأسبوع.</li>
            <li>مواعيد زيارة المرضى الداخليين من 4 عصراً وحتى 8 مساءً فقط.</li>
            <li>يسمح بمرافق واحد فقط للمريض في العيادات الخارجية لتقليل الازدحام.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="flex items-center gap-2 font-bold text-xl text-slate-800 mb-3">
            <FileWarning className="text-red-500" /> حقوق وواجبات المريض
          </h2>
          <div className="text-gray-600 text-sm leading-7 space-y-2">
            <p><strong>الحقوق:</strong> يحق للمريض معرفة تشخيصه الطبي كاملاً، والحصول على تقرير طبي مفصل، ومعاملة لائقة تحفظ كرامته وخصوصيته.</p>
            <p><strong>الواجبات:</strong> يجب تقديم معلومات صحيحة عن التاريخ المرضي، الالتزام بمواعيد الحجز، والحفاظ على ممتلكات المركز.</p>
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="flex items-center gap-2 font-bold text-xl text-slate-800 mb-3">
            <Info className="text-green-500" /> سياسة الخصوصية
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            نحن نلتزم بحماية بياناتك الطبية والشخصية بأقصى درجات الأمان. لا يتم مشاركة ملفك الطبي مع أي جهة خارجية إلا بموافقة كتابية منك أو في الحالات التي يقتضيها القانون. جميع العاملين ملزمون بميثاق شرف للحفاظ على سرية المرضى.
          </p>
        </section>

      </div>
    </div>
  );
}
