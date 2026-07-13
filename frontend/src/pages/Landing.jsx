import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  FileText, 
  Cpu, 
  Briefcase, 
  MessageSquare, 
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  // If already logged in, go straight to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const features = [
    {
      title: 'Interactive Resume Builder',
      desc: 'Fill out details dynamically and see updates in real-time. Export clean, printer-optimized PDFs instantly.',
      icon: FileText,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      title: 'AI Resume Analyzer',
      desc: 'Upload your PDF resume to receive instant ATS scores, critical missing keywords, and structural feedback using Gemini AI.',
      icon: Cpu,
      color: 'text-violet-500 bg-violet-500/10'
    },
    {
      title: 'Job Tracker & Kanban',
      desc: 'Manage your job application pipeline visually. Record interview schedules, calendar reminders, and analytics.',
      icon: Briefcase,
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      title: 'AI Mock Interview Coach',
      desc: 'Simulate full HR or technical rounds. Recieve transcripts, communication analysis, and sample improved answers.',
      icon: MessageSquare,
      color: 'text-amber-500 bg-amber-500/10'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 text-slate-800 dark:text-slate-200 transition-colors duration-300 overflow-x-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-slate-300">
            CareerPilot <span className="text-primary-500">AI</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            to="/login" 
            className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-glow-primary hover:scale-[1.02] transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-8 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>Elevate your career preparation with Gemini AI</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          The Intelligent Hub for <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-600 dark:from-primary-400 dark:via-indigo-400 dark:to-purple-500">
            Job Search & Preparation
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Create resume copies, optimize against ATS parameters using AI review systems, generate custom cover letters, track applications, and practice interviews in one unified workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-bold hover:shadow-glow-primary hover:scale-[1.03] transition-all"
          >
            Create Your Account
          </Link>
          <Link 
            to="/login" 
            className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300 font-semibold transition-all"
          >
            Demo Sign In
          </Link>
        </div>

        {/* Dashboard Preview mockup */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-purple-600 opacity-20 blur-[80px] pointer-events-none rounded-3xl"></div>
          <div className="glass-panel border border-slate-200/60 dark:border-slate-800/40 rounded-3xl p-4 shadow-2xl relative">
            <div className="flex items-center space-x-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-4 mb-4">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium pl-2">careerpilot-dashboard-v1.app</span>
            </div>
            {/* Simple Grid Mock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-100/50 dark:bg-dark-800/50 rounded-2xl p-6 text-left border border-slate-200/20">
                <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2">Resume ATS Score</p>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">84%</div>
                <div className="w-full bg-slate-200 dark:bg-dark-900 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary-500 h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
              <div className="bg-slate-100/50 dark:bg-dark-800/50 rounded-2xl p-6 text-left border border-slate-200/20">
                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">Applied Applications</p>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">18 Active</div>
                <div className="text-xs text-slate-500 mt-3 flex items-center">
                  <Zap className="w-3 h-3 mr-1 text-emerald-500" /> +3 added this week
                </div>
              </div>
              <div className="bg-slate-100/50 dark:bg-dark-800/50 rounded-2xl p-6 text-left border border-slate-200/20">
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">Interview Coach</p>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">3 Sessions</div>
                <div className="text-xs text-slate-500 mt-3 flex items-center">
                  <Star className="w-3 h-3 mr-1 text-amber-500" /> Avg Confidence Score: 78
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-100/50 dark:bg-dark-900/40 border-y border-slate-200/50 dark:border-slate-800/40 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Core Modules</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Everything you need to automate your profile optimization and ace your recruitment loops.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="glass-panel border border-slate-200/40 dark:border-slate-800/30 rounded-3xl p-8 glass-card-hover"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust banner / Tech stack */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Built on a Modern Tech Stack</p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
          <span className="font-bold text-slate-600 dark:text-slate-400 text-lg">React.js</span>
          <span className="font-bold text-slate-600 dark:text-slate-400 text-lg">Node & Express</span>
          <span className="font-bold text-slate-600 dark:text-slate-400 text-lg">MongoDB Atlas</span>
          <span className="font-bold text-slate-600 dark:text-slate-400 text-lg">Tailwind CSS</span>
          <span className="font-bold text-slate-600 dark:text-slate-400 text-lg">Gemini API</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 CareerPilot AI. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary-500">Privacy Policy</a>
            <a href="#" className="hover:text-primary-500">Terms of Service</a>
            <a href="#" className="hover:text-primary-500">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
