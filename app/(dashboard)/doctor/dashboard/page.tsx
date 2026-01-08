'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Stethoscope, Clock, CheckCircle, Star, 
  MessageSquare, User, Calendar, ArrowLeft, Loader2 
} from 'lucide-react';

export default function DoctorDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingConsults, setPendingConsults] = useState<any[]>([]);
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // 1. معرفة هوية الطبيب الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setDoctorId(user.id);
        fetchConsultations(user.id);
      }
    };
    init();
  }, []);

  const fetchConsultations = async (uid: string) => {
    setLoading(true);

    try {
      // أ) جلب الاستشارات المفتوحة (التي لم يتم الرد عليها) - ترتيب زمني
      // نستخدم (as any) لتجاوز مشاكل TypeScript مع العلاقات المعقدة مؤقتاً
      const { data: pending } = await (supabase
        .from('consultations') as any)
        .select('*, medical_files(full_name, gender, birth_date)')
        .neq('status', 'closed') // أي حالة غير مغلقة تعتبر مفتوحة
        .order('created_at', { ascending: true }); // الأقدم فالأحدث (عشان يرد على اللي انتظروا اكتر)

      // ب) جلب سجل ردود هذا الطبيب فقط
      const { data: history } = await (supabase
        .from('consultations') as any)
        .select('*, medical_files(full_name)')
        .eq('doctor_id', uid) // شرط: الطبيب هو المستخدم الحالي
        .eq('status', 'closed')
        .order('updated_at', { ascending: false }); // الأحدث فالأقدم

      if (pending) setPendingConsults(pending);
      if (history) setMyHistory(history);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // مكون عرض النجوم للتقييم
  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={14} 
            className={`${star <= (rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 dir-rtl font-cairo bg-slate-50 min-h-screen">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Stethoscope className="text-blue-600" /> عيادتي الإلكترونية
        </h1>
        <p className="text-slate-500 text-sm">مرحباً دكتور، لديك <span className="font-bold text-blue-600">{pendingConsults.length}</span> استشارة بانتظار ردك اليوم.</p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-6 w-fit">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pending' 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Clock size={16} />
          غرفة الانتظار ({pendingConsults.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history' 
            ? 'bg-green-600 text-white shadow-md' 
            : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <CheckCircle size={16} />
          سجل الردود والتقييمات
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : (
        <div className="space-y-4">
          
          {/* 1. Pending List */}
          {activeTab === 'pending' && (
            <div className="grid grid-cols-1 gap-4">
              {pendingConsults.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3 opacity-50" />
                  <p className="text-gray-500 font-bold">لا توجد استشارات معلقة حالياً</p>
                  <p className="text-xs text-gray-400">عمل رائع! لقد قمت بالرد على الجميع.</p>
                </div>
              ) : (
                pendingConsults.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-orange-500"></div>
                    
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                          <User size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg mb-1">
                            {item.medical_files?.full_name || 'مريض مجهول'}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md font-bold">انتظار</span>
                          </div>
                          <p className="text-slate-600 text-sm line-clamp-2 pl-4 border-r-2 border-slate-100">
                            {item.content}
                          </p>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/doctor/consultations/${item.id}`} // رابط الرد على الاستشارة
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200"
                      >
                        <MessageSquare size={16} />
                        الرد الآن
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. History List */}
          {activeTab === 'history' && (
            <div className="grid grid-cols-1 gap-4">
              {myHistory.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500">لم تقم بالرد على أي استشارات بعد.</p>
                </div>
              ) : (
                myHistory.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between w-full">
                          <h3 className="font-bold text-slate-800">{item.medical_files?.full_name}</h3>
                          <span className="text-xs text-gray-400">{new Date(item.updated_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mb-2">الشكوى: {item.content}</p>
                        
                        {/* Rating Section */}
                        <div className="flex items-center gap-2 bg-slate-50 w-fit px-3 py-1 rounded-lg">
                          <span className="text-xs font-bold text-slate-600">التقييم:</span>
                          {item.rating ? (
                            <RatingStars rating={item.rating} />
                          ) : (
                            <span className="text-[10px] text-gray-400">لم يتم التقييم بعد</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link 
                      href={`/doctor/consultations/${item.id}`} // رابط لعرض التفاصيل فقط
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                      title="عرض التفاصيل"
                    >
                      <ArrowLeft size={20} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
