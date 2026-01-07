'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import ImageUpload from '@/components/ui/ImageUpload';

export default function AdminDoctors() {
  const supabase = createClient();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); // للمستخدمين المراد ترقيتهم
  const [clinics, setClinics] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // النموذج الشامل (تم إضافة الكود السري والدور)
  const initialForm = {
    id: '', // user_id
    clinic_id: '',
    specialty: '',
    doctor_number: '',
    national_id: '',
    secret_code: '', // <-- جديد: الكود السري
    role: 'doctor',  // <-- جديد: الدور (افتراضي طبيب)
    bio: '',
    qualifications: '',
    trainings: '',
    experience_years: 0,
    consultation_rate: 0,
    shift: '',
    image_url: ''
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. جلب الأطباء الحاليين
    const { data: docs } = await supabase
      .from('doctors')
      .select(`*, profiles(full_name, email, role), clinics(name)`) // نجلب الدور من profiles
      .order('created_at');
    if (docs) setDoctors(docs);

    // 2. جلب العيادات
    const { data: cls } = await supabase.from('clinics').select('*');
    if (cls) setClinics(cls);

    // 3. جلب المستخدمين العاديين
    const { data: usrs } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'doctor')
      .limit(20);
    if (usrs) setUsers(usrs);
  };

  const handleSave = async () => {
    // التحقق من الحقول الأساسية
    if (!formData.id) { alert('يجب اختيار المستخدم'); return; }
    if (formData.secret_code && formData.secret_code.length !== 6) {
        alert('الكود السري يجب أن يكون 6 أرقام'); return;
    }

    // 1. تحديث دور المستخدم في profiles (إذا تغير)
    // @ts-ignore
    await supabase.from('profiles').update({ role: formData.role }).eq('id', formData.id);

    // 2. الإدراج أو التحديث في جدول doctors
    const updateData: any = {
      id: formData.id,
      clinic_id: formData.clinic_id || null,
      specialty: formData.specialty,
      doctor_number: formData.doctor_number,
      national_id: formData.national_id,
      bio: formData.bio,
      qualifications: formData.qualifications,
      trainings: formData.trainings,
      experience_years: formData.experience_years,
      consultation_rate: formData.consultation_rate,
      image_url: formData.image_url,
      shift: formData.shift
    };

    // تحديث الكود السري فقط إذا تم إدخاله (لتجنب مسحه عند التعديل إذا ترك فارغاً)
    if (formData.secret_code) {
        updateData.secret_code = formData.secret_code;
    }

    // @ts-ignore
    const { error } = await supabase.from('doctors').upsert(updateData);

    if (!error) {
      alert('تم حفظ بيانات الطبيب بنجاح ✅');
      setShowAddModal(false);
      setEditingId(null);
      fetchData();
    } else {
      alert('خطأ: ' + error.message);
    }
  };

  const openEdit = (doc: any) => {
    setFormData({
      id: doc.id,
      clinic_id: doc.clinic_id || '',
      specialty: doc.specialty || '',
      doctor_number: doc.doctor_number || '',
      national_id: doc.national_id || '',
      secret_code: doc.secret_code || '', // إظهار الكود الحالي (أو تركه فارغاً للأمان)
      role: doc.profiles.role || 'doctor', // جلب الدور الحالي
      bio: doc.bio || '',
      qualifications: doc.qualifications || '',
      trainings: doc.trainings || '',
      experience_years: doc.experience_years || 0,
      consultation_rate: doc.consultation_rate || 0,
      shift: doc.shift || '',
      image_url: doc.image_url || ''
    });
    setEditingId(doc.id);
    setShowAddModal(true);
  };

  const openAdd = () => {
    setFormData(initialForm);
    setEditingId(null);
    setShowAddModal(true);
  };

  return (
    <div className="p-6 dir-rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">👨‍⚕️ سجل الأطباء الشامل</h1>
        <button onClick={openAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 shadow">
          + إضافة طبيب جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-right whitespace-nowrap">
          <thead className="bg-gray-50 text-sm font-bold text-gray-600">
            <tr>
              <th className="p-4">صورة</th>
              <th className="p-4">الاسم / التخصص</th>
              <th className="p-4">الرقم القومي</th>
              <th className="p-4">الكود السري</th>
              <th className="p-4">الدور</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {doctors.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <img src={doc.image_url || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-full object-cover border" alt="doc" />
                </td>
                <td className="p-4">
                  <div className="font-bold">{doc.profiles?.full_name}</div>
                  <div className="text-xs text-gray-500">{doc.specialty || 'عام'}</div>
                </td>
                <td className="p-4 font-mono">{doc.national_id || '-'}</td>
                <td className="p-4 font-mono text-xs bg-gray-100 rounded px-2 w-fit">
                  {doc.secret_code ? '******' : <span className="text-red-500">غير معين</span>}
                </td>
                <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${doc.profiles?.role === 'dept_head' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                        {doc.profiles?.role === 'dept_head' ? 'رئيس قسم' : 'طبيب'}
                    </span>
                </td>
                <td className="p-4">
                  <button onClick={() => openEdit(doc)} className="text-blue-600 font-bold text-sm hover:underline">تعديل كامل ✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl p-6 shadow-2xl my-10">
            <h2 className="text-xl font-bold mb-6 border-b pb-2">
              {editingId ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد (ترقية مستخدم)'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* القسم الأمني (الهام جداً) */}
              <div className="col-span-full bg-red-50 p-4 rounded border border-red-100 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                 <h3 className="col-span-full text-red-800 font-bold text-sm">🔒 بيانات الدخول والتحقق</h3>
                 
                 <div>
                    <label className="block text-sm font-bold mb-1">الرقم القومي <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full p-2 border rounded font-mono" value={formData.national_id} onChange={e => setFormData({...formData, national_id: e.target.value})} placeholder="الرقم القومي للتحقق" />
                 </div>

                 <div>
                    <label className="block text-sm font-bold mb-1">الكود السري (6 أرقام) <span className="text-red-500">*</span></label>
                    <input type="text" maxLength={6} className="w-full p-2 border rounded font-mono tracking-widest" value={formData.secret_code} onChange={e => setFormData({...formData, secret_code: e.target.value})} placeholder="******" />
                 </div>

                 <div>
                    <label className="block text-sm font-bold mb-1">الصلاحية (الدور)</label>
                    <select className="w-full p-2 border rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="doctor">طبيب معالج</option>
                        <option value="dept_head">رئيس قسم (استشاري)</option>
                    </select>
                 </div>
              </div>

              {!editingId && (
                <div className="col-span-full bg-blue-50 p-4 rounded border border-blue-100">
                  <label className="block font-bold mb-2">اختر المستخدم لترقيته لطبيب</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={formData.id}
                    onChange={e => setFormData({...formData, id: e.target.value})}
                  >
                    <option value="">-- اختر من القائمة --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* باقي البيانات المهنية (كما هي) */}
              <div>
                <label className="block text-sm font-bold mb-1">الرقم الوظيفي</label>
                <input type="text" className="w-full p-2 border rounded" value={formData.doctor_number} onChange={e => setFormData({...formData, doctor_number: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">العيادة</label>
                <select className="w-full p-2 border rounded" value={formData.clinic_id} onChange={e => setFormData({...formData, clinic_id: e.target.value})}>
                  <option value="">اختر العيادة...</option>
                  {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">التخصص الدقيق</label>
                <input type="text" className="w-full p-2 border rounded" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-bold mb-1">نبذة تعريفية (Bio)</label>
                <textarea className="w-full p-2 border rounded h-20" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">المؤهلات العلمية</label>
                <textarea className="w-full p-2 border rounded" placeholder="مثال: دكتوراه في الباطنة..." value={formData.qualifications} onChange={e => setFormData({...formData, qualifications: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">الدورات التدريبية</label>
                <textarea className="w-full p-2 border rounded" value={formData.trainings} onChange={e => setFormData({...formData, trainings: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">سنوات الخبرة</label>
                <input type="number" className="w-full p-2 border rounded" value={formData.experience_years} onChange={e => setFormData({...formData, experience_years: parseInt(e.target.value)})} />
              </div>
               <div>
                <label className="block text-sm font-bold mb-1">سعر الاستشارة</label>
                <input type="number" className="w-full p-2 border rounded" value={formData.consultation_rate} onChange={e => setFormData({...formData, consultation_rate: parseFloat(e.target.value)})} />
              </div>
              
               <div>
                <label className="block text-sm font-bold mb-1">مواعيد العمل (Shift)</label>
                <input type="text" className="w-full p-2 border rounded" placeholder="09:00 - 17:00" value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-bold mb-2">صورة الطبيب</label>
                <div className="flex items-center gap-4">
                  {formData.image_url && <img src={formData.image_url} className="w-16 h-16 rounded-full object-cover" alt="preview" />}
                  <div className="flex-1">
                     <ImageUpload onUploadComplete={(urls) => setFormData({...formData, image_url: urls[0]})} />
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-8 flex justify-end gap-4 border-t pt-4">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-2 rounded text-gray-600 hover:bg-gray-100 font-bold">إلغاء</button>
              <button onClick={handleSave} className="bg-blue-900 text-white px-8 py-2 rounded font-bold hover:bg-blue-800 shadow-lg">حفظ البيانات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
