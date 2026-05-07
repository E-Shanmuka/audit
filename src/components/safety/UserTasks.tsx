import React, { useState } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { ClipboardList, ChevronRight } from 'lucide-react';
import AuditFlow from './AuditFlow';

const UserTasks: React.FC = () => {
  const { modules, currentUser, tasks, checklists } = useSafety();
  const [selectedChecklistId, setSelectedChecklistId] = useState<string>('');

  if (!currentUser) return null;

  const allTasks = tasks.filter(t => t.status !== 'completed');

  const startFromTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    // find checklist matching module + submodule (and machineCode if specified)
    const cl = checklists.find(c =>
      c.isActive && c.module === task.module && c.subModule === task.subModule &&
      (!c.machineCode || c.machineCode === task.machineCode)
    );
    if (!cl) {
      alert('No active checklist available for this task. Please contact your admin.');
      return;
    }
    setSelectedChecklistId(cl.id);
  };

  const reset = () => {
    setSelectedChecklistId('');
  };

  if (selectedChecklistId) {
    const task = tasks.find(t => {
      const cl = checklists.find(c => c.id === selectedChecklistId);
      return cl && t.module === cl.module && t.subModule === cl.subModule && (!cl.machineCode || cl.machineCode === t.machineCode);
    });
    return <AuditFlow checklistId={selectedChecklistId} machineCode={task?.machineCode} onDone={reset} onBack={reset} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-2 text-sm">
        <span className="font-semibold text-[#1e3a5f]">My Tasks</span>
      </div>

      {allTasks.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No tasks found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {allTasks.map(t => (
            <div key={t.id} className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition" title={t.status === 'pending' ? `Pending Task: ${t.title} - Due ${t.dueDate}` : ''}>
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${t.priority === 'critical' ? 'bg-red-100 text-red-700' : t.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{t.priority}</span>
                <span className="text-xs text-slate-500">Due {t.dueDate}</span>
              </div>
              <h4 className="font-bold text-slate-900 mb-1">{t.title}</h4>
              <p className="text-xs text-slate-500 mb-2">{t.description}</p>
              <div className="text-xs text-slate-600 mb-2">
                <span className="font-mono">{t.machineCode}</span> • {t.module} → {t.subModule}
              </div>
              <div className="text-xs text-slate-500 mb-3">
                Assigned to: {t.assignedToName}
              </div>
              {t.assignedTo === currentUser.id ? (
                <button onClick={() => startFromTask(t.id)} className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                  Start Audit <ChevronRight className="w-3 h-3" />
                </button>
              ) : (
                <div className="w-full bg-slate-100 text-slate-500 py-2 rounded-lg text-xs font-semibold flex items-center justify-center">
                  Assigned to {t.assignedToName}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTasks;
