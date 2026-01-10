'use client';
import { Info, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-cairo dir-rtl flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-lg text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
           <Info size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">مركز غرب المطار الطبي</h1>
        <p className="text-slate-500 mb-6">الإصدار 1.0.0</p>
        
        <div className="text-right space-y-4 bg-slate-50 p-4 rounded-xl text-sm text-slate-600">
          <p>تطبيق طبي متكامل يهدف إلى تسهيل إدارة الملفات الطبية للأسرة، وحجز المواعيد، ومتابعة المؤشرات الحيوية وسجلات النمو والحمل.</p>
          <div className="flex items-center gap-2 text-green-600 font-bold">
            <ShieldCheck size={18}/>
            <span>جميع بياناتك مشفرة ومحمية بالكامل.</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-6">© 2026 جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}
