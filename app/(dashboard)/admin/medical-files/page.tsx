'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminMedicalFiles() {
  const supabase = createClient();
  const router = useRouter();
  const [files, setFiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async (searchTerm = '') => {
    setLoading(true);
    let query = supabase
      .from('medical_files')
      .select('*')
      .order('file_number', { ascending: true }); // الترتيب الافتراضي برقم الملف

    if (searchTerm) {
      // البحث في الاسم، الرقم القومي، الهاتف، أو رقم الملف
      // ملاحظة: البحث في رقم (file_number) يتطلب تحويله لنص في Supabase أو استخدام eq إذا كان رقماً دقيقاً
      if (!isNaN(Number(searchTerm))) {
         query = query.or(`file_number.eq.${searchTerm},national_id.eq.${searchTerm},phone_number.eq.${searchTerm}`);
      } else {
         query = query.ilike('full_name', `%${searchTerm}%`);
      }
    }

    const { data } = await query.limit(50);
    if (data) setFiles(data);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(search);
  };

  return (
    <div className="p-6 dir-rtl">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">🗂️ أرشيف الملفات الطبية</h1>

      {/* شريط البحث */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow mb-6 flex gap-2">
        <input 
          type="text" 
          placeholder="بحث بـ: رقم الملف، الاسم، الرقم القومي، التليفون..." 
          className="flex-1 p-2 border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold">بحث 🔍</button>
      </form>

      {/* الجدول */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-right whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="p-4"># رقم الملف</th>
              <th className="p-4">الاسم</th>
              <th className="p-4">الرقم القومي</th>
              <th className="p-4">التليفون</th>
              <th className="p-4">النوع</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
               <tr><td colSpan={6} className="p-8 text-center">جاري البحث...</td></tr>
            ) : files.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-gray-400">لا توجد ملفات مطابقة</td></tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="hover:bg-blue-50 transition">
                  <td className="p-4 font-mono font-bold text-blue-700">{file.file_number}</td>
                  <td className="p-4 font-bold">{file.full_name}</td>
                  <td className="p-4 text-gray-600">{file.national_id || '-'}</td>
                  <td className="p-4 text-gray-600">{file.phone_number || '-'}</td>
                  <td className="p-4">{file.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                  <td className="p-4 flex gap-2">
                    <Link href={`/admin/medical-files/${file.id}`} className="text-blue-600 hover:underline text-sm font-bold">
                      عرض التفاصيل
                    </Link>
                    <Link href={`/admin/medical-files/${file.id}/history`} className="text-purple-600 hover:underline text-sm font-bold bg-purple-50 px-2 py-1 rounded">
                      سجل التردد 📅
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}