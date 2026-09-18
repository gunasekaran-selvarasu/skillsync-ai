import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/authContext';
import { 
  Building2, 
  Briefcase, 
  Send, 
  Users, 
  Settings2, 
  BarChart, 
  LogOut,
  Shield,
  UserCheck
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Placement Intelligence', icon: BarChart },
    { to: '/admin/drives', label: 'Placement Drives', icon: Send },
    { to: '/admin/companies', label: 'Companies & Jobs', icon: Briefcase },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/ai-config', label: 'AI Configuration & Audit', icon: Settings2 },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-30">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">SkillSync <span className="text-purple-600">AI</span></h1>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Admin / TPO
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-emerald-600" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                {user?.name?.[0] || 'T'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'Marcus Vance'}</p>
                <p className="text-[11px] text-slate-400 truncate">Placement Officer</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">Apex Institute of Technology</span>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
              TPO Administration
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
              TPO / Admin Persona
            </span>
            <div className="text-xs text-slate-600 font-medium border-l border-slate-200 pl-3">
              {user?.name} ({user?.email})
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
