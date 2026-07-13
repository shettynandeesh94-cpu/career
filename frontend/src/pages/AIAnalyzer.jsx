import React, { useState } from 'react';
import { api } from '../utils/api';
import { 
  Cpu, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  HelpCircle,
  FileCheck
} from 'lucide-react';

const AIAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF resumes are supported.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    setError('');
    setLoading(true);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobTitle', jobTitle);
      formData.append('jobDescription', jobDescription);

      const res = await api.post('/ai/analyze-resume', formData, true);
      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      } else {
        setError('Failed to analyze the resume.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during resume analysis.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 60) return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-500 border-rose-500/20 bg-rose-500/5';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm">
        <h1 className="text-xl font-extrabold flex items-center">
          <Cpu className="w-5.5 h-5.5 mr-2.5 text-primary-500" /> AI Resume Analyzer (ATS Auditor)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload your resume PDF to receive instant ATS scores, critical missing keywords, and detailed bullet suggestions powered by Google Gemini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: UPLOAD & CONFIG INPUT */}
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">Upload & Targets</h2>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Drag Drop Area */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resume File (PDF)</label>
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-850 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl p-6 text-center transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {file ? (
                  <div className="flex flex-col items-center space-y-2">
                    <FileCheck className="w-10 h-10 text-emerald-500" />
                    <p className="text-xs font-bold truncate max-w-[200px]">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Format</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                    <p className="text-xs font-semibold">Drag & drop or click to browse</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Supports PDF format up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Job Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Frontend Engineer"
                className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description listing to extract missing keywords..."
                rows={5}
                className="block w-full px-3.5 py-2.5 bg-slate-100/50 dark:bg-dark-800/40 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-xs leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:shadow-glow-primary text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running Auditor...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4.5 h-4.5" />
                  <span>Start ATS Audit</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: SCANNED REPORT / INSTRUCTIONS */}
        <div className="lg:col-span-2 space-y-6">
          {!analysis && !loading && (
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-600">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30 animate-pulse" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-400">Awaiting Resume Upload</h3>
              <p className="text-xs max-w-sm mx-auto mt-2 leading-relaxed">
                Configure your target role on the left and upload your resume PDF. The AI Auditor will analyze match score, search vocabulary, identify spelling flags, and suggest edits.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-12 text-center">
              {/* Scan scanner animation */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <Cpu className="w-8 h-8 text-primary-500 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-base font-bold">Analyzing Resume Structures</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed animate-pulse">
                Parsing PDF contents, identifying target matches, and requesting Gemini API evaluation report...
              </p>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* Scores Card */}
              <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Circle Score Gauge */}
                  <div className={`w-28 h-28 rounded-full border-8 flex flex-col items-center justify-center flex-shrink-0 ${getScoreColor(analysis.score)}`}>
                    <span className="text-3xl font-black">{analysis.score}%</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-85">ATS Match</span>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Summary</span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{analysis.summary}</h3>
                    
                    <div className="flex flex-wrap gap-4 pt-2 justify-center sm:justify-start">
                      <div className="flex items-center text-xs">
                        <span className="text-slate-400 mr-1.5">Grammar Score:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{analysis.grammarScore}/100</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <span className="text-slate-400 mr-1.5">Impact Score:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{analysis.impactScore}/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keywords comparison columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                  {/* Matching */}
                  <div className="space-y-2 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-emerald-600 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Matching Keywords ({analysis.matchingKeywords?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.matchingKeywords?.map((kw, i) => (
                        <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing */}
                  <div className="space-y-2 bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-rose-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5" /> Missing Keywords ({analysis.missingKeywords?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingKeywords?.map((kw, i) => (
                        <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-md">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions and feedback split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Structural Improvements & grammar */}
                <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Grammar & Structure Check</h3>
                  
                  {/* Grammar feedback */}
                  {analysis.grammarFeedback && analysis.grammarFeedback.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Writing issues detected:</h4>
                      {analysis.grammarFeedback.map((item, i) => (
                        <div key={i} className="text-xs p-3 bg-slate-100/50 dark:bg-dark-800/30 border border-slate-200/15 rounded-xl space-y-1">
                          <p className="font-bold text-rose-500">❌ {item.issue}</p>
                          <p className="text-slate-500 pl-4">💡 Suggestion: {item.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Structural suggestions */}
                  {analysis.structuralImprovements && analysis.structuralImprovements.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Structural layout improvements:</h4>
                      {analysis.structuralImprovements.map((item, i) => (
                        <div key={i} className="text-xs p-3 bg-slate-100/50 dark:bg-dark-800/30 border border-slate-200/15 rounded-xl space-y-1">
                          <p className="font-bold text-primary-500">📍 Section: {item.section}</p>
                          <p className="text-slate-500 pl-4">{item.tip}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AISuggestions recommendations list */}
                <div className="glass-panel border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step-by-Step Optimization Plan</h3>
                  <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-600 dark:text-slate-300">
                    {analysis.aiSuggestions}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AIAnalyzer;
