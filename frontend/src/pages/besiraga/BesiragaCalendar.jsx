// frontend/src/pages/besiraga/BesiragaCalendar.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { besiragaService, ROOM_INFO } from '../../services/besiragaApi';

import '../../assets/style/besiraga.css';

const BesiragaCalendar = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await besiragaService.getAllReservations();
      setReservations(response.data || []);
    } catch (error) {
      console.error('Rezervasyonları yüklerken hata:', error);
    } finally {
      setLoading(false);
    }
  };

 

  const filteredReservations = reservations.filter(res => {
    const resDate = new Date(res.start_datetime).toISOString().split('T')[0];
    const matchesRoom = selectedRoom === 'all' || res.room_name === selectedRoom;
    const matchesDate = resDate === selectedDate;
    return matchesRoom && matchesDate;
  });

  const formatTime = (datetime) => {
    return new Date(datetime).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f6f6]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ec1313]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f6f6] font-['Manrope']">
      {/* Header */}
      <header className="sticky top-0 bg-[#f8f6f6] z-10">
        <div className="flex items-center p-4 justify-between border-b border-[#ec1313]/20">
          <h1 className="text-xl font-bold text-gray-900 flex-1 text-center">Beşirağa Müsayit mi?</h1>
        </div>
      </header>

      <main className="flex-grow p-4 space-y-6">
        {/* Mekanlarımız Butonu */}
        <button
          onClick={() => setShowInfoDrawer(true)}
          className="w-full bg-gradient-to-r from-[#ec1313] to-[#c01010] hover:from-[#c01010] hover:to-[#a00e0e] text-white py-4 px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-sm">Mekanlarımızı Keşfedin</span>
        </button>

        {/* Oda Seçimi */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mekan Seçimi</h2>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex items-center justify-center rounded-lg border border-[#ec1313]/20 text-gray-700 py-3 cursor-pointer has-[:checked]:bg-[#ec1313] has-[:checked]:text-white has-[:checked]:border-[#ec1313] transition-all">
              <input 
                className="sr-only" 
                name="room" 
                type="radio" 
                value="all"
                checked={selectedRoom === 'all'}
                onChange={(e) => setSelectedRoom(e.target.value)}
              />
              <span className="text-sm font-medium">Tümü</span>
            </label>
            {Object.entries(ROOM_INFO).map(([key, info]) => (
              <label key={key} className="flex items-center justify-center rounded-lg border border-[#ec1313]/20 text-gray-700 py-3 cursor-pointer has-[:checked]:bg-[#ec1313] has-[:checked]:text-white has-[:checked]:border-[#ec1313] transition-all">
                <input 
                  className="sr-only" 
                  name="room" 
                  type="radio" 
                  value={key}
                  checked={selectedRoom === key}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                />
                <span className="text-xs font-medium text-center px-1">{info.name}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Tarih Seçimi */}
        <section>
          <label className="block text-xl font-bold text-gray-900 mb-4">Tarih Seçimi</label>
          <div className="relative">
            <input 
              className="w-full rounded-lg border border-[#ec1313]/20 bg-transparent text-gray-900 focus:ring-[#ec1313] focus:border-[#ec1313] p-3 pr-10" 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </section>

        {/* Mevcut Randevular */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mevcut Randevular</h2>
          {filteredReservations.length === 0 ? (
            <div className="text-center py-10 px-4 bg-[#ec1313]/5 rounded-lg">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600">Seçilen tarihte randevu bulunmamaktadır.</p>
              <p className="text-gray-500 text-sm mt-1">Tüm Mekanlar müsait!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredReservations.map((reservation) => {
                const roomInfo = ROOM_INFO[reservation.room_name];
                const redShades = ['#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626'];
                const randomRed = redShades[Math.floor(Math.random() * redShades.length)];
                
                return (
                  <div
                    key={reservation.id}
                    className="bg-white rounded-xl p-4 shadow-md border-2 hover:shadow-lg transition-shadow"
                    style={{ borderColor: '#ec1313' }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className="px-3 py-1 rounded-lg text-white text-xs font-bold"
                          style={{ backgroundColor: '#ec1313' }}
                        >
                          {roomInfo.name}
                        </span>
                        <span className="text-[#ec1313] text-xs font-semibold bg-red-50 px-2 py-1 rounded">
                         DOLU
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-gray-900 text-base mb-2">
                          {reservation.group_name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <svg className="w-4 h-4 text-[#ec1313]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(reservation.start_datetime)} - {formatTime(reservation.end_datetime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Mekan Bilgileri Drawer */}
      {showInfoDrawer && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowInfoDrawer(false)}
          />
          
          {/* Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
            <div 
              className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              {/* Sticky Header */}
              <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-200 flex-shrink-0 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Mekanlarımız</h2>
                  <button 
                    onClick={() => setShowInfoDrawer(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 px-4 py-4">
                <div className="space-y-4 pb-6">
                  {Object.entries(ROOM_INFO).map(([key, info]) => (
                    <div 
                      key={key}
                      className="bg-white rounded-2xl overflow-hidden border-2 border-[#ec1313]/20 shadow-sm"
                    >
                      {/* Mekan Görseli */}
                      <div className="h-36 relative overflow-hidden">
                        {info.image ? (
                          <img 
                            src={info.image} 
                            alt={info.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {/* Fallback - Resim yüklenemezse göster */}
                        <div className="w-full h-full bg-gradient-to-br from-[#ec1313]/10 to-[#ec1313]/5 flex items-center justify-center" style={{ display: info.image ? 'none' : 'flex' }}>
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2VjMTMxMyIgb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
                          </div>
                          <div className="relative text-center">
                            <svg className="w-16 h-16 mx-auto text-[#ec1313] opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Mekan Bilgileri */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-bold text-gray-900">{info.name}</h3>
                          <span 
                            className="px-2.5 py-1 rounded-full text-white text-xs font-bold whitespace-nowrap"
                            style={{ backgroundColor: '#ec1313' }}
                          >
                            {info.capacity} Kişi
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">
                          {key === 'Yemekhane' && 'Geniş ve ferah yemekhane alanımız. Düğün, nişan ve özel organizasyonlar için idealdir.'}
                          {key === 'Atolye' && 'Atölye çalışmaları, seminer ve eğitimler için özel olarak tasarlanmış mekanımız.'}
                          {key === 'Cardaklar' && 'Açık havada, doğayla iç içe çardak alanlarımız. Yazlık etkinlikler için mükemmel.'}
                          {key === 'Medrese_Sedir' && 'Medrese içerisindeki geleneksel sedirli odamız. Samimi toplantılar için uygundur.'}
                          {key === 'Cami_Sedir' && 'Cami yanındaki geniş sedirli odamız. Toplu sohbet ve etkinlikler için idealdir.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BesiragaCalendar;