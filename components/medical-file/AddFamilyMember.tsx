'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function AddFamilyMember({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    relation: 'son',
    birth_date: '',
    gender: 'male',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('medical_files').insert({
      user_id: user.id, // يندرج تحت الملف الرئيسي
      ...formData,
      chronic_diseases: [], // قيم افتراضية
      allergies: [],
      surgeries: []
    });

    if (!error) {
      onSuccess();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
      <h4 className="font-bold text-gray-700 mb-3">إضافة فرد جديد للعائلة</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text" placeholder="الاسم الكامل" required
          className="w-full p-2 border rounded"
          value={formData.full_name}
          onChange={e => setFormData({...formData, full_name: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-2">
          <select 
            className="p-2 border rounded"
            value={formData.relation}
            onChange={e => setFormData({...formData, relation: e.target.value})}
          >
            <option value="son">ابن</option>
            <option value="daughter">ابنة</option>
            <option value="wife">زوجة</option>
            <option value="husband">زوج</option>
            <option value="father">أب</option>
            <option value="mother">أم</option>
          </select>
          <select 
            className="p-2 border rounded"
            value={formData.gender}
            onChange={e => setFormData({...formData, gender: e.target.value})}
          >
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </div>
        <input
          type="date" required
          className="w-full p-2 border rounded"
          value={formData.birth_date}
          onChange={e => setFormData({...formData, birth_date: e.target.value})}
        />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="text-gray-500 text-sm">إلغاء</button>
          <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded text-sm">
            {loading ? 'جاري الإضافة...' : 'حفظ'}
          </button>
        </div>
      </form>
    </div>
  );
}