'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminConsultations() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  
  // الفلاتر
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // desc | asc

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterSpecialty, sortOrder]);

  const fetchData = async () => {
    let query = supabase
      .from('consultations')
      .select(`
        id, created_at, status, specialty, content,
        medical_files (full_name, file_number),
        doctors (profiles (full_name))
      `)
      .order('created_at', { ascending: sortOrder === 'asc' });

    if (filterStatus !== 'all') query = query.eq('status', filterStatus);
    if (filterSpecialty !== 'all') query = query.eq('specialty', filterSpecialty);

    const { data } = await query;
    if (data) setItems(data);
  };

  return (
    <div className="p-6 dir-rtl">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">إدارة الاستشارات الطبية</h1>

      {/* أدوات الفلترة */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold mb-1">الحالة</label>
          <select className="p-2 border rounded w-32" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">الكل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="active">جارية</option>
            <option value="closed">مغلقة</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">التخصص</label>
          <select className="p-2 border rounded w-32" value={filterSpecialty} onChange={e => setFilterSpecialty(e.target.value)}>
            <option value="all">الكل</option>
            <option value="باطنة">باطنة</option>
            <option value="أطفال">أطفال</option>
            <option value="عظام">عظام</option>
            {/* ... باقي التخصصات */}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">الترتيب الزمني</label>
          <select className="p-2 border rounded w-32" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option value="desc">الأحدث أولاً</option>
            <option value="asc">الأقدم أولاً</option>
          </select>
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-sm">
            <tr>
              <th className="p-4">رقم الملف</th>
              <th className="p-4">المريض</th>
              <th className="p-4">التخصص</th>
              <th className="p-4">الطبيب</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">التاريخ</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-blue-600">{item.medical_files?.file_number}</td>
                <td className="p-4 font-bold">{item.medical_files?.full_name}</td>
                <td className="p-4">{item.specialty}</td>
                <td className="p-4 text-gray-600">{item.doctors?.profiles?.full_name || '---'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${item.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('ar-EG')}</td>
                <td className="p-4">
                  <Link href={`/admin/review/${item.id}`} className="text-blue-600 hover:underline text-sm font-bold">عرض</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}