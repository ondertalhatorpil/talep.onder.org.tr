import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, ArrowRight, Clock, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';

const ReservationConfirmation = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 animate-fadeIn">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden">
          
          {/* Üst Kısım: Başarı İkonu Alanı */}
          <div className="pt-12 pb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20 scale-150"></div>
              <div className="relative bg-red-50 text-red-600 rounded-full p-6 shadow-xl shadow-red-100">
                <CheckCircle2 size={48} strokeWidth={1.5} />
              </div>
            </div>
          </div>
          
          {/* İçerik */}
          <div className="px-8 pb-10 text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
              İşlem <span className="text-red-600">Başarılı!</span>
            </h1>
            <p className="text-gray-500 font-medium text-xs mb-8">
              Talebiniz alınmıştır. Lütfen aşağıdaki kuralları unutmayınız:
            </p>

            {/* Önemli Hatırlatıcılar Grubu */}
            <div className="grid grid-cols-1 gap-3 mb-8 text-left">
              <div className="flex items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm mr-3">
                  <ShieldCheck size={16} />
                </div>
                <p className="text-[11px] font-bold text-gray-600 tracking-tight">Emniyet kemerinizi takın, hız kurallarına uyun.</p>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm mr-3">
                  <Sparkles size={16} />
                </div>
                <p className="text-[11px] font-bold text-gray-600 tracking-tight">Aracı temiz tutun ve içinde çöp bırakmayın.</p>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm mr-3">
                  <AlertTriangle size={16} />
                </div>
                <p className="text-[11px] font-bold text-gray-600 tracking-tight">Belirlediğiniz teslim saatine titizlikle uyun.</p>
              </div>
            </div>
            
            {/* Süreç Bilgilendirme */}
            <div className="bg-gray-900 rounded-2xl p-5 mb-8 flex items-center justify-between shadow-lg shadow-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-amber-400 mr-3">
                  <Clock size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Mevcut Durum</p>
                  <p className="text-sm font-bold text-white leading-none">Onay Bekleniyor</p>
                </div>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </div>
            
            {/* Butonlar */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-red-100 group"
              >
                <Home size={16} />
                Panel'e Dön
              </button>
              
              <button
                onClick={() => navigate('/reservations')}
                className="w-full flex items-center justify-center gap-2 py-3 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-gray-600 transition-all group"
              >
                Taleplerimi Gör
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationConfirmation;