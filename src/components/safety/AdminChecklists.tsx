import React, { useState } from 'react';
import { useSafety, Checklist, Question, QuestionType } from '@/contexts/SafetyContext';
import { Plus, Pencil, Trash2, X, Search, ListChecks, ToggleLeft, ToggleRight, GripVertical, ChevronDown } from 'lucide-react';

const uid = () => Math.random().toString(36).slice(2, 10);

const AdminChecklists: React.FC = () => {
  const { checklists, modules, machines, departments, addChecklist, updateChecklist, deleteChecklist, toggleChecklist } = useSafety();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Checklist | null>(null);
  const [search, setSearch] = useState('');
  const [filterMod, setFilterMod] = useState<string>('all');

  const blank: Omit<Checklist, 'id' | 'createdAt'> = {
    title: '', module: modules[0]?.name || '', subModule: modules[0]?.subModules[0]?.name || '',
    machineCode: '', department: '', questions: [], isActive: true,
  };
  const [form, setForm] = useState<Omit<Checklist, 'id' | 'createdAt'>>(blank);

  const subModulesForMod = modules.find(m => m.name === form.module)?.subModules || [];

  const filtered = checklists.filter(c =>
    (filterMod === 'all' || c.module === filterMod) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const open = (c?: Checklist) => {
    if (c) { setEditing(c); setForm({ ...c }); }
    else {
      setEditing(null);
      setForm({
        title: '', module: modules[0]?.name || '', subModule: modules[0]?.subModules[0]?.name || '',
        machineCode: '', department: '', questions: [], isActive: true,
      });
    }
    setShowModal(true);
  };

  const addQuestion = () => {
    setForm(f => ({
      ...f,
      questions: [...f.questions, { id: uid(), text: '', type: 'ok_notok', required: true }],
    }));
  };

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    setForm(f => ({ ...f, questions: f.questions.map(q => q.id === id ? { ...q, ...patch } : q) }));
  };
  const removeQuestion = (id: string) => {
    setForm(f => ({ ...f, questions: f.questions.filter(q => q.id !== id) }));
  };
  const moveQuestion = (idx: number, dir: -1 | 1) => {
    setForm(f => {
      const q = [...f.questions];
      const j = idx + dir;
      if (j < 0 || j >= q.length) return f;
      [q[idx], q[j]] = [q[j], q[idx]];
      return { ...f, questions: q };
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.questions.length === 0) {
      alert('Add at least one question'); return;
    }
    if (editing) updateChecklist(editing.id, form);
    else addChecklist(form);
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] rounded-xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="w-5 h-5 text-orange-300" />
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">Dynamic Checklist Engine</span>
            </div>
            <h2 className="text-xl font-bold mb-1">Build & manage safety checklists</h2>
            <p className="text-blue-200 text-sm">Add questions of any type. Changes reflect instantly to users — no code changes required.</p>
          </div>
          <button onClick={() => open()} className="bg-orange-500 hover:bg-orange-600 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" /> New Checklist
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search checklists..." className="bg-transparent outline-none text-sm flex-1" />
        </div>
        <select value={filterMod} onChange={e => setFilterMod(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
          <option value="all">All Modules</option>
          {modules.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {filtered.map(c => (
          <div key={c.id} className={`bg-white rounded-xl border p-5 hover:shadow-md transition ${c.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">{c.module}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-700">{c.subModule}</span>
                  {c.machineCode && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-700">{c.machineCode}</span>}
                </div>
                <h3 className="font-bold text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{c.questions.length} questions • Created {new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => toggleChecklist(c.id)} className="p-1" title={c.isActive ? 'Disable' : 'Enable'}>
                {c.isActive ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-1 mb-4 max-h-24 overflow-hidden">
              {c.questions.slice(0, 3).map((q, i) => (
                <div key={q.id} className="flex gap-2"><span className="text-slate-400">{i + 1}.</span> <span className="truncate">{q.text}</span></div>
              ))}
              {c.questions.length > 3 && <div className="text-slate-400">+ {c.questions.length - 3} more...</div>}
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => open(c)} className="flex-1 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
              <button onClick={() => { if (confirm('Delete checklist?')) deleteChecklist(c.id); }} className="px-3 py-2 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-lg">{editing ? 'Edit Checklist' : 'Create Checklist'}</h3>
                <p className="text-xs text-slate-500">Build dynamic safety checklists with custom questions</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase">Title</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Daily Forklift Pre-Operation Checklist" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">Module</label>
                  <select value={form.module} onChange={e => {
                    const newMod = e.target.value;
                    const firstSub = modules.find(m => m.name === newMod)?.subModules[0]?.name || '';
                    setForm({ ...form, module: newMod, subModule: firstSub });
                  }} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {modules.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">Submodule</label>
                  <select value={form.subModule} onChange={e => setForm({ ...form, subModule: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {subModulesForMod.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">Machine (Optional)</label>
                  <select value={form.machineCode || ''} onChange={e => setForm({ ...form, machineCode: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="">Any Machine</option>
                    {machines.map(m => <option key={m.id} value={m.code}>{m.code} - {m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">Department (Optional)</label>
                  <select value={form.department || ''} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="">Any Department</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm font-semibold">Active (visible to users)</span>
              </label>

              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900">Questions <span className="text-slate-400 font-normal">({form.questions.length})</span></h4>
                  <button type="button" onClick={addQuestion} className="bg-[#1e3a5f] text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Question
                  </button>
                </div>
                {form.questions.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-500">
                    No questions yet. Click "Add Question" to start building your checklist.
                  </div>
                )}
                <div className="space-y-3">
                  {form.questions.map((q, idx) => (
                    <div key={q.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col gap-1 pt-2">
                          <button type="button" onClick={() => moveQuestion(idx, -1)} className="text-slate-400 hover:text-slate-600 text-xs">▲</button>
                          <span className="text-xs text-slate-400 font-mono">{idx + 1}</span>
                          <button type="button" onClick={() => moveQuestion(idx, 1)} className="text-slate-400 hover:text-slate-600 text-xs">▼</button>
                        </div>
                        <div className="flex-1 space-y-2">
                          <input required value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })} placeholder="Question text..." className="w-full px-3 py-2 border border-slate-200 rounded text-sm bg-white" />
                          <div className="flex flex-wrap gap-2 items-center">
                            <select value={q.type} onChange={e => updateQuestion(q.id, { type: e.target.value as QuestionType, options: e.target.value === 'dropdown' ? (q.options || ['']) : undefined })} className="px-2 py-1 border border-slate-200 rounded text-xs bg-white">
                              <option value="ok_notok">OK / NOT OK</option>
                              <option value="dropdown">Dropdown</option>
                              <option value="text">Text Field</option>
                            </select>
                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                              <input type="checkbox" checked={q.required} onChange={e => updateQuestion(q.id, { required: e.target.checked })} />
                              Required
                            </label>
                            {q.type === 'dropdown' && (
                              <div className="flex-1 space-y-1">
                                {(q.options || []).map((opt, optIdx) => (
                                  <div key={optIdx} className="flex gap-1 items-center">
                                    <input
                                      value={opt}
                                      onChange={e => {
                                        const newOpts = [...(q.options || [])];
                                        newOpts[optIdx] = e.target.value;
                                        updateQuestion(q.id, { options: newOpts });
                                      }}
                                      placeholder={`Option ${optIdx + 1}`}
                                      className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newOpts = (q.options || []).filter((_, i) => i !== optIdx);
                                        updateQuestion(q.id, { options: newOpts });
                                      }}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newOpts = [...(q.options || []), ''];
                                    updateQuestion(q.id, { options: newOpts });
                                  }}
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  <Plus className="w-3 h-3" /> Add Option
                                </button>
                              </div>
                            )}
                            <button type="button" onClick={() => removeQuestion(q.id)} className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-semibold">{editing ? 'Update Checklist' : 'Create Checklist'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChecklists;
