import React from 'react';

const StatisticsCards = ({ vehicles, upcomingReservations, animate }) => {
  // Hesaplamalar
  const activeVehiclesCount = vehicles.filter(v => v.status === 'active').length;
  const pendingReservationsCount = upcomingReservations.filter(r => r.status === 'pending').length;
  const totalVehicles = vehicles.length;
  const activePercentage = totalVehicles > 0 ? Math.round((activeVehiclesCount / totalVehicles) * 100) : 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 ease-out ${animate ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      
      {/* Aktif Araçlar Kartı */}
      <div className="group bg-white border border-gray-100 rounded-3xl p-7 transition-all duration-300 hover:border-red-100 hover:shadow-[0_20px_50px_rgba(239,68,68,0.05)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-bold tracking-wider text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase">
              %{activePercentage} Oran
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Aktif Araçlar</p>
            <h3 className="text-4xl font-extrabold text-gray-900 mt-1">{activeVehiclesCount}</h3>
          </div>
        </div>
      </div>

      {/* Bekleyen Talepler Kartı */}
      <div className="group bg-white border border-gray-100 rounded-3xl p-7 transition-all duration-300 hover:border-amber-100 hover:shadow-[0_20px_50px_rgba(245,158,11,0.05)]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {pendingReservationsCount > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Bekleyen Talepler</p>
            <h3 className="text-4xl font-extrabold text-gray-900 mt-1">{pendingReservationsCount}</h3>
          </div>
        </div>
      </div>

      {/* Toplam Araçlar Kartı */}
      <div className="group bg-gray-900 rounded-3xl p-7 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] shadow-xl">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-white/10 rounded-2xl text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Filo Büyüklüğü</p>
            <h3 className="text-4xl font-extrabold text-white mt-1">{totalVehicles}</h3>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StatisticsCards;