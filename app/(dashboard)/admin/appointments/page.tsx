'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Calendar, Clock, User, Phone, Stethoscope, MapPin } from 'lucide-react';

export default function AdminAppointments() {
  const supabase = createClient();
  const [appointments, setAppointments] = useState<any[]>([]);
  // نستخدم visit_date حسب تسمية قاعدة البيانات
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [filterDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    
    // استعلام معقد لجلب البيانات المرتبطة
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        medical_files ( full_name, gender, birth_date ),
        profiles:user_id ( phone, full_name ),
        doctors:doctor_id ( profiles(full_name) ),
        clinics ( name )
      `)
      .eq('visit_date', filterDate)
      .order('visit_time', { ascending: true, nullsFirst: false }); // ترتيب حسب الوقت

    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  // دالة لتحديث حالة الموعد
  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
    fetchAppointments(); // تحديث البيانات
  };

  return (
    <div className="p-6 dir-rtl font-cairo min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-blue-600"/> جدول المواعيد اليومي
          </h1>
          <p className="text-gray-500 text-sm mt-1">إدارة حجوزات العيادات الخارجية</p>
        </div>
        
        <div className="bg-white p-2 rounded-xl shadow-sm border flex items-center gap-2">
          <span className="text-gray-400 text-sm font-bold px-2">تاريخ العرض:</span>
          <input 
            type="date" 
            className="p-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-500 animate-pulse">جاري تحميل الجدول...</div>
        ) : appointments.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center text-gray-400">
            <Calendar size={48} className="mb-4 opacity-20"/>
            <p>لا توجد مواعيد محجوزة لهذا التاريخ.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">الوقت</th>
                  <th className="p-4">المريض</th>
                  <th className="p-4">بيانات الاتصال</th>
                  <th className="p-4">العيادة / الطبيب</th>
                  <th className="p-4">سبب الزيارة</th>
                  <th className="p-4 text-center">الحالة</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-blue-50/50 transition duration-150">
                    
                    {/* 1. الوقت */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg w-fit">
                        <Clock size={16}/>
                        {apt.visit_time ? apt.visit_time.slice(0,5) : '--:--'}
                      </div>
                    </td>

                    {/* 2. المريض */}
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{apt.medical_files?.full_name}</div>
                      <div className="text-xs text-gray-500">
                        {apt.medical_files?.gender === 'male' ? 'ذكر' : 'أنثى'} • {new Date().getFullYear() - new Date(apt.medical_files?.birth_date).getFullYear()} سنة
                      </div>
                    </td>

                    {/* 3. الاتصال */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gray-600 text-sm dir-ltr justify-end">
                        {apt.phone || apt.profiles?.phone || 'لا يوجد'} <Phone size={14}/>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">حساب: {apt.profiles?.full_name}</div>
                    </td>

                    {/* 4. العيادة والطبيب */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">
                          {apt.specialty || apt.clinics?.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Stethoscope size={14}/>
                        {apt.doctors?.profiles?.full_name || <span className="text-orange-500 text-xs">لم يحدد طبيب</span>}
                      </div>
                    </td>

                    {/* 5. السبب */}
                    <td className="p-4">
                      <p className="text-sm text-gray-600 truncate max-w-[150px]" title={apt.reason}>
                        {apt.reason}
                      </p>
                    </td>

                    {/* 6. الحالة */}
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                        apt.status === 'completed' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {apt.status === 'pending' && 'قيد الانتظار'}
                        {apt.status === 'confirmed' && 'مؤكد'}
                        {apt.status === 'cancelled' && 'ملغي'}
                        {apt.status === 'completed' && 'تم الكشف'}
                      </span>
                    </td>

                    {/* 7. الإجراءات */}
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {apt.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateStatus(apt.id, 'confirmed')}
                              className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition" 
                              title="تأكيد"
                            >
                              ✓
                            </button>
                            <button 
                              onClick={() => updateStatus(apt.id, 'cancelled')}
                              className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition" 
                              title="إلغاء"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        {/* يمكن إضافة زر "تعديل" لتعيين طبيب أو وقت */}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
