import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import StatusBadge from './StatusBadge';

const UpcomingReservations = ({ reservations, animate, isToday }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <svg className="h-5 w-5 mr-2 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Yaklaşan Talepler
        </h2>
        <Link to="/reservations" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
          Tümünü Gör
          <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      {reservations.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {reservations.map((reservation, index) => (
            <div 
              key={reservation.id} 
              className={`px-6 py-4 transition duration-300 hover:bg-gray-50 transform ${animate ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-primary-600"></div>
                <div className="flex justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    {reservation.brand} {reservation.model}
                  </h3>
                  <StatusBadge status={reservation.status} type="reservation" />
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-600">
                  <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">
                    {format(new Date(reservation.start_date_time), 'PPP', { locale: tr })}
                  </span>
                  {isToday(reservation.start_date_time) && (
                    <span className="ml-2 px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 animate-pulse">
                      Bugün
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-600">
                  <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {format(new Date(reservation.start_date_time), 'HH:mm')} - {format(new Date(reservation.end_date_time), 'HH:mm')}
                  </span>
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-600">
                  <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{reservation.purpose}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>
                    {reservation.department} - {reservation.username}
                  </span>
                  <span className="text-gray-400">
                    {reservation.license_plate}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-base">Yaklaşan talep bulunmamaktadır.</p>
          <Link to="/reservations/new" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-500 bg-primary-600 hover:bg-primary-700">
            Talep Oluştur
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingReservations;