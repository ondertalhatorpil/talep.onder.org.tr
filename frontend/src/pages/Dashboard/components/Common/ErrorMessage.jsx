import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-50 backdrop-blur-sm border border-red-300 shadow-lg rounded-xl p-6 transform transition-all duration-300 hover:scale-105">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-base text-red-700 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;