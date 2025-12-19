import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const VehiclesList = ({ vehicles, animate, isAdmin }) => {
  return (
    <div className={`bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-1000 delay-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center">
          <span className="w-8 h-[1px] bg-red-600 mr-3"></span>
          Araç Filosu
        </h2>
        <Link 
          to="/vehicles" 
          className="group text-sm font-semibold text-red-600 hover:text-red-700 flex items-center transition-colors"
        >
          Tümünü Gör
          <svg className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          {vehicles.slice(0, 6).map((vehicle, index) => (
            <div 
              key={vehicle.id} 
              className={`p-6 transition-all duration-300 hover:bg-gray-50/80 border-b border-gray-50 sm:even:border-l relative group`}
            >
              <div className="flex items-center space-x-4">
                {/* Araç İkonu / Avatar */}
                <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all duration-300 border border-transparent group-hover:border-gray-100">
                  <svg className="h-7 w-7 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>

                {/* Araç Bilgileri */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 truncate tracking-tight">
                      {vehicle.brand} <span className="text-gray-500 font-semibold">{vehicle.model}</span>
                    </h3>
                    <div className="flex items-center mt-0.5">
                      <span className="inline-flex items-center text-[11px] font-black bg-gray-900 text-white px-2 py-0.5 rounded leading-none tracking-wider">
                        {vehicle.license_plate}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <StatusBadge status={vehicle.status} type="vehicle" />
                    
                    <Link 
                      to={`/reservations/new?vehicle=${vehicle.id}`} 
                      className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 flex items-center text-xs font-bold text-red-600 uppercase tracking-tighter"
                    >
                      Hızlı Talep
                      <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Boş Durum */
        <div className="px-8 py-16 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Sistemde kayıtlı araç bulunmuyor.</p>
          {isAdmin && (
            <Link to="/vehicles/new" className="mt-4 inline-flex items-center px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition-all shadow-lg">
              Yeni Araç Ekle
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default VehiclesList;