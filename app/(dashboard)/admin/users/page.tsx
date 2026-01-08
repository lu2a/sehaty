'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  Shield, 
  Stethoscope, 
  User, 
  CheckCircle,
  XCircle,
  Loader2 
} from 'lucide-react';

export default function AdminUsers() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // جلب البيانات من جدول profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    if (error) console.error(error);
    setLoading(false);
  };

  // دالة تغيير الدور (ترقية/تنزيل)
  const updateUserRole = async (userId: string, newRole: string) => {
    const confirmMsg = `هل أنت متأكد من تغيير صلاحية هذا المستخدم إلى ${newRole}؟`;
    if (!confirm(confirmMsg)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      alert('تم تحديث الصلاحية بنجاح ✅');
      fetchUsers(); // تحديث القائمة
    } else {
      alert('حدث خطأ: ' + error.message);
    }
  };

  // تصفية المستخدمين حسب البحث
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Shield size={12}/> مدير</span>;
      case 'doctor': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Stethoscope size={12}/> طبيب</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><User size={12}/> مريض</span>;
    }
  };

  return (
    <div className="p-6 dir-rtl bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-blue-600" /> إدارة المستخدمين
          </h1>
          <p className="text-slate-500 text-sm">عرض وتعديل صلاحيات الأطباء والمرضى</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="بحث بالاسم..." 
            className="w-full pr-10 pl-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="p-4">المستخدم</th>
                <th className="p-4">الصلاحية الحالية</th>
                <th className="p-4">تاريخ الانضمام</th>
                <th className="p-4 text-center">إجراءات الترقية</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> جاري التحميل...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">لا يوجد مستخدمين بهذا الاسم</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{user.full_name || 'بدون اسم'}</div>
                      <div className="text-xs text-slate-400">{user.id}</div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(user.role || 'client')}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      {/* أزرار تغيير الدور */}
                      <button 
                        onClick={() => updateUserRole(user.id, 'client')}
                        title="تحويل لمريض"
                        className={`p-2 rounded-lg border ${user.role === 'client' ? 'bg-gray-200 opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
                        disabled={user.role === 'client'}
                      >
                        <User size={18} />
                      </button>

                      <button 
                        onClick={() => updateUserRole(user.id, 'doctor')}
                        title="ترقية لطبيب"
                        className={`p-2 rounded-lg border ${user.role === 'doctor' ? 'bg-blue-100 text-blue-600 cursor-not-allowed' : 'hover:bg-blue-50 text-blue-600 border-blue-200'}`}
                        disabled={user.role === 'doctor'}
                      >
                        <Stethoscope size={18} />
                      </button>

                      <button 
                        onClick={() => updateUserRole(user.id, 'admin')}
                        title="ترقية لمدير"
                        className={`p-2 rounded-lg border ${user.role === 'admin' ? 'bg-red-100 text-red-600 cursor-not-allowed' : 'hover:bg-red-50 text-red-600 border-red-200'}`}
                        disabled={user.role === 'admin'}
                      >
                        <Shield size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
