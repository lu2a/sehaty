'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function AdminAppointments() {
  const supabase = createClient();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // تاريخ اليوم افتراضياً
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [filterDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        profiles:user_id (full_name, phone),
        doctors (profiles(full_name)),
        clinics (name)
      `)
      .eq('appointment_date', filterDate)
      .order('appointment_time');

    if (data) setAppointments(data);
    setLoading(false);
  };

  return (
    <div className="p-6 dir-rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">📅 جدول المواعيد اليومي</h1>
        <input 
          type="date" 
          className="p-2 border rounded-lg shadow-sm"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">جاري التحميل...</div>
        ) : appointments.length === 0 ? (
          <div className="p-10 text-center text-gray-500">لا توجد مواعيد لهذا اليوم.</div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4">الوقت</th>
                <th className="p-4">المريض</th>
                <th className="p-4">رقم الهاتف</th>
                <th className="p-4">الطبيب المعالج</th>
                <th className="p-4">العيادة</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-blue-50 transition">
                  <td className="p-4 font-bold text-blue-700">{apt.appointment_time}</td>
                  <td className="p-4 font-bold">{apt.profiles?.full_name}</td>
                  <td className="p-4 font-mono text-sm">{apt.profiles?.phone || '-'}</td>
                  <td className="p-4">{apt.doctors?.profiles?.full_name}</td>
                  <td className="p-4 text-sm">{apt.clinics?.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                      {apt.status === 'confirmed' ? 'مؤكد' : apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}