'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Baby, Plus, Trash2, Calendar } from 'lucide-react';

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
      const { data } = await supabase.from('children_records').select('*').eq('user_id', user.id);
      if (data) setChildren(data);
    }
  };

  const handleAddChild = async () => {
    if (!newChild.name || !newChild.birth_date) return alert('البيانات ناقصة');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase.from('children_records').insert({ ...newChild, user_id: user.id });
      if (!error) {
        setIsAdding(false);
        setNewChild({ name: '', birth_date: '', gender: 'male' });
        fetchChildren();
      }
    }
  };

  return (
    <div className="p-4 min-h-screen dir-rtl font-cairo max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Baby className="text-orange-500"/> ملفات الأطفال</h1>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-orange-100 text-orange-600 p-2 rounded-full hover:bg-orange-200"><Plus/></button>
      </div>

      {isAdding && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-200 mb-6 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-sm mb-3 text-orange-800">إضافة طفل جديد</h3>
          <div className="space-y-3">
            <input type="text" placeholder="اسم الطفل" className="w-full p-2 border rounded-lg" value={newChild.name} onChange={e => setNewChild({...newChild, name: e.target.value})} />
            <div className="flex gap-2">
               <input type="date" className="w-full p-2 border rounded-lg" value={newChild.birth_date} onChange={e => setNewChild({...newChild, birth_date: e.target.value})} />
               <select className="p-2 border rounded-lg" value={newChild.gender} onChange={e => setNewChild({...newChild, gender: e.target.value})}>
                 <option value="male">ذكر</option>
                 <option value="female">أنثى</option>
               </select>
            </div>
            <button onClick={handleAddChild} className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold">حفظ</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {children.length === 0 && !isAdding && <p className="text-center text-gray-400 mt-10">لا يوجد أطفال مسجلين</p>}
        {children.map((child) => (
          <div key={child.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${child.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`}>
              {child.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{child.name}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar size={12}/> {new Date(child.birth_date).toLocaleDateString('ar-EG')} 
                <span className="bg-gray-100 px-2 rounded-full mr-2">
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
