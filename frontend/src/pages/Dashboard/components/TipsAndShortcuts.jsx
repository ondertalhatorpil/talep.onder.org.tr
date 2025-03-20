import React from 'react';
import { Link } from 'react-router-dom';

const TipsAndShortcuts = ({ animate }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-md p-6 transform transition duration-700 delay-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} border border-gray-100`}>
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        İpuçları ve Kısayollar
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
            <svg className="h-5 w-5 mr-1 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Takvim Görünümü
          </h3>
          <p className="text-sm text-blue-700">
            Talepleri takvim görünümünde görmek için 
            <Link to="/calendar" className="underline font-medium"> takvim sayfasını</Link> ziyaret edin.
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <h3 className="font-medium text-green-800 mb-2 flex items-center">
            <svg className="h-5 w-5 mr-1 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Araç Durumu
          </h3>
          <p className="text-sm text-green-700">
            Bakımda olan araçlar otomatik olarak talep listesinde görünmez.
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <h3 className="font-medium text-purple-800 mb-2 flex items-center">
            <svg className="h-5 w-5 mr-1 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Hızlı Talep
          </h3>
          <p className="text-sm text-purple-700">
            Takvimde bir zaman aralığına tıklayarak hızlıca talep oluşturabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TipsAndShortcuts;