import React from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import Login from './safety/Login';
import Sidebar from './safety/Sidebar';
import Header from './safety/Header';
import Dashboard from './safety/Dashboard';
import AdminUsers from './safety/AdminUsers';
import AdminMachines from './safety/AdminMachines';
import AdminModules from './safety/AdminModules';
import AdminChecklists from './safety/AdminChecklists';
import AdminAlerts from './safety/AdminAlerts';
import AdminTasks from './safety/AdminTasks';
import AdminDepartments from './safety/AdminDepartments';
import ScanMachine from './safety/ScanMachine';
import UserTasks from './safety/UserTasks';
import AuditHistory from './safety/AuditHistory';
import IssuesView from './safety/IssuesView';
import NotificationsView from './safety/NotificationsView';
import SupervisorUsers from './safety/SupervisorUsers';
import CreatePermit from './safety/CreatePermit';
import RequestedPermits from './safety/RequestedPermits';
import ApprovedPermits from './safety/ApprovedPermits';
import RejectedPermits from './safety/RejectedPermits';
import PermitDetails from './safety/PermitDetails';
import AdminPermitTemplates from './safety/AdminPermitTemplates';
import AdminPermitRequests from './safety/AdminPermitRequests';
import AdminChecklistHistory from './safety/AdminChecklistHistory';
import AdminPermitDownloads from './safety/AdminPermitDownloads';
import DepartmentPermits from './safety/DepartmentPermits';

const ProfileView: React.FC = () => {
  const { currentUser } = useSafety();
  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Full Name</div>
            <div className="text-base font-semibold text-slate-900">{currentUser.name}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Employee Code</div>
            <div className="text-base font-semibold text-slate-900">{currentUser.employeeId}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Mobile Number</div>
            <div className="text-base font-semibold text-slate-900">{currentUser.phone || 'N/A'}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Gmail Address</div>
            <div className="text-base font-semibold text-slate-900">{currentUser.email}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Role</div>
            <div className="text-base font-semibold text-slate-900">{currentUser.role}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Department</div>
            <div className="text-base font-semibold text-slate-900">{currentUser.department || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const { currentUser, activeView, loading, error, refresh } = useSafety();

  // Initial load splash
  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white">
        <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mb-5 shadow-2xl">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <div className="font-bold text-xl mb-1">SafetyOps</div>
        <div className="text-blue-200 text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Connecting to database...
        </div>
      </div>
    );
  }

  // Hard error on initial load with no data
  if (error && !currentUser && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="font-bold text-slate-900 mb-2">Connection Failed</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button onClick={refresh} className="bg-[#1e3a5f] text-white px-5 py-2 rounded-lg text-sm font-semibold">Retry</button>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Login />;

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'my-profile': return <ProfileView />;
      case 'my-tasks': return <UserTasks />;
      case 'audit-history': return <AuditHistory />;
      case 'issues': return <IssuesView />;
      case 'notifications': return <NotificationsView />;
      case 'supervisor-users': return <SupervisorUsers />;
      case 'admin-users': return <AdminUsers />;
      case 'admin-machines': return <AdminMachines />;
      case 'admin-modules': return <AdminModules />;
      case 'admin-checklists': return <AdminChecklists />;
      case 'admin-alerts': return <AdminAlerts />;
      case 'admin-tasks': return <AdminTasks />;
      case 'admin-departments': return <AdminDepartments />;
      case 'scan-machine': return <ScanMachine />;
      case 'create-permit': return <CreatePermit />;
      case 'requested-permits': return <RequestedPermits />;
      case 'approved-permits': return <ApprovedPermits />;
      case 'rejected-permits': return <RejectedPermits />;
      case 'permit-details': return <PermitDetails />;
      case 'admin-permit-templates': return <AdminPermitTemplates />;
      case 'admin-permit-requests': return <AdminPermitRequests />;
      case 'admin-checklist-history': return <AdminChecklistHistory />;
      case 'admin-permit-downloads': return <AdminPermitDownloads />;
      case 'department-permits': return <DepartmentPermits />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        {loading && (
          <div className="bg-blue-50 border-b border-blue-100 px-4 lg:px-8 py-2 flex items-center gap-2 text-xs text-blue-800">
            <Loader2 className="w-3 h-3 animate-spin" /> Syncing with database...
          </div>
        )}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {renderView()}
        </main>
        <footer className="border-t border-slate-200 bg-white px-4 lg:px-8 py-3 text-xs text-slate-500 flex items-center justify-between">
          <div>© 2026 SafetyOps · Industrial SMS Platform · Persisted to PostgreSQL</div>
          <div className="hidden md:block">v2.0 · Database Engine</div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
