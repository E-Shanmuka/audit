import React, { useState } from 'react';
import { useSafety, Module } from '@/contexts/SafetyContext';
import { Plus, Trash2, Layers, ChevronDown, ChevronRight } from 'lucide-react';

const AdminModules: React.FC = () => {
  const { modules, addModule, deleteModule, addSubModule, deleteSubModule } = useSafety();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newMod, setNewMod] = useState({ name: '', description: '', icon: 'Layers' });
  const [subFor, setSubFor] = useState<string | null>(null);
  const [newSub, setNewSub] = useState({ name: '', description: '' });

  const toggle = (id: string) => setExpanded(s => ({ ...s, [id]: !s[id] }));

  const submitMod = (e: React.FormEvent) => {
    e.preventDefault();
    addModule({ ...newMod, subModules: [] });
    setNewMod({ name: '', description: '', icon: 'Layers' });
    setShowAdd(false);
  };

  const submitSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFor) return;
    addSubModule(subFor, newSub);
    setNewSub({ name: '', description: '' });
    setSubFor(null);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900">System Modules</h2>
          <p className="text-sm text-slate-500">Organize safety workflows into modules and submodules</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Module
        </button>
      </div>

      {showAdd && (
        <form onSubmit={submitMod} className="bg-blue-50 rounded-xl p-5 border border-blue-200 space-y-3">
          <h3 className="font-semibold text-slate-900">New Module</h3>
          <input required placeholder="Module name (e.g. EHS Audit)" value={newMod.name} onChange={e => setNewMod({ ...newMod, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input placeholder="Description" value={newMod.description} onChange={e => setNewMod({ ...newMod, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <div className="flex gap-2">
            <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-semibold">Create</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {modules.map(m => (
          <div key={m.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <button onClick={() => toggle(m.id)} className="p-1 hover:bg-slate-100 rounded">
                {expanded[m.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2c5282] flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900">{m.name}</div>
                <div className="text-xs text-slate-500">{m.description} • {m.subModules.length} submodules</div>
              </div>
              <button onClick={() => setSubFor(subFor === m.id ? null : m.id)} className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Plus className="w-3 h-3 inline mr-1" />Submodule
              </button>
              <button onClick={() => { if (confirm('Delete module and all submodules?')) deleteModule(m.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {subFor === m.id && (
              <form onSubmit={submitSub} className="px-4 py-3 bg-blue-50 border-t border-blue-100 flex gap-2">
                <input required placeholder="Submodule name" value={newSub.name} onChange={e => setNewSub({ ...newSub, name: e.target.value })} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <input placeholder="Description" value={newSub.description} onChange={e => setNewSub({ ...newSub, description: e.target.value })} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                <button type="submit" className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-semibold">Add</button>
              </form>
            )}

            {expanded[m.id] && (
              <div className="border-t border-slate-100 divide-y divide-slate-100">
                {m.subModules.length === 0 && <div className="p-4 text-sm text-slate-500 text-center">No submodules yet</div>}
                {m.subModules.map(sm => (
                  <div key={sm.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{sm.name}</div>
                      <div className="text-xs text-slate-500">{sm.description}</div>
                    </div>
                    <button onClick={() => deleteSubModule(m.id, sm.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminModules;
