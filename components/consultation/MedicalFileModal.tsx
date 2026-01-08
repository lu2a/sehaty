'use client';
import { X, User, Activity, AlertCircle } from 'lucide-react';

export default function MedicalFileModal({ file, onClose }: { file: any, onClose: () => void }) {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User size={20}/> الملف الطبي: {file.full_name}
          </h2>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 overflow-y-auto font-cairo dir-rtl space-y-6 bg-slate-50 flex-1">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm text-center border">
              <span className="text-gray-400 text-xs block">العمر</span>
              <span className="font-bold text-lg">{new Date().getFullYear() - new Date(file.birth_date).getFullYear()} سنة</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm text-center border">
              <span className="text-gray-400 text-xs block">فصيلة الدم</span>
              <span className="font-bold text-lg text-red-600">{file.blood_type || '--'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm text-center border">
              <span className="text-gray-400 text-xs block">الوزن</span>
              <span className="font-bold text-lg">{file.weight || '--'} كجم</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm text-center border">
              <span className="text-gray-400 text-xs block">الطول</span>
              <span className="font-bold text-lg">{file.height || '--'} سم</span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
              <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2"><AlertCircle size={18}/> الأمراض المزمنة</h3>
              <p className="text-gray-700">{file.chronic_diseases ? 'يوجد' : 'لا يوجد'}</p>
              {file.chronic_diseases_details && <p className="bg-red-50 p-3 rounded-lg mt-2 text-sm text-red-800">{file.chronic_diseases_details}</p>}
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
              <h3 className="font-bold text-blue-700 mb-3 flex items-center gap-2"><Activity size={18}/> العمليات السابقة</h3>
              <p className="text-gray-700">{file.surgeries || 'لا يوجد'}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-white flex justify-end">
          <button onClick={onClose} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold hover:bg-gray-200">
            إغلاق والعودة
          </button>
        </div>
      </div>
    </div>
  );
}
