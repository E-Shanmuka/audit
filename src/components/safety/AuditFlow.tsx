import React, { useState, useEffect } from 'react';
import { useSafety, Answer } from '@/contexts/SafetyContext';
import { CheckCircle2, XCircle, ArrowLeft, Send, AlertCircle, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuditFlow: React.FC<{ checklistId: string; machineCode?: string; onDone: () => void; onBack: () => void }> = ({ checklistId, machineCode: propMachineCode, onDone, onBack }) => {
  const { checklists, machines, currentUser, addAudit, addIssue, getAuditsByFilter } = useSafety();
  const cl = checklists.find(c => c.id === checklistId);
  const [machineCode, setMachineCode] = useState(propMachineCode || cl?.machineCode || '');
  const [shift, setShift] = useState('');
  const [auditDate, setAuditDate] = useState('');
  const [answers, setAnswers] = useState<Record<string, { answer: string; remark: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isDateLocked, setIsDateLocked] = useState(false);
  const [loadedAuditExists, setLoadedAuditExists] = useState(false);

  const parseDateInput = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadPrevious = async () => {
    if (!currentUser || !machineCode || !auditDate) return;
    const audits = await getAuditsByFilter({
      checklistId,
      machineCode,
      userId: currentUser.id,
      auditDate,
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = parseDateInput(auditDate);
    const pastDate = selected < today;

    if (audits.length > 0) {
      const latest = audits[0]; // sorted by createdAt desc
      const ans: Record<string, { answer: string; remark: string }> = {};
      cl.questions.forEach(q => {
        const match = latest.answers.find(a => a.questionId === q.id);
        ans[q.id] = { answer: match?.answer || '', remark: match?.remark || '' };
      });
      setAnswers(ans);
      setLoadedAuditExists(true);
    } else {
      setAnswers({});
      setLoadedAuditExists(false);
    }

    setIsDateLocked(pastDate);
  };

  useEffect(() => {
    // Auto-set shift based on current time
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 6 && hour < 14) setShift('morning');
    else if (hour >= 14 && hour < 22) setShift('afternoon');
    else setShift('night');

    // Auto-set audit date to today using local date values
    setAuditDate(formatDateForInput(now));
  }, []);

  useEffect(() => {
    loadPrevious();
  }, [auditDate, machineCode]);

  if (!cl || !currentUser) return null;

  const setAnswer = (qid: string, val: string) => {
    setAnswers(p => ({ ...p, [qid]: { ...(p[qid] || { remark: '' }), answer: val } }));
  };
  const setRemark = (qid: string, val: string) => {
    setAnswers(p => ({ ...p, [qid]: { ...(p[qid] || { answer: '' }), remark: val } }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = parseDateInput(auditDate);

    if (!machineCode) { alert('Please select a machine'); return; }
    if (selected > today) { alert('Future audit dates are not allowed.'); return; }
    if (isDateLocked) { alert('Past audits are view-only and cannot be edited.'); return; }

    // validate required
    for (const q of cl.questions) {
      if (q.required && !answers[q.id]?.answer) {
        alert(`Please answer required question: "${q.text}"`);
        return;
      }
    }

    const finalAnswers: Answer[] = cl.questions.map(q => ({
      questionId: q.id,
      question: q.text,
      answer: answers[q.id]?.answer || '',
      remark: answers[q.id]?.remark || '',
    }));

    const hasIssues = finalAnswers.some(a => a.answer === 'NOT OK');

    addAudit({
      checklistId: cl.id,
      checklistTitle: cl.title,
      module: cl.module,
      subModule: cl.subModule,
      machineCode,
      userId: currentUser.id,
      userName: currentUser.name,
      answers: finalAnswers,
      status: hasIssues ? 'has_issues' : 'completed',
      shift,
      auditDate,
    });

    // Auto-create issues for NOT OK with remarks
    finalAnswers.filter(a => a.answer === 'NOT OK').forEach(a => {
      addIssue({
        title: `Audit Failure: ${a.question.substring(0, 60)}`,
        description: a.remark || 'Marked NOT OK during audit',
        machineCode,
        reportedBy: currentUser.id,
        reportedByName: currentUser.name,
        department: cl.department,
        severity: 'high',
        status: 'open',
      });
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <ClipboardCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Audit Submitted Successfully</h2>
          <p className="text-slate-500 mb-6">Your responses have been saved and admin notified of any issues.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onDone} className="bg-[#1e3a5f] text-white px-6 py-2.5 rounded-lg font-semibold text-sm">Back to Tasks</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2c5282] rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/30 border border-orange-300/30 text-orange-100">{cl.module}</span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-white">{cl.subModule}</span>
        </div>
        <h2 className="text-2xl font-bold mb-1">{cl.title}</h2>
        <p className="text-blue-200 text-sm">Answer all required questions to submit your audit. Auditor: {currentUser.name}</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Employee Name</label>
          <input
            type="text"
            value={currentUser.name}
            readOnly
            className="w-full mt-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Shift</label>
            <select value={shift} onChange={e => setShift(e.target.value)} className="w-full mt-2 px-3 py-2.5 border border-slate-200 rounded-lg text-sm">
              <option value="morning">Morning (6AM-2PM)</option>
              <option value="afternoon">Afternoon (2PM-10PM)</option>
              <option value="night">Night (10PM-6AM)</option>
            </select>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Audit Date</label>
            <input
              type="date"
              value={auditDate}
              max={formatDateForInput(new Date())}
              onChange={e => setAuditDate(e.target.value)}
              className="w-full mt-2 px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
            />
            {isDateLocked && (
              <div className="mt-2 text-xs text-orange-600">Past audit dates are view-only; answers cannot be edited.</div>
            )}
            {isDateLocked && !loadedAuditExists && (
              <div className="mt-2 text-xs text-orange-600">No audit entry exists for this past date.</div>
            )}
            {!isDateLocked && loadedAuditExists && (
              <div className="mt-2 text-xs text-slate-500">Existing audit for today is loaded and can still be updated.</div>
            )}
          </div>
        </div>

        {cl.questions.map((q, idx) => {
          const a = answers[q.id];
          return (
            <div key={q.id} className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 flex-shrink-0">{idx + 1}</div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{q.text} {q.required && <span className="text-red-500">*</span>}</div>
                  <div className="text-xs text-slate-500 mt-0.5 capitalize">{q.type.replace('_', '/')}</div>
                </div>
              </div>

              {q.type === 'ok_notok' && (
                <div className="grid grid-cols-2 gap-2 ml-11">
                  <button type="button" onClick={() => setAnswer(q.id, 'OK')}
                    disabled={isDateLocked}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm border-2 transition ${a?.answer === 'OK' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-300'} ${isDateLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <CheckCircle2 className="w-5 h-5" /> OK
                  </button>
                  <button type="button" onClick={() => setAnswer(q.id, 'NOT OK')}
                    disabled={isDateLocked}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm border-2 transition ${a?.answer === 'NOT OK' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 hover:border-red-300'} ${isDateLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <XCircle className="w-5 h-5" /> NOT OK
                  </button>
                </div>
              )}

              {q.type === 'dropdown' && (
                <select value={a?.answer || ''} onChange={e => setAnswer(q.id, e.target.value)}
                  disabled={isDateLocked}
                  className={`w-full ml-0 px-3 py-2.5 border rounded-lg text-sm ${isDateLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'border-slate-200'}`}>
                  <option value="">Select an option...</option>
                  {(q.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}

              {q.type === 'text' && (
                <textarea value={a?.answer || ''} onChange={e => setAnswer(q.id, e.target.value)}
                  disabled={isDateLocked}
                  rows={3} placeholder="Type your response..."
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${isDateLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200' : 'border-slate-200'}`} />
              )}

              {(q.type === 'ok_notok' || q.type === 'dropdown') && (
                <input value={a?.remark || ''} onChange={e => setRemark(q.id, e.target.value)}
                  disabled={isDateLocked}
                  placeholder={a?.answer === 'NOT OK' ? 'Required: describe the issue...' : 'Add remark (optional)'}
                  className={`w-full mt-3 ml-0 px-3 py-2 border rounded-lg text-sm ${a?.answer === 'NOT OK' ? 'border-red-300 bg-red-50' : 'border-slate-200'} ${isDateLocked ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} />
              )}
            </div>
          );
        })}

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-orange-900">
            <strong>Note:</strong> Any "NOT OK" answer will automatically generate an issue for admin review. Add detailed remarks to help with resolution.
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 flex gap-3">
          <button type="button" onClick={onBack} className="px-6 py-3 border border-slate-200 rounded-lg text-sm font-semibold">Cancel</button>
          <button type="submit" className="flex-1 bg-[#1e3a5f] hover:bg-[#162d4a] text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Submit Audit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuditFlow;
