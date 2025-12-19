import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Sayfa kaydırıldığında nav barın gölge alması için
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Navigasyon Paneli */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-3 lg:px-10">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Alanı */}
            <div className="flex items-center space-x-12">
              <NavLink to="/dashboard" className="flex items-center group">
                <img
                  src="https://onder.org.tr/assets/images/statics/onder-logo.svg"
                  alt="ÖNDER"
                  className="h-10 w-auto transition-transform duration-500 group-hover:rotate-[-2deg]"
                />
              </NavLink>

              {/* Masaüstü Menü (Opsiyonel: Eğer başka linklerin varsa buraya ekleyebilirsin) */}
              <div className="hidden lg:flex items-center space-x-8">
                <NavLink to="/dashboard" className={({isActive}) => `text-sm font-bold tracking-tight transition-all ${isActive ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  Panel
                </NavLink>
                <NavLink to="/reservations" className={({isActive}) => `text-sm font-bold tracking-tight transition-all ${isActive ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  Taleplerim
                </NavLink>
              </div>
            </div>

            {/* Kullanıcı ve Aksiyon Alanı */}
            <div className="flex items-center space-x-6">
              {/* Kullanıcı Profili Mini */}
              <div className="hidden md:flex flex-col items-end border-r border-gray-200 pr-6">
                <span className="text-sm font-bold text-gray-900 leading-none">
                  {user?.name || "Kullanıcı"}
                </span>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">
                  {user?.department || "Departman"}
                </span>
              </div>

              {/* Çıkış Butonu */}
              <button
                onClick={handleLogout}
                className="group flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-2xl text-gray-400 md:text-white md:bg-gray-900 hover:bg-red-600 md:hover:shadow-lg md:hover:shadow-red-100 transition-all duration-300"
                title="Çıkış Yap"
              >
                <svg className="h-5 w-5 md:mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden md:block text-sm font-bold">Çıkış</span>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Ana İçerik */}
      <main className="relative">
        {/* Dekoratif Arka Plan Efekti (Dashboard'a derinlik katar) */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white to-transparent pointer-events-none -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-2 lg:px-10 py-4">

          <Outlet />
        </div>
      </main>

      {/* Alt Bilgi - Footer (Opsiyonel) */}
      <footer className="py-10 text-center">
        <p className=" font-bold text-gray-300 uppercase tracking-[0.3em]">
          Önder Araç Yönetim Sistemi &copy; 2025
        </p>
      </footer>
    </div>
  );
};

export default DashboardLayout;