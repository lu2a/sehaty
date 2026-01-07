'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Activity, Clock, CheckCircle, AlertTriangle, Archive } from 'lucide-react';

export default function DoctorDashboard() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, [activeTab]);

  const fetchConsultations = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = (supabase.from('consultations') as any)
      .select(`
        id, created_at, urgency, status, content, doctor_id,
        medical_files (full_name, gender, birth_date)
      `);

    if (activeTab === 'active') {
      // الحالات المفتوحة (التي لم يتم الرد عليها بعد أو قيد العمل)
      // تظهر: الحالات المتاحة للجميع OR الحالات التي استلمها هذا الطبيب
      query = query.neq('status', 'closed')
                   .or(`doctor_id.is.null,doctor_id.eq.${user.id}`);
    } else {
      // أرشيف الطبيب (الحالات التي أغلقها هذا الطبيب)
      query = query.eq('status', 'closed')
                   .eq('doctor_id', user.id);
    }

    const { data } = await query;
    
    if (data) {
      // الفرز: الطوارئ أولاً، ثم الزمن
      const urgencyWeight = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
      const sorted = data.sort((a: any, b: any) => {
        const scoreA = urgencyWeight[a.urgency as keyof typeof urgencyWeight] || 0;
        const scoreB = urgencyWeight[b.urgency as keyof typeof urgencyWeight] || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        // الأقدم أولاً في الحالات النشطة، الأحدث أولاً في الأرشيف
        return activeTab === 'active' 
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setConsultations(sorted);
    }
    setLoading(false);
  };

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'critical': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold animate-pulse flex items-center gap-1"><AlertTriangle size={12}/> طوارئ</span>;
      case 'high': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">عاجل</span>;
      default: return <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">عادي</span>;
    }
  };

  return (
    <div className="p-6 dir-rtl bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">غرفة الطبيب</h1>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button 
          onClick={() => setActiveTab('active')}
          className={`pb-2 px-4 font-bold flex items-center gap-2 ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          <Activity size={18} /> الحالات النشطة
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-2 px-4 font-bold flex items-center gap-2 ${activeTab === 'history' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
        >
          <Archive size={18} /> أرشيف ردودي
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? <p>جاري التحميل...</p> : consultations.length === 0 ? (
          <div className="text-center py-10 text-gray-400">لا توجد حالات هنا</div>
        ) : (
          consultations.map((item) => (
            <Link href={`/doctor/consultations/${item.id}${activeTab === 'active' ? '/reply' : ''}`} key={item.id}>
              <div className={`bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden group ${item.doctor_id ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-gray-300'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {item.medical_files?.full_name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{item.medical_files?.full_name}</h3>
                        {getUrgencyBadge(item.urgency)}
                        {item.status === 'closed' && <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={12}/> تم الرد</span>}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-1">{item.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                         <span className="flex items-center gap-1"><Clock size={12}/> {new Date(item.created_at).toLocaleString('ar-EG')}</span>
                         {!item.doctor_id && <span className="text-purple-600 bg-purple-50 px-2 rounded">متاحة للاستلام</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
