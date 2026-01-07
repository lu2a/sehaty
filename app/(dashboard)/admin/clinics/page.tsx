'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function ClinicsManagement() {
  const supabase = createClient();
  const [clinics, setClinics] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    const { data } = await supabase.from('clinics').select('*').order('created_at');
    if (data) setClinics(data);
  };

  const handleAddClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

const { error } = await supabase.from('clinics').insert([
  {
    name: newName,
    description: newDesc
  }
] as any); // <--- أضفنا هذا للإجبار

    if (!error) {
      setNewName('');
      setNewDesc('');
      fetchClinics();
      alert('تمت إضافة العيادة بنجاح');
    } else {
      alert(error.message);
    }
  };

  const handleDeleteClinic = async (id: string) => {
    if (!confirm('هل أنت متأكد؟ سيتم حذف العيادة من القائمة.')) return;
    const { error } = await supabase.from('clinics').delete().eq('id', id);
    if (!error) fetchClinics();
  };

  return (
    <div className="p-6 dir-rtl">
      <h1 className="text-2xl font-bold mb-6">إدارة العيادات والتخصصات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* نموذج الإضافة */}
        <div className="bg-white p-6 rounded-xl shadow h-fit">
          <h2 className="font-bold mb-4 text-blue-900">إضافة عيادة جديدة</h2>
          <form onSubmit={handleAddClinic} className="space-y-4">
            <div>
              <label className="text-sm block mb-1">اسم العيادة</label>
              <input 
                className="w-full p-2 border rounded" 
                placeholder="مثال: عيادة الجلدية"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm block mb-1">الوصف</label>
              <textarea 
                className="w-full p-2 border rounded" 
                placeholder="وصف مختصر..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
              + إضافة
            </button>
          </form>
        </div>

        {/* القائمة */}
        <div className="lg:col-span-2 space-y-4">
          {clinics.map((clinic) => (
            <div key={clinic.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center border-r-4 border-orange-500">
              <div>
                <h3 className="font-bold text-lg">{clinic.name}</h3>
                <p className="text-gray-500 text-sm">{clinic.description}</p>
              </div>
              <button 
                onClick={() => handleDeleteClinic(clinic.id)}
                className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm"
              >
                حذف 🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
