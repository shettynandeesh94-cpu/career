import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  LogOut, 
  Award, 
  TrendingUp, 
  FileText, 
  CheckCircle,
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';

const MockInterview = () => {
  const [role, setRole] = useState('Full Stack Engineer');
  const [mode, setMode] = useState('technical');
  const [interviewsList, setInterviewsList] = useState([]);
  
  // Active session tracking
  const [activeSession, setActiveSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userReply, setUserReply] = useState('');
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  
  // Evaluation Output details
  const [evaluation, setEvaluation] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(true); // true = setup, false = active chat, 'evaluation' = completed report
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const loadPastInterviews = async () => {
    try {
      const res = await api.get('/interviews');
      if (res.success) {
        setInterviewsList(res.interviews || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPastInterviews();
  }, [setupMode]);

  const handleStartInterview = async () => {
    setLoading(true);
    setEvaluation(null);
    try {
      const res = await api.post('/interviews/start', { role, mode });
      if (res.success && res.interview) {
        setActiveSession(res.interview);
        setChatMessages(res.interview.messages);
        setSetupMode(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userReply.trim() || submittingMessage) return;

    const currentReply = userReply;
    setUserReply('');
    setSubmittingMessage(true);

    // Optimistically update UI
    setChatMessages(prev => [...prev, { sender: 'user', text: currentReply }]);

    try {
      const res = await api.post(`/interviews/${activeSession._id}/message`, { message: currentReply });
      if (res.success) {
        setChatMessages(res.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingMessage(false);
    }
  };

  const handleEndInterview = async () => {
    if (!window.confirm('Do you want to finish this interview and generate your AI feedback report?')) return;
    setEndingSession(true);
    try {
      const res = await api.post(`/interviews/${activeSession._id}/end`);
      if (res.success && res.interview) {
        setEvaluation(res.interview.feedback);
        setSetupMode('evaluation');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEndingSession(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm">
        <h1 className="text-xl font-extrabold flex items-center">
          <MessageSquare className="w-5.5 h-5.5 mr-2.5 text-primary-500" /> AI Mock Interview Coach
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Prepare for live loops. Configure roles, chat with AI panels, and retrieve evaluations detailing confidence and correctness.
        </p>
      </div>

      {/* SETUP SCREEN */}
      {setupMode === true && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Configure panels card */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Start New Session</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Job Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                >
                  <option value="Full Stack Engineer">Full Stack Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="HR / Cultural Candidate">HR Candidate</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Interview Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
                >
                  <option value="technical">Technical / System Design / Algorithms</option>
                  <option value="hr">HR / Behavioral / Scenario Analysis</option>
                </select>
              </div>

              <button
                onClick={handleStartInterview}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:shadow-glow-primary text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Play className="w-4.5 h-4.5" />
                    <span>Convene AI Board Panel</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Past logs list */}
          <div className="lg:col-span-2 glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Mock Interview History</h3>
            
            {interviewsList.length === 0 ? (
              <div className="p-12 text-center text-slate-450 border border-dashed border-slate-200/10 rounded-2xl">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-xs">No completed interviews logged.</p>
                <p className="text-[10px] text-slate-500 mt-1">Practice loops will be evaluated and archived here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {interviewsList.map(int => (
                  <div
                    key={int._id}
                    onClick={() => {
                      setActiveSession(int);
                      setEvaluation(int.feedback);
                      setSetupMode('evaluation');
                    }}
                    className="p-4 bg-slate-100/30 dark:bg-dark-800/35 border border-slate-200/20 rounded-2xl hover:border-primary-500/20 cursor-pointer hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold truncate max-w-[150px]">{int.role}</h4>
                        <span className="text-[9px] uppercase font-bold text-slate-400">{int.mode} Panel</span>
                      </div>
                      <span className={`text-sm font-black ${getScoreColor(int.feedback?.overallScore)}`}>
                        {int.feedback?.overallScore}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3">Completed: {new Date(int.updatedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAT SESSION INTERFACE */}
      {setupMode === false && activeSession && (
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-4 sm:p-6 shadow-xl max-w-3xl mx-auto flex flex-col h-[70vh] min-h-[500px]">
          {/* Top Panel bar */}
          <div className="flex justify-between items-center border-b border-slate-200/35 dark:border-slate-800/35 pb-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">{activeSession.role}</h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">{activeSession.mode} AI Interview panel</p>
            </div>
            
            <button
              onClick={handleEndInterview}
              disabled={endingSession}
              className="px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/15 text-xs font-bold rounded-xl transition-all flex items-center"
            >
              {endingSession ? 'Evaluating...' : 'Conclude & Score'}
            </button>
          </div>

          {/* Dialogue Transcript logs */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1 scrollbar-thin">
            {chatMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-3xl text-xs leading-relaxed
                  ${msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-primary-500 to-indigo-600 text-white rounded-tr-none shadow-md shadow-primary-500/10'
                    : 'bg-slate-100 dark:bg-dark-800/80 border border-slate-200/10 rounded-tl-none text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <p className="font-bold text-[9px] uppercase tracking-wider mb-1 opacity-75">
                    {msg.sender === 'user' ? 'You (Candidate)' : 'AI Interviewer'}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {submittingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 bg-slate-100 dark:bg-dark-800/80 border border-slate-200/10 rounded-3xl rounded-tl-none text-xs">
                  <div className="flex space-x-1.5 py-1 px-2 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef}></div>
          </div>

          {/* User Input bar */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-200/35 dark:border-slate-800/35 pt-4 flex space-x-2">
            <input
              type="text"
              required
              value={userReply}
              onChange={(e) => setUserReply(e.target.value)}
              disabled={submittingMessage || endingSession}
              placeholder="Type your response here..."
              className="flex-1 px-4 py-3.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-xs"
            />
            <button
              type="submit"
              disabled={submittingMessage || !userReply.trim() || endingSession}
              className="p-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-glow-primary disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* EVALUATION REPORT VIEW */}
      {setupMode === 'evaluation' && evaluation && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header & scores block */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/35 dark:border-slate-800/35 pb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded uppercase">Report Compiled</span>
                <h3 className="text-base font-black mt-1">Mock Assessment: {activeSession.role}</h3>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">{activeSession.mode} loop</p>
              </div>
              <button
                onClick={() => setSetupMode(true)}
                className="flex items-center px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" /> Back to Dashboard
              </button>
            </div>

            {/* Scores grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200/15 rounded-2xl p-4 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Overall Performance</p>
                <h2 className={`text-2xl font-black mt-1 ${getScoreColor(evaluation.overallScore)}`}>{evaluation.overallScore}%</h2>
              </div>
              <div className="bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200/15 rounded-2xl p-4 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Communication & Structure</p>
                <h2 className={`text-2xl font-black mt-1 ${getScoreColor(evaluation.communicationScore)}`}>{evaluation.communicationScore}%</h2>
              </div>
              <div className="bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200/15 rounded-2xl p-4 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Technical depth</p>
                <h2 className={`text-2xl font-black mt-1 ${getScoreColor(evaluation.correctnessScore)}`}>{evaluation.correctnessScore}%</h2>
              </div>
              <div className="bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200/15 rounded-2xl p-4 text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Confidence level</p>
                <h2 className={`text-2xl font-black mt-1 ${getScoreColor(evaluation.confidenceScore)}`}>{evaluation.confidenceScore}%</h2>
              </div>
            </div>

            {/* Critique text */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Award className="w-4 h-4 mr-1.5 text-primary-500" /> Executive Feedback
              </h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350 bg-slate-100/30 dark:bg-dark-800/20 p-4 border border-slate-200/10 rounded-2xl">{evaluation.feedbackText}</p>
            </div>
          </div>

          {/* QA list improvements */}
          {evaluation.sampleImprovements && evaluation.sampleImprovements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Round Transcript & Critique Suggestions</h3>
              
              <div className="space-y-4">
                {evaluation.sampleImprovements.map((item, idx) => (
                  <div key={idx} className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-5 shadow-sm space-y-3 text-xs">
                    <div className="p-3 bg-slate-100/50 dark:bg-dark-800/30 rounded-xl">
                      <p className="font-bold text-[9px] text-slate-400 uppercase mb-1">Interviewer Question {idx + 1}</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-250">{item.question}</p>
                    </div>
                    
                    <div className="p-3 border border-slate-100 dark:border-slate-850 rounded-xl">
                      <p className="font-bold text-[9px] text-slate-400 uppercase mb-1">Your response</p>
                      <p className="italic text-slate-600 dark:text-slate-400">"{item.userAnswer}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                        <p className="font-bold text-[9px] text-rose-500 uppercase mb-1">Critique</p>
                        <p className="text-slate-600 dark:text-slate-350">{item.critique}</p>
                      </div>
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <p className="font-bold text-[9px] text-emerald-500 uppercase mb-1">Suggested Exemplar Response</p>
                        <p className="text-slate-600 dark:text-slate-350 whitespace-pre-wrap">{item.suggestedAnswer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MockInterview;
