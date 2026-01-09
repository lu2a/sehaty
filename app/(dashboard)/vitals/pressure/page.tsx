'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Activity, Droplet, User } from 'lucide-react';

export default function VitalsPage() {
  const supabase = createClient();
  const db: any = supabase;

  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [type, setType] = useState<'pressure' | 'sugar'>('pressure');
  const [logs, setLogs] = useState<any[]>([]);

  // Input
  const [val1, setVal1] = useState(''); // Systolic or Sugar
  const [val2, setVal2] = useState(''); // Diastolic

  useEffect(() => {
    // جلب كل أفراد الأسرة
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await db.from('medical_files').select('id, full_name').eq('user_id', user.id);
      if (data) {
        setMembers(data);
        if (data.length > 0) setSelectedMember(data[0].id);
      }
    }
    getData();
  }, []);

  useEffect(() => {
    if (selectedMember) fetchLogs();
  }, [selectedMember, type]);

  async function fetchLogs() {
    const { data } = await db.from('family_vitals')
      .select('*')
      .eq('medical_file_id', selectedMember)
      .eq('type', type)
      .order('measure_time', { ascending: false });
    if (data) setLogs(data);
  }

  async function handleSave() {
    if (!selectedMember || !val1) return;
    const { data: { user } } = await supabase.auth.getUser();

    const payload = type === 'pressure' 
      ? { systolic: val1, diastolic: val2, type: 'pressure' }
      : { sugar_value: val1, type: 'sugar' };

    await db.from('family_vitals').insert({
      medical_file_id: selectedMember,
      user_id: user?.id,
      ...payload
    });

    setVal1(''); setVal2('');
    fetchLogs();
  }

  return (
    <div className="p-4 max-w-xl mx-auto font-cairo dir-rtl min-h-screen">
      <h1 className="text-xl font-bold text-center mb-6">المؤشرات الحيوية للأسرة</h1>

      <div className="bg-white p-4 rounded-xl border mb-6">
        <label className="flex items-center gap-2 font-bold mb-2 text-gray-700">
           <User size={18}/> اختر الفرد:
        </label>
        <select className="w-full p-3 border rounded-lg" value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
          {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
        </select>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button onClick={() => setType('pressure')} className={`flex-1 py-2 rounded-lg font-bold ${type === 'pressure' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>ضغط الدم</button>
        <button onClick={() => setType('sugar')} className={`flex-1 py-2 rounded-lg font-bold ${type === 'sugar' ? 'bg-white shadow text-pink-600' : 'text-gray-500'}`}>السكر</button>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <div className="flex gap-4 mb-4">
          <input type="number" placeholder={type === 'pressure' ? 'العالي (Systolic)' : 'mg/dL'} className="flex-1 p-3 border rounded-lg text-center text-lg font-bold" value={val1} onChange={e => setVal1(e.target.value)} />
          {type === 'pressure' && (
            <input type="number" placeholder="الواطي (Diastolic)" className="flex-1 p-3 border rounded-lg text-center text-lg font-bold" value={val2} onChange={e => setVal2(e.target.value)} />
          )}
        </div>
        <button onClick={handleSave} className={`w-full py-3 rounded-lg font-bold text-white ${type === 'pressure' ? 'bg-blue-600' : 'bg-pink-600'}`}>تسجيل القراءة</button>
      </div>

      <div className="space-y-3">
        {logs.map((log: any) => (
          <div key={log.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
            <span className="text-gray-500 text-sm">{new Date(log.measure_time).toLocaleDateString('ar-EG')} {new Date(log.measure_time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
            <span className="text-xl font-bold dir-ltr">
              {log.type === 'pressure' ? `${log.systolic}/${log.diastolic}` : `${log.sugar_value} mg`}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
