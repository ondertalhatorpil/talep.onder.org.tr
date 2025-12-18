import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  
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
        </main>
      </div>
    </>
  );
};


export default Login;