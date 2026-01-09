'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import * as XLSX from 'xlsx'; // Excel library
import { 
  Database, Upload, Plus, Trash2, FileSpreadsheet, 
  Loader2, CheckCircle, AlertCircle, Pill 
} from 'lucide-react';

// ✅ Define list categories (Clinical + Medications)
const CATEGORIES = [
  // --- Clinical Lists ---
  { id: 'diagnosis', label: 'التشخيصات (Diagnosis)' },
  { id: 'lab', label: 'التحاليل (Labs)' },
  { id: 'radiology', label: 'الأشعة (Radiology)' },
  { id: 'advice', label: 'الرسائل التثقيفية (Advice)' },
  { id: 'red_flag', label: 'علامات الخطورة (Red Flags)' },
  
  // --- 💊 New Medication Lists ---
  { id: 'medication', label: 'أسماء الأدوية (Drug Names)' },
  { id: 'med_conc', label: 'التركيزات (Concentrations)' },
  { id: 'med_form', label: 'الأشكال الدوائية (Forms)' },
  { id: 'med_dose', label: 'الجرعات (Doses)' },
  { id: 'med_duration', label: 'مدة العلاج (Durations)' },
];

export default function AdminMedicalLists() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('diagnosis');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch data when tab changes
  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await (supabase.from('medical_lists') as any)
      .select('*')
      .eq('category', activeTab)
      .order('created_at', { ascending: false });
    
    if (data) setItems(data);
    setLoading(false);
  };

  // --- 1. Manual Add ---
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    // ✅ MODIFICATION: Use upsert to ignore duplicates if they exist
    const { error } = await (supabase.from('medical_lists') as any).upsert(
      {
        category: activeTab,
        value: newItem.trim() 
      },
      { onConflict: 'category, value', ignoreDuplicates: true }
    );

    if (!error) {
      setNewItem('');
      fetchItems();
    } else {
      alert('خطأ: ' + error.message);
    }
  };

  // --- 2. Delete ---
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    await (supabase.from('medical_lists') as any).delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  };

  // --- 3. Smart Excel Upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert data to array of arrays
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        // Smart correction logic (two columns or one column)
        const rowsToInsert = data
          .filter(row => row.length > 0)
          .map(row => {
            // Case 1: Two columns (Category | Value)
            if (row.length >= 2 && row[1]) {
               return { category: row[0], value: row[1] };
            }
            // Case 2: One column (Value only)
            else if (row.length === 1 && row[0]) {
               return { category: activeTab, value: row[0] };
            }
            return null;
          })
          // Clean data
          .filter((item: any) => 
             item && 
             item.value && 
             !['القيمة', 'Value', 'القسم', 'Category'].includes(item.value)
          );

        if (rowsToInsert.length === 0) {
          alert('لم يتم العثور على بيانات صالحة للرفع!');
          setUploading(false);
          return;
        }

        // ✅ MODIFICATION: Use upsert to ignore duplicates
        const { error } = await (supabase.from('medical_lists') as any).upsert(
          rowsToInsert,
          { onConflict: 'category, value', ignoreDuplicates: true }
        );

        if (!error) {
          alert(`تمت المعالجة بنجاح ✅\n(تم تجاهل أي قيم مكررة تلقائياً)`);
          fetchItems();
        } else {
          alert('خطأ في قاعدة البيانات: ' + error.message);
        }

      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء قراءة الملف.');
      }
      setUploading(false);
      e.target.value = ''; 
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-6 dir-rtl min-h-screen bg-gray-50 font-cairo">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 text-white p-3 rounded-lg">
          <Database size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة القوائم الطبية</h1>
          <p className="text-gray-500">تحديث قواعد بيانات الأدوية، التحاليل، والتشخيصات</p>
        </div>
      </div>

      {/* Tabs - Updated to include medications */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === cat.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            {/* Distinct icon for medications */}
            {cat.id.startsWith('med') && <Pill size={14} className="opacity-80"/>}
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Add & Upload */}
        <div className="space-y-6">
          
          {/* Manual Add */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-green-600"/> إضافة عنصر واحد
            </h3>
            <form onSubmit={handleAddManual} className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 p-2 border rounded-lg outline-none focus:border-blue-500"
                placeholder={`قيمة جديدة لـ ${CATEGORIES.find(c => c.id === activeTab)?.label.split(' ')[0]}...`}
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
              />
              <button disabled={!newItem} className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700 disabled:opacity-50">
                حفظ
              </button>
            </form>
          </div>

          {/* Excel Upload */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-green-600"/> استيراد من Excel
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              يدعم الوضعين:
              <br/> 1. ملف بعمودين: <strong>(القسم | القيمة)</strong>
              <br/> 2. ملف بعمود واحد: <strong>(القيمة فقط)</strong> وسيتم إضافتها للقسم الحالي: <span className="text-blue-600 font-bold">{CATEGORIES.find(c => c.id === activeTab)?.label}</span>
            </p>
            
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="text-sm text-gray-500"><span className="font-semibold">اضغط للرفع</span> أو اسحب الملف هنا</p>
                  </>
                )}
              </div>
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg text-xs text-yellow-800 flex gap-2">
            <AlertCircle size={16} className="shrink-0"/>
            <p>تنبيه: سيتم تجاهل الصف الأول تلقائياً إذا كان يحتوي على كلمات مثل "القسم" أو "Value".</p>
          </div>

        </div>

        {/* Right Column: List View */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
            <h3 className="font-bold text-gray-700">
              {CATEGORIES.find(c => c.id === activeTab)?.label} ({items.length})
            </h3>
            <button onClick={fetchItems} className="text-xs text-blue-600 hover:underline">تحديث القائمة</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center items-center h-full text-gray-400 gap-2">
                <Loader2 className="animate-spin"/> جاري التحميل...
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Database size={40} className="mb-2 opacity-20"/>
                <p>القائمة فارغة لهذا القسم</p>
              </div>
            ) : (
              <table className="w-full text-right">
                <thead className="text-xs text-gray-500 bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-3">الاسم (القيمة)</th>
                    <th className="p-3">تاريخ الإضافة</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 group">
                      <td className="p-3 font-medium text-gray-800">{item.value}</td>
                      <td className="p-3 text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
