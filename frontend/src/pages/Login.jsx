import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { besiragaService } from '../services/besiragaApi';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  // Beşirağa Modal State
  const [showBesiragaModal, setShowBesiragaModal] = useState(false);
  const [besiragaPassword, setBesiragaPassword] = useState('');
  const [besiragaError, setBesiragaError] = useState('');
  const [besiragaLoading, setBesiragaLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Kullanıcı adı ve şifre gereklidir');
      return;
    }
    
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Giriş yapılamadı');
    }
  };

  // Beşirağa Modal Aç
  const handleOpenBesiragaModal = () => {
    setShowBesiragaModal(true);
    setBesiragaPassword('');
    setBesiragaError('');
  };

  // Beşirağa Modal Kapat
  const handleCloseBesiragaModal = () => {
    setShowBesiragaModal(false);
    setBesiragaPassword('');
    setBesiragaError('');
  };

  // Beşirağa Şifre Kontrolü (DÜZELTİLMİŞ MANTIK)
  const handleBesiragaSubmit = async (e) => {
    e.preventDefault();
    setBesiragaError('');

    if (!besiragaPassword) {
      setBesiragaError('Lütfen şifre girin');
      return;
    }

    setBesiragaLoading(true);

    try {
      // YENİ MANTIK: Şifreyi doğrulamak için doğrudan talepleri çekmeyi dene.
      // Eğer şifre doğruysa, middleware izin verecek ve veri gelecek.
      // Eğer şifre yanlışsa, middleware 401 hatası döndürecek ve catch bloğu çalışacak.
      await besiragaService.getAllRequests(besiragaPassword, 'pending');
      
      // Eğer yukarıdaki satır hata vermeden çalıştıysa, şifre doğrudur.
      sessionStorage.setItem('besiraga_password', besiragaPassword);
      navigate('/besiraga/panel');

    } catch (error) {
      // Backend'den gelen "Yetkisiz" hatası buraya düşecek.
      setBesiragaError(error.response?.data?.message || 'Hatalı şifre');
    } finally {
      setBesiragaLoading(false);
    }
  };
  
  return (
    <>
      <div className="flex flex-col min-h-screen justify-center items-center p-4 sm:p-6 bg-gray-50">
        <main className="w-full max-w-sm">
          {/* Giriş Kartı */}
          <div className="bg-white p-4 sm:p-8 rounded-2xl mb-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-gray-900">
                <span className="text-red-600">ÖNDER</span> Personel
              </h1>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">Devam etmek için giriş yapın</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Hata Mesajı */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Kullanıcı Adı Alanı */}
                <div className="relative">
                  <label className="sr-only" htmlFor="username">Kullanıcı Adı</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      className="w-full h-14 pl-12 pr-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition shadow-sm"
                      id="username"
                      placeholder="Kullanıcı Adı"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
                
                {/* Şifre Alanı */}
                <div className="relative">
                  <label className="sr-only" htmlFor="password">Şifre</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      className="w-full h-14 pl-12 pr-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition shadow-sm"
                      id="password"
                      placeholder="Şifre"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Giriş Butonu */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-red-600/50 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Giriş Yap'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Beşirağa Müsait mi Buton Alanı */}
          <div className="w-full max-w-sm text-center pt-4">
            <svg className="inline-block text-red-600 w-8 h-8 sm:w-10 sm:h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Beşirağa Müsait mi?</h2>
            <button
              onClick={handleOpenBesiragaModal}
              type="button"
              className="block w-full h-12 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl text-base hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-600/50 shadow-md hover:shadow-lg"
            >
              Yönetici Girişi
            </button>
          </div>
        </main>
      </div>

      {/* Beşirağa Modal */}
      {showBesiragaModal && (
        <div 
          className="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-2 z-50 transition-opacity duration-300"
          onClick={handleCloseBesiragaModal}
        >
          <div 
            className="w-full max-w-md  p-3 sm:p-8 transition-all duration-300 transform scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleBesiragaSubmit}>
              {besiragaError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium text-red-700">{besiragaError}</p>
                </div>
              )}
              <div className="relative">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    className="w-full h-16 pl-14 pr-20 bg-gray-50 border-2 border-gray-300 rounded-xl text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition shadow-inner"
                    id="besiraga-password"
                    placeholder="Şifre girin..."
                    type="password"
                    value={besiragaPassword}
                    onChange={(e) => setBesiragaPassword(e.target.value)}
                    autoComplete="off"
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    disabled={besiragaLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {besiragaLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};


export default Login;