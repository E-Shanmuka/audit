import React, { useState } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Users, AlertTriangle, CheckCircle2, Clock, Search, UserCheck } from 'lucide-react';

const SupervisorUsers: React.FC = () => {
  const { users, issues, currentUser } = useSafety();
  const [search, setSearch] = useState('');

  if (!currentUser) return null;

  // Get users in the same department as supervisor
  const teamUsers = users.filter(u =>
    u.department === currentUser.department &&
    u.id !== currentUser.id &&
    u.active
  );

  // Get issues assigned to team members
  const teamIssues = issues.filter(issue =>
    teamUsers.some(user => user.id === issue.assignedTo)
  );

  const filteredUsers = teamUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const getUserIssues = (userId: string) => {
    return teamIssues.filter(issue => issue.assignedTo === userId);
  };

  const getUserStats = (userId: string) => {
    const userIssues = getUserIssues(userId);
    return {
      total: userIssues.length,
      open: userIssues.filter(i => i.status === 'open').length,
      resolved: userIssues.filter(i => i.status === 'resolved').length,
      overdue: userIssues.filter(i => i.status === 'open' && new Date(i.dueDate) < new Date()).length,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Team</h1>
          <p className="text-slate-600 mt-1">Monitor team performance and issue assignments</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">{teamUsers.length} Team Members</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team members..." className="bg-transparent outline-none text-sm flex-1" />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map(user => {
          const stats = getUserStats(user.id);
          const userIssues = getUserIssues(user.id);

          return (
            <div key={user.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{user.name}</h3>
                  <p className="text-sm text-slate-500">Employee ID: {user.employeeId}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  {stats.overdue > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {stats.overdue} Overdue
                    </span>
                  )}
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full capitalize">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-slate-900">{stats.total}</div>
                  <div className="text-xs text-slate-500 uppercase">Total Issues</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-orange-700">{stats.open}</div>
                  <div className="text-xs text-orange-600 uppercase">Open</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-emerald-700">{stats.resolved}</div>
                  <div className="text-xs text-emerald-600 uppercase">Resolved</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-red-700">{stats.overdue}</div>
                  <div className="text-xs text-red-600 uppercase">Overdue</div>
                </div>
              </div>

              {userIssues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Recent Issues</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {userIssues.slice(0, 3).map(issue => (
                      <div key={issue.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                        {issue.status === 'resolved' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : issue.status === 'open' && new Date(issue.dueDate) < new Date() ? (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-orange-600" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{issue.title}</div>
                          <div className="text-xs text-slate-500">Due: {new Date(issue.dueDate).toLocaleDateString()}</div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                          issue.status === 'open' && new Date(issue.dueDate) < new Date() ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {issue.status === 'resolved' ? 'Resolved' : issue.status === 'open' && new Date(issue.dueDate) < new Date() ? 'Overdue' : 'Open'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userIssues.length === 0 && (
                <div className="text-center py-4 text-slate-500">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No issues assigned</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No team members found</p>
          <p className="text-xs text-slate-400 mt-1">Team members will appear here when added to your department</p>
        </div>
      )}
    </div>
  );
};

export default SupervisorUsers;