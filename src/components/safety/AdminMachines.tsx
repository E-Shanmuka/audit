import React, { useState } from 'react';
import { useSafety, Machine } from '@/contexts/SafetyContext';
import { Plus, Pencil, Trash2, X, Search, Cog, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import QRCodeLib from 'qrcode';

const AdminMachines: React.FC = () => {
  const { machines, departments, addMachine, updateMachine, deleteMachine } = useSafety();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const blank: Omit<Machine, 'id'> = { code: '', name: '', department: departments[0]?.name || '', location: '', type: '', status: 'operational' };
  const [form, setForm] = useState(blank);

  const filtered = machines.filter(m =>
    (statusFilter === 'all' || m.status === statusFilter) &&
    (m.code.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const open = (m?: Machine) => {
    if (m) { setEditing(m); setForm({ ...m }); }
    else { setEditing(null); setForm(blank); }
    setShowModal(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMachine(editing.id, form);
    else addMachine(form);
    setShowModal(false);
  };

  const downloadQR = async (machineName: string) => {
    try {
      const url = await QRCodeLib.toDataURL(machineName, { width: 256 });
      const link = document.createElement('a');
      link.download = `${machineName}-qr.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = (s: string) =>
    s === 'operational'
      ? 'bg-emerald-100 text-emerald-700'
      : s === 'maintenance'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(['all', 'operational', 'maintenance', 'down'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`p-4 rounded-xl border text-left transition ${statusFilter === s ? 'border-[#1e3a5f] bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <div className="text-2xl font-bold text-slate-900">{s === 'all' ? machines.length : machines.filter(m => m.status === s).length}</div>
            <div className="text-xs text-slate-500 capitalize">{s === 'all' ? 'All Machines' : s}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code or name..." className="bg-transparent outline-none text-sm flex-1" />
        </div>
        <button onClick={() => open()} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Machine
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Cog className="w-5 h-5 text-blue-600" />
                </div>
                <div className="w-12 h-12">
                  <QRCode value={m.name} size={48} />
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${statusColor(m.status)}`}>{m.status}</span>
            </div>
            <div className="text-xs font-mono text-slate-500 mb-1">{m.code}</div>
            <div className="font-bold text-slate-900 mb-1">{m.name}</div>
            <div className="text-xs text-slate-500 space-y-0.5 mb-4">
              <div>{m.type} • {m.department}</div>
              <div className="text-slate-400">{m.location}</div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => open(m)} className="flex-1 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
              <button onClick={() => downloadQR(m.name)} className="px-3 py-1.5 text-xs font-semibold border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1"><Download className="w-3 h-3" /> QR</button>
              <button onClick={() => { if (confirm('Delete machine?')) deleteMachine(m.id); }} className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg">{editing ? 'Edit Machine' : 'Add Machine'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Machine Code</label>
                  <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="MCH-001" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Type</label>
                  <input required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="CNC Machine" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Machine Name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Location</label>
                <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Department</label>
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Machine['status'] })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option value="operational">Operational</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="down">Down</option>
                  </select>
                </div>
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

export default AdminMachines;
