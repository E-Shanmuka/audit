import React from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Menu, Bell, Search } from 'lucide-react';

const titles: Record<string, string> = {
  'dashboard': 'Dashboard',
  'my-tasks': 'My Tasks',
  'audit-history': 'Audit History',
  'issues': 'Issues',
  'notifications': 'Notifications',
  'create-permit': 'Create Permit',
  'requested-permits': 'Requested Permits',
  'approved-permits': 'Approved Permits',
  'rejected-permits': 'Rejected Permits',
  'permit-details': 'Permit Details',
  'admin-users': 'User Management',
  'admin-machines': 'Machine Registry',
  'admin-modules': 'Modules & Submodules',
  'admin-checklists': 'Checklist Builder',
  'admin-tasks': 'Task Assignment',
  'admin-departments': 'Departments',
  'admin-permit-templates': 'Permit Templates',
  'admin-permit-requests': 'Permit Requests',
  'department-permits': 'Department Permits',
  'audit-flow': 'Perform Audit',
};

const Header: React.FC = () => {
  const { toggleSidebar, activeView, setActiveView, currentUser, notifications } = useSafety();
  if (!currentUser) return null;
  const unread = notifications.filter(n => n.userId === currentUser.id && !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center gap-4">
      <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <h1 className="text-lg lg:text-xl font-bold text-slate-900">{titles[activeView] || 'SafetyOps'}</h1>
        <p className="text-xs text-slate-500 hidden sm:block">Industrial Safety Management Platform</p>
      </div>
      <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg w-72">
        <Search className="w-4 h-4 text-slate-400" />
        <input placeholder="Search machines, audits..." className="bg-transparent outline-none text-sm flex-1" />
      </div>
      <button onClick={() => setActiveView('notifications')} className="relative p-2 rounded-lg hover:bg-slate-100">
        <Bell className="w-5 h-5 text-slate-700" />
        {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
      </button>
    </header>
  );
};

export default Header;
