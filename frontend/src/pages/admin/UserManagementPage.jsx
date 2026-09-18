import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Shield, GraduationCap, UserCheck, Search } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const url = roleFilter ? `/admin/users?role=${roleFilter}` : '/admin/users';
      const res = await api.get(url);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Institutional User Directory
          </h2>
          <p className="text-xs text-slate-500">
            Multi-tenant role-based user management across Students, Faculty Mentors, and Administrators
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setRoleFilter('')}
            className={`px-3 py-1.5 rounded-lg transition ${roleFilter === '' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter('student')}
            className={`px-3 py-1.5 rounded-lg transition ${roleFilter === 'student' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
          >
            Students
          </button>
          <button
            onClick={() => setRoleFilter('faculty')}
            className={`px-3 py-1.5 rounded-lg transition ${roleFilter === 'faculty' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
          >
            Faculty
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg transition ${roleFilter === 'admin' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
          >
            Admins
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">User Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isStudent = u.role === 'student';
                const isFaculty = u.role === 'faculty';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-700">
                        {u.name?.[0]}
                      </div>
                      {u.name}
                    </td>
                    <td className="py-3 text-slate-500 font-mono">{u.email}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        isStudent 
                          ? 'bg-purple-100 text-purple-700' 
                          : (isFaculty ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800')
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
