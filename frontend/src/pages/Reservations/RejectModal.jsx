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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white animate-fadeIn">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Talebi Reddet</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 mb-3">
              Bu talebi reddetme nedeninizi belirtiniz.
            </p>
            <textarea
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-red-500"
              rows="4"
              placeholder="Reddetme nedeninizi yazın..."
              value={rejectReasonText}
              onChange={(e) => setRejectReasonText(e.target.value)}
            />
          </div>
          <div className="items-center px-4 py-3 flex justify-end space-x-2">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              İptal
            </button>
            <button
              onClick={handleRejectReservation}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
            >
              Reddet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;