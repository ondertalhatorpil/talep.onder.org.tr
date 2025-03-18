import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';


const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav>
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo area with hover effect */}
              <div className="flex-shrink-0">
                <NavLink to="/dashboard" className="flex items-center">
                  <img
                    src="https://onder.org.tr/assets/images/statics/onder-logo.svg"
                    alt="ÖNDER"
                    className="h-12 w-auto transition-transform duration-300 hover:scale-105"
                  />
                </NavLink>
              </div>

              {/* User info and logout button with improved styling */}
              <div className="flex items-center space-x-6">
                {/* User info with better visibility */}
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs text-gray-500">{user?.department}</span>
                </div>

                {/* Modern logout button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  aria-label="Çıkış Yap"
                >
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Çıkış</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="pt-4"></div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;