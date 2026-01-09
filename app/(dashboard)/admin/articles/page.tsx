'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Upload, FileText, CheckCircle, AlertTriangle, Plus, X, Image as ImageIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ArticlesManagement() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'excel'>('manual');
  
  // Manual Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    image_url: ''
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await (supabase.from('articles') as any).select('*').order('created_at', { ascending: false }).limit(10);
    if (data) setArticles(data);
  };

  // --- 1. إضافة يدوية ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await (supabase.from('articles') as any).insert({
      title: formData.title,
      category: formData.category,
      content: formData.content,
      image_url: formData.image_url || null,
      created_at: new Date().toISOString()
    });

    if (error) {
      alert('حدث خطأ: ' + error.message);
    } else {
      alert('تم إضافة المقال بنجاح ✅');
      setFormData({ title: '', category: '', content: '', image_url: '' });
      fetchArticles();
    }
    setLoading(false);
  };

  // --- 2. رفع إكسيل ---
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // تحويل البيانات إلى JSON
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert('الملف فارغ!');
          setLoading(false);
          return;
        }

        // تنسيق البيانات لتناسب قاعدة البيانات
        // نفترض أن أعمدة الإكسيل هي: Title, Category, Content, Image
        const formattedData = data.map((row: any) => ({
          title: row['العنوان'] || row['Title'] || row['title'],
          category: row['القسم'] || row['Category'] || row['category'],
          content: row['المحتوى'] || row['Content'] || row['content'],
          image_url: row['رابط الصورة'] || row['Image'] || row['image_url'] || null,
          created_at: new Date().toISOString()
        }));

        // إضافة للـ Supabase
        const { error } = await (supabase.from('articles') as any).insert(formattedData);

        if (error) throw error;

        alert(`تم استيراد ${formattedData.length} مقال بنجاح! 🚀`);
        fetchArticles();
        if (fileInputRef.current) fileInputRef.current.value = '';

      } catch (err: any) {
        console.error(err);
        alert('حدث خطأ أثناء معالجة الملف: ' + err.message);
      }
      setLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6 dir-rtl font-cairo bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FileText className="text-rose-600"/> إدارة المقالات والمحتوى
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="flex bg-white p-1 rounded-xl shadow-sm border w-fit">
            <button 
              onClick={() => setActiveTab('manual')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'manual' ? 'bg-rose-100 text-rose-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              إضافة يدوية
            </button>
            <button 
              onClick={() => setActiveTab('excel')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'excel' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              استيراد إكسيل
            </button>
          </div>

          {/* Manual Form */}
          {activeTab === 'manual' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">📝 بيانات المقال الجديد</h3>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">عنوان المقال</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
                      placeholder="مثال: فوائد شرب الماء"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">القسم / التصنيف</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
                      placeholder="مثال: تغذية، صحة عامة..."
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">رابط الصورة (اختياري)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-200 outline-none dir-ltr text-right"
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    />
                    <div className="bg-slate-100 p-3 rounded-xl"><ImageIcon className="text-slate-400"/></div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">محتوى المقال</label>
                  <textarea 
                    required
                    rows={6}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-rose-200 outline-none"
                    placeholder="اكتب نص المقال هنا..."
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  />
                </div>

                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'جاري الحفظ...' : <><Plus size={20}/> نشر المقال</>}
                </button>
              </form>
            </div>
          )}

          {/* Excel Upload */}
          {activeTab === 'excel' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center animate-in fade-in">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h3 className="font-bold text-xl mb-2">رفع ملف إكسيل</h3>
              <p className="text-slate-500 mb-6 text-sm">
                يجب أن يحتوي الملف على الأعمدة التالية (بالعربي أو الإنجليزي):<br/>
                <span className="font-mono bg-slate-100 px-1 rounded mx-1">العنوان</span>
                <span className="font-mono bg-slate-100 px-1 rounded mx-1">القسم</span>
                <span className="font-mono bg-slate-100 px-1 rounded mx-1">المحتوى</span>
                <span className="font-mono bg-slate-100 px-1 rounded mx-1">رابط الصورة</span>
              </p>

              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                ref={fileInputRef}
                className="hidden" 
                id="excel-upload"
              />
              
              <label 
                htmlFor="excel-upload"
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white cursor-pointer transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200'}`}
              >
                {loading ? 'جاري المعالجة...' : <><Upload size={20}/> اختيار ملف إكسيل</>}
              </label>
            </div>
          )}
        </div>

        {/* Sidebar: Latest Articles */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500"/> آخر المقالات المضافة
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {articles.length === 0 && <p className="text-center text-slate-400 text-sm">لا توجد مقالات بعد</p>}
              {articles.map((article) => (
                <div key={article.id} className="p-3 border rounded-xl hover:bg-slate-50 transition flex gap-3">
                  {article.image_url ? (
                    <img src={article.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0"/>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><FileText size={20}/></div>
                  )}
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-slate-800 truncate">{article.title}</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{article.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
