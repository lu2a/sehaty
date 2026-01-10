import React from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dir-rtl">
      
      {/* القائمة الجانبية (Sidebar)
        ملاحظة: السايدبار أصبح يجلب دور المستخدم بنفسه، لذا لا نمرر له userRole
      */}
      <Sidebar />

      {/* حاوية المحتوى الرئيسي 
        lg:pr-64: تترك مسافة 64 وحدة من اليمين في الشاشات الكبيرة لأن السايدبار مثبت (Fixed)
      */}
      <div className="lg:pr-64 min-h-screen transition-all duration-300">
        {children}
      </div>
      
    </div>
  );
}
