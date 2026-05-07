import React, { useState } from 'react';
import { useSafety, Task } from '@/contexts/SafetyContext';
import { Plus, Trash2, X, Search, Calendar, AlertTriangle } from 'lucide-react';

const AdminTasks: React.FC = () => {
  const { tasks, modules, machines, users, addTask, updateTask, deleteTask } = useSafety();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const blank: Omit<Task, 'id' | 'createdAt'> = {
    title: '', description: '', module: modules[0]?.name || '', subModule: modules[0]?.subModules[0]?.name || '',
    machineCode: machines[0]?.code || '', assignedTo: users.find(u => u.role === 'user')?.id || '',
    assignedToName: users.find(u => u.role === 'user')?.name || '',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    priority: 'medium', status: 'pending',
  };
  const [form, setForm] = useState(blank);
  const subMods = modules.find(m => m.name === form.module)?.subModules || [];

  const filtered = tasks.filter(t =>
    (statusFilter === 'all' || t.status === statusFilter) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.machineCode.toLowerCase().includes(search.toLowerCase()))
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = users.find(x => x.id === form.assignedTo);
    addTask({ ...form, assignedToName: u?.name || form.assignedToName });
    setShowModal(false);
    setForm(blank);
  };

  const prioColor = (p: string) => p === 'critical' ? 'bg-red-100 text-red-700' : p === 'high' ? 'bg-orange-100 text-orange-700' : p === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700';
  const statusColor = (s: string) => s === 'completed' ? 'bg-emerald-100 text-emerald-700' : s === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700';

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="bg-transparent outline-none text-sm flex-1" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Assign Task
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                <th className="px-5 py-3">Task</th>
                <th className="px-5 py-3">Assigned To</th>
                <th className="px-5 py-3">Machine</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-sm text-slate-900">{t.title}</div>
                    <div className="text-xs text-slate-500">{t.module} → {t.subModule}</div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700">{t.assignedToName}</td>
                  <td className="px-5 py-3 text-xs font-mono text-slate-700">{t.machineCode}</td>
                  <td className="px-5 py-3 text-xs text-slate-600"><Calendar className="w-3 h-3 inline mr-1" />{t.dueDate}</td>
                  <td className="px-5 py-3"><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${prioColor(t.priority)}`}>{t.priority}</span></td>
                  <td className="px-5 py-3">
                    <select value={t.status} onChange={e => updateTask(t.id, { status: e.target.value as Task['status'] })} className={`text-[10px] font-bold uppercase px-2 py-1 rounded border-0 cursor-pointer ${statusColor(t.status)}`}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => { if (confirm('Delete task?')) deleteTask(t.id); }} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-500">No tasks found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg">Assign New Task</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Task Title</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Module</label>
                  <select value={form.module} onChange={e => {
                    const newMod = e.target.value;
                    const firstSub = modules.find(m => m.name === newMod)?.subModules[0]?.name || '';
                    setForm({ ...form, module: newMod, subModule: firstSub });
                  }} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {modules.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Submodule</label>
                  <select value={form.subModule} onChange={e => setForm({ ...form, subModule: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {subMods.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Machine</label>
                  <select required value={form.machineCode} onChange={e => setForm({ ...form, machineCode: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {machines.map(m => <option key={m.id} value={m.code}>{m.code} - {m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Assign To</label>
                  <select required value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {users.filter(u => u.active).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Due Date</label>
                  <input type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Task['priority'] })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-semibold">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
