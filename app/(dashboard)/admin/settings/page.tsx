'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Save, Building, MapPin, Phone, Mail, Globe, Clock, ImageIcon, Loader2 } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload'; // تأكدنا من وجوده في ملفاتك

export default function AdminSettings() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // الحالة الافتراضية
  const [formData, setFormData] = useState({
    id: '',
    center_name: '',
    description: '',
    logo_url: '',
    address: '',
    location_url: '',
    phone: '',
    email: '',
    whatsapp: '',
    working_hours: ''
  });

  // جلب البيانات عند التحميل
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('center_settings')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setFormData({
          id: data.id,
          center_name: data.center_name || '',
          description: data.description || '',
          logo_url: data.logo_url || '',
          address: data.address || '',
          location_url: data.location_url || '',
          phone: data.phone || '',
          email: data.email || '',
          whatsapp: data.whatsapp || '',
          working_hours: data.working_hours || ''
        });
      }
      setFetching(false);
    };

    fetchSettings();
  }, []);

  // دالة الحفظ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('center_settings')
      .upsert({
        id: formData.id || undefined, // لو مفيش ID هينشئ جديد (رغم اننا عملنا insert مبدئي)
        ...formData,
        updated_at: new Date()
      });

    if (!error) {
      alert('تم حفظ إعدادات المركز بنجاح ✅');
    } else {
      alert('خطأ أثناء الحفظ: ' + error.message);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (fetching) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto dir-rtl font-cairo">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building className="text-blue-600" /> إعدادات المركز
          </h1>
          <p className="text-slate-500 text-sm">تعديل البيانات الأساسية التي تظهر للمرضى وفي الروشتات</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5" />}
          حفظ التغييرات
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* القسم الأيمن: اللوجو والوصف */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center justify-center gap-2">
              <ImageIcon size={18} /> شعار المركز (Logo)
            </h3>
            
            <div className="flex justify-center mb-4">
              <div className="w-full">
                {/* استخدام مكون رفع الصور الخاص بك */}
                <ImageUpload 
                  value={formData.logo_url ? [formData.logo_url] : []}
                  onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                  onRemove={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">سيظهر هذا الشعار في الهيدر والروشتات المطبوعة.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <label className="block font-bold text-slate-700 mb-2">نبذة عن المركز</label>
            <textarea 
              name="description"
              rows={5}
              className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="اكتب وصفاً مختصراً يظهر في صفحة الهبوط..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* القسم الأيسر: باقي البيانات */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. المعلومات الأساسية */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
              <Building size={20} className="text-blue-500"/> المعلومات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">اسم المركز *</label>
                <input required name="center_name" type="text" className="input" value={formData.center_name} onChange={handleChange} />
              </div>
              <div>
                <label className="label">مواعيد العمل</label>
                <div className="relative">
                  <Clock className="absolute right-3 top-3 text-gray-400" size={18} />
                  <input name="working_hours" type="text" className="input pr-10" placeholder="مثال: يومياً من 9 ص لـ 10 م" value={formData.working_hours} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* 2. التواصل */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
              <Phone size={20} className="text-green-500"/> بيانات التواصل
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">رقم الهاتف</label>
                <input name="phone" type="text" className="input dir-ltr text-right" placeholder="01xxxxxxxxx" value={formData.phone} onChange={handleChange} />
              </div>
              <div>
                <label className="label">رقم واتساب</label>
                <input name="whatsapp" type="text" className="input dir-ltr text-right" placeholder="201xxxxxxxxx" value={formData.whatsapp} onChange={handleChange} />
              </div>
              <div className="col-span-2">
                <label className="label">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 text-gray-400" size={18} />
                  <input name="email" type="email" className="input pr-10" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* 3. الموقع والعنوان */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
              <MapPin size={20} className="text-red-500"/> العنوان والموقع
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">العنوان التفصيلي</label>
                <input name="address" type="text" className="input" placeholder="المحافظة - المدينة - اسم الشارع" value={formData.address} onChange={handleChange} />
              </div>
              <div>
                <label className="label">رابط جوجل مابس (Google Maps Link)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute right-3 top-3 text-gray-400" size={18} />
                    <input name="location_url" type="url" className="input pr-10 dir-ltr text-right" value={formData.location_url} onChange={handleChange} />
                  </div>
                  {formData.location_url && (
                    <a href={formData.location_url} target="_blank" rel="noreferrer" className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg flex items-center justify-center">
                      <Globe size={20} />
                    </a>
                  )}
                </div>
              </div>
              
              {/* معاينة الخريطة (اختياري لو الرابط Embed) */}
              {formData.location_url && formData.location_url.includes('embed') && (
                <div className="mt-4 rounded-xl overflow-hidden border">
                  <iframe src={formData.location_url} width="100%" height="250" style={{border:0}} loading="lazy"></iframe>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .label { @apply block text-sm font-bold text-slate-700 mb-2; }
        .input { @apply w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white; }
      `}</style>
    </div>
  );
}
