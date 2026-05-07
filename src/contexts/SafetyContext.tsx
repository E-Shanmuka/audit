import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

const getAuthToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('sms.token') : null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const normalizeString = (value: any) => {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
};

const matchesFilter = (filter: any, value: any) => {
  const normalizedFilter = normalizeString(filter);
  if (!normalizedFilter) return true;
  return normalizeString(value) === normalizedFilter;
};

const parseJsonResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('Failed to parse JSON response', { status: response.status, text });
    throw new Error(`Invalid JSON response (${response.status})`);
  }
};

// ============ TYPES ============
export type Role = 'admin' | 'supervisor' | 'auditor' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  employeeId: string;
  phone?: string;
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  manager: string;
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  department: string;
  location: string;
  type: string;
  status: 'operational' | 'maintenance' | 'down';
}

export interface SubModule {
  id: string;
  name: string;
  description: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  subModules: SubModule[];
}

export type QuestionType = 'ok_notok' | 'dropdown' | 'text';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
}

export interface Checklist {
  id: string;
  title: string;
  module: string;
  subModule: string;
  machineCode?: string;
  department?: string;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
}

export interface Answer {
  questionId: string;
  question: string;
  answer: string;
  remark: string;
  editedBy?: string;  // Employee name who edited this question
  editedAt?: string;  // When this question was edited
}

export interface Audit {
  id: string;
  checklistId: string;
  checklistTitle: string;
  module: string;
  subModule: string;
  machineCode: string;
  userId: string;
  userName: string;
  answers: Answer[];
  status: 'completed' | 'has_issues';
  shift?: 'day' | 'afternoon' | 'night' | 'evening';
  auditDate?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  module: string;
  subModule: string;
  machineCode: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  machineCode: string;
  reportedBy: string;
  reportedByName: string;
  department?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  auditId?: string;
  createdAt: string;
  dueDate?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
  createdAt: string;
}

export interface AlertRule {
  id: string;
  machineCode?: string;
  module: string;
  subModule: string;
  department: string;
  isActive: boolean;
  createdAt: string;
}

interface SafetyContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // App state
  activeView: string;
  setActiveView: (v: string) => void;
  selectedSubmodule: string | null;
  setSelectedSubmodule: (s: string | null) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Loading / error
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  // Data
  users: User[];
  departments: Department[];
  machines: Machine[];
  modules: Module[];
  checklists: Checklist[];
  audits: Audit[];
  tasks: Task[];
  issues: Issue[];
  notifications: Notification[];
  alertRules: AlertRule[];

  // CRUD
  addUser: (u: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, u: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  addDepartment: (d: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (id: string, d: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;

  addMachine: (m: Omit<Machine, 'id'>) => Promise<void>;
  updateMachine: (id: string, m: Partial<Machine>) => Promise<void>;
  deleteMachine: (id: string) => Promise<void>;

  addModule: (m: Omit<Module, 'id'>) => Promise<void>;
  updateModule: (id: string, m: Partial<Module>) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;
  addSubModule: (moduleId: string, sm: Omit<SubModule, 'id'>) => Promise<void>;
  deleteSubModule: (moduleId: string, smId: string) => Promise<void>;

  addChecklist: (c: Omit<Checklist, 'id' | 'createdAt'>) => Promise<void>;
  updateChecklist: (id: string, c: Partial<Checklist>) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  toggleChecklist: (id: string) => Promise<void>;

  addAudit: (a: Omit<Audit, 'id' | 'createdAt'>) => Promise<void>;
  getAuditsByFilter: (filter: {checklistId?: string, machineCode?: string, userId?: string, auditDate?: string}) => Promise<Audit[]>;
  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, t: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addIssue: (i: Omit<Issue, 'id' | 'createdAt'>) => Promise<void>;
  updateIssue: (id: string, i: Partial<Issue>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  addAlertRule: (r: Omit<AlertRule, 'id' | 'createdAt'>) => Promise<void>;
  updateAlertRule: (id: string, r: Partial<AlertRule>) => Promise<void>;
  deleteAlertRule: (id: string) => Promise<void>;
}

const SafetyContext = createContext<SafetyContextType | null>(null);
export const useSafety = () => {
  const ctx = useContext(SafetyContext);
  if (!ctx) throw new Error('useSafety must be used inside SafetyProvider');
  return ctx;
};

// ============ MAPPERS (DB row → UI shape) ============
const mapUser = (r: any): User => ({
  id: r.id || r._id || String(r._id),
  name: r.name,
  email: r.email,
  password: r.password,
  role: r.role,
  department: r.department || '',
  employeeId: r.employeeCode || r.employee_id || '',
  phone: r.mobile || r.phone || undefined,
  active: r.active ?? true,
});
const mapDept = (r: any): Department => ({ id: r.id || r._id || String(r._id), name: r.name, code: r.code, manager: r.manager || '' });
const mapMachine = (r: any): Machine => ({
  id: r.id || r._id || String(r._id), code: r.code, name: r.name, department: r.department || '',
  location: r.location || '', type: r.type || '', status: r.status || 'operational',
});
const mapModule = (r: any): Module => ({
  id: r.id || r._id || String(r._id), name: r.name, description: r.description || '', icon: r.icon || 'Layers',
  subModules: Array.isArray(r.subModules) ? r.subModules : Array.isArray(r.sub_modules) ? r.sub_modules : [],
});
const mapChecklist = (r: any): Checklist => ({
  id: r.id || r._id || String(r._id), title: r.title, module: r.module, subModule: r.subModule || r.sub_module,
  machineCode: r.machineCode || r.machine_code || undefined,
  department: r.department || undefined,
  questions: Array.isArray(r.questions) ? r.questions : [],
  isActive: r.isActive ?? r.is_active ?? true,
  createdAt: r.createdAt || r.created_at,
});
const mapAudit = (r: any): Audit => ({
  id: r.id || r._id || String(r._id), checklistId: r.checklistId || r.checklist_id,
  checklistTitle: r.checklistTitle || r.checklist_title,
  module: r.module,
  subModule: r.subModule || r.sub_module,
  machineCode: r.machineCode || r.machine_code || '',
  userId: r.userId || r.user_id,
  userName: r.userName || r.user_name,
  answers: Array.isArray(r.answers) ? r.answers : [],
  status: r.status,
  shift: r.shift || undefined,
  auditDate: r.auditDate || r.audit_date || undefined,
  createdAt: r.createdAt || r.created_at,
});
const mapTask = (r: any): Task => {
  const normalizedStatus =
    r.status === 'in-progress' || r.status === 'in_progress'
      ? 'in_progress'
      : ['pending', 'in_progress', 'completed'].includes(r.status)
      ? r.status
      : 'pending';
  return {
    id: r.id || r._id || String(r._id),
    title: r.title,
    description: r.description || '',
    module: r.module || '',
    subModule: r.subModule || r.sub_module || '',
    machineCode: r.machineCode || r.machine_code || '',
    assignedTo: r.assignedTo || r.assigned_to || '',
    assignedToName: r.assignedToName || r.assigned_to_name || '',
    dueDate: typeof r.dueDate === 'string'
      ? r.dueDate.slice(0, 10)
      : typeof r.due_date === 'string'
      ? r.due_date.slice(0, 10)
      : r.dueDate || r.due_date || '',
    priority: ['low', 'medium', 'high', 'critical'].includes(r.priority)
      ? r.priority
      : 'medium',
    status: normalizedStatus as Task['status'],
    createdAt: toStringValue(r.createdAt || r.created_at),
  };
};
const toStringValue = (value: any) => {
  if (!value && value !== 0) return '';
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
};

const mapIssue = (r: any): Issue => {
  const rawStatus = String(r.status || 'open');
  const normalizedStatus = rawStatus === 'in-progress' ? 'investigating' : rawStatus;
  return {
    id: r.id || r._id || String(r._id),
    title: r.title,
    description: r.description || '',
    machineCode: r.machineCode || r.machine_code || '',
    reportedBy: r.reportedBy || r.reported_by || r.reportedByName || '',
    reportedByName: r.reportedByName || r.reported_by_name || r.reportedBy || '',
    department: r.department || r.departmentName || undefined,
    severity: ['low', 'medium', 'high', 'critical'].includes(r.severity) ? r.severity : 'medium',
    status: ['open', 'investigating', 'resolved', 'closed'].includes(normalizedStatus)
      ? (normalizedStatus as Issue['status'])
      : 'open',
    auditId: r.auditId || r.audit_id || undefined,
    createdAt: toStringValue(r.createdAt || r.created_at),
    dueDate: toStringValue(r.dueDate || r.due_date) || undefined,
    resolvedBy: r.resolvedBy || r.resolved_by || undefined,
    resolvedByName: r.resolvedByName || r.resolved_by_name || undefined,
    resolvedAt: toStringValue(r.resolvedAt || r.resolved_at) || undefined,
  };
};
const mapNotification = (r: any): Notification => ({
  id: r.id || r._id || String(r._id),
  userId: r.userId || r.user_id || '',
  title: r.title,
  message: r.message,
  type: r.type,
  read: typeof r.read === 'boolean' ? r.read : false,
  createdAt: r.createdAt || r.created_at || '',
});

// ============ PROVIDER ============
export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedSubmodule, setSelectedSubmodule] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [lastNotificationIds, setLastNotificationIds] = useState<string[]>([]);

  // Error helper
  const handleError = (op: string, err: any) => {
    const msg = err?.message || String(err);
    console.error(`[SMS:${op}]`, err);
    setError(msg);
    toast({ title: `Failed: ${op}`, description: msg, variant: 'destructive' });
  };

  // Loaders
  const loadIssues = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch('/api/issues', { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`Failed to load issues: ${response.status}`);
      const json = await parseJsonResponse(response);
      const rows = Array.isArray(json?.issues) ? json.issues : [];
      setIssues(rows.map(mapIssue));
    } catch (e: any) {
      console.warn('Load issues failed', e);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch('/api/tasks', { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`Failed to load tasks: ${response.status}`);
      const json = await parseJsonResponse(response);
      const rows = Array.isArray(json?.tasks) ? json.tasks : [];
      setTasks(rows.map(mapTask));
    } catch (e: any) {
      console.warn('Load tasks failed', e);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`Failed to load notifications: ${response.status}`);
      const json = await parseJsonResponse(response);
      const rows = Array.isArray(json?.notifications) ? json.notifications : [];
      const mapped = rows.map(mapNotification);
      setNotifications(mapped);
      if (currentUser) {
        const myNew = mapped.filter(n => n.userId === currentUser.id).map(n => n.id);
        const added = myNew.filter(id => !lastNotificationIds.includes(id));
        if (added.length > 0) {
          const newNotifs = mapped.filter(n => added.includes(n.id));
          newNotifs.forEach(n => {
            toast({ title: `New alert: ${n.title}`, description: n.message, variant: 'default' });
          });
          setLastNotificationIds(myNew);
        }
      }
    } catch (e: any) {
      console.warn('Notification refresh failed', e);
    }
  }, [currentUser, lastNotificationIds]);

  const loadAlertRules = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setAlertRules([]);
        return;
      }
      const response = await fetch('/api/alerts', { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`Failed to load alerts: ${response.status}`);
      const json = await parseJsonResponse(response);
      const rows = Array.isArray(json?.alerts) ? json.alerts : [];
      setAlertRules(rows.map((r: any) => ({
        id: r.id || r._id || String(r._id),
        machineCode: r.machineCode || r.machine_code || undefined,
        module: r.module,
        subModule: r.subModule,
        department: r.department,
        isActive: r.isActive ?? r.is_active ?? true,
        createdAt: r.createdAt || r.created_at || '',
      })));
    } catch (e: any) {
      handleError('Load alert rules', e);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const [uRes, dRes, mRes, modRes, clRes, nRes] = await Promise.all([
        fetch('/api/users', { headers: getAuthHeaders() }),
        fetch('/api/departments', { headers: getAuthHeaders() }),
        fetch('/api/machines', { headers: getAuthHeaders() }),
        fetch('/api/modules', { headers: getAuthHeaders() }),
        fetch('/api/checklists', { headers: getAuthHeaders() }),
        fetch('/api/notifications', { headers: getAuthHeaders() }),
      ]);

      const [u, d, m, mod, cl, n] = await Promise.all([
        parseJsonResponse(uRes),
        parseJsonResponse(dRes),
        parseJsonResponse(mRes),
        parseJsonResponse(modRes),
        parseJsonResponse(clRes),
        parseJsonResponse(nRes),
      ]);

      if (!uRes.ok) throw new Error(u?.message || `Failed to load users (${uRes.status})`);
      if (!dRes.ok) throw new Error(d?.message || `Failed to load departments (${dRes.status})`);
      if (!mRes.ok) throw new Error(m?.message || `Failed to load machines (${mRes.status})`);
      if (!modRes.ok) throw new Error(mod?.message || `Failed to load modules (${modRes.status})`);
      if (!clRes.ok) throw new Error(cl?.message || `Failed to load checklists (${clRes.status})`);
      if (!nRes.ok) throw new Error(n?.message || `Failed to load notifications (${nRes.status})`);

      setUsers((u?.users || []).map(mapUser));
      setDepartments((d?.departments || []).map(mapDept));
      setMachines((m?.machines || []).map(mapMachine));
      setModules((mod?.modules || []).map(mapModule));
      setChecklists((cl?.checklists || []).map(mapChecklist));
      setNotifications((n?.notifications || []).map(mapNotification));
      setAlertRules([]);
      setAudits([]);

      if (token) {
        try {
          const [aRes, alertRes] = await Promise.all([
            fetch('/api/audits', { headers: getAuthHeaders() }),
            fetch('/api/alerts', { headers: getAuthHeaders() }),
          ]);

          if (aRes.ok) {
            const a = await parseJsonResponse(aRes);
            setAudits((Array.isArray(a) ? a : []).map(mapAudit));
          } else {
            const a = await parseJsonResponse(aRes).catch(() => null);
            console.warn('Failed to load audits:', aRes.status, a?.message || aRes.statusText);
          }

          if (alertRes.ok) {
            const alertJson = await parseJsonResponse(alertRes);
            setAlertRules((alertJson?.alerts || []).map((r: any) => ({
              id: r.id || r._id || String(r._id),
              machineCode: r.machineCode || r.machine_code || undefined,
              module: r.module,
              subModule: r.subModule,
              department: r.department,
              isActive: r.isActive ?? r.is_active ?? true,
              createdAt: r.createdAt || r.created_at || '',
            })));
          } else {
            const alertJson = await parseJsonResponse(alertRes).catch(() => null);
            console.warn('Failed to load alerts:', alertRes.status, alertJson?.message || alertRes.statusText);
          }
        } catch (error) {
          console.warn('Protected data load failed', error);
        }
      }

      await loadIssues();
      await loadTasks();
    } catch (e: any) {
      handleError('Load data', e);
    } finally {
      setLoading(false);
    }
  }, [loadIssues, loadTasks]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sms.token') : null;
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('sms.currentUser') : null;
    if (!token) {
      setLoading(false);
      return;
    }

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {}
    }

    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      loadNotifications();
    }, 15000);
    loadNotifications();
    return () => clearInterval(interval);
  }, [currentUser, loadNotifications]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await response.json();
      if (!response.ok) {
        toast({ title: 'Login failed', description: json.message || 'Invalid email or password', variant: 'destructive' });
        return false;
      }

      const u = json.user;
      if (!u) {
        toast({ title: 'Login failed', description: 'Invalid server response', variant: 'destructive' });
        return false;
      }

      const user = {
        id: u.id,
        name: u.name,
        email: u.email,
        password: '',
        role: u.role,
        department: u.department || '',
        employeeId: u.employeeCode || '',
        phone: u.mobile || undefined,
        active: true,
      };
      setCurrentUser(user);
      try {
        localStorage.setItem('sms.currentUser', JSON.stringify(user));
        localStorage.setItem('sms.currentUserId', u.id);
        localStorage.setItem('sms.token', json.token);
      } catch {}
      setActiveView('dashboard');
      setSelectedSubmodule(null);
      toast({ title: 'Welcome back!', description: `Signed in as ${u.name}` });
      await loadAll();
      return true;
    } catch (e: any) {
      handleError('Login', e);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sms.currentUser');
      localStorage.removeItem('sms.currentUserId');
      localStorage.removeItem('sms.token');
    } catch {}
    toast({ title: 'Signed out' });
  };

  const toggleSidebar = () => setSidebarOpen(s => !s);

  // ====== USERS ======
  const addUser = async (u: Omit<User, 'id'>) => {
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          department: u.department,
          employeeId: u.employeeId,
          phone: u.phone,
          active: u.active,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to create user');
      setUsers(p => [...p, mapUser(json.user)]);
      toast({ title: 'User created', description: u.name });
    } catch (e) { handleError('Create user', e); }
  };
  const updateUser = async (id: string, u: Partial<User>) => {
    try {
      const patch: any = {};
      if (u.name !== undefined) patch.name = u.name;
      if (u.email !== undefined) patch.email = u.email;
      if (u.password !== undefined) patch.password = u.password;
      if (u.role !== undefined) patch.role = u.role;
      if (u.department !== undefined) patch.department = u.department;
      if (u.employeeId !== undefined) patch.employeeId = u.employeeId;
      if (u.phone !== undefined) patch.phone = u.phone;
      if (u.active !== undefined) patch.active = u.active;
      const response = await fetch(`/api/users/update/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(patch),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to update user');
      setUsers(p => p.map(x => x.id === id ? mapUser(json.user) : x));
      toast({ title: 'User updated' });
    } catch (e) { handleError('Update user', e); }
  };
  const deleteUser = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to delete user');
      setUsers(p => p.filter(x => x.id !== id));
      toast({ title: 'User deleted' });
    } catch (e) { handleError('Delete user', e); }
  };

  // ====== DEPARTMENTS ======
  const addDepartment = async (d: Omit<Department, 'id'>) => {
    try {
      const response = await fetch('/api/departments/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(d),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to create department');
      setDepartments(p => [...p, mapDept(json.department)]);
      toast({ title: 'Department added' });
    } catch (e) { handleError('Create department', e); }
  };
  const updateDepartment = async (id: string, d: Partial<Department>) => {
    try {
      const response = await fetch(`/api/departments/update/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(d),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to update department');
      setDepartments(p => p.map(x => x.id === id ? mapDept(json.department) : x));
      toast({ title: 'Department updated' });
    } catch (e) { handleError('Update department', e); }
  };
  const deleteDepartment = async (id: string) => {
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to delete department');
      setDepartments(p => p.filter(x => x.id !== id));
      toast({ title: 'Department deleted' });
    } catch (e) { handleError('Delete department', e); }
  };

  // ====== MACHINES ======
  const addMachine = async (m: Omit<Machine, 'id'>) => {
    try {
      const response = await fetch('/api/machines/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(m),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to create machine');
      setMachines(p => [...p, mapMachine(json.machine)]);
      toast({ title: 'Machine added', description: m.code });
    } catch (e) { handleError('Create machine', e); }
  };
  const updateMachine = async (id: string, m: Partial<Machine>) => {
    try {
      const response = await fetch(`/api/machines/update/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(m),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to update machine');
      setMachines(p => p.map(x => x.id === id ? mapMachine(json.machine) : x));
      toast({ title: 'Machine updated' });
    } catch (e) { handleError('Update machine', e); }
  };
  const deleteMachine = async (id: string) => {
    try {
      const response = await fetch(`/api/machines/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to delete machine');
      setMachines(p => p.filter(x => x.id !== id));
      toast({ title: 'Machine deleted' });
    } catch (e) { handleError('Delete machine', e); }
  };

  // ====== MODULES ======
  const addModule = async (m: Omit<Module, 'id'>) => {
    try {
      const response = await fetch('/api/modules/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(m),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to create module');
      setModules(p => [...p, mapModule(json.module)]);
      toast({ title: 'Module added' });
    } catch (e) { handleError('Create module', e); }
  };
  const updateModule = async (id: string, m: Partial<Module>) => {
    try {
      const response = await fetch(`/api/modules/update/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: m.name,
          description: m.description,
          icon: m.icon,
          subModules: m.subModules,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to update module');
      setModules(p => p.map(x => x.id === id ? mapModule(json.module) : x));
      toast({ title: 'Module updated' });
    } catch (e) { handleError('Update module', e); }
  };
  const deleteModule = async (id: string) => {
    try {
      const response = await fetch(`/api/modules/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to delete module');
      setModules(p => p.filter(x => x.id !== id));
      toast({ title: 'Module deleted' });
    } catch (e) { handleError('Delete module', e); }
  };
  const addSubModule = async (moduleId: string, sm: Omit<SubModule, 'id'>) => {
    const mod = modules.find(x => x.id === moduleId);
    if (!mod) return;
    const newSubs = [...mod.subModules, { ...sm, id: Math.random().toString(36).slice(2, 11) }];
    try {
      const response = await fetch(`/api/modules/update/${moduleId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ subModules: newSubs }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to add submodule');
      setModules(p => p.map(x => x.id === moduleId ? mapModule(json.module) : x));
      toast({ title: 'Submodule added' });
    } catch (e) { handleError('Add submodule', e); }
  };
  const deleteSubModule = async (moduleId: string, smId: string) => {
    const mod = modules.find(x => x.id === moduleId);
    if (!mod) return;
    const newSubs = mod.subModules.filter(s => s.id !== smId);
    try {
      const response = await fetch(`/api/modules/update/${moduleId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ subModules: newSubs }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to delete submodule');
      setModules(p => p.map(x => x.id === moduleId ? mapModule(json.module) : x));
      toast({ title: 'Submodule removed' });
    } catch (e) { handleError('Delete submodule', e); }
  };

  // ====== CHECKLISTS ======
  const addChecklist = async (c: Omit<Checklist, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/checklists/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: c.title,
          module: c.module,
          subModule: c.subModule,
          machineCode: c.machineCode,
          department: c.department,
          questions: c.questions,
          isActive: c.isActive,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to create checklist');
      setChecklists(p => [mapChecklist(json.checklist), ...p]);
      toast({ title: 'Checklist created', description: c.title });
    } catch (e) { handleError('Create checklist', e); }
  };
  const updateChecklist = async (id: string, c: Partial<Checklist>) => {
    try {
      const patch: any = {};
      if (c.title !== undefined) patch.title = c.title;
      if (c.module !== undefined) patch.module = c.module;
      if (c.subModule !== undefined) patch.subModule = c.subModule;
      if (c.machineCode !== undefined) patch.machineCode = c.machineCode || null;
      if (c.department !== undefined) patch.department = c.department || null;
      if (c.questions !== undefined) patch.questions = c.questions;
      if (c.isActive !== undefined) patch.isActive = c.isActive;
      const response = await fetch(`/api/checklists/update/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(patch),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to update checklist');
      setChecklists(p => p.map(x => x.id === id ? mapChecklist(json.checklist) : x));
      toast({ title: 'Checklist updated' });
    } catch (e) { handleError('Update checklist', e); }
  };
  const deleteChecklist = async (id: string) => {
    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to delete checklist');
      setChecklists(p => p.filter(x => x.id !== id));
      toast({ title: 'Checklist deleted' });
    } catch (e) { handleError('Delete checklist', e); }
  };
  const toggleChecklist = async (id: string) => {
    const cl = checklists.find(x => x.id === id);
    if (!cl) return;
    await updateChecklist(id, { isActive: !cl.isActive });
  };

  // ====== AUDITS ======
  const addAudit = async (a: Omit<Audit, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/audits/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          checklistId: a.checklistId,
          checklistTitle: a.checklistTitle,
          module: a.module,
          subModule: a.subModule,
          machineCode: a.machineCode,
          userId: a.userId,
          userName: a.userName,
          answers: a.answers,
          status: a.status,
          shift: a.shift,
          auditDate: a.auditDate,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to submit audit');
      setAudits(p => [mapAudit(json), ...p]);
      toast({ title: 'Audit submitted', description: 'Your responses have been saved.' });

      const rule = alertRules.find(r => r.isActive && r.module === a.module && r.subModule === a.subModule && (!r.machineCode || r.machineCode === a.machineCode));
      const checklist = checklists.find(c => c.id === a.checklistId);
      const targetDepartment = rule?.department || checklist?.department || '';

      if (a.status === 'has_issues') {
        const issueTitle = `Audit issue on ${a.checklistTitle}`;
        const issueDesc = a.answers
          .filter(ans => ans.answer === 'NOT OK')
          .map(ans => `${ans.question}: ${ans.remark || 'No remark provided'}`)
          .join('\n');

        await addIssue({
          title: issueTitle,
          description: issueDesc || 'Marked NOT OK during audit',
          machineCode: a.machineCode,
          department: targetDepartment || undefined,
          severity: 'high',
          status: 'open',
          auditId: undefined,
          reportedByName: a.userName,
        });
      }

      const admins = users.filter(u => u.role === 'admin');
      for (const admin of admins) {
        await addNotification({
          userId: admin.id,
          title: 'Audit Submitted',
          message: `${a.userName} submitted ${a.checklistTitle} for ${a.machineCode}`,
          type: a.status === 'has_issues' ? 'warning' : 'info',
          read: false,
        });
      }
    } catch (e) { handleError('Submit audit', e); }
  };
  const getAuditsByFilter = async (filter: {checklistId?: string, machineCode?: string, userId?: string, auditDate?: string}) => {
    try {
      const params = new URLSearchParams();
      if (filter.checklistId) params.append('checklistId', filter.checklistId);
      if (filter.machineCode) params.append('machineCode', filter.machineCode);
      if (filter.userId) params.append('userId', filter.userId);
      if (filter.auditDate) params.append('auditDate', filter.auditDate);
      const response = await fetch(`/api/audits?${params}`, {
        headers: getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to fetch audits');
      return json.map(mapAudit);
    } catch (e) { handleError('Fetch audits', e); return []; }
  };

  // ====== TASKS ======
  const addTask = async (t: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(t),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to create task');
      setTasks(p => [mapTask(json.task), ...p]);
      toast({ title: 'Task created' });
      await addNotification({
        userId: t.assignedTo, title: 'New Task Assigned', message: t.title,
        type: 'info', read: false,
      });
    } catch (e) { handleError('Create task', e); }
  };
  const updateTask = async (id: string, t: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/update/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(t),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to update task');
      setTasks(p => p.map(x => x.id === id ? mapTask(json.task) : x));
    } catch (e) { handleError('Update task', e); }
  };
  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to delete task');
      setTasks(p => p.filter(x => x.id !== id));
      toast({ title: 'Task deleted' });
    } catch (e) { handleError('Delete task', e); }
  };

  // ====== ISSUES ======
  const addIssue = async (i: Omit<Issue, 'id' | 'createdAt'>) => {
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);
      const response = await fetch('/api/issues/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: i.title,
          description: i.description,
          machineCode: i.machineCode,
          department: i.department,
          severity: i.severity,
          status: i.status,
          auditId: i.auditId,
          dueDate: dueDate.toISOString().slice(0, 10),
          reportedByName: i.reportedByName,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to report issue');
      setIssues(p => [mapIssue(json.issue), ...p]);
      toast({ title: 'Issue reported' });
      if (i.department) {
        const deptUsers = users.filter(u => u.department === i.department);
        for (const user of deptUsers) {
          await addNotification({
            userId: user.id, title: 'Issue Assigned to Your Department',
            message: `${i.title} on ${i.machineCode} - Due ${dueDate.toISOString().slice(0, 10)}`,
            type: i.severity === 'critical' ? 'critical' : 'warning',
            read: false,
          });
        }
      } else {
        const admins = users.filter(u => u.role === 'admin');
        for (const admin of admins) {
          await addNotification({
            userId: admin.id, title: 'New Issue Reported',
            message: `${i.title} on ${i.machineCode}`,
            type: i.severity === 'critical' ? 'critical' : 'warning',
            read: false,
          });
        }
      }
    } catch (e) { handleError('Report issue', e); }
  };
  const updateIssue = async (id: string, i: Partial<Issue>) => {
    try {
      const patch: any = {};
      if (i.title !== undefined) patch.title = i.title;
      if (i.description !== undefined) patch.description = i.description;
      if (i.machineCode !== undefined) patch.machineCode = i.machineCode;
      if (i.severity !== undefined) patch.severity = i.severity;
      if (i.status !== undefined) {
        patch.status = i.status;
        if ((i.status === 'resolved' || i.status === 'closed') && !issues.find(x => x.id === id)?.resolvedBy) {
          patch.resolvedBy = currentUser?.id;
          patch.resolvedByName = currentUser?.name;
          patch.resolvedAt = new Date().toISOString();
        }
      }
      const response = await fetch(`/api/issues/update/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(patch),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to update issue');
      setIssues(p => p.map(x => x.id === id ? mapIssue(json.issue) : x));
      toast({ title: 'Issue updated' });
    } catch (e) { handleError('Update issue', e); }
  };
  const deleteIssue = async (id: string) => {
    try {
      const response = await fetch(`/api/issues/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to delete issue');
      setIssues(p => p.filter(x => x.id !== id));
      toast({ title: 'Issue deleted' });
    } catch (e) { handleError('Delete issue', e); }
  };

  // ====== NOTIFICATIONS ======
  const addNotification = async (n: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/notifications/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to create notification');
      setNotifications(p => [mapNotification(json.notification), ...p]);
    } catch (e) { handleError('Create notification', e); }
  };
  const markNotificationRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/update/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ read: true }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to mark notification read');
      setNotifications(p => p.map(x => x.id === id ? mapNotification(json.notification) : x));
    } catch (e) { handleError('Mark read', e); }
  };

  const addAlertRule = async (r: Omit<AlertRule, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/alerts/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          machineCode: r.machineCode,
          module: r.module,
          subModule: r.subModule,
          department: r.department,
          isActive: r.isActive,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to create alert rule');
      setAlertRules(p => [{
        id: json.alert.id || json.alert._id || String(json.alert._id),
        machineCode: json.alert.machineCode || json.alert.machine_code || undefined,
        module: json.alert.module,
        subModule: json.alert.subModule,
        department: json.alert.department,
        isActive: json.alert.isActive ?? json.alert.is_active ?? true,
        createdAt: json.alert.createdAt || json.alert.created_at || '',
      }, ...p]);
      toast({ title: 'Alert rule added', description: `${r.module} / ${r.subModule}` });
    } catch (e) { handleError('Create alert rule', e); }
  };

  const updateAlertRule = async (id: string, r: Partial<AlertRule>) => {
    try {
      const response = await fetch(`/api/alerts/update/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          machineCode: r.machineCode,
          module: r.module,
          subModule: r.subModule,
          department: r.department,
          isActive: r.isActive,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to update alert rule');
      setAlertRules(p => p.map(x => x.id === id ? {
        id: json.alert.id || json.alert._id || String(json.alert._id),
        machineCode: json.alert.machineCode || json.alert.machine_code || undefined,
        module: json.alert.module,
        subModule: json.alert.subModule,
        department: json.alert.department,
        isActive: json.alert.isActive ?? json.alert.is_active ?? true,
        createdAt: json.alert.createdAt || json.alert.created_at || '',
      } : x));
      toast({ title: 'Alert rule updated' });
    } catch (e) { handleError('Update alert rule', e); }
  };

  const deleteAlertRule = async (id: string) => {
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || 'Failed to delete alert rule');
      setAlertRules(p => p.filter(x => x.id !== id));
      toast({ title: 'Alert rule removed' });
    } catch (e) { handleError('Delete alert rule', e); }
  };

  return (
    <SafetyContext.Provider value={{
      currentUser, login, logout,
      activeView, setActiveView, selectedSubmodule, setSelectedSubmodule, sidebarOpen, toggleSidebar,
      loading, error, refresh: loadAll,
      users, departments, machines, modules, checklists, audits, tasks, issues, notifications, alertRules,
      addUser, updateUser, deleteUser,
      addDepartment, updateDepartment, deleteDepartment,
      addMachine, updateMachine, deleteMachine,
      addModule, updateModule, deleteModule, addSubModule, deleteSubModule,
      addChecklist, updateChecklist, deleteChecklist, toggleChecklist,
      addAudit, getAuditsByFilter, addTask, updateTask, deleteTask,
      addIssue, updateIssue, deleteIssue,
      markNotificationRead, addNotification, addAlertRule, updateAlertRule, deleteAlertRule,
    }}>
      {children}
    </SafetyContext.Provider>
  );
};
