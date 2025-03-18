import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReservationConfirmation = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative h-auto p-16 w-full">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="rounded-2xl shadow-2xl overflow-hidden bg-white">
          {/* Üst Kısım - Gradient ve İkon */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 px-8 py-10 text-center relative">
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-lg">
              <div className="text-5xl">🚗</div>
            </div>
          </div>
          
          {/* İçerik Kısmı */}
          <div className="px-8 pt-14 pb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Araç Talebiniz Alındı!
            </h1>
            <p className="text-gray-600 mb-6">
              Talebiniz başarıyla oluşturuldu ve yönetici onayına gönderildi.
            </p>
            
            {/* Durum Bilgisi */}
            <div className="bg-blue-50 rounded-lg p-3 mb-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-700 font-medium">Onay bekliyor</span>
            </div>
            
            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
              >
                Anasayfaya Dön
              </button>
            </div>
          </div>
        </div>
        
        {/* Alt Bilgi */}
        <div className="text-center mt-4 text-gray-500 text-sm">
          Sorun yaşarsanız, lütfen yöneticiniz ile iletişime geçiniz.
        </div>
      </div>
    </div>
  );
};

export default ReservationConfirmation;