import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { 
  FileText, 
  Briefcase, 
  Cpu, 
  MessageSquare, 
  Sparkles, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Hourglass
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    resumesCount: 0,
    jobsCount: 0,
    interviewsCount: 0,
    avgAtsScore: 75,
  });
  const [recentResumes, setRecentResumes] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resumesRes, jobsRes, interviewsRes] = await Promise.all([
          api.get('/resumes'),
          api.get('/jobs'),
          api.get('/interviews'),
        ]);

        const resumes = resumesRes.resumes || [];
        const jobs = jobsRes.jobs || [];
        const interviews = interviewsRes.interviews || [];

        // Calculate jobs column distribution
        const statusCounts = {
          saved: 0,
          applied: 0,
          interviewing: 0,
          offered: 0,
          rejected: 0,
        };
        jobs.forEach(job => {
          if (statusCounts[job.status] !== undefined) {
            statusCounts[job.status]++;
          }
        });

        const statusLabels = {
          saved: 'Saved',
          applied: 'Applied',
          interviewing: 'Interviewing',
          offered: 'Offered',
          rejected: 'Rejected',
        };

        const jobChartData = Object.keys(statusCounts).map(key => ({
          name: statusLabels[key],
          count: statusCounts[key],
          key: key
        }));

        setChartData(jobChartData);

        // Mock a average ATS score based on profile or default it
        const avgATS = resumes.length > 0 ? 82 : 0;

        setStats({
          resumesCount: resumes.length,
          jobsCount: jobs.length,
          interviewsCount: interviews.length,
          avgAtsScore: avgATS,
        });

        setRecentResumes(resumes.slice(0, 3));

        // Get upcoming interviews from jobs list
        const upcoming = [];
        jobs.forEach(job => {
          if (job.interviews && job.interviews.length > 0) {
            job.interviews.forEach(int => {
              upcoming.push({
                _id: job._id,
                company: job.company,
                title: job.title,
                round: int.round,
                date: new Date(int.date),
              });
            });
          }
        });
        
        // Sort by date upcoming
        upcoming.sort((a, b) => a.date - b.date);
        setUpcomingInterviews(upcoming.slice(0, 3));

      } catch (error) {
        console.error('Error fetching dashboard stats:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = {
    Saved: '#64748B',
    Applied: '#3B82F6',
    Interviewing: '#F59E0B',
    Offered: '#10B981',
    Rejected: '#EF4444',
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Resumes Created',
      value: stats.resumesCount,
      desc: 'Versions saved',
      icon: FileText,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Tracked Jobs',
      value: stats.jobsCount,
      desc: 'Active applications',
      icon: Briefcase,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Mock Interviews',
      value: stats.interviewsCount,
      desc: 'Completed sessions',
      icon: MessageSquare,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Average ATS Score',
      value: stats.resumesCount > 0 ? `${stats.avgAtsScore}%` : 'N/A',
      desc: 'Across resumes',
      icon: Cpu,
      color: 'from-purple-500/20 to-pink-500/10 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative glass-panel rounded-3xl p-6 md:p-8 overflow-hidden border border-slate-200/60 dark:border-slate-800/40">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, <span className="text-primary-500 dark:text-primary-400">{user?.name}</span>!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Your application pipeline is active. Use AI-driven utilities to analyze resumes, prepare responses, and secure interviews.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <Link 
              to="/resume-builder" 
              className="flex items-center px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs transition-colors shadow-glow-primary"
            >
              <Plus className="w-4 h-4 mr-1.5" /> New Resume
            </Link>
            <Link 
              to="/ai-analyzer" 
              className="flex items-center px-4 py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              <Cpu className="w-4 h-4 mr-1.5" /> ATS Audit
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-5 flex items-center space-x-4 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{card.value}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics & Active Lists split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <div className="lg:col-span-2 glass-panel border border-slate-200/60 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary-500" /> Application Pipeline status
              </h2>
              <Link to="/job-tracker" className="text-xs font-semibold text-primary-500 hover:underline flex items-center">
                Kanban view <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            
            {stats.jobsCount === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <Briefcase className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No jobs tracked yet.</p>
                <Link to="/job-tracker" className="text-xs text-primary-500 mt-2 hover:underline">Add your first job entry</Link>
              </div>
            ) : (
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 15, 27, 0.95)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }} 
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3B66F5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tools */}
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold flex items-center">
            <Sparkles className="w-4.5 h-4.5 mr-2 text-amber-500" /> Career AI Tools
          </h2>
          
          <div className="space-y-3">
            <Link to="/career-tools" className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200/10 hover:border-primary-500/20 hover:bg-slate-100 dark:hover:bg-dark-800 transition-all group">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Cover Letter Generator</h4>
                  <p className="text-[10px] text-slate-500">Draft letter copies instantly</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link to="/career-tools" className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200/10 hover:border-primary-500/20 hover:bg-slate-100 dark:hover:bg-dark-800 transition-all group">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">LinkedIn Summaries</h4>
                  <p className="text-[10px] text-slate-500">Professional profile copywriter</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link to="/mock-interview" className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200/10 hover:border-primary-500/20 hover:bg-slate-100 dark:hover:bg-dark-800 transition-all group">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">AI Interview coach</h4>
                  <p className="text-[10px] text-slate-500">Technical & HR simulation</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Lists: Resumes and upcoming events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Resumes */}
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold flex items-center">
              <FileText className="w-4 h-4 mr-2 text-primary-500" /> Recent Resumes
            </h3>
            <Link to="/resume-builder" className="text-xs font-semibold text-primary-500 hover:underline">
              View all
            </Link>
          </div>

          {recentResumes.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs mb-3">No resumes found. Let's create one!</p>
              <Link to="/resume-builder" className="inline-flex items-center px-4 py-2 rounded-xl bg-primary-500/10 text-primary-500 font-bold text-xs hover:bg-primary-500/20 transition-colors">
                Open Resume Builder
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-dark-800">
              {recentResumes.map((resume) => (
                <div key={resume._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{resume.title}</h4>
                      <p className="text-[10px] text-slate-400">Updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Link to={`/resume-builder?id=${resume._id}`} className="text-xs font-semibold text-slate-400 hover:text-primary-500">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming interviews calendar events */}
        <div className="glass-panel border border-slate-200/60 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-primary-500" /> Upcoming Interviews
            </h3>
            <Link to="/job-tracker" className="text-xs font-semibold text-primary-500 hover:underline">
              Tracker
            </Link>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs">No scheduled interviews. Keep applying!</p>
              <p className="text-[10px] text-slate-500 mt-1">Interviews added in the Job Tracker show up here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <Hourglass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.round} Interview @ {item.company}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.title}</p>
                    <p className="text-[10px] text-amber-500 font-semibold mt-1">
                      {item.date.toLocaleDateString()} at {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
