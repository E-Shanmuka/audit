import React, { useState } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const { login, loading: dataLoading } = useSafety();
  const [email, setEmail] = useState('admin@safety.com');
  const [password, setPassword] = useState('admin123');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await login(email, password);
    setSubmitting(false);
  };

  const quickLogin = async (e: string, p: string) => {
    setEmail(e); setPassword(p);
    setSubmitting(true);
    await login(e, p);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950">
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl bg-white">
        {/* Left side */}
        <div className="hidden md:flex flex-col justify-between p-10 text-white bg-gradient-to-br from-[#1e3a5f] to-[#0f1f3a] relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)", backgroundSize: '40px 40px' }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="font-bold text-lg leading-tight">SafetyOps</div>
                <div className="text-xs text-blue-200">Industrial SMS</div>
              </div>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4">Industrial Safety Management System</h1>
            <p className="text-blue-200 leading-relaxed">A unified platform for EHS audits, JSA, incident reporting, and dynamic checklist workflows across your entire facility.</p>
          </div>
          <div className="relative grid grid-cols-3 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/10">
              <div className="text-2xl font-bold">8</div>
              <div className="text-xs text-blue-200">Modules</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/10">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-xs text-blue-200">Dynamic</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/10">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-xs text-blue-200">Monitoring</div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="p-8 md:p-12">
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">SafetyOps</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to your account</h2>
          <p className="text-slate-500 mb-8 text-sm">Welcome back. Enter your credentials to access the SMS dashboard.</p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none text-sm" />
              </div>
            </div>
            <button type="submit" disabled={submitting || dataLoading} className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>

          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => quickLogin('admin@safety.com', 'admin123')}
                className="text-left p-3 rounded-lg border border-slate-200 hover:border-[#1e3a5f] hover:bg-slate-50 transition">
                <div className="text-sm font-semibold text-slate-900">Admin</div>
                <div className="text-xs text-slate-500">admin@safety.com</div>
              </button>
              <button onClick={() => quickLogin('john@safety.com', 'user123')}
                className="text-left p-3 rounded-lg border border-slate-200 hover:border-[#1e3a5f] hover:bg-slate-50 transition">
                <div className="text-sm font-semibold text-slate-900">User</div>
                <div className="text-xs text-slate-500">john@safety.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
