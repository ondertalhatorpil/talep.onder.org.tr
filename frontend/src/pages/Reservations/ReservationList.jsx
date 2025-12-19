import React from 'react';
import { format, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';

const ReservationList = ({
  sortedReservations,
  searchTerm,
  statusFilter,
  setSearchTerm,
  setStatusFilter,
  getStatusClass,
  getStatusText,
  handleUpdateStatus,
  handleCancelReservation,
  openRejectModal,
  isAdmin
}) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white/50">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center">
          <span className="w-8 h-[1px] bg-red-600 mr-3"></span>
          Talepler
        </h2>
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            {sortedReservations.length} Kayıt Listeleniyor
        </span>
      </div>

      {sortedReservations.length > 0 ? (
        <div className="divide-y divide-gray-50">
          {sortedReservations.map((reservation) => {
            const startDate = new Date(reservation.start_date_time);
            const endDate = new Date(reservation.end_date_time);
            const isToday = new Date().toDateString() === startDate.toDateString();
            const isPast = startDate < new Date();
            const isSameDayRes = isSameDay(startDate, endDate);

            return (
              <div 
                key={reservation.id} 
                className={`group px-8 py-7 transition-all duration-300 hover:bg-gray-50/80 ${isPast ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                  
                  {/* Tarih Bloğu */}
                  <div className="flex-shrink-0 flex lg:flex-col items-center justify-center w-20 h-20 bg-gray-50 rounded-3xl border border-gray-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-red-400">
                      {format(startDate, 'MMM', { locale: tr })}
                    </span>
                    <span className="text-2xl font-black text-gray-900 group-hover:text-red-600">
                      {format(startDate, 'dd')}
                    </span>
                  </div>

                  {/* Detaylar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                        {reservation.brand} <span className="text-gray-400 font-semibold">{reservation.model}</span>
                      </h3>
                      <span className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg tracking-wider">
                        {reservation.license_plate}
                      </span>
                      {isToday && (
                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider animate-pulse">Bugün</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-3 gap-x-8 text-sm text-gray-500 font-semibold">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700">
                          {isSameDayRes 
                            ? `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`
                            : `${format(startDate, 'dd.MM HH:mm')} → ${format(endDate, 'dd.MM HH:mm')}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">{reservation.username}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2" />
                        </svg>
                        <span className="truncate">{reservation.department}</span>
                      </div>
                    </div>

                    <div className="mt-4 text-xs font-medium text-gray-400 italic line-clamp-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      "{reservation.purpose}"
                    </div>
                  </div>

                  {/* Aksiyonlar */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 min-w-[160px]">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm ${getStatusClass(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>

                    <div className="flex space-x-2">
                      {reservation.status === 'pending' && isAdmin && !isPast && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(reservation.id, 'approved')}
                            className="p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-100 active:scale-90"
                            title="Onayla"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <button
                            onClick={() => openRejectModal(reservation.id)}
                            className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-90"
                            title="Reddet"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </>
                      )}
                      {(reservation.status === 'pending' || reservation.status === 'approved') && !isPast && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="p-2.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                          title="İptal Et"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-8 py-24 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Talep Bulunamadı</h3>
          <p className="text-gray-400 mt-2 font-medium max-w-xs mx-auto text-sm leading-relaxed">
            Filtreleme kriterlerinize veya aramalarınıza uygun bir kayıt mevcut değil.
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                className="mt-8 px-6 py-2.5 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all"
            >
                Tüm Filtreleri Temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationList;