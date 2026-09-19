import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, 
  Shield, 
  GraduationCap, 
  UserCheck, 
  Search, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  AlertCircle,
  KeyRound
} from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Add / Provision Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [provisionForm, setProvisionForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'faculty',
    designation: 'Associate Professor',
    employee_code: ''
  });
  const [addError, setAddError] = useState('');
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'student',
    status: 'active',
    password: '',
    roll_number: '',
    cgpa: 8.0,
    graduation_year: 2026,
    designation: '',
    employee_code: ''
  });
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Modal
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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

  // Add user submit
  const handleProvision = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSubmitting(true);
    try {
      await api.post('/admin/users', provisionForm);
      setIsAddModalOpen(false);
      setProvisionForm({
        name: '',
        email: '',
        password: '',
        role: 'faculty',
        designation: 'Associate Professor',
        employee_code: ''
      });
      fetchUsers();
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Failed to provision user');
    } finally {
      setAddSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditError('');
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'student',
      status: user.status || 'active',
      password: '',
      roll_number: user.roll_number || '',
      cgpa: user.cgpa ?? 8.0,
      graduation_year: user.graduation_year || 2026,
      designation: user.designation || '',
      employee_code: user.employee_code || ''
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');
    setEditSubmitting(true);
    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status
      };
      if (editForm.password && editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }
      if (editForm.role === 'student') {
        payload.roll_number = editForm.roll_number;
        payload.cgpa = Number(editForm.cgpa);
        payload.graduation_year = Number(editForm.graduation_year);
      } else if (editForm.role === 'faculty') {
        payload.designation = editForm.designation;
        payload.employee_code = editForm.employee_code;
      }

      await api.put(`/admin/users/${editingUser.id}`, payload);
      setIsEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Submit Delete
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteError('');
    setDeleteSubmitting(true);
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setDeleteError(err.response?.data?.detail || 'Failed to delete user');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.roll_number?.toLowerCase().includes(q) ||
      u.employee_code?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Institutional User Directory
          </h2>
          <p className="text-xs text-slate-500">
            Create, update, and manage access privileges across Students, Faculty Mentors, and Administrators
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setRoleFilter('')}
              className={`px-3 py-1.5 rounded-lg transition ${roleFilter === '' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
            >
              All
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

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Provision Staff
          </button>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, roll no..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">User Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Details</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
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
                      <td className="py-3 text-slate-600">
                        {isStudent && (
                          <span>{u.roll_number || 'No Roll'} • CGPA: {u.cgpa ?? 'N/A'}</span>
                        )}
                        {isFaculty && (
                          <span>{u.designation || 'Faculty'} {u.employee_code ? `(${u.employee_code})` : ''}</span>
                        )}
                        {!isStudent && !isFaculty && (
                          <span className="text-slate-400">Institutional Admin</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                          u.status === 'inactive' ? 'text-slate-400' : 'text-emerald-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'inactive' ? 'bg-slate-400' : 'bg-emerald-500'
                          }`}></span>
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(u);
                              setDeleteError('');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Provision Institutional Staff</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {addError}
              </div>
            )}

            <form onSubmit={handleProvision} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={provisionForm.name}
                  onChange={(e) => setProvisionForm({ ...provisionForm, name: e.target.value })}
                  placeholder="Prof. Alan Turing"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={provisionForm.email}
                  onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
                  placeholder="a.turing@apex.edu"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={provisionForm.role}
                    onChange={(e) => setProvisionForm({ ...provisionForm, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="faculty">Faculty Mentor</option>
                    <option value="admin">Admin / TPO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={provisionForm.password}
                    onChange={(e) => setProvisionForm({ ...provisionForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {provisionForm.role === 'faculty' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={provisionForm.designation}
                      onChange={(e) => setProvisionForm({ ...provisionForm, designation: e.target.value })}
                      placeholder="Associate Professor"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Code</label>
                    <input
                      type="text"
                      value={provisionForm.employee_code}
                      onChange={(e) => setProvisionForm({ ...provisionForm, employee_code: e.target.value })}
                      placeholder="FAC-CSE-109"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition disabled:opacity-50"
                >
                  {addSubmitting ? 'Provisioning...' : 'Confirm Provisioning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit User Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Mentor</option>
                    <option value="admin">Admin / TPO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Student specific */}
              {editForm.role === 'student' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={editForm.roll_number}
                      onChange={(e) => setEditForm({ ...editForm, roll_number: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.cgpa}
                      onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Grad Year</label>
                    <input
                      type="number"
                      value={editForm.graduation_year}
                      onChange={(e) => setEditForm({ ...editForm, graduation_year: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* Faculty specific */}
              {editForm.role === 'faculty' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={editForm.designation}
                      onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Code</label>
                    <input
                      type="text"
                      value={editForm.employee_code}
                      onChange={(e) => setEditForm({ ...editForm, employee_code: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* Optional Password Reset */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  Reset Password (Leave blank to keep unchanged)
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="New password (optional)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition disabled:opacity-50"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete User Account</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to permanently delete <strong>{userToDelete.name}</strong> ({userToDelete.email})? This will also remove associated student/faculty profile records.
            </p>

            {deleteError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {deleteError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition disabled:opacity-50"
              >
                {deleteSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
