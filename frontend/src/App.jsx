import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import AIAnalyzer from './pages/AIAnalyzer';
import CareerTools from './pages/CareerTools';
import JobTracker from './pages/JobTracker';
import MockInterview from './pages/MockInterview';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes enclosed in Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="resume-builder" element={<ResumeBuilder />} />
              <Route path="ai-analyzer" element={<AIAnalyzer />} />
              <Route path="career-tools" element={<CareerTools />} />
              <Route path="job-tracker" element={<JobTracker />} />
              <Route path="mock-interview" element={<MockInterview />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Fallback Catch All */}
            <Route path="*" element={<Navigate to="/landing" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
