import React from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Bell, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const NotificationsView: React.FC = () => {
  const { notifications, currentUser, markNotificationRead } = useSafety();
  if (!currentUser) return null;

  const myNotifs = notifications.filter(n => n.userId === currentUser.id);

  const iconFor = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };
  const bgFor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50';
      case 'warning': return 'bg-orange-50';
      case 'success': return 'bg-emerald-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Notifications</h2>
            <p className="text-xs text-slate-500">{myNotifs.filter(n => !n.read).length} unread of {myNotifs.length}</p>
          </div>
        </div>
        <button onClick={() => myNotifs.filter(n => !n.read).forEach(n => markNotificationRead(n.id))} className="text-xs font-semibold text-[#1e3a5f] hover:underline">Mark all read</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {myNotifs.length === 0 && (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No notifications</p>
          </div>
        )}
        <div className="divide-y divide-slate-100">
          {myNotifs.map(n => (
            <button key={n.id} onClick={() => markNotificationRead(n.id)} className={`w-full p-4 text-left flex items-start gap-3 hover:bg-slate-50 ${!n.read ? 'bg-blue-50/40' : ''}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bgFor(n.type)}`}>
                {iconFor(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold text-sm ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</h4>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsView;
