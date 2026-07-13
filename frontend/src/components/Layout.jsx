import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 transition-colors duration-300">
      <Navbar onToggleSidebar={toggleSidebar} />
      
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} />
        
        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 sm:p-6 md:ml-64 overflow-x-hidden transition-all duration-300">
          <div className="max-w-7xl mx-auto animate-[fadeIn_0.4s_ease-out]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 md:hidden"
        ></div>
      )}
    </div>
  );
};

export default Layout;
