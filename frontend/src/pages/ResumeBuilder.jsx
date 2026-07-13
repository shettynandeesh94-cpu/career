import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Download, 
  Plus, 
  Trash2,
  ListRestart
} from 'lucide-react';

const emptyResumeState = {
  title: 'My Resume',
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  templateId: 'minimal',
};

const ResumeBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resumeId = searchParams.get('id');

  const [resumesList, setResumesList] = useState([]);
  const [resumeData, setResumeData] = useState(emptyResumeState);
  const [activeTab, setActiveTab] = useState('personal'); // personal, experience, education, projects, skills, certs
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  // Fetch list of user resumes and active resume if specified
  useEffect(() => {
    const loadResumes = async () => {
      try {
        const res = await api.get('/resumes');
        if (res.success) {
          setResumesList(res.resumes || []);
          
          if (resumeId) {
            const activeRes = await api.get(`/resumes/${resumeId}`);
            if (activeRes.success) {
              setResumeData(activeRes.resume);
            }
          } else if (res.resumes && res.resumes.length > 0) {
            // Default to first resume found
            setResumeData(res.resumes[0]);
            navigate(`?id=${res.resumes[0]._id}`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Error loading resumes:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadResumes();
  }, [resumeId]);

  const handleInputChange = (section, field, value) => {
    setResumeData(prev => {
      if (section === 'personalInfo') {
        return {
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [section]: value
      };
    });
  };

  // List field modifiers (Experience, Education, Projects, Skills, Certs)
  const addListItem = (section, defaultObj) => {
    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], { ...defaultObj, id: Date.now().toString() }]
    }));
  };

  const removeListItem = (section, idx) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== idx)
    }));
  };

  const updateListItem = (section, idx, field, value) => {
    setResumeData(prev => {
      const updatedList = [...prev[section]];
      updatedList[idx] = { ...updatedList[idx], [field]: value };
      return {
        ...prev,
        [section]: updatedList
      };
    });
  };

  const saveResume = async () => {
    setSaveStatus('Saving...');
    try {
      if (resumeData._id) {
        const res = await api.put(`/resumes/${resumeData._id}`, resumeData);
        if (res.success) {
          setSaveStatus('Saved!');
          setResumeData(res.resume);
        }
      } else {
        const res = await api.post('/resumes', resumeData);
        if (res.success) {
          setSaveStatus('Saved!');
          setResumeData(res.resume);
          navigate(`?id=${res.resume._id}`, { replace: true });
        }
      }
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setSaveStatus('Error saving');
      console.error(err);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const createNewResumeCopy = async () => {
    setLoading(true);
    try {
      const copyData = {
        ...resumeData,
        title: `Copy of ${resumeData.title || 'Resume'}`
      };
      delete copyData._id;
      delete copyData.createdAt;
      delete copyData.updatedAt;

      const res = await api.post('/resumes', copyData);
      if (res.success) {
        setResumeData(res.resume);
        // Refresh resumes dropdown list
        const listRes = await api.get('/resumes');
        if (listRes.success) {
          setResumesList(listRes.resumes || []);
        }
        navigate(`?id=${res.resume._id}`, { replace: true });
      }
    } catch (err) {
      console.error('Failed to create copy of resume:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerPDFDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', name: 'Personal Details', icon: User },
    { id: 'experience', name: 'Work History', icon: Briefcase },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'projects', name: 'Projects', icon: Code },
    { id: 'skills', name: 'Core Skills', icon: ListRestart },
    { id: 'certs', name: 'Certifications', icon: Award },
  ];

  return (
    <div className="space-y-6 print-area">
      {/* Header controls (HIDDEN IN PRINT) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <input
              type="text"
              value={resumeData.title}
              onChange={(e) => handleInputChange('title', null, e.target.value)}
              className="text-base font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 focus:outline-none py-0.5"
            />
            <p className="text-[10px] text-slate-400">Manage multiple versions linked to your account</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Resume Version Switcher */}
          {resumesList.length > 0 && (
            <select
              value={resumeData._id || ''}
              onChange={(e) => navigate(`?id=${e.target.value}`)}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none"
            >
              <option value="">-- Switch Resume --</option>
              {resumesList.map(res => (
                <option key={res._id} value={res._id}>{res.title}</option>
              ))}
            </select>
          )}

          <button
            onClick={createNewResumeCopy}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-dark-800 text-xs font-semibold transition-colors"
          >
            Create New copy
          </button>

          <button
            onClick={saveResume}
            className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs rounded-xl transition-colors shadow-glow-primary"
          >
            <Save className="w-4 h-4 mr-1.5" /> {saveStatus || 'Save Draft'}
          </button>

          <button
            onClick={triggerPDFDownload}
            className="flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5" /> PDF Download
          </button>
        </div>
      </div>

      {/* Editor Content split (PREVIEW AREA ALONE ON PRINT) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: EDITOR PANEL (HIDDEN IN PRINT) */}
        <div className="no-print space-y-6 glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm">
          {/* Wizard Tabs scrollbar */}
          <div className="flex border-b border-slate-200/50 dark:border-slate-800/40 overflow-x-auto pb-1 space-x-1.5 scrollbar-thin">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2.5 border-b-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'border-primary-500 text-primary-500 bg-primary-500/5' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:bg-dark-800/50'
                    }`}
                >
                  <TabIcon className="w-4.5 h-4.5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="min-h-[450px]">
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.firstName}
                      onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.lastName}
                      onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                      placeholder="Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                      placeholder="jane.doe@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Website</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.website}
                      onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                      placeholder="janedoe.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">LinkedIn Profile Link</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.linkedin}
                      onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                      placeholder="linkedin.com/in/janedoe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">GitHub Profile Link</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.github}
                      onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                      placeholder="github.com/janedoe"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Professional Summary</label>
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) => handleInputChange('summary', null, e.target.value)}
                    rows={4}
                    className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs leading-relaxed"
                    placeholder="Result-oriented full stack developer with 3+ years experience building highly performant frontend clients..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Work Experience</h3>
                  <button
                    onClick={() => addListItem('experience', { company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '' })}
                    className="flex items-center px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-500 font-bold text-[10px] hover:bg-primary-500/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Job
                  </button>
                </div>

                {resumeData.experience.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center bg-slate-100/30 dark:bg-dark-800/20 rounded-2xl border border-dashed border-slate-200/10">No work experience entries added. Click 'Add Job'.</p>
                ) : (
                  <div className="space-y-6">
                    {resumeData.experience.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-100/30 dark:bg-dark-800/20 border border-slate-200/45 dark:border-slate-850 relative space-y-3">
                        <button
                          onClick={() => removeListItem('experience', idx)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Company Name</label>
                            <input
                              type="text"
                              value={item.company}
                              onChange={(e) => updateListItem('experience', idx, 'company', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="Acme Corp"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Role Title</label>
                            <input
                              type="text"
                              value={item.role}
                              onChange={(e) => updateListItem('experience', idx, 'role', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="Software Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Start Date</label>
                            <input
                              type="text"
                              value={item.startDate}
                              onChange={(e) => updateListItem('experience', idx, 'startDate', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="MM/YYYY or Year"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">End Date (or 'Present')</label>
                            <input
                              type="text"
                              value={item.endDate}
                              onChange={(e) => updateListItem('experience', idx, 'endDate', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="MM/YYYY or Present"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Responsibilities / Bullet points (one per line)</label>
                          <textarea
                            value={item.description}
                            onChange={(e) => updateListItem('experience', idx, 'description', e.target.value)}
                            rows={3}
                            className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs leading-relaxed"
                            placeholder="• Developed backend logic using Express/MongoDB.&#10;• Orchestrated Redux stores reducing redraw overhead."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Education Details</h3>
                  <button
                    onClick={() => addListItem('education', { school: '', degree: '', fieldOfStudy: '', location: '', startDate: '', endDate: '', gpa: '' })}
                    className="flex items-center px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-500 font-bold text-[10px] hover:bg-primary-500/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add School
                  </button>
                </div>

                {resumeData.education.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center bg-slate-100/30 dark:bg-dark-800/20 rounded-2xl border border-dashed border-slate-200/10">No education entries added. Click 'Add School'.</p>
                ) : (
                  <div className="space-y-6">
                    {resumeData.education.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-100/30 dark:bg-dark-800/20 border border-slate-200/45 dark:border-slate-850 relative space-y-3">
                        <button
                          onClick={() => removeListItem('education', idx)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">School / University</label>
                            <input
                              type="text"
                              value={item.school}
                              onChange={(e) => updateListItem('education', idx, 'school', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="Stanford University"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Degree</label>
                            <input
                              type="text"
                              value={item.degree}
                              onChange={(e) => updateListItem('education', idx, 'degree', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="Bachelor of Science"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Field of Study</label>
                            <input
                              type="text"
                              value={item.fieldOfStudy}
                              onChange={(e) => updateListItem('education', idx, 'fieldOfStudy', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="Computer Science"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">GPA / Grades</label>
                            <input
                              type="text"
                              value={item.gpa}
                              onChange={(e) => updateListItem('education', idx, 'gpa', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="3.8/4.0"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Start Date</label>
                            <input
                              type="text"
                              value={item.startDate}
                              onChange={(e) => updateListItem('education', idx, 'startDate', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="MM/YYYY or Year"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">End Date</label>
                            <input
                              type="text"
                              value={item.endDate}
                              onChange={(e) => updateListItem('education', idx, 'endDate', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="MM/YYYY or Grad date"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Personal & Academic Projects</h3>
                  <button
                    onClick={() => addListItem('projects', { name: '', role: '', technologies: '', link: '', description: '' })}
                    className="flex items-center px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-500 font-bold text-[10px] hover:bg-primary-500/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
                  </button>
                </div>

                {resumeData.projects.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center bg-slate-100/30 dark:bg-dark-800/20 rounded-2xl border border-dashed border-slate-200/10">No projects added. Click 'Add Project'.</p>
                ) : (
                  <div className="space-y-6">
                    {resumeData.projects.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-100/30 dark:bg-dark-800/20 border border-slate-200/45 dark:border-slate-850 relative space-y-3">
                        <button
                          onClick={() => removeListItem('projects', idx)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Project Name</label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateListItem('projects', idx, 'name', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="E-Commerce API"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Role / Responsibility</label>
                            <input
                              type="text"
                              value={item.role}
                              onChange={(e) => updateListItem('projects', idx, 'role', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="Lead Backend Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Technologies Used</label>
                            <input
                              type="text"
                              value={item.technologies}
                              onChange={(e) => updateListItem('projects', idx, 'technologies', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="Node.js, Express, MongoDB, Redis"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Project Link (e.g. GitHub)</label>
                            <input
                              type="text"
                              value={item.link}
                              onChange={(e) => updateListItem('projects', idx, 'link', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="github.com/user/project"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Description (bullet points, one per line)</label>
                          <textarea
                            value={item.description}
                            onChange={(e) => updateListItem('projects', idx, 'description', e.target.value)}
                            rows={3}
                            className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs leading-relaxed"
                            placeholder="• Designed schemas using Mongoose.&#10;• Set up caching layers using Redis reducing API latency by 60%."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Core Skills</h3>
                  <button
                    onClick={() => addListItem('skills', { name: '', level: 'Intermediate' })}
                    className="flex items-center px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-500 font-bold text-[10px] hover:bg-primary-500/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Skill
                  </button>
                </div>

                {resumeData.skills.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center bg-slate-100/30 dark:bg-dark-800/20 rounded-2xl border border-dashed border-slate-200/10">No skills added. Click 'Add Skill'.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resumeData.skills.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-100/30 dark:bg-dark-800/20 border border-slate-200/45 dark:border-slate-850 flex items-center justify-between space-x-2">
                        <div className="flex-1 space-y-1.5">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateListItem('skills', idx, 'name', e.target.value)}
                            className="block w-full px-2.5 py-1.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none text-xs"
                            placeholder="React.js"
                          />
                          <select
                            value={item.level}
                            onChange={(e) => updateListItem('skills', idx, 'level', e.target.value)}
                            className="block w-full px-2 py-1 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none text-[10px]"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>
                        <button
                          onClick={() => removeListItem('skills', idx)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certs' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Certifications & Awards</h3>
                  <button
                    onClick={() => addListItem('certifications', { name: '', issuer: '', date: '', link: '' })}
                    className="flex items-center px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-500 font-bold text-[10px] hover:bg-primary-500/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Cert
                  </button>
                </div>

                {resumeData.certifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center bg-slate-100/30 dark:bg-dark-800/20 rounded-2xl border border-dashed border-slate-200/10">No certifications added. Click 'Add Cert'.</p>
                ) : (
                  <div className="space-y-6">
                    {resumeData.certifications.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-100/30 dark:bg-dark-800/20 border border-slate-200/45 dark:border-slate-850 relative space-y-3">
                        <button
                          onClick={() => removeListItem('certifications', idx)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Certification Name</label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateListItem('certifications', idx, 'name', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="AWS Cloud Practitioner"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Issuing Organization</label>
                            <input
                              type="text"
                              value={item.issuer}
                              onChange={(e) => updateListItem('certifications', idx, 'issuer', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="Amazon Web Services"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Issue Date</label>
                            <input
                              type="text"
                              value={item.date}
                              onChange={(e) => updateListItem('certifications', idx, 'date', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="MM/YYYY or Year"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase">Credential URL</label>
                            <input
                              type="text"
                              value={item.link}
                              onChange={(e) => updateListItem('certifications', idx, 'link', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs mt-1"
                              placeholder="aws.amazon.com/verify/..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick wizard controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-slate-800/50 mt-6">
            <button
              onClick={() => {
                const idx = tabs.findIndex(t => t.id === activeTab);
                if (idx > 0) setActiveTab(tabs[idx - 1].id);
              }}
              disabled={activeTab === 'personal'}
              className="flex items-center text-xs font-bold text-slate-500 hover:text-primary-500 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>
            <button
              onClick={() => {
                const idx = tabs.findIndex(t => t.id === activeTab);
                if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
              }}
              disabled={activeTab === 'certs'}
              className="flex items-center text-xs font-bold text-slate-500 hover:text-primary-500 disabled:opacity-30 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE CANVAS PREVIEW */}
        <div className="space-y-4">
          {/* Template Switcher (HIDDEN IN PRINT) */}
          <div className="flex items-center justify-between no-print glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-2xl px-5 py-3 shadow-sm">
            <span className="text-xs font-bold text-slate-500">Resume Styling Template:</span>
            <div className="flex space-x-2">
              {['minimal', 'tech', 'professional'].map(t => (
                <button
                  key={t}
                  onClick={() => handleInputChange('templateId', null, t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize
                    ${resumeData.templateId === t 
                      ? 'bg-primary-500 text-white shadow-sm' 
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Actual CV Document Wrapper */}
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-xl p-8 min-h-[842px] max-w-[595px] mx-auto print-area text-left font-sans text-sm relative">
            
            {/* Template 1: MINIMAL */}
            {resumeData.templateId === 'minimal' && (
              <div className="space-y-5">
                {/* Header */}
                <div className="text-center space-y-1.5 pb-4 border-b border-slate-200">
                  <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-800">
                    {resumeData.personalInfo.firstName || 'Jane'} {resumeData.personalInfo.lastName || 'Doe'}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                    {resumeData.personalInfo.website && <span className="underline">{resumeData.personalInfo.website}</span>}
                    {resumeData.personalInfo.linkedin && <span>{resumeData.personalInfo.linkedin}</span>}
                    {resumeData.personalInfo.github && <span>{resumeData.personalInfo.github}</span>}
                  </div>
                </div>

                {/* Summary */}
                {resumeData.summary && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-0.5">Professional Summary</h2>
                    <p className="text-xs text-slate-600 leading-relaxed">{resumeData.summary}</p>
                  </div>
                )}

                {/* Work Experience */}
                {resumeData.experience.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-0.5">Work History</h2>
                    <div className="space-y-3">
                      {resumeData.experience.map((exp, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-start text-xs">
                            <div>
                              <span className="font-bold text-slate-700">{exp.role}</span>
                              <span className="text-slate-400"> @ {exp.company}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold">{exp.startDate} – {exp.endDate || 'Present'}</span>
                          </div>
                          {exp.description && (
                            <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed pl-2 border-l border-slate-100">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-0.5">Projects</h2>
                    <div className="space-y-3">
                      {resumeData.projects.map((proj, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-start text-xs">
                            <div>
                              <span className="font-bold text-slate-700">{proj.name}</span>
                              {proj.role && <span className="text-slate-400"> ({proj.role})</span>}
                            </div>
                            {proj.link && <span className="text-[10px] text-slate-400 underline">{proj.link}</span>}
                          </div>
                          {proj.technologies && (
                            <p className="text-[10px] text-primary-600 font-semibold">Tech: {proj.technologies}</p>
                          )}
                          {proj.description && (
                            <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed pl-2 border-l border-slate-100">{proj.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-0.5">Education</h2>
                    <div className="space-y-2">
                      {resumeData.education.map((edu, index) => (
                        <div key={index} className="flex justify-between items-start text-xs">
                          <div>
                            <span className="font-bold text-slate-700">{edu.school}</span>
                            <span className="text-slate-500"> — {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</span>
                            {edu.gpa && <span className="text-slate-400 text-[10px] block">GPA: {edu.gpa}</span>}
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold">{edu.startDate} – {edu.endDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-0.5">Skills</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeData.skills.map((s, index) => (
                        <span key={index} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold border border-slate-200/50">
                          {s.name} ({s.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {resumeData.certifications.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-0.5">Certifications</h2>
                    <div className="space-y-1">
                      {resumeData.certifications.map((c, index) => (
                        <div key={index} className="flex justify-between text-xs text-slate-600">
                          <div>
                            <span className="font-semibold">{c.name}</span> — <span className="text-slate-400">{c.issuer}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{c.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Template 2: TECH SLATE */}
            {resumeData.templateId === 'tech' && (
              <div className="space-y-5">
                {/* Header */}
                <div className="border-l-4 border-primary-500 pl-4 py-1 space-y-1">
                  <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                    {resumeData.personalInfo.firstName || 'Jane'} {resumeData.personalInfo.lastName || 'Doe'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-500 font-medium">
                    {resumeData.personalInfo.email && <span>Email: {resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span>Phone: {resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.location && <span>Loc: {resumeData.personalInfo.location}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[10px] text-slate-400 font-semibold">
                    {resumeData.personalInfo.website && <span className="text-primary-500 underline">{resumeData.personalInfo.website}</span>}
                    {resumeData.personalInfo.linkedin && <span>LinkedIn: {resumeData.personalInfo.linkedin}</span>}
                    {resumeData.personalInfo.github && <span>GitHub: {resumeData.personalInfo.github}</span>}
                  </div>
                </div>

                {/* Summary */}
                {resumeData.summary && (
                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{resumeData.summary}</p>
                  </div>
                )}

                {/* Work Experience */}
                {resumeData.experience.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-primary-600 flex items-center">
                      <span className="w-1.5 h-3 bg-primary-500 mr-2 rounded-sm inline-block"></span> Work History
                    </h2>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="font-extrabold text-slate-800">{exp.role} <span className="font-normal text-slate-400">at {exp.company}</span></span>
                            <span className="text-[10px] text-slate-400 font-bold">{exp.startDate} – {exp.endDate || 'Present'}</span>
                          </div>
                          {exp.description && (
                            <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed pl-3 border-l-2 border-slate-200">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-primary-600 flex items-center">
                      <span className="w-1.5 h-3 bg-primary-500 mr-2 rounded-sm inline-block"></span> Key Projects
                    </h2>
                    <div className="space-y-3">
                      {resumeData.projects.map((proj, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="font-extrabold text-slate-800">{proj.name} {proj.role && <span className="font-normal text-slate-400">({proj.role})</span>}</span>
                            {proj.link && <span className="text-[9px] text-primary-500 font-semibold underline">{proj.link}</span>}
                          </div>
                          {proj.technologies && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {proj.technologies.split(',').map((tech, i) => (
                                <span key={i} className="text-[9px] font-bold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">{tech.trim()}</span>
                              ))}
                            </div>
                          )}
                          {proj.description && (
                            <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed pl-3 border-l-2 border-slate-200 mt-1">{proj.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Split grid for Skills, Education, Certs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {resumeData.skills.length > 0 && (
                      <div className="space-y-2">
                        <h2 className="text-xs font-black uppercase tracking-wider text-primary-600">Core Stack</h2>
                        <div className="flex flex-wrap gap-1">
                          {resumeData.skills.map((s, index) => (
                            <span key={index} className="px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] font-bold uppercase tracking-tight">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    {resumeData.education.length > 0 && (
                      <div className="space-y-2">
                        <h2 className="text-xs font-black uppercase tracking-wider text-primary-600">Education</h2>
                        {resumeData.education.map((edu, index) => (
                          <div key={index} className="text-[10px] text-slate-600 leading-tight">
                            <p className="font-bold text-slate-800">{edu.school}</p>
                            <p>{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                            <p className="text-slate-400 font-semibold">{edu.startDate} – {edu.endDate}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Template 3: PROFESSIONAL */}
            {resumeData.templateId === 'professional' && (
              <div className="space-y-4">
                {/* Header columns */}
                <div className="flex justify-between items-start pb-4 border-b-2 border-slate-800">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
                      {resumeData.personalInfo.firstName || 'Jane'}
                    </h1>
                    <h1 className="text-3xl font-light text-slate-600 leading-none mt-1">
                      {resumeData.personalInfo.lastName || 'Doe'}
                    </h1>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 space-y-0.5">
                    {resumeData.personalInfo.email && <p className="font-bold text-slate-700">{resumeData.personalInfo.email}</p>}
                    {resumeData.personalInfo.phone && <p>{resumeData.personalInfo.phone}</p>}
                    {resumeData.personalInfo.location && <p>{resumeData.personalInfo.location}</p>}
                    {resumeData.personalInfo.linkedin && <p>{resumeData.personalInfo.linkedin}</p>}
                    {resumeData.personalInfo.github && <p>{resumeData.personalInfo.github}</p>}
                  </div>
                </div>

                {/* Rest identical to minimal but premium typography styling */}
                {resumeData.summary && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-slate-800">Profile</h2>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{resumeData.summary}</p>
                  </div>
                )}

                {resumeData.experience.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-slate-800 border-t border-slate-200 pt-2">Experience</h2>
                    <div className="space-y-3">
                      {resumeData.experience.map((exp, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-800">{exp.role} <span className="text-slate-400">| {exp.company}</span></span>
                            <span className="text-slate-500 font-medium">{exp.startDate} – {exp.endDate || 'Present'}</span>
                          </div>
                          {exp.description && (
                            <p className="text-[11px] text-slate-600 leading-relaxed pl-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.education.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-slate-800 border-t border-slate-200 pt-2">Academic background</h2>
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="flex justify-between text-xs text-slate-650">
                        <div>
                          <span className="font-bold text-slate-800">{edu.school}</span> — <span>{edu.degree} in {edu.fieldOfStudy}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{edu.startDate} – {edu.endDate}</span>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.skills.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-slate-800 border-t border-slate-200 pt-2">Expertise</h2>
                    <p className="text-xs text-slate-600">
                      {resumeData.skills.map(s => s.name).join(' • ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeBuilder;
