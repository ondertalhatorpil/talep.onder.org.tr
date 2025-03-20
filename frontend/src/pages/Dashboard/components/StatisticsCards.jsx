import React from 'react';

const StatisticsCards = ({ vehicles, upcomingReservations, animate }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transform transition duration-700 delay-100 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="bg-white rounded-2xl shadow-md p-6 transition duration-500 hover:shadow-xl transform hover:-translate-y-1 border border-gray-100">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gradient-to-r from-red-500 to-ping-600 rounded-lg p-3 shadow-lg">
            <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Aktif Araçlar</dt>
              <dd className="flex items-baseline">
                <div className="text-3xl font-bold text-gray-900">
                  {vehicles.filter(v => v.status === 'active').length}
                </div>
                <div className="ml-2 flex items-baseline text-sm text-green-600">
                  <span className="sr-only">Artış</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    {Math.round(vehicles.filter(v => v.status === 'active').length / vehicles.length * 100)}%
                  </span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-md p-6 transition duration-500 hover:shadow-xl transform hover:-translate-y-1 border border-gray-100">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-3 shadow-lg">
            <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Bekleyen Talepler</dt>
              <dd className="flex items-baseline">
                <div className="text-3xl font-bold text-gray-900">
                  {upcomingReservations.filter(r => r.status === 'pending').length}
                </div>
                {upcomingReservations.filter(r => r.status === 'pending').length > 0 && (
                  <div className="ml-2 flex items-baseline text-sm text-amber-600">
                    <span className="sr-only">Beklemede</span>
                    <svg className="self-center flex-shrink-0 h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-md p-6 transition duration-500 hover:shadow-xl transform hover:-translate-y-1 border border-gray-100">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 shadow-lg">
            <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Toplam Araçlar</dt>
              <dd className="flex items-baseline">
                <div className="text-3xl font-bold text-gray-900">
                  {vehicles.length}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCards;