import React from 'react'
import { Link } from 'react-router-dom';


const ReservationHeader = ({
    isAdmin,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter
  }) => {

    return (
        <>
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl shadow-xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-white rounded-full p-3 mr-4 shadow-lg">
                  <svg className="h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-black">Talepler</h1>
                  <p className="text-red-300 mt-1">
                    {isAdmin
                      ? 'Tüm departmanların rezervasyonlarını görüntüle ve yönet'
                      : 'Departmanınızın rezervasyonlarını görüntüle ve yönet'}
                  </p>
                </div>
              </div>
              <div className="flex">
                <Link
                  to="/reservations/new"
                  className="transition duration-300 ease-in-out text-sm flex items-center bg-black text-primary-700 font-medium rounded-lg px-4 py-2"
                >
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Yeni Talep Oluştur
                </Link>
              </div>
            </div>
          </div>
    
          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-50 border border-red-300 shadow-lg rounded-xl p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
    
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Arama Alanı */}
              <div className="group">
                <label htmlFor="search" className="block text-base font-semibold text-gray-700 mb-2 transition duration-300 group-hover:text-primary-600">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Talep Ara
                  </div>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    placeholder="Plaka, departman ara..."
                    className="pl-12 pr-4 py-3 block w-full text-base border-2 border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 shadow-sm hover:border-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
    
              {/* Durum Filtresi */}
              <div className="group">
                <label htmlFor="status" className="block text-base font-semibold text-gray-700 mb-2 transition duration-300 group-hover:text-primary-600">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Durum Filtresi
                  </div>
                </label>
                <div className="relative">
                  <select
                    id="status"
                    className="block w-full pl-4 pr-10 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 shadow-sm hover:border-gray-400 appearance-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="pending">Beklemede</option>
                    <option value="approved">Onaylandı</option>
                    <option value="rejected">Reddedildi</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
    
            {/* Hızlı Filtre Butonları */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-sm rounded-full border transition-all duration-300 ${statusFilter === 'all'
                    ? 'bg-primary-100 text-primary-800 border-primary-300 font-medium'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 text-sm rounded-full border transition-all duration-300 ${statusFilter === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300 font-medium'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Beklemede
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1 text-sm rounded-full border transition-all duration-300 ${statusFilter === 'approved'
                    ? 'bg-green-100 text-green-800 border-green-300 font-medium'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Onaylandı
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1 text-sm rounded-full border transition-all duration-300 ${statusFilter === 'rejected'
                    ? 'bg-red-100 text-red-800 border-red-300 font-medium'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Reddedildi
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-3 py-1 text-sm rounded-full border transition-all duration-300 ${statusFilter === 'cancelled'
                    ? 'bg-gray-100 text-gray-800 border-gray-300 font-medium'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                İptal Edildi
              </button>
    
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-auto px-3 py-1 text-sm rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all duration-300 flex items-center"
                >
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Aramayı Temizle
                </button>
              )}
            </div>
          </div>
        </>
      );
    };
    
    export default ReservationHeader;