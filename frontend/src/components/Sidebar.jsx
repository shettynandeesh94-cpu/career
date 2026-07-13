import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Cpu, 
  Briefcase, 
  MessageSquare, 
  User, 
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Resume Builder', path: '/resume-builder', icon: FileText },
    { name: 'AI Resume Analyzer', path: '/ai-analyzer', icon: Cpu },
    { name: 'AI Career Tools', path: '/career-tools', icon: Sparkles },
    { name: 'Job Tracker', path: '/job-tracker', icon: Briefcase },
    { name: 'Mock Interview', path: '/mock-interview', icon: MessageSquare },
    { name: 'Profile Settings', path: '/profile', icon: User },
  ];

  return (
    <aside 
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-30 transition-all duration-300 w-64 glass-panel border-r border-slate-200/50 dark:border-slate-800/40 flex flex-col justify-between py-6
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all group
                ${isActive 
                  ? 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-md shadow-primary-500/10' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-primary-500 dark:hover:text-primary-400'
                }
              `}
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0 transition-transform group-hover:scale-105" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-glow-primary">
            AI
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">CareerPilot Engine</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500">v1.0 • Gemini 1.5</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
