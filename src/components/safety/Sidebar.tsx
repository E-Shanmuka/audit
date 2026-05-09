import React, { useState } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Cog,
  Layers,
  ClipboardList,
  ListChecks,
  AlertTriangle,
  FileSearch,
  ShieldCheck,
  LogOut,
  X,
  ChevronRight,
  ChevronDown,
  Scan,
  FileText,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { currentUser, activeView, setActiveView, logout, sidebarOpen, toggleSidebar } = useSafety();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const isSupervisor = currentUser.role === 'supervisor';
  const isAuditor = currentUser.role === 'auditor';
  const isUser = currentUser.role === 'user';
  const isDepartment = currentUser.role === 'department';

  const topNavItems: { id: string; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan-machine', label: 'Scan Machine', icon: Scan },
    { id: 'my-profile', label: 'My Profile', icon: Users },
    { id: 'issues', label: 'Issues', icon: AlertTriangle },
    { id: 'audit-history', label: 'Reports', icon: FileSearch },
    ...(isDepartment ? [{ id: 'department-permits', label: 'Department Permits', icon: FileText }] : []),
  ].filter(item => {
    if (isAdmin) {
      return item.id !== 'issues' && item.id !== 'audit-history';
    } else if (isSupervisor) {
      return item.id === 'dashboard' || item.id === 'my-profile' || item.id === 'issues';
    } else if (isAuditor) {
      return item.id === 'dashboard' || item.id === 'my-profile' || item.id === 'audit-history';
    } else if (isDepartment) {
      return item.id === 'dashboard' || item.id === 'my-profile' || item.id === 'department-permits';
    } else {
      return item.id !== 'audit-history';
    }
  });

  const myTasksModules = [];

  const permitsModules = [
    { id: 'create-permit', label: 'Create Permit' },
    { id: 'requested-permits', label: 'Requested Permits' },
    { id: 'approved-permits', label: 'Approved Permits' },
    { id: 'rejected-permits', label: 'Rejected Permits' },
  ];

  const handleTopNavClick = (id: string) => {
    setActiveView(id);
    if (window.innerWidth < 1024) toggleSidebar();
  };

  return (
    <>
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar} />}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0f1f3a] text-white flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">SafetyOps</div>
              <div className="text-[10px] text-blue-300 uppercase tracking-wider">Industrial SMS</div>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-1 rounded hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[10px] font-bold text-blue-300/70 uppercase tracking-wider px-3 mb-2">Workspace</div>
          {topNavItems.map(item => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTopNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{item.badge}</span> : null}
                {active && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}

          <div className="mt-4 px-3 text-[10px] font-bold text-blue-300/70 uppercase tracking-wider mb-2">My Tasks</div>
          <div className="menu-item">
            <button
              onClick={() => handleTopNavClick('my-tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'my-tasks' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="flex-1 text-left">My Tasks</span>
              {activeView === 'my-tasks' && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-4 px-3 text-[10px] font-bold text-blue-300/70 uppercase tracking-wider mb-2">Permits</div>
          <div className="space-y-1">
            {permitsModules.map(module => {
              const active = activeView === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => handleTopNavClick(module.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="flex-1 text-left">{module.label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {currentUser.role === 'department' && (
            <>
              <div className="mt-4 px-3 text-[10px] font-bold text-blue-300/70 uppercase tracking-wider mb-2">Department</div>
              <button onClick={() => { setActiveView('department-permits'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'department-permits' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <FileText className="w-4 h-4" />
                <span className="flex-1 text-left">Pending Permits</span>
                {activeView === 'department-permits' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </>
          )}

          {isSupervisor && (
            <>
              <div className="text-[10px] font-bold text-blue-300/70 uppercase tracking-wider px-3 mb-2 mt-6">Team Management</div>
              <button onClick={() => { setActiveView('supervisor-users'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'supervisor-users' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <Users className="w-4 h-4" />
                <span className="flex-1 text-left">My Team</span>
                {activeView === 'supervisor-users' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <div className="text-[10px] font-bold text-blue-300/70 uppercase tracking-wider px-3 mb-2 mt-6">Admin Control</div>
              <button onClick={() => { setActiveView('admin-users'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-users' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <Users className="w-4 h-4" />
                <span className="flex-1 text-left">Users</span>
                {activeView === 'admin-users' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setActiveView('admin-machines'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-machines' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <Cog className="w-4 h-4" />
                <span className="flex-1 text-left">Machines</span>
                {activeView === 'admin-machines' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setActiveView('admin-modules'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-modules' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <Layers className="w-4 h-4" />
                <span className="flex-1 text-left">Modules</span>
                {activeView === 'admin-modules' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setActiveView('admin-checklists'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-checklists' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <ListChecks className="w-4 h-4" />
                <span className="flex-1 text-left">Checklists</span>
                {activeView === 'admin-checklists' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setActiveView('admin-alerts'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-alerts' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="flex-1 text-left">Alerts</span>
                {activeView === 'admin-alerts' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setActiveView('admin-tasks'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-tasks' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <ClipboardList className="w-4 h-4" />
                <span className="flex-1 text-left">Tasks</span>
                {activeView === 'admin-tasks' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setActiveView('admin-departments'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-departments' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <Building2 className="w-4 h-4" />
                <span className="flex-1 text-left">Departments</span>
                {activeView === 'admin-departments' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setActiveView('admin-alerts'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-alerts' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="flex-1 text-left">Alerts</span>
                {activeView === 'admin-alerts' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setActiveView('admin-permit-templates'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-permit-templates' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <FileText className="w-4 h-4" />
                <span className="flex-1 text-left">Permit Templates</span>
                {activeView === 'admin-permit-templates' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setActiveView('admin-permit-requests'); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-permit-requests' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
              >
                <ClipboardList className="w-4 h-4" />
                <span className="flex-1 text-left">Permit Requests</span>
                {activeView === 'admin-permit-requests' && <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-[10px] font-bold text-blue-300/70 uppercase tracking-wider px-3 mb-2">Downloads</div>
                <button onClick={() => { setActiveView('admin-checklist-history'); if (window.innerWidth < 1024) toggleSidebar(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-checklist-history' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
                >
                  <ListChecks className="w-4 h-4" />
                  <span className="flex-1 text-left">Checklist History</span>
                  {activeView === 'admin-checklist-history' && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { setActiveView('admin-permit-downloads'); if (window.innerWidth < 1024) toggleSidebar(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeView === 'admin-permit-downloads' ? 'bg-orange-500 text-white shadow-lg' : 'text-blue-100 hover:bg-white/5'}`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="flex-1 text-left">Permit Forms</span>
                  {activeView === 'admin-permit-downloads' && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </>
          )}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-sm">
              {currentUser.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{currentUser.name}</div>
              <div className="text-[10px] text-blue-300 uppercase tracking-wide">{currentUser.role}</div>
            </div>
            <button onClick={logout} title="Sign out" className="p-2 rounded hover:bg-white/10 text-blue-200">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
