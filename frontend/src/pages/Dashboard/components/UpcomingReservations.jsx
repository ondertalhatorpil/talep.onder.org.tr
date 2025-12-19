import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import StatusBadge from './StatusBadge';

const UpcomingReservations = ({ reservations, animate, isToday }) => {
  return (
    <div className={`bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-1000 delay-300 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      
      {/* Header Bölümü */}
      <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-600 mr-2 animate-pulse"></span>
            Yaklaşan Talepler
          </h2>
        </div>
        <Link 
          to="/reservations" 
          className="group text-sm font-semibold text-red-600 hover:text-red-700 flex items-center transition-colors"
        >
          Tümünü Gör
          <svg className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {reservations.length > 0 ? (
        <div className="divide-y divide-gray-50">
          {reservations.map((reservation, index) => (
            <div 
              key={reservation.id} 
              className="group px-8 py-6 transition-all duration-300 hover:bg-gray-50/50"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                
                {/* Tarih Rozeti (Sol Taraf) */}
                <div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 group-hover:border-red-100 group-hover:bg-red-50 transition-colors">
                  <span className="text-xs font-bold text-gray-400 group-hover:text-red-400 uppercase">
                    {format(new Date(reservation.start_date_time), 'MMM', { locale: tr })}
                  </span>
                  <span className="text-xl font-black text-gray-800 group-hover:text-red-600">
                    {format(new Date(reservation.start_date_time), 'dd')}
                  </span>
                </div>

                {/* İçerik (Orta Taraf) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate pr-4">
                      {reservation.brand} <span className="text-gray-500 font-medium">{reservation.model}</span>
                    </h3>
                    <StatusBadge status={reservation.status} type="reservation" />
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="mr-1.5 h-4 w-4 text-red-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-gray-700">
                        {format(new Date(reservation.start_date_time), 'HH:mm')} - {format(new Date(reservation.end_date_time), 'HH:mm')}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {reservation.username}
                    </div>

                    <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight text-gray-600">
                      {reservation.license_plate}
                    </div>
                  </div>

                  {/* Alt Bilgi - Kullanım Amacı */}
                  <div className="mt-3 text-sm text-gray-400 italic line-clamp-1">
                    "{reservation.purpose}"
                  </div>
                </div>

                {/* Sağ Taraf - Bugün Etiketi */}
                {isToday(reservation.start_date_time) && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 ring-4 ring-red-50">
                      BUGÜN
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Boş Durum Tasarımı */
        <div className="px-8 py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Kayıtlı talep bulunamadı</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">Yakın zamanda planlanmış bir araç kullanım talebi görünmüyor.</p>
          <Link 
            to="/reservations/new" 
            className="mt-6 inline-flex items-center px-6 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100"
          >
            Yeni Talep Oluştur
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingReservations;