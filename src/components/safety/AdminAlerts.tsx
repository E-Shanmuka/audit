import React, { useMemo, useState } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Plus, Pencil, Trash2, X, Search, AlertTriangle } from 'lucide-react';

const AdminAlerts: React.FC = () => {
  const { alertRules, addAlertRule, updateAlertRule, deleteAlertRule, machines, modules, departments, checklists } = useSafety();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    machineCode: '',
    module: modules[0]?.name || '',
    subModule: modules[0]?.subModules[0]?.name || '',
    department: departments[0]?.name || '',
    isActive: true,
  });

  const moduleMap = useMemo(() => {
    return modules.reduce<Record<string, any[]>>((acc, mod) => {
      acc[mod.name] = mod.subModules || [];
      return acc;
    }, {});
  }, [modules]);

  const filtered = alertRules.filter(rule =>
    rule.department.toLowerCase().includes(search.toLowerCase()) ||
    rule.module.toLowerCase().includes(search.toLowerCase()) ||
    rule.subModule.toLowerCase().includes(search.toLowerCase()) ||
    (rule.machineCode || '').toLowerCase().includes(search.toLowerCase())
  );

  const open = (rule?: typeof form & { id?: string }) => {
    if (rule) {
      setEditingId(rule.id || null);
      setForm({
        machineCode: rule.machineCode || '',
        module: rule.module,
        subModule: rule.subModule,
        department: rule.department,
        isActive: rule.isActive,
      });
    } else {
      setEditingId(null);
      setForm({
        machineCode: '',
        module: modules[0]?.name || '',
        subModule: modules[0]?.subModules[0]?.name || '',
        department: departments[0]?.name || '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      machineCode: form.machineCode || undefined,
      module: form.module,
      subModule: form.subModule,
      department: form.department,
      isActive: form.isActive,
    };
    if (editingId) {
      await updateAlertRule(editingId, payload);
    } else {
      await addAlertRule(payload);
    }
    setShowModal(false);
  };

  const availableSubmodules = moduleMap[form.module] || [];
  const checklistCount = checklists.filter(c => c.module === form.module && c.subModule === form.subModule).length;

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] rounded-xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-300" />
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">Department Alerts</span>
            </div>
            <h2 className="text-xl font-bold mb-1">Assign modules, submodules and machines to departments</h2>
            <p className="text-blue-200 text-sm">When audited checklist answers are NOT OK, these rules determine which department users receive notifications.</p>
          </div>
          <button onClick={() => open()} className="bg-orange-500 hover:bg-orange-600 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" /> New Alert Rule
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alert rules..." className="bg-transparent outline-none text-sm flex-1" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {filtered.map(rule => (
          <div key={rule.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">{rule.department}</div>
                <h3 className="font-bold text-slate-900">{rule.module} / {rule.subModule}</h3>
                {rule.machineCode && <div className="text-xs text-slate-500 mt-1">Machine: {rule.machineCode}</div>}
                <div className="text-xs text-slate-500 mt-1">Checklists: {checklists.filter(c => c.module === rule.module && c.subModule === rule.subModule && (!rule.machineCode || c.machineCode === rule.machineCode)).length}</div>
              </div>
              <div className={`text-xs font-semibold px-2 py-1 rounded ${rule.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {rule.isActive ? 'Active' : 'Paused'}
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => open(rule)} className="flex-1 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50">Edit</button>
              <button onClick={() => { if (confirm('Delete this alert rule?')) deleteAlertRule(rule.id); }} className="px-3 py-2 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{editingId ? 'Edit Alert Rule' : 'New Alert Rule'}</h3>
                <p className="text-sm text-slate-500">Select which department gets alerts for this module/submodule.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">Module</label>
                  <select value={form.module} onChange={e => setForm({ ...form, module: e.target.value, subModule: moduleMap[e.target.value]?.[0]?.name || '' })} className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {modules.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">Submodule</label>
                  <select value={form.subModule} onChange={e => setForm({ ...form, subModule: e.target.value })} className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {availableSubmodules.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">Department</label>
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">Machine Code (optional)</label>
                  <select value={form.machineCode} onChange={e => setForm({ ...form, machineCode: e.target.value })} className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="">Any Machine</option>
                    {machines.map(m => <option key={m.id} value={m.code}>{m.code} — {m.name}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
                <span>Active rule</span>
              </label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Current checklist count for this selection: <span className="font-semibold text-slate-900">{checklistCount}</span>
              </div>
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlerts;
