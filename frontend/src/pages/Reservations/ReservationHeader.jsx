import React from 'react';
import { Link } from 'react-router-dom';

const ReservationHeader = ({
    isAdmin,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter
  }) => {

    const filterOptions = [
        { id: 'all', label: 'Tümü' },
        { id: 'pending', label: 'Beklemede' },
        { id: 'approved', label: 'Onaylandı' },
        { id: 'rejected', label: 'Reddedildi' },
        { id: 'cancelled', label: 'İptal' },
    ];

    return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center mb-2">
                    <span className="w-8 h-[1px] bg-red-600 mr-3"></span>
                    Talep Yönetimi
                </h2>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Araç Rezervasyonları</h1>
            </div>
            <Link
                to="/reservations/new"
                className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center group"
            >
                <svg className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Yeni Talep Oluştur
            </Link>
          </div>
    
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center text-red-600 text-sm font-bold animate-shake">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
            </div>
          )}
    
          <div className="bg-white rounded-[2rem] p-3 border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-300 group-focus-within:text-red-500 transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                    type="text"
                    placeholder="Plaka, isim veya departman ara..."
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-red-500/10 transition-all text-sm font-semibold text-gray-700 placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
    
            <div className="flex p-1 bg-gray-50 rounded-[1.5rem] overflow-x-auto no-scrollbar scroll-smooth">
                {filterOptions.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => setStatusFilter(option.id)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            statusFilter === option.id 
                            ? 'bg-white text-red-600 shadow-sm' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
          </div>
        </div>
      );
    };
    
    export default ReservationHeader;