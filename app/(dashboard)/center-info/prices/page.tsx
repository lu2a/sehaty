'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Search, Banknote, Filter, Loader2, Tag 
} from 'lucide-react';

export default function UserPricesPage() {
  const supabase = createClient();
  
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // جلب الأسعار عند تحميل الصفحة
  useEffect(() => {
    const fetchPrices = async () => {
      // نستخدم as any لتجاوز فحص النوع لأن الجدول جديد
      const { data, error } = await (supabase.from('service_prices') as any)
        .select('*')
        .order('category', { ascending: true }); // ترتيب حسب القسم
      
      if (data) setPrices(data);
      setLoading(false);
    };

    fetchPrices();
  }, []);

  // 1. استخراج الأقسام المتاحة ديناميكياً من البيانات (بدون تكرار)
  const categories = ['الكل', ...Array.from(new Set(prices.map(item => item.category)))];

  // 2. فلترة البيانات حسب البحث والقسم
  const filteredPrices = prices.filter(item => {
    const matchesSearch = item.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-8 dir-rtl font-cairo max-w-5xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4 shadow-sm">
          <Banknote size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">لائحة أسعار الخدمات</h1>
        <p className="text-gray-500">شفافية كاملة في الأسعار.. اختر الخدمة لمعرفة التكلفة</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 sticky top-4 z-10">
        
        {/* شريط البحث */}
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="ابحث عن اسم الخدمة (كشف، تحليل، أشعة...)" 
            className="w-full p-3 pr-10 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-100 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
        </div>

        {/* فلاتر الأقسام */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat as string)}
              className={`
                whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all border
                ${selectedCategory === cat 
                  ? 'bg-green-600 text-white border-green-600 shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
              `}
            >
              {cat as string}
            </button>
          ))}
        </div>
      </div>

      {/* Prices List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={30} />
            <p>جاري تحميل الأسعار...</p>
          </div>
        ) : filteredPrices.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredPrices.map((item, index) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 md:p-5 hover:bg-green-50/30 transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-green-500 bg-green-50 p-2 rounded-lg group-hover:bg-green-100 transition">
                    <Tag size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{item.service_name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                      {item.category}
                    </span>
                  </div>
                </div>
                
                <div className="text-left">
                  <span className="block font-bold text-xl text-green-700">
                    {item.price} <span className="text-xs font-normal text-gray-500">ج.م</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Filter size={40} className="mb-2 opacity-20" />
            <p>لا توجد خدمات تطابق بحثك</p>
          </div>
        )}
      </div>

      <div className="text-center mt-8 text-xs text-gray-400">
        * الأسعار قد تختلف قليلاً حسب الحالة الطبية أو توقيت الخدمة (طوارئ). يرجى التأكد من الاستقبال.
      </div>

    </div>
  );
}
