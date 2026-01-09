'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import * as XLSX from 'xlsx'; // استيراد مكتبة الإكسيل
import { 
  Banknote, Plus, Trash2, Search, Save, Loader2, Upload, FileSpreadsheet 
} from 'lucide-react';

export default function AdminPricesPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Data (Manual)
  const [formData, setFormData] = useState({
    service_name: '',
    category: '',
    price: ''
  });

  // Categories List
  const categories = [
    'كشوفات العيادات', 'التحاليل الطبية', 'الأشعة', 'الطوارئ', 'العمليات', 'خدمات تمريضية'
  ];

  // 1. Fetch Data
  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    const { data } = await (supabase.from('service_prices') as any)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPrices(data);
    setLoading(false);
  };

  // 2. Add New Price (Manual)
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_name || !formData.price || !formData.category) return alert('يرجى ملء جميع الحقول');

    setIsSubmitting(true);
    
    // نستخدم upsert للتعامل مع التكرار (تحديث السعر إذا كان الاسم موجوداً)
    const { data, error } = await (supabase.from('service_prices') as any)
      .upsert([{ 
        service_name: formData.service_name, 
        category: formData.category, 
        price: parseFloat(formData.price) 
      }], { onConflict: 'service_name' }) // هام: يعتمد على الـ Constraint في قاعدة البيانات
      .select()
      .single();

    if (!error && data) {
      // تحديث القائمة المحلية
      const existingIndex = prices.findIndex(p => p.service_name === data.service_name);
      if (existingIndex >= 0) {
        const updatedPrices = [...prices];
        updatedPrices[existingIndex] = data;
        setPrices(updatedPrices);
      } else {
        setPrices([data, ...prices]);
      }
      setFormData({ service_name: '', category: '', price: '' });
      alert('تم الحفظ بنجاح');
    } else {
      alert('حدث خطأ: ' + error?.message);
    }
    setIsSubmitting(false);
  };

  // 3. Handle Excel Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        
        // تحويل البيانات إلى JSON
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert('الملف فارغ!');
          setIsUploading(false);
          return;
        }

        // تنسيق البيانات لتناسب قاعدة البيانات
        // نفترض أن ملف الإكسيل يحتوي على الأعمدة: (الخدمة, القسم, السعر)
        const formattedData = data.map(row => ({
          service_name: row['الخدمة'] || row['service_name'] || row['Service Name'], // محاولة قراءة الاسم بأكثر من صيغة
          category: row['القسم'] || row['category'] || row['Category'] || 'عام',
          price: parseFloat(row['السعر'] || row['price'] || row['Price'] || '0')
        })).filter(item => item.service_name && item.price > 0);

        if (formattedData.length === 0) {
          alert('لم يتم العثور على بيانات صالحة. تأكد من عناوين الأعمدة في ملف الإكسيل: (الخدمة، القسم، السعر)');
          setIsUploading(false);
          return;
        }

        // إرسال البيانات إلى Supabase (Upsert)
        const { error } = await (supabase.from('service_prices') as any)
          .upsert(formattedData, { onConflict: 'service_name' });

        if (!error) {
          alert(`تم استيراد ${formattedData.length} خدمة بنجاح!`);
          fetchPrices(); // إعادة تحميل الجدول
        } else {
          alert('حدث خطأ أثناء الاستيراد: ' + error.message);
        }

      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء معالجة الملف.');
      }
      setIsUploading(false);
      // تصفير المدخل
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsBinaryString(file);
  };

  // 4. Delete Price
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    
    const { error } = await (supabase.from('service_prices') as any)
      .delete()
      .eq('id', id);

    if (!error) {
      setPrices(prices.filter(p => p.id !== id));
    } else {
      alert('خطأ في الحذف: ' + error.message);
    }
  };

  // Filter Logic
  const filteredPrices = prices.filter(p => 
    p.service_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.includes(searchTerm)
  );

  return (
    <div className="p-6 dir-rtl font-cairo max-w-6xl mx-auto min-h-screen bg-slate-50">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Banknote className="text-emerald-600" /> إدارة قائمة الأسعار
          </h1>
          <p className="text-gray-500 text-sm mt-1">إضافة، تعديل، واستيراد أسعار الخدمات الطبية.</p>
        </div>
        
        {/* زر رفع الإكسيل */}
        <div>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-200 transition"
          >
            {isUploading ? <Loader2 className="animate-spin" size={20}/> : <FileSpreadsheet size={20}/>}
            {isUploading ? 'جاري المعالجة...' : 'استيراد من Excel'}
          </button>
          <p className="text-[10px] text-gray-400 mt-1 text-center">الأعمدة المطلوبة: (الخدمة، القسم، السعر)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Form Section (Manual Add) --- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 sticky top-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2 text-slate-800">
              <Plus size={20} className="text-emerald-600"/> إضافة يدوية
            </h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم الخدمة</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition"
                  placeholder="مثال: كشف باطنة استشاري"
                  value={formData.service_name}
                  onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">القسم / الفئة</label>
                <select 
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">-- اختر القسم --</option>
                  {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">السعر (ج.م)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
              >
                {isSubmitting ? <Loader2 className="animate-spin"/> : <Save size={18}/>}
                حفظ الخدمة
              </button>
            </form>
          </div>
        </div>

        {/* --- Table Section (List) --- */}
        <div className="lg:col-span-2">
          
          {/* Search Bar */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 mb-4 flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-100 transition">
            <Search className="text-gray-400 mr-2" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن خدمة أو قسم..." 
              className="flex-1 p-1 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right min-w-[600px]">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">اسم الخدمة</th>
                    <th className="p-4">القسم</th>
                    <th className="p-4">السعر</th>
                    <th className="p-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">جاري التحميل...</td></tr>
                  ) : filteredPrices.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">لا توجد خدمات مسجلة</td></tr>
                  ) : (
                    filteredPrices.map((item, index) => (
                      <tr key={item.id} className="hover:bg-emerald-50/30 transition group">
                        <td className="p-4 text-gray-400 font-mono text-xs">{index + 1}</td>
                        <td className="p-4 font-bold text-gray-800">{item.service_name}</td>
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-emerald-600 text-lg">
                          {item.price} <span className="text-xs text-gray-400 font-normal">ج.م</span>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-300 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition group-hover:scale-110"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
