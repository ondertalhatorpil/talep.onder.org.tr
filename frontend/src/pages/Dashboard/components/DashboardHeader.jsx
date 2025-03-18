import React from 'react';
import { Link } from 'react-router-dom';

const DashboardHeader = ({ user, animate }) => {
  return (
    <div className={`bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl shadow-xl p-8 text-white transform transition duration-700 ${animate ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-white rounded-full p-3 mr-4 shadow-lg">
            <svg className="h-8 w-8 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">Hoş Geldiniz, {user?.department}</h1>
            <p className="text-red-300 mt-1">
              {user?.department} departmanı • {user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link 
            to="/calendar" 
            className="transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-md text-sm flex items-center bg-black bg-opacity-20 text-white rounded-lg px-4 py-2 backdrop-blur-sm"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Takvim Görünümü
          </Link>
          <Link 
            to="/reservations/new" 
            className="transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-md text-sm flex items-center bg-black text-primary-700 font-medium rounded-lg px-4 py-2"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Rezervasyon
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;