import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = ({ animate }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-md p-6 transform transition duration-700 delay-200 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} border border-gray-100`}>
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <svg className="h-6 w-6 mr-2 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Hızlı İşlemler
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/reservations/new" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-4 rounded-xl text-center transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center">
          <svg className="h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-medium">Yeni Talep Oluştur</span>
        </Link>
        <Link to="/calendar" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-4 rounded-xl text-center transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center">
          <svg className="h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Takvim Görünümü</span>
        </Link>
        <Link to="/reservations" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-4 rounded-xl text-center transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center">
          <svg className="h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="font-medium">Tüm Talepler</span>
        </Link>
        <Link to="/vehicles" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-4 rounded-xl text-center transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center">
          <svg className="h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Araçları Yönet</span>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;