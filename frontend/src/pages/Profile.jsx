import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Save, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  MapPin,
  Phone
} from 'lucide-react';
import { Linkedin, Github } from '../components/BrandIcons';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [skills, setSkills] = useState([]);
  
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTitle(user.profile?.title || '');
      setSummary(user.profile?.summary || '');
      setPhone(user.profile?.phone || '');
      setLocation(user.profile?.location || '');
      setWebsite(user.profile?.website || '');
      setLinkedin(user.profile?.linkedin || '');
      setGithub(user.profile?.github || '');
      setSkills(user.profile?.skills || []);
    }
  }, [user]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await updateProfile({
        name,
        profile: {
          title,
          summary,
          phone,
          location,
          website,
          linkedin,
          github,
          skills,
        }
      });
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm">
        <h1 className="text-xl font-extrabold flex items-center">
          <User className="w-5.5 h-5.5 mr-2.5 text-primary-500" /> Profile Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure your professional background. These details are used as inputs for AI career tools.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {status.message && (
          <div className={`p-4 rounded-2xl flex items-start space-x-2 text-xs border
            ${status.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT SIDEBAR: PROFILE SUMMARY */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 border border-primary-500/20 flex items-center justify-center text-white text-3xl font-black shadow-glow-primary">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            </div>
            {title && (
              <span className="px-3 py-1 bg-primary-500/10 text-primary-500 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                {title}
              </span>
            )}
            
            <div className="w-full border-t border-slate-200/40 dark:border-slate-800/45 pt-4 text-xs text-left space-y-3.5">
              {location && <p className="flex items-center text-slate-500"><MapPin className="w-4 h-4 mr-2" /> {location}</p>}
              {phone && <p className="flex items-center text-slate-500"><Phone className="w-4 h-4 mr-2" /> {phone}</p>}
              {website && <p className="flex items-center text-slate-500"><Globe className="w-4 h-4 mr-2" /> {website}</p>}
              {linkedin && <p className="flex items-center text-slate-500"><Linkedin className="w-4 h-4 mr-2" /> {linkedin}</p>}
              {github && <p className="flex items-center text-slate-500"><Github className="w-4 h-4 mr-2" /> {github}</p>}
            </div>
          </div>

          {/* RIGHT PANELS: FIELDS */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Core Info */}
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">Core Background</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Professional Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lead Fullstack Engineer"
                    className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Contact</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Professional Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  placeholder="Tell us about your background, achievements, and core targets..."
                  className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* Socials & portfolios */}
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">Social Links & Portfolios</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">LinkedIn URL</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/..."
                    className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">GitHub URL</label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="github.com/..."
                    className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Personal Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="myportfolio.com"
                    className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Core Skill tags */}
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">Competency Skills</h3>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Type skill (e.g. React) and click '+'"
                  className="flex-1 px-3.5 py-2 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                />
                <button
                  onClick={handleAddSkill}
                  className="p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {skills.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">No skill tags registered. Add some to feed AI tools.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(sk => (
                    <span 
                      key={sk} 
                      className="px-2.5 py-1 bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-350 border border-slate-200/40 rounded-lg text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <span>{sk}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(sk)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Save bar */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-bold text-xs rounded-xl hover:shadow-glow-primary hover:scale-[1.01] transition-all"
              >
                {loading ? (
                  <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-4.5 h-4.5 mr-1.5" /> Save Profile Details
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
};

export default Profile;
