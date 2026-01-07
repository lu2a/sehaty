'use client';

import { useState } from 'react';

export interface DrugItem {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  notes: string;
}

interface Props {
  onSave: (drugs: DrugItem[], notes: string) => void;
  loading: boolean;
}

export default function PrescriptionBuilder({ onSave, loading }: Props) {
  const [drugs, setDrugs] = useState<DrugItem[]>([]);
  const [currentDrug, setCurrentDrug] = useState<DrugItem>({
    name: '', dose: '', frequency: '', duration: '', notes: ''
  });
  const [generalNotes, setGeneralNotes] = useState('');

  const addDrug = () => {
    if (!currentDrug.name) return;
    setDrugs([...drugs, currentDrug]);
    setCurrentDrug({ name: '', dose: '', frequency: '', duration: '', notes: '' });
  };

  const removeDrug = (index: number) => {
    setDrugs(drugs.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mt-6">
      <h3 className="font-bold text-lg mb-4 text-blue-900 border-b pb-2">Rx: تحرير الوصفة الطبية</h3>
      
      {/* نموذج إضافة دواء */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-4 bg-gray-50 p-3 rounded">
        <input 
          placeholder="اسم الدواء (العلمي/التجاري)" 
          className="p-2 border rounded col-span-2"
          value={currentDrug.name}
          onChange={e => setCurrentDrug({...currentDrug, name: e.target.value})}
        />
        <input 
          placeholder="الجرعة (500mg)" 
          className="p-2 border rounded"
          value={currentDrug.dose}
          onChange={e => setCurrentDrug({...currentDrug, dose: e.target.value})}
        />
        <input 
          placeholder="التكرار (كل 8 ساعات)" 
          className="p-2 border rounded"
          value={currentDrug.frequency}
          onChange={e => setCurrentDrug({...currentDrug, frequency: e.target.value})}
        />
        <button 
          onClick={addDrug}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          + إضافة
        </button>
      </div>

      {/* قائمة الأدوية المضافة */}
      {drugs.length > 0 && (
        <div className="mb-4 space-y-2">
          {drugs.map((drug, idx) => (
            <div key={idx} className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
              <div>
                <span className="font-bold">{drug.name}</span>
                <span className="text-sm text-gray-600 mx-2">
                  {drug.dose} | {drug.frequency} | {drug.duration}
                </span>
              </div>
              <button onClick={() => removeDrug(idx)} className="text-red-500 hover:text-red-700 text-sm">حذف</button>
            </div>
          ))}
        </div>
      )}

      {/* ملاحظات عامة */}
      <textarea
        placeholder="توصيات طبية عامة للمريض..."
        className="w-full p-2 border rounded mb-4 h-20"
        value={generalNotes}
        onChange={e => setGeneralNotes(e.target.value)}
      />

      <button 
        onClick={() => onSave(drugs, generalNotes)}
        disabled={loading || drugs.length === 0}
        className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 disabled:bg-gray-300"
      >
        {loading ? 'جاري الحفظ...' : 'حفظ وإصدار الوصفة'}
      </button>
    </div>
  );
}