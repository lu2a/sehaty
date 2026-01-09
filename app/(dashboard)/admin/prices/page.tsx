'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Banknote, Plus, Trash2, Search, Filter, Save, Loader2 
} from 'lucide-react';

export default function AdminPricesPage() {
  const supabase = createClient();
  
  // States
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Data
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
    // ✅ تصحيح: استخدام (as any)
    const { data, error } = await (supabase.from('service_prices') as any)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPrices(data);
    setLoading(false);
  };

  // 2. Add New Price
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_name || !formData.price || !formData.category) return alert('يرجى ملء جميع الحقول');

    setIsSubmitting(true);
    // ✅ تصحيح: استخدام (as any) لتفادي خطأ الإدخال
    const { data, error } = await (supabase.from('service_prices') as any)
      .insert([{ 
        service_name: formData.service_name, 
        category: formData.category, 
        price: parseFloat(formData.price) 
      }])
      .select()
      .single();

    if (!error && data) {
      setPrices([data, ...prices]);
      setFormData({ service_name: '', category: '', price: '' });
    } else {
      alert('حدث خطأ أثناء الإضافة: ' + error?.message);
    }
    setIsSubmitting(false);
  };

  // 3. Delete Price
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    
    // ✅ تصحيح: استخدام (as any)
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
    p.service_name.includes(searchTerm) || p.category.includes(searchTerm)
  );

  return (
    <div className="p-6 dir-rtl font-cairo max-w-6xl mx-auto min-h-screen bg-slate-50">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Banknote className="text-green-600" /> إدارة قائمة الأسعار
          </h1>
          <p className="text-gray-500 text-sm mt-1">إضافة وتعديل أسعار الخدمات الطبية بالمركز</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Form Section (Left) --- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 sticky top-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2">
              <Plus size={20} className="text-blue-600"/> إضافة خدمة جديدة
            </h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم الخدمة</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: كشف باطنة استشاري"
                  value={formData.service_name}
                  onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">القسم / الفئة</label>
                <select 
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md shadow-blue-200"
              >
                {isSubmitting ? <Loader2 className="animate-spin"/> : <Save size={18}/>}
                حفظ الخدمة
              </button>
            </form>
          </div>
        </div>

        {/* --- Table Section (Right) --- */}
        <div className="lg:col-span-2">
          
          {/* Search Bar */}
          <div className="bg-white p-2 rounded-xl border mb-4 flex items-center gap-2 shadow-sm">
            <Search className="text-gray-400 mr-2" size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن خدمة أو قسم..." 
              className="flex-1 p-2 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right min-w-[500px]">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
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
                      <tr key={item.id} className="hover:bg-blue-50/50 transition">
                        <td className="p-4 text-gray-400 font-mono text-xs">{index + 1}</td>
                        <td className="p-4 font-bold text-gray-800">{item.service_name}</td>
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-green-600 text-lg">
                          {item.price} <span className="text-xs text-gray-400 font-normal">ج.م</span>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
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
