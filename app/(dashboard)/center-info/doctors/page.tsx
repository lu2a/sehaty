'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { User, Stethoscope, Calendar, Search } from 'lucide-react';
import Link from 'next/link';

export default function DoctorsPage() {
  const supabase = createClient();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      // نفترض أن الأطباء مخزنين في profiles ولهم role = doctor
      // ويمكن جلب التخصص من جدول آخر أو حقل إضافي
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor');
      
      if (data) setDoctors(data);
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => 
    doc.full_name?.includes(search) || doc.specialty?.includes(search)
  );

  return (
    <div className="p-4 md:p-8 dir-rtl min-h-screen">
      
      {/* Header & Search */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">نخبة الأطباء</h1>
        <p className="text-gray-500 text-sm mb-6">تعرف على فريقنا الطبي المتميز</p>
        
        <div className="relative max-w-md mx-auto">
          <input 
            type="text" 
            placeholder="ابحث باسم الطبيب أو التخصص..." 
            className="w-full p-3 pr-10 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute right-3 top-3 text-gray-400" size={20} />
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="text-center text-gray-400">جاري تحميل القائمة...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
              {/* Avatar */}
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                {doc.avatar_url ? (
                  <img src={doc.avatar_url} alt={doc.full_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={32} />
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{doc.full_name}</h3>
                <p className="text-sm text-blue-600 flex items-center gap-1 mb-2">
                  <Stethoscope size={14} /> {doc.specialty || 'طبيب عام'}
                </p>
                <Link 
                  href={`/appointments/book?doctor=${doc.id}`} 
                  className="inline-flex items-center gap-1 text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition"
                >
                  <Calendar size={12} /> احجز موعد
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
