import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Menu, Sparkles } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass-panel border-b border-slate-200/50 dark:border-slate-800/40 z-40 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-white dark:to-slate-300">
            CareerPilot <span className="text-primary-500 dark:text-primary-400 font-extrabold text-sm ml-0.5 px-1.5 py-0.5 rounded-lg bg-primary-500/10 border border-primary-500/20">AI</span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-all hover:scale-105"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {user && (
          <div className="flex items-center space-x-3 border-l border-slate-200/60 dark:border-slate-800/50 pl-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{user.name}</span>
              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</span>
            </div>
            
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-500/15 flex items-center justify-center font-bold text-sm shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={logout}
              className="p-2.5 rounded-xl border border-rose-500/10 text-rose-500 hover:bg-rose-500/5 transition-all hover:scale-105"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
