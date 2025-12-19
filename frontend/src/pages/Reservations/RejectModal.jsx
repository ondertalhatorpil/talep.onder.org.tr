import React from 'react';

const RejectModal = ({ 
  rejectModalOpen, 
  setRejectModalOpen, 
  rejectReasonText, 
  setRejectReasonText, 
  handleRejectReservation 
}) => {
  if (!rejectModalOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" 
        onClick={() => setRejectModalOpen(false)}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.15)] animate-scaleIn">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Talebi Reddet</h3>
          <p className="text-gray-500 font-medium mt-2 mb-8 text-sm leading-relaxed">
            Bu talebi neden reddettiğinizi lütfen belirtin. <br/> Bu açıklama kullanıcıya iletilecektir.
          </p>

          <textarea
            className="w-full p-5 bg-gray-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-semibold text-gray-700 placeholder:text-gray-300 mb-8"
            rows="4"
            placeholder="Reddetme nedeninizi yazın..."
            value={rejectReasonText}
            onChange={(e) => setRejectReasonText(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all text-[11px] uppercase tracking-widest"
            >
              Vazgeç
            </button>
            <button
              onClick={handleRejectReservation}
              className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-100 text-[11px] uppercase tracking-widest"
            >
              Talebi Reddet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;