import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <svg className="h-5 w-5 mr-2 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Rezervasyon Listesi
        </h2>
      </div>

      {sortedReservations.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {sortedReservations.map((reservation) => {
            const startDate = new Date(reservation.start_date_time);
            const endDate = new Date(reservation.end_date_time);
            const isToday = new Date().toDateString() === startDate.toDateString();
            const isPast = startDate < new Date();

            return (
              <li 
                key={reservation.id} 
                className={`transition duration-300 hover:bg-gray-50 ${isPast ? 'bg-gray-50 opacity-75' : ''}`}
              >
                <div className="px-6 py-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <h3 className={`text-lg font-bold ${isPast ? 'text-gray-500' : 'text-gray-900'} flex items-center`}>
                          {reservation.brand} {reservation.model}
                        </h3>
                        <span className="ml-3 text-sm text-gray-500 font-medium">
                          {reservation.license_plate}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className={`flex-shrink-0 mr-1.5 h-4 w-4 ${isPast ? 'text-gray-400' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className={`font-medium ${isPast ? 'text-gray-400' : ''}`}>
                            {format(startDate, 'PPP', { locale: tr })}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg className={`flex-shrink-0 mr-1.5 h-4 w-4 ${isPast ? 'text-gray-400' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className={`${isPast ? 'text-gray-400' : ''}`}>
                            {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg className={`flex-shrink-0 mr-1.5 h-4 w-4 ${isPast ? 'text-gray-400' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className={`${isPast ? 'text-gray-400' : ''}`}>
                            {reservation.department}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg className={`flex-shrink-0 mr-1.5 h-4 w-4 ${isPast ? 'text-gray-400' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className={`${isPast ? 'text-gray-400' : ''}`}>
                            {reservation.username}
                          </span>
                        </div>

                        {isToday && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Bugün
                          </span>
                        )}
                        
                        {isPast && !isToday && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Geçmiş
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <p className={`text-sm ${isPast ? 'text-gray-400' : 'text-gray-600'} line-clamp-1`}>
                          <span className="font-medium">Amaç:</span> {reservation.purpose}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${getStatusClass(reservation.status)} ${isPast ? 'opacity-75' : ''}`}>
                        {getStatusText(reservation.status)}
                      </span>

                      <div className="mt-3 flex space-x-2">
                        {reservation.status === 'pending' && isAdmin && !isPast && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(reservation.id, 'approved')}
                              className="flex items-center text-sm px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition duration-300"
                            >
                              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Onayla
                            </button>
                            <button
                              onClick={() => openRejectModal(reservation.id)}
                              className="flex items-center text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition duration-300"
                            >
                              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reddet
                            </button>
                          </>
                        )}

                        {(reservation.status === 'pending' || reservation.status === 'approved') && !isPast && (
                          <button
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="flex items-center text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition duration-300"
                          >
                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            İptal Et
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-6 py-12 text-center">
          {searchTerm || statusFilter !== 'all' ? (
            <div>
              <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 text-lg mb-4">Arama kriterlerinize uygun rezervasyon bulunamadı.</p>
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition duration-300"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div>
              <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-lg mb-4">Sistemde rezervasyon bulunmamaktadır.</p>
              <Link
                to="/reservations/new"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition duration-300 inline-flex items-center"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Rezervasyon Ekle
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationList;