import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/authContext';
import { 
  LayoutDashboard, 
  Sparkles, 
  Target, 
  Map, 
  FileText, 
  Briefcase, 
  Award, 
  FolderGit2, 
  Mic2, 
  CheckCircle2, 
  Compass, 
  LogOut,
  GraduationCap,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function StudentLayout() {
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/career-twin', label: 'AI Career Twin', icon: Sparkles, badge: 'Core' },
    { to: '/student/skills-gaps', label: 'Skills & Gaps', icon: Target },
    { to: '/student/roadmap', label: 'Dynamic Roadmap', icon: Map },
    { to: '/student/resume-studio', label: 'Resume Studio', icon: FileText },
    { to: '/student/job-match', label: 'Job Match & JD Analyzer', icon: Briefcase },
    { to: '/student/assessments', label: 'Assessments', icon: Award },
    { to: '/student/projects', label: 'AI Project Generator', icon: FolderGit2 },
    { to: '/student/interviews', label: 'Interview Prep', icon: Mic2 },
    { to: '/student/verification', label: 'Skill Verification', icon: CheckCircle2 },
    { to: '/student/what-if', label: 'Career What-If', icon: Compass },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">SkillSync <span className="text-purple-600">AI</span></h1>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Student Portal
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-purple-600" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                {user?.name?.[0] || 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'Alex Morgan'}</p>
                <p className="text-[11px] text-slate-400 truncate">CS2026-042</p>
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

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-slate-700">Apex Institute of Technology</span>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
              CSE Dept
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full font-semibold">
              Student Persona
            </span>
            <div className="text-xs text-slate-600 font-medium border-l border-slate-200 pl-3">
              {user?.name} ({user?.email})
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
