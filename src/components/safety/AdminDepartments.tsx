import React, { useState } from 'react';
import { useSafety, Department } from '@/contexts/SafetyContext';
import { Plus, Trash2, Pencil, Building2, X } from 'lucide-react';

const AdminDepartments: React.FC = () => {
  const { departments, users, machines, addDepartment, updateDepartment, deleteDepartment } = useSafety();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const blank = { name: '', code: '', manager: '' };
  const [form, setForm] = useState(blank);

  const open = (d?: Department) => {
    if (d) { setEditing(d); setForm({ name: d.name, code: d.code, manager: d.manager }); }
    else { setEditing(null); setForm(blank); }
    setShowModal(true);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateDepartment(editing.id, form);
    else addDepartment(form);
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900">Departments</h2>
          <p className="text-sm text-slate-500">Organize teams across the facility</p>
        </div>
        <button onClick={() => open()} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(d => {
          const userCount = users.filter(u => u.department === d.name).length;
          const machineCount = machines.filter(m => m.department === d.name).length;
          return (
            <div key={d.id} className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-mono text-slate-400">{d.code}</span>
              </div>
              <h3 className="font-bold text-slate-900">{d.name}</h3>
              <p className="text-xs text-slate-500">Manager: {d.manager}</p>
              <div className="flex gap-4 mt-3 text-xs">
                <div><span className="font-bold text-slate-900">{userCount}</span> <span className="text-slate-500">users</span></div>
                <div><span className="font-bold text-slate-900">{machineCount}</span> <span className="text-slate-500">machines</span></div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <button onClick={() => open(d)} className="flex-1 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
                <button onClick={() => { if (confirm('Delete?')) deleteDepartment(d.id); }} className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg">{editing ? 'Edit' : 'Add'} Department</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Department Name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Code</label>
                <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Manager</label>
                <input required value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-semibold">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartments;
