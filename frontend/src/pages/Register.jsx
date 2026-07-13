import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      setIsSubmitting(false);
      return;
    }

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setFormError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900 text-slate-800 dark:text-slate-200 transition-colors duration-300 relative px-4 overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-primary-500/10 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/landing" className="flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-slate-300">
              CareerPilot <span className="text-primary-500">AI</span>
            </span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">Join CareerPilot AI today to prepare for job loops</p>
        </div>

        {/* Card wrapper */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-sm transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-sm transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:shadow-glow-primary text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Signup redirection footer */}
        <p className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
