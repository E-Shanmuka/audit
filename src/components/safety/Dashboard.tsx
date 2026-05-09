import React, { useState } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import {
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Cog,
  TrendingUp,
  Activity,
  X,
  ChevronRight,
} from 'lucide-react';
import AuditFlow from './AuditFlow';

const normalizeString = (value: any) => {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
};

const matchesFilter = (filter: any, value: any) => {
  const normalizedFilter = normalizeString(filter);
  if (!normalizedFilter) return true;
  return normalizeString(value) === normalizedFilter;
};

const StatCard: React.FC<{ label: string; value: number | string; trend?: string; icon: any; color: string; bg: string }> = ({ label, value, trend, icon: Icon, color, bg }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      {trend && (
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {trend}
        </span>
      )}
    </div>
    <div className="text-3xl font-bold text-slate-900">{value}</div>
    <div className="text-sm text-slate-500 mt-1">{label}</div>
  </div>
);

const Dashboard: React.FC = () => {
  const { currentUser, audits, issues, tasks, machines, modules, checklists, setActiveView } = useSafety();
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string>('');

  const moduleGroups = Array.from(
    new Map([
      ...modules.map(m => [m.name, m]),
      ...checklists.map(c => [c.module, { id: c.module, name: c.module, description: '', icon: 'Layers', subModules: [] }]),
    ])
  ).map(([, value]) => value as any);

  if (!currentUser) return null;

  // Show audit flow if checklist selected
  if (selectedChecklistId) {
    return (
      <AuditFlow
        checklistId={selectedChecklistId}
        machineCode={selectedMachine?.code}
        onDone={() => {
          setSelectedChecklistId('');
          setSelectedMachine(null);
        }}
        onBack={() => {
          setSelectedChecklistId('');
        }}
      />
    );
  }

  const machineCount = machines.length;
  const issueCount = issues.filter(i => i.title && !i.title.toLowerCase().includes('demo') && !i.title.toLowerCase().includes('test')).length;
  const openIssuesCount = issues.filter(i => i.status === 'open' && i.title && !i.title.toLowerCase().includes('demo') && !i.title.toLowerCase().includes('test')).length;
  const solvedIssuesCount = issues.filter(i => i.status === 'resolved' && i.title && !i.title.toLowerCase().includes('demo') && !i.title.toLowerCase().includes('test')).length;
  const expiredIssuesCount = issues.filter(i => i.status === 'closed' && i.title && !i.title.toLowerCase().includes('demo') && !i.title.toLowerCase().includes('test')).length;
  const permitCount = tasks.length;
  const departmentCount = new Set(machines.map(m => m.department)).size;

  const stats = [
    { label: 'Machines', value: machineCount, key: 'machines' },
    { label: 'All Issues', value: issueCount, key: 'issues' },
    { label: 'Open Issues', value: openIssuesCount, key: 'issues' },
    { label: 'Solved Issues', value: solvedIssuesCount, key: 'issues' },
    { label: 'Expired Issues', value: expiredIssuesCount, key: 'issues' },
    { label: 'Permits', value: permitCount, key: 'permits' },
    { label: 'Departments', value: departmentCount, key: 'departments' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#0d4f5d] to-[#1f7d8d] rounded-3xl p-6 lg:p-8 text-white overflow-hidden relative">
        <div className="absolute inset-y-0 right-0 w-72 bg-white/5 rounded-full -mr-24" />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-300 mb-3">EPTW Dashboard</div>
          <h1 className="text-3xl lg:text-4xl font-bold">Welcome back, {currentUser.name.split(' ')[0]}</h1>
          <p className="mt-3 text-slate-200 max-w-2xl text-sm">Overview of requests, approvals, permits, and overdue items across your safety operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map(stat => (
          <button key={stat.label} onClick={() => {
            if (stat.key === 'issues') {
              setActiveView('issues');
            } else if (stat.key === 'permits') {
              setActiveView('my-tasks');
            }
          }} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition text-left cursor-pointer">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-4">{stat.label}</div>
            <div className="text-4xl font-bold text-slate-900">{stat.value}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Machines</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map(machine => (
            <button
              key={machine.id}
              onClick={() => setSelectedMachine(machine)}
              className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-[#1e3a5f] hover:shadow-md transition text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-slate-900">{machine.name}</h3>
                  <p className="text-xs text-slate-500">{machine.code}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-mono">{machine.location}</span> • {machine.type}
              </div>
              <div className={`text-xs font-semibold mt-2 px-2 py-1 rounded-full inline-block ${
                machine.status === 'operational' ? 'bg-emerald-100 text-emerald-700' :
                machine.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {machine.status}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedMachine && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedMachine(null)}>
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedMachine.name}</h2>
                <p className="text-sm text-slate-500">{selectedMachine.code} • {selectedMachine.location}</p>
              </div>
              <button onClick={() => setSelectedMachine(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Type</div>
                  <div className="text-lg font-semibold text-slate-900">{selectedMachine.type}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Status</div>
                  <div className={`text-lg font-semibold ${
                    selectedMachine.status === 'operational' ? 'text-emerald-600' :
                    selectedMachine.status === 'maintenance' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {selectedMachine.status}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Department</div>
                  <div className="text-lg font-semibold text-slate-900">{selectedMachine.department}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Available Checklists</h3>
{moduleGroups.map(module => {
                  const moduleAudits = audits.filter(a => a.machineCode === selectedMachine.code && a.module === module.name);
                  const moduleTasks = tasks.filter(t => t.machineCode === selectedMachine.code && t.module === module.name);
                  const moduleIssues = issues.filter(i => i.machineCode === selectedMachine.code);

                  // Get available checklists for this module/machine
                  const availableChecklists = checklists.filter(cl =>
                    cl.isActive &&
                    cl.module === module.name &&
                    matchesFilter(cl.department, selectedMachine.department)
                  );

                  if (availableChecklists.length === 0) return null;

                  return (
                    <div key={module.id} className="bg-slate-50 rounded-xl p-4">
                      <h4 className="font-bold text-slate-900 mb-3">{module.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Audits Completed</div>
                          <div className="font-semibold text-slate-900">{moduleAudits.length}</div>
                          {moduleAudits.length > 0 && (
                            <div className="text-xs text-slate-400 mt-1">
                              Last by: {moduleAudits[0].userName}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Active Tasks</div>
                          <div className="font-semibold text-slate-900">{moduleTasks.filter(t => t.status !== 'completed').length}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Issues</div>
                          <div className="font-semibold text-slate-900">{moduleIssues.length}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {availableChecklists.length > 0 ? (
                          <>
                            <div className="text-xs text-slate-500 mb-2">Available Checklists:</div>
                            {availableChecklists.map(checklist => (
                              <button
                                key={checklist.id}
                                onClick={() => setSelectedChecklistId(checklist.id)}
                                className="w-full bg-white hover:bg-slate-100 border border-slate-200 rounded-lg p-3 text-left transition flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-semibold text-slate-900">{checklist.title}</div>
                                  <div className="text-xs text-slate-500">{checklist.subModule}</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="text-xs text-slate-500 py-4 text-center">
                            No checklists available for this module
                          </div>
                        )}
                      </div>

                      {module.subModules.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="text-xs text-slate-500 mb-2">Submodules</div>
                          <div className="flex flex-wrap gap-2">
                            {module.subModules.map((sub: any) => (
                              <span key={sub.id} className="text-xs bg-white px-2 py-1 rounded border">
                                {sub.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
