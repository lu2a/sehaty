'use client';
import { createClient } from '@/lib/supabase';
// يمكنك جلب الأسعار من قاعدة البيانات وعرضها في جدول
export default function PricesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto dir-rtl">
      <h1 className="text-2xl font-bold mb-6">💰 لائحة أسعار الخدمات</h1>
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        {/* جدول الأسعار */}
        <table className="w-full text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">الخدمة</th>
              <th className="p-4">السعر</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="p-4">كشف استشاري</td><td className="p-4 font-bold text-green-600">300 ج.م</td></tr>
            <tr><td className="p-4">كشف أخصائي</td><td className="p-4 font-bold text-green-600">150 ج.م</td></tr>
            <tr><td className="p-4">رسم قلب</td><td className="p-4 font-bold text-green-600">100 ج.م</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
