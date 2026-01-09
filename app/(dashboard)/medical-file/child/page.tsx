'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Baby, Plus, Trash2, Calendar, X } from 'lucide-react';

export default function ChildRecordPage() {
  const supabase = createClient();
  const [children, setChildren] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newChild, setNewChild] = useState({ name: '', birth_date: '', gender: 'male' });

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // ✅ تصحيح: استخدام (as any) لتجاوز خطأ النوع
      const { data } = await (supabase.from('children_records') as any)
        .select('*')
        .eq('user_id', user.id);
        
      if (data) setChildren(data);
    }
  };

  const handleAddChild = async () => {
    if (!newChild.name || !newChild.birth_date) return alert('البيانات ناقصة');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // ✅ تصحيح: استخدام (as any) هنا أيضاً
      const { error } = await (supabase.from('children_records') as any).insert({ 
        ...newChild, 
        user_id: user.id 
      });

      if (!error) {
        setIsAdding(false);
        setNewChild({ name: '', birth_date: '', gender: 'male' });
        fetchChildren(); // تحديث القائمة
      } else {
        alert('حدث خطأ أثناء الحفظ');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('هل أنت متأكد من حذف السجل؟')) return;
    
    // ✅ تصحيح: استخدام (as any)
    const { error } = await (supabase.from('children_records') as any)
      .delete()
      .eq('id', id);

    if(!error) {
        setChildren(children.filter(c => c.id !== id));
    }
  };

  return (
    <div className="p-4 min-h-screen dir-rtl font-cairo max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Baby className="text-orange-500"/> ملفات الأطفال
        </h1>
        <button 
            onClick={() => setIsAdding(!isAdding)} 
            className="bg-orange-100 text-orange-600 p-2 rounded-full hover:bg-orange-200 transition"
        >
            {isAdding ? <X size={20}/> : <Plus size={20}/>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-200 mb-6 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-sm mb-3 text-orange-800">إضافة طفل جديد</h3>
          <div className="space-y-3">
            <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">الاسم</label>
                <input 
                    type="text" 
                    placeholder="اسم الطفل" 
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-300" 
                    value={newChild.name} 
                    onChange={e => setNewChild({...newChild, name: e.target.value})} 
                />
            </div>
            <div className="flex gap-2">
               <div className="flex-1">
                   <label className="text-xs font-bold text-gray-500 mb-1 block">تاريخ الميلاد</label>
                   <input 
                        type="date" 
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-300" 
                        value={newChild.birth_date} 
                        onChange={e => setNewChild({...newChild, birth_date: e.target.value})} 
                   />
               </div>
               <div className="w-1/3">
                   <label className="text-xs font-bold text-gray-500 mb-1 block">النوع</label>
                   <select 
                        className="w-full p-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange-300" 
                        value={newChild.gender} 
                        onChange={e => setNewChild({...newChild, gender: e.target.value})}
                    >
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                   </select>
               </div>
            </div>
            <button 
                onClick={handleAddChild} 
                className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold hover:bg-orange-600 transition shadow-md shadow-orange-200"
            >
                حفظ البيانات
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {children.length === 0 && !isAdding && (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-300">
                <Baby className="mx-auto text-gray-300 mb-2" size={40}/>
                <p className="text-gray-400 text-sm">لا يوجد أطفال مسجلين</p>
            </div>
        )}
        
        {children.map((child) => (
          <div key={child.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative group">
            <button 
                onClick={() => handleDelete(child.id)} 
                className="absolute top-3 left-3 text-gray-300 hover:text-red-500 transition"
            >
                <Trash2 size={16}/>
            </button>
            
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm ${child.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`}>
              {child.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{child.name}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Calendar size={12}/> {new Date(child.birth_date).toLocaleDateString('ar-EG')} 
                <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] mr-2">
                   {new Date().getFullYear() - new Date(child.birth_date).getFullYear()} سنوات
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
