'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function UsersManagement() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50); // جلب آخر 50 مستخدم
    
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`هل أنت متأكد من تغيير صلاحية هذا المستخدم إلى ${newRole}؟`)) return;

    // 1. تحديث الصلاحية في جدول profiles
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert('خطأ: ' + error.message);
      return;
    }

    // 2. إذا تمت الترقية لطبيب، يجب إنشاء سجل في جدول doctors
    if (newRole === 'doctor') {
      await supabase
        .from('doctors')
        .insert({ id: userId, is_active: true })
        .select() // للتأكد من عدم التكرار
        .maybeSingle(); 
        // نستخدم maybeSingle أو on conflict في قاعدة البيانات لمنع الأخطاء إذا كان موجوداً
    }

    alert('تم تحديث الصلاحية بنجاح ✅');
    fetchUsers(); // تحديث القائمة
  };

  // فلترة المستخدمين
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 dir-rtl">
      <h1 className="text-2xl font-bold mb-6">إدارة المستخدمين والصلاحيات</h1>

      {/* البحث */}
      <input
        type="text"
        placeholder="بحث بالاسم أو البريد الإلكتروني..."
        className="w-full p-3 border rounded-lg mb-6 bg-white shadow-sm"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="p-4">المستخدم</th>
              <th className="p-4">البريد الإلكتروني</th>
              <th className="p-4">الصلاحية الحالية</th>
              <th className="p-4">إجراءات الترقية</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold">{user.full_name || 'بدون اسم'}</td>
                <td className="p-4 text-gray-600 font-mono text-sm">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button 
                    onClick={() => handleRoleChange(user.id, 'doctor')}
                    className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100 border border-blue-200"
                  >
                    تعيين كطبيب 👨‍⚕️
                  </button>
                  <button 
                    onClick={() => handleRoleChange(user.id, 'dept_head')}
                    className="px-3 py-1 bg-orange-50 text-orange-600 text-xs rounded hover:bg-orange-100 border border-orange-200"
                  >
                    رئيس قسم 👔
                  </button>
                  <button 
                    onClick={() => handleRoleChange(user.id, 'admin')}
                    className="px-3 py-1 bg-purple-50 text-purple-600 text-xs rounded hover:bg-purple-100 border border-purple-200"
                  >
                    مدير عام ⚡
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}