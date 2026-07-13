import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Sparkles, 
  FileText, 
  Mail, 
  User, 
  Copy, 
  Check, 
  AlertCircle,
  Cpu
} from 'lucide-react';
import { Linkedin } from '../components/BrandIcons';

const CareerTools = () => {
  const [activeTool, setActiveTool] = useState('cover-letter'); // cover-letter, linkedin, bio, email
  const [resumesList, setResumesList] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  
  // Dynamic output holders
  const [outputs, setOutputs] = useState({
    coverLetter: '',
    linkedin: '',
    bio: '',
    email: '',
  });

  // Inputs
  const [inputs, setInputs] = useState({
    jobTitle: '',
    company: '',
    jobDescription: '',
    skills: '',
    experience: '',
    summary: '',
    tone: 'professional',
    emailType: 'cold-outreach', // cold-outreach, follow-up, referral-request
    recipientRole: '',
    customNotes: '',
  });

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/resumes');
        if (res.success && res.resumes) {
          setResumesList(res.resumes);
          if (res.resumes.length > 0) {
            setSelectedResumeId(res.resumes[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching resumes:', err.message);
      }
    };
    fetchResumes();
  }, []);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Submissions
  const generateCoverLetter = async () => {
    setLoading(true);
    try {
      let resumeData = null;
      if (selectedResumeId) {
        const activeRes = await api.get(`/resumes/${selectedResumeId}`);
        if (activeRes.success) {
          resumeData = activeRes.resume;
        }
      }
      
      const res = await api.post('/ai/cover-letter', {
        resumeData,
        jobTitle: inputs.jobTitle,
        company: inputs.company,
        jobDescription: inputs.jobDescription,
      });

      if (res.success) {
        setOutputs(prev => ({ ...prev, coverLetter: res.coverLetter }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateLinkedIn = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/linkedin-summary', {
        skills: inputs.skills ? inputs.skills.split(',').map(s => s.trim()) : [],
        experience: inputs.experience ? [inputs.experience] : [],
        summary: inputs.summary,
      });
      if (res.success) {
        setOutputs(prev => ({ ...prev, linkedin: res.summary }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateBio = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/bio', {
        profileInfo: {
          skills: inputs.skills ? inputs.skills.split(',').map(s => s.trim()) : [],
          summary: inputs.summary,
          title: inputs.jobTitle,
        },
        tone: inputs.tone,
      });
      if (res.success) {
        setOutputs(prev => ({ ...prev, bio: res.bio }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/email', {
        type: inputs.emailType,
        recipientRole: inputs.recipientRole,
        companyName: inputs.company,
        jobTitle: inputs.jobTitle,
        customNotes: inputs.customNotes,
      });
      if (res.success) {
        setOutputs(prev => ({ ...prev, email: res.email }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    { id: 'cover-letter', name: 'Cover Letter', icon: FileText, desc: 'Tailor custom proposals using resume inputs' },
    { id: 'linkedin', name: 'LinkedIn Summary', icon: Linkedin, desc: 'Branding copywriter for headlines & bio blocks' },
    { id: 'bio', name: 'Professional Bio', icon: User, desc: 'Portfolio writeups with tone matching' },
    { id: 'email', name: 'HR Cold Email', icon: Mail, desc: 'Draft outreach, referrals and followups' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm">
        <h1 className="text-xl font-extrabold flex items-center">
          <Sparkles className="w-5.5 h-5.5 mr-2.5 text-amber-500 animate-pulse" /> AI Career Assistant Tools
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select a tool below to quickly generate resumes, LinkedIn bios, professional profiles, or networking outreach emails with Gemini support.
        </p>
      </div>

      {/* Tools selection bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map(tool => {
          const ToolIcon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`text-left p-5 rounded-2xl glass-panel border transition-all flex items-start space-x-3.5
                ${activeTool === tool.id 
                  ? 'border-primary-500/80 bg-primary-500/5 shadow-md shadow-primary-500/5 -translate-y-0.5' 
                  : 'border-slate-200/40 dark:border-slate-800/35 hover:border-primary-500/30'
                }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${activeTool === tool.id 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-slate-100 dark:bg-dark-800 text-slate-500'
                }`}
              >
                <ToolIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold">{tool.name}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-550 leading-normal mt-1">{tool.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main interaction panels splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* INPUT AREA */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{activeTool.replace('-', ' ')} Settings</h3>
          
          <div className="space-y-4">
            {/* Tool specific configurations */}
            {activeTool === 'cover-letter' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Resume Copy</label>
                  {resumesList.length === 0 ? (
                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] rounded-xl">
                      No saved resumes found. The AI will draft letters using default details.
                    </div>
                  ) : (
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                    >
                      {resumesList.map(res => (
                        <option key={res._id} value={res._id}>{res.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={inputs.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g. Google"
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Job Title</label>
                  <input
                    type="text"
                    value={inputs.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="e.g. Frontend developer"
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job Description</label>
                  <textarea
                    value={inputs.jobDescription}
                    onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                    placeholder="Paste job details for accurate alignment..."
                    rows={4}
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <button
                  onClick={generateCoverLetter}
                  disabled={loading || !inputs.company || !inputs.jobTitle}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Cover Letter'}
                </button>
              </>
            )}

            {activeTool === 'linkedin' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={inputs.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    placeholder="React, Node.js, Express, MongoDB"
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Experience Highlights</label>
                  <textarea
                    value={inputs.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="Lead engineer building core systems, improved load speed by 40%..."
                    rows={3}
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Personal Summary / Goal</label>
                  <textarea
                    value={inputs.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Passionate about writing clean modules and exploring backend infrastructure..."
                    rows={3}
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <button
                  onClick={generateLinkedIn}
                  disabled={loading}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                >
                  {loading ? 'Generating...' : 'Generate Profile Copy'}
                </button>
              </>
            )}

            {activeTool === 'bio' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Job / Core title</label>
                  <input
                    type="text"
                    value={inputs.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Career Summary</label>
                  <textarea
                    value={inputs.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="3+ years experience with full stack development..."
                    rows={4}
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Writing Tone</label>
                  <select
                    value={inputs.tone}
                    onChange={(e) => handleInputChange('tone', e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  >
                    <option value="professional">Professional / Executive</option>
                    <option value="bold">Bold / Technical Leader</option>
                    <option value="casual">Casual / Friendly startup</option>
                  </select>
                </div>

                <button
                  onClick={generateBio}
                  disabled={loading}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors"
                >
                  {loading ? 'Generating...' : 'Generate Bios'}
                </button>
              </>
            )}

            {activeTool === 'email' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Goal</label>
                  <select
                    value={inputs.emailType}
                    onChange={(e) => handleInputChange('emailType', e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  >
                    <option value="cold-outreach">Cold LinkedIn Outreach</option>
                    <option value="follow-up">Job Application Follow-up</option>
                    <option value="referral-request">Internal Referral request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={inputs.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recipient Role</label>
                  <input
                    type="text"
                    value={inputs.recipientRole}
                    onChange={(e) => handleInputChange('recipientRole', e.target.value)}
                    placeholder="e.g. Engineering Lead / Recruiter"
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Custom Notes / Context</label>
                  <textarea
                    value={inputs.customNotes}
                    onChange={(e) => handleInputChange('customNotes', e.target.value)}
                    placeholder="I saw their post about scaling their storage team..."
                    rows={3}
                    className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>

                <button
                  onClick={generateEmail}
                  disabled={loading || !inputs.company}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Compose Email Draft'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* OUTPUT AREA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-2xl px-5 py-3 shadow-sm">
            <span className="text-xs font-bold text-slate-500 flex items-center">
              <Cpu className="w-4 h-4 mr-1.5 text-primary-500" /> Generated Content Output
            </span>
            {outputs[activeTool === 'cover-letter' ? 'coverLetter' : activeTool] && (
              <button
                onClick={() => handleCopy(outputs[activeTool === 'cover-letter' ? 'coverLetter' : activeTool], activeTool)}
                className="flex items-center text-xs font-bold text-primary-500 hover:text-primary-600 cursor-pointer"
              >
                {copiedText === activeTool ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" /> Copy to clipboard
                  </>
                )}
              </button>
            )}
          </div>

          <div className="bg-white text-slate-900 border border-slate-200 dark:border-slate-850 dark:bg-dark-900 dark:text-slate-200 rounded-3xl p-6 min-h-[420px] shadow-sm relative overflow-y-auto leading-relaxed">
            {loading && (
              <div className="absolute inset-0 bg-slate-50/50 dark:bg-dark-950/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-10 rounded-3xl">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold animate-pulse text-slate-500">Drafting professional copy using Gemini...</p>
              </div>
            )}

            {/* Render appropriate output text */}
            {activeTool === 'cover-letter' && (
              outputs.coverLetter ? (
                <div className="text-xs whitespace-pre-wrap font-sans leading-relaxed">
                  {outputs.coverLetter}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[350px] text-slate-400">
                  <FileText className="w-14 h-14 mb-3 opacity-30" />
                  <p className="text-xs">No Cover Letter generated yet.</p>
                  <p className="text-[10px] text-slate-550 mt-1">Configure parameters and click 'Generate Cover Letter' to write a tailored copy.</p>
                </div>
              )
            )}

            {activeTool === 'linkedin' && (
              outputs.linkedin ? (
                <div className="text-xs whitespace-pre-wrap font-sans leading-relaxed">
                  {outputs.linkedin}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[350px] text-slate-400">
                  <Linkedin className="w-14 h-14 mb-3 opacity-30" />
                  <p className="text-xs">No LinkedIn Profile Copy generated yet.</p>
                </div>
              )
            )}

            {activeTool === 'bio' && (
              outputs.bio ? (
                <div className="text-xs whitespace-pre-wrap font-sans leading-relaxed">
                  {outputs.bio}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[350px] text-slate-400">
                  <User className="w-14 h-14 mb-3 opacity-30" />
                  <p className="text-xs">No Professional Bios generated yet.</p>
                </div>
              )
            )}

            {activeTool === 'email' && (
              outputs.email ? (
                <div className="text-xs whitespace-pre-wrap font-sans leading-relaxed">
                  {outputs.email}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[350px] text-slate-400">
                  <Mail className="w-14 h-14 mb-3 opacity-30" />
                  <p className="text-xs">No Email Draft generated yet.</p>
                </div>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CareerTools;
