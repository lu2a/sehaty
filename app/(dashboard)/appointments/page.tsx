'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function MyAppointments() {
  const supabase = createClient();
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('appointments')
        .select(`
          id, appointment_date, appointment_time, status, clinic_id,
          clinics (name),
          doctors (
            profiles (full_name)
          )
        `)
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true }); // الأقرب أولاً

      if (data) setAppointments(data);
    }
    getData();
  }, []);

  return (
    <div className="p-6 dir-rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">مواعيدي الطبية</h1>
        <Link href="/appointments/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + حجز جديد
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 mb-4">لا توجد مواعيد قادمة.</p>
          <Link href="/appointments/new" className="text-blue-600 font-bold hover:underline">احجز الآن</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white p-5 rounded-xl shadow border-r-4 border-blue-500 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{apt.clinics?.name}</h3>
                <p className="text-gray-600">د. {apt.doctors?.profiles?.full_name}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span>📅 {apt.appointment_date}</span>
                  <span>⏰ {apt.appointment_time}</span>
                </div>
              </div>
              <div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  {apt.status === 'confirmed' ? 'مؤكد' : apt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}