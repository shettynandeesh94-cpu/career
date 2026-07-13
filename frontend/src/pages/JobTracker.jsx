import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit, 
  MapPin, 
  Link as LinkIcon, 
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const JobTracker = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  
  // New Job Form State
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    status: 'saved',
    salary: '',
    url: '',
    description: '',
    notes: '',
  });

  // Interview Schedule Form State
  const [interviewForm, setInterviewForm] = useState({
    round: '',
    date: '',
    location: '',
    notes: '',
  });

  const columns = [
    { id: 'saved', name: 'Saved Opportunities', color: 'border-t-slate-400 bg-slate-400/5' },
    { id: 'applied', name: 'Applied', color: 'border-t-blue-500 bg-blue-500/5' },
    { id: 'interviewing', name: 'Interviewing', color: 'border-t-amber-500 bg-amber-500/5' },
    { id: 'offered', name: 'Offered', color: 'border-t-emerald-500 bg-emerald-500/5' },
    { id: 'rejected', name: 'Rejected', color: 'border-t-rose-500 bg-rose-500/5' },
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs');
      if (res.success) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/jobs', newJob);
      if (res.success) {
        setJobs(prev => [res.job, ...prev]);
        setShowAddModal(false);
        setNewJob({
          title: '',
          company: '',
          location: '',
          status: 'saved',
          salary: '',
          url: '',
          description: '',
          notes: '',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      const res = await api.put(`/jobs/${jobId}`, { status: newStatus });
      if (res.success) {
        setJobs(prev => prev.map(job => job._id === jobId ? res.job : job));
        if (activeJob && activeJob._id === jobId) {
          setActiveJob(res.job);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.success) {
        setJobs(prev => prev.filter(job => job._id !== jobId));
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewForm.round || !interviewForm.date) return;
    
    try {
      const updatedInterviews = [...(activeJob.interviews || []), interviewForm];
      const res = await api.put(`/jobs/${activeJob._id}`, { 
        interviews: updatedInterviews,
        status: 'interviewing' // auto advance status
      });

      if (res.success) {
        setJobs(prev => prev.map(job => job._id === activeJob._id ? res.job : job));
        setActiveJob(res.job);
        setInterviewForm({ round: '', date: '', location: '', notes: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getJobsByStatus = (statusId) => {
    return jobs.filter(job => job.status === statusId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold flex items-center">
            <Briefcase className="w-5.5 h-5.5 mr-2.5 text-primary-500" /> Job Applications Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual pipeline dashboard. Slide opportunities, schedule mock panels, and track dates.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl transition-all shadow-glow-primary self-start md:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Log Opportunity
        </button>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Kanban Board Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const columnJobs = getJobsByStatus(col.id);
            return (
              <div 
                key={col.id} 
                className={`rounded-2xl border-t-4 p-4 min-h-[480px] flex flex-col space-y-3 ${col.color} border-slate-200 dark:border-slate-800`}
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/30 dark:border-slate-800/30">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">{col.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/60 dark:bg-dark-800 text-slate-500 rounded-md">
                    {columnJobs.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px]">
                  {columnJobs.map(job => (
                    <div
                      key={job._id}
                      onClick={() => {
                        setActiveJob(job);
                        setShowDetailModal(true);
                      }}
                      className="p-3.5 bg-white dark:bg-dark-800/60 border border-slate-200/65 dark:border-slate-800/40 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                    >
                      <h4 className="text-xs font-extrabold truncate text-slate-800 dark:text-slate-200">{job.title}</h4>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">{job.company}</p>
                      
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-0.5" /> {job.location || 'Remote'}
                        </span>
                        {job.interviews && job.interviews.length > 0 && (
                          <span className="flex items-center text-amber-500 font-bold bg-amber-500/5 px-1.5 py-0.5 border border-amber-500/10 rounded">
                            <Clock className="w-3 h-3 mr-0.5" /> QA Panel
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {columnJobs.length === 0 && (
                    <div className="h-full flex items-center justify-center py-10 border border-dashed border-slate-200/20 rounded-xl">
                      <span className="text-[10px] text-slate-400">No items</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD JOB OPPORTUNITY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/45 w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out] text-left">
            <h3 className="text-base font-extrabold mb-4">Log Job Opportunity</h3>
            
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    placeholder="e.g. Google"
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Location</label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    placeholder="e.g. Remote / Hybrid"
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Salary Range</label>
                  <input
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    placeholder="e.g. $120k - $140k"
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Job Post Link / URL</label>
                <input
                  type="text"
                  value={newJob.url}
                  onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                  placeholder="github.com/careers/..."
                  className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Description / Details</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  rows={2}
                  className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Current Pipeline Status</label>
                <select
                  value={newJob.status}
                  onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                  className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                >
                  <option value="saved">Saved Opportunity</option>
                  <option value="applied">Applied / Submitted</option>
                  <option value="interviewing">Interview Scheduled</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected / Closed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl transition-colors shadow-glow-primary"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: JOB DETAILS & SCHEDULER */}
      {showDetailModal && activeJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/45 w-full max-w-2xl rounded-3xl p-6 shadow-2xl animate-[fadeIn_0.2s_ease-out] text-left max-h-[90vh] overflow-y-auto">
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-slate-200/35 dark:border-slate-800/35 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-dark-800 text-slate-500 rounded uppercase tracking-wider">
                  {activeJob.status}
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{activeJob.title}</h3>
                <p className="text-xs font-bold text-slate-500">{activeJob.company}</p>
              </div>
              <button
                onClick={() => handleDeleteJob(activeJob._id)}
                className="p-2 border border-rose-500/10 text-rose-500 hover:bg-rose-500/5 rounded-xl transition-colors"
                title="Delete Application"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Details & quick status modifications */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Application Information</h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex"><span className="text-slate-400 w-24">Location:</span> <span>{activeJob.location || 'Not set'}</span></div>
                  <div className="flex"><span className="text-slate-400 w-24">Salary:</span> <span>{activeJob.salary || 'Not set'}</span></div>
                  <div className="flex">
                    <span className="text-slate-400 w-24">Post Link:</span> 
                    {activeJob.url ? (
                      <a href={activeJob.url} target="_blank" rel="noreferrer" className="text-primary-500 underline flex items-center">
                        Open Job Post <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : (
                      <span className="text-slate-500 italic">None</span>
                    )}
                  </div>
                </div>

                {activeJob.description && (
                  <div className="p-3 bg-slate-100/30 dark:bg-dark-800/20 border border-slate-200/10 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Details</p>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{activeJob.description}</p>
                  </div>
                )}

                {/* Direct pipelines triggers */}
                <div className="space-y-2 border-t border-slate-200/30 dark:border-slate-800/30 pt-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Change Pipeline Status:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['saved', 'applied', 'interviewing', 'offered', 'rejected'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(activeJob._id, st)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold capitalize
                          ${activeJob.status === st 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-500'
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interview schedule column */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200/30 dark:border-slate-800/30 md:pl-6 pt-4 md:pt-0">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-amber-500" /> Interview Scheduler
                </h4>

                {/* Upcoming rounds */}
                {activeJob.interviews && activeJob.interviews.length > 0 ? (
                  <div className="space-y-2.5">
                    {activeJob.interviews.map((int, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>{int.round} Round</span>
                          <span className="text-amber-500">{new Date(int.date).toLocaleDateString()}</span>
                        </div>
                        {int.location && <p className="text-slate-400 text-[10px] mt-0.5">Location: {int.location}</p>}
                        {int.notes && <p className="text-slate-500 text-[10px] mt-1">{int.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">No interview panel schedule registered. Add one below.</p>
                )}

                {/* Form to schedule panel */}
                <form onSubmit={handleScheduleInterview} className="space-y-3 pt-2 border-t border-slate-200/30 dark:border-slate-800/30">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Round</label>
                      <input
                        type="text"
                        required
                        value={interviewForm.round}
                        onChange={(e) => setInterviewForm({ ...interviewForm, round: e.target.value })}
                        placeholder="e.g. System Design"
                        className="block w-full px-2 py-1.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none text-[10px] mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Panel Date</label>
                      <input
                        type="datetime-local"
                        required
                        value={interviewForm.date}
                        onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                        className="block w-full px-2 py-1.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none text-[10px] mt-0.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Location (Zoom / Meet link)</label>
                    <input
                      type="text"
                      value={interviewForm.location}
                      onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })}
                      placeholder="e.g. Zoom link"
                      className="block w-full px-2 py-1.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none text-[10px] mt-0.5"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Add to Calendar</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200/35 dark:border-slate-800/35 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 rounded-xl text-xs font-bold transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default JobTracker;
