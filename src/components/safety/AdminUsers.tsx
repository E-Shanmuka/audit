import React, { useState } from 'react';
import { useSafety, User } from '@/contexts/SafetyContext';
import { Plus, Pencil, Trash2, X, Search, UserCog, ChevronRight, ChevronDown } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const { users, departments, addUser, updateUser, deleteUser } = useSafety();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [expandedFilter, setExpandedFilter] = useState<string | null>('roles');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const blank = { name: '', email: '', password: '', role: 'user' as const, department: departments[0]?.name || '', employeeId: '', phone: '', active: true };
  const [form, setForm] = useState(blank);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchRole = !selectedRole || u.role === selectedRole;
    const matchDept = !selectedDept || u.department === selectedDept;
    const matchStatus = selectedStatus === null || (selectedStatus === 'active' ? u.active : !u.active);
    return matchSearch && matchRole && matchDept && matchStatus;
  });

  const roleOptions = ['user', 'auditor', 'supervisor', 'admin'];
  const deptOptions = departments.map(d => d.name);
  const statusOptions = [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }];

  const roleStats = roleOptions.map(r => ({ role: r, count: users.filter(u => u.role === r).length }));
  const deptStats = deptOptions.map(d => ({ dept: d, count: users.filter(u => u.department === d).length }));

  const open = (u?: User) => {
    if (u) { setEditing(u); setForm({ ...u }); }
    else { setEditing(null); setForm(blank); }
    setShowModal(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateUser(editing.id, form);
    else addUser(form);
    setShowModal(false);
  };

  return (
    <div className="flex gap-6 min-h-screen">
      {/* Sidebar Filters */}
      <div className="w-64 space-y-3">
        {/* Roles Filter */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <button onClick={() => setExpandedFilter(expandedFilter === 'roles' ? null : 'roles')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-900">
            <span>User Roles</span>
            {expandedFilter === 'roles' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {expandedFilter === 'roles' && (
            <div className="border-t border-slate-200 divide-y divide-slate-200">
              {roleOptions.map(role => {
                const count = users.filter(u => u.role === role).length;
                return (
                  <button key={role} onClick={() => setSelectedRole(selectedRole === role ? null : role)} className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${selectedRole === role ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50'}`}>
                    <span className="capitalize">{role}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedRole === role ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Department Filter */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <button onClick={() => setExpandedFilter(expandedFilter === 'dept' ? null : 'dept')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-900">
            <span>Department</span>
            {expandedFilter === 'dept' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {expandedFilter === 'dept' && (
            <div className="border-t border-slate-200 divide-y divide-slate-200">
              {deptOptions.map(dept => {
                const count = users.filter(u => u.department === dept).length;
                return (
                  <button key={dept} onClick={() => setSelectedDept(selectedDept === dept ? null : dept)} className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${selectedDept === dept ? 'bg-purple-50 text-purple-900' : 'hover:bg-slate-50'}`}>
                    <span>{dept}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedDept === dept ? 'bg-purple-200 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <button onClick={() => setExpandedFilter(expandedFilter === 'status' ? null : 'status')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 font-semibold text-sm text-slate-900">
            <span>Status</span>
            {expandedFilter === 'status' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {expandedFilter === 'status' && (
            <div className="border-t border-slate-200 divide-y divide-slate-200">
              {statusOptions.map(opt => {
                const count = opt.value === 'active' ? users.filter(u => u.active).length : users.filter(u => !u.active).length;
                return (
                  <button key={opt.value} onClick={() => setSelectedStatus(selectedStatus === opt.value ? null : opt.value)} className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${selectedStatus === opt.value ? 'bg-green-50 text-green-900' : 'hover:bg-slate-50'}`}>
                    <span>{opt.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedStatus === opt.value ? 'bg-green-200 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {(selectedRole || selectedDept || selectedStatus) && (
          <button onClick={() => { setSelectedRole(null); setSelectedDept(null); setSelectedStatus(null); }} className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold">
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-5">
      <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="bg-transparent outline-none text-sm flex-1" />
        </div>
        <button onClick={() => open()} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Employee ID</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {u.name.split(' ').map(s => s[0]).slice(0,2).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700">{u.employeeId}</td>
                  <td className="px-5 py-3 text-sm text-slate-700">{u.department}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'supervisor' ? 'bg-blue-100 text-blue-700' :
                      u.role === 'auditor' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role === 'admin' && <UserCog className="w-3 h-3 inline mr-1" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${u.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      ● {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => open(u)} className="p-2 rounded hover:bg-slate-100 text-slate-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm('Delete user?')) deleteUser(u.id); }} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg">{editing ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Employee ID</label>
                  <input required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Gmail Address</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <input type="text" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Department</label>
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'admin' | 'supervisor' | 'auditor' | 'user' })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="user">User</option>
                    <option value="auditor">Auditor</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Mobile Number</label>
                <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </label>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white rounded-lg text-sm font-semibold">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminUsers;
