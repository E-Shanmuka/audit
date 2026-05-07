import React, { useState } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { CheckCircle2, XCircle, Search, Calendar, X, FileSearch } from 'lucide-react';

const AuditHistory: React.FC = () => {
  const { audits, currentUser } = useSafety();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewing, setViewing] = useState<string | null>(null);

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';
  const list = audits;

  const filtered = list.filter(a =>
    (statusFilter === 'all' || a.status === statusFilter) &&
    (a.checklistTitle.toLowerCase().includes(search.toLowerCase()) ||
     a.machineCode.toLowerCase().includes(search.toLowerCase()) ||
     a.userName.toLowerCase().includes(search.toLowerCase()))
  );

  const audit = audits.find(a => a.id === viewing);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 border border-slate-200 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audits..." className="bg-transparent outline-none text-sm flex-1" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
          <option value="all">All Status</option>
          <option value="completed">Passed</option>
          <option value="has_issues">Has Issues</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <FileSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No audits found</p>
            <p className="text-xs text-slate-400 mt-1">Submit your first audit to see it here</p>
          </div>
        )}
        <div className="divide-y divide-slate-100">
          {filtered.map(a => (
            <button key={a.id} onClick={() => setViewing(a.id)} className="w-full p-4 hover:bg-slate-50 text-left flex items-center gap-4">
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${a.status === 'has_issues' ? 'bg-orange-100' : 'bg-emerald-100'}`}>
                {a.status === 'has_issues' ? <XCircle className="w-5 h-5 text-orange-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{a.module}</span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{a.subModule}</span>
                </div>
                <div className="font-semibold text-sm text-slate-900 truncate">{a.checklistTitle}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  <span className="font-mono">{a.machineCode}</span> • {a.userName} • <Calendar className="w-3 h-3 inline" /> {new Date(a.createdAt).toLocaleString()}
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${a.status === 'has_issues' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {a.status === 'has_issues' ? 'Issues' : 'Passed'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {audit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="font-bold text-lg">{audit.checklistTitle}</h3>
                <p className="text-xs text-slate-500">{audit.module} → {audit.subModule}</p>
              </div>
              <button onClick={() => setViewing(null)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Machine</div>
                  <div className="font-mono font-bold text-slate-900">{audit.machineCode}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Auditor</div>
                  <div className="font-bold text-slate-900">{audit.userName}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Shift</div>
                  <div className="font-bold text-slate-900 capitalize">{audit.shift || 'N/A'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Audit Date</div>
                  <div className="font-bold text-slate-900">{audit.auditDate ? new Date(audit.auditDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Submitted</div>
                  <div className="font-bold text-slate-900">{new Date(audit.createdAt).toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Status</div>
                  <div className={`font-bold ${audit.status === 'has_issues' ? 'text-orange-700' : 'text-emerald-700'}`}>{audit.status === 'has_issues' ? 'Has Issues' : 'Passed'}</div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Responses ({audit.answers.length})</h4>
                <div className="space-y-2">
                  {audit.answers.map((a, i) => (
                    <div key={a.questionId} className={`p-3 rounded-lg border ${a.answer === 'NOT OK' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-xs text-slate-500 mb-0.5">Question {i + 1}</div>
                      <div className="font-semibold text-sm text-slate-900 mb-2">{a.question}</div>
                      <div className="text-sm">
                        <span className="font-semibold text-slate-700">Answer: </span>
                        <span className={a.answer === 'NOT OK' ? 'text-red-700 font-bold' : a.answer === 'OK' ? 'text-emerald-700 font-bold' : 'text-slate-900'}>{a.answer || '—'}</span>
                      </div>
                      {a.remark && <div className="text-xs text-slate-600 mt-1"><strong>Remark:</strong> {a.remark}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditHistory;
