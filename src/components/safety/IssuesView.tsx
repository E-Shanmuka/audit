import React, { useState } from 'react';
import { useSafety, Issue } from '@/contexts/SafetyContext';
import { Plus, Trash2, X, Search, AlertTriangle } from 'lucide-react';

const IssuesView: React.FC = () => {
  const { issues, machines, currentUser, addIssue, updateIssue, deleteIssue } = useSafety();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';

  const blank = {
    title: '', description: '', machineCode: machines[0]?.code || '',
    severity: 'medium' as Issue['severity'], status: 'open' as Issue['status'],
  };
  const [form, setForm] = useState(blank);

  const list = issues;

  const filtered = list.filter(i =>
    (statusFilter === 'all' || i.status === statusFilter) &&
    (i.title.toLowerCase().includes(search.toLowerCase()) || i.machineCode.toLowerCase().includes(search.toLowerCase()))
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addIssue({
      ...form,
      reportedBy: currentUser.id,
      reportedByName: currentUser.name,
    });
    setShowModal(false);
    setForm(blank);
  };

  const sevColor = (s: string) => s === 'critical' ? 'bg-red-100 text-red-700 border-red-300' : s === 'high' ? 'bg-orange-100 text-orange-700 border-orange-300' : s === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-blue-100 text-blue-700 border-blue-300';
  const statusColor = (s: string) => s === 'open' ? 'bg-red-100 text-red-700' : s === 'investigating' ? 'bg-orange-100 text-orange-700' : s === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(['all', 'open', 'investigating', 'resolved'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`p-4 rounded-xl border text-left transition ${statusFilter === s ? 'border-[#1e3a5f] bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <div className="text-2xl font-bold text-slate-900">{s === 'all' ? list.length : list.filter(i => i.status === s).length}</div>
            <div className="text-xs text-slate-500 capitalize">{s === 'all' ? 'All Issues' : s}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search issues..." className="bg-transparent outline-none text-sm flex-1" />
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Report Issue
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No issues found</p>
          </div>
        )}
        {filtered.map(i => (
          <div key={i.id} className={`bg-white rounded-xl p-5 border-l-4 border border-slate-200 ${i.severity === 'critical' ? 'border-l-red-500' : i.severity === 'high' ? 'border-l-orange-500' : i.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${sevColor(i.severity)}`}>{i.severity}</span>
                  <span className="text-xs font-mono text-slate-500">{i.machineCode}</span>
                </div>
                <h3 className="font-bold text-slate-900">{i.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{i.description}</p>
                <div className="text-xs text-slate-400 mt-2 space-y-1">
                  <p>Reported by {i.reportedByName} • {new Date(i.createdAt).toLocaleString()}</p>
                  {i.dueDate && <p>Due: {new Date(i.dueDate).toLocaleDateString()}</p>}
                  {i.resolvedByName && <p>Resolved by {i.resolvedByName} • {i.resolvedAt ? new Date(i.resolvedAt).toLocaleString() : ''}</p>}
                  {i.department && <p className="font-semibold text-slate-600">Department: {i.department}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {isAdmin ? (
                  <select value={i.status} onChange={e => updateIssue(i.id, { status: e.target.value as Issue['status'] })} className={`text-[10px] font-bold uppercase px-2 py-1 rounded border-0 cursor-pointer ${statusColor(i.status)}`}>
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                ) : (
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${statusColor(i.status)}`}>{i.status}</span>
                )}
                {isAdmin && (
                  <button onClick={() => { if (confirm('Delete?')) deleteIssue(i.id); }} className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg">Report Issue</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Title</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Machine</label>
                  <select required value={form.machineCode} onChange={e => setForm({ ...form, machineCode: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {machines.map(m => <option key={m.id} value={m.code}>{m.code} - {m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Severity</label>
                  <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value as Issue['severity'] })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-semibold">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesView;
