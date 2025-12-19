import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = ({ animate }) => {
  const actions = [
    {
      title: "Yeni Talep Oluştur",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />,
      link: "/reservations/new",
      color: "bg-red-600", // Ana aksiyon kırmızısı
      textColor: "text-white",
      hover: "hover:bg-red-700 shadow-red-100"
    },
    {
      title: "Takvim Görünümü",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
      link: "/calendar",
      color: "bg-white",
      textColor: "text-gray-700",
      hover: "hover:border-gray-300 hover:bg-gray-50 border-gray-100"
    },
    {
      title: "Tüm Talepler",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
      link: "/reservations",
      color: "bg-white",
      textColor: "text-gray-700",
      hover: "hover:border-gray-300 hover:bg-gray-50 border-gray-100"
    },
    {
      title: "Araçları Yönet",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
      link: "/vehicles",
      color: "bg-white",
      textColor: "text-gray-700",
      hover: "hover:border-gray-300 hover:bg-gray-50 border-gray-100"
    }
  ];

  return (
    <div className={`mt-8 transform transition-all duration-1000 delay-200 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center">
          <span className="w-8 h-[1px] bg-red-600 mr-3"></span>
          Hızlı İşlemler
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className={`group relative flex flex-col items-start p-6 rounded-[2rem] border transition-all duration-300 overflow-hidden ${action.color} ${action.textColor} ${action.hover} shadow-sm hover:shadow-xl hover:-translate-y-1`}
          >
            {/* Arka plan süslemesi (Hover'da görünen hafif efekt) */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-current opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className={`mb-4 p-3 rounded-2xl ${action.textColor === 'text-white' ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-red-50 group-hover:text-red-600'} transition-colors duration-300`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {action.icon}
              </svg>
            </div>
            
            <span className="font-semibold tracking-tight text-lg leading-tight">
              {action.title}
            </span>
            
            <div className={`mt-4 flex items-center text-xs font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity`}>
              İşleme Git
              <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;