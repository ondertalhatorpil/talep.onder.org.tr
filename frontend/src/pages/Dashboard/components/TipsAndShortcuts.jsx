import React from 'react';
import { Link } from 'react-router-dom';

const TipsAndShortcuts = ({ animate }) => {
  const tips = [
    {
      title: "Güvenli Sürüş",
      description: "Hız sınırlarına uyun ve seyir halindeyken telefon kullanmaktan kaçının. Emniyet kemerinizi mutlaka takın.",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04c-.243.39-.382.85-.382 1.344 0 5.277 3.047 9.811 7.455 11.94 4.408-2.129 7.455-6.663 7.455-11.94 0-.494-.139-.954-.382-1.344z" />,
      theme: "red"
    },
    {
      title: "Araç Temizliği",
      description: "Aracı teslim ederken içinde çöp bırakmamaya özen gösterin. Temiz bir araç, bir sonraki iş arkadaşınıza saygıdır.",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />,
      theme: "gray"
    },
    {
      title: "Yakıt ve Arıza",
      description: "Çeyrek depo altı yakıtla bırakmayın. Beklenmedik bir arıza veya kaza durumunda derhal yönetime bilgi verin.",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      theme: "gray"
    }
  ];

  return (
    <div className={`mt-8 transform transition-all duration-1000 delay-700 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center">
            <span className="w-8 h-[1px] bg-red-600 mr-3"></span>
            Kullanım Rehberi
          </h2>
          <div className="flex space-x-2">
             <div className="w-2 h-2 rounded-full bg-red-100"></div>
             <div className="w-2 h-2 rounded-full bg-red-200"></div>
             <div className="w-2 h-2 rounded-full bg-red-400"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tips.map((tip, index) => (
            <div key={index} className="relative group">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 p-3 rounded-2xl transition-colors duration-300 ${tip.theme === 'red' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-600'}`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {tip.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 tracking-tight">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alt Bilgi Bandı */}
        <div className="mt-10 pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-gray-400">
            * Tüm kurallar dernek operasyon güvenliği için geçerlidir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TipsAndShortcuts;