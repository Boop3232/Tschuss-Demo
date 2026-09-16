import React from 'react';

export const AuthLoading: React.FC<{ message?: string }> = ({ 
  message = 'Verifying authentication session...' 
}) => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        {/* Pulsing glow ring */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 animate-ping opacity-60 absolute inset-0" />
        {/* Brand Icon */}
        <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
          T
        </div>
      </div>

      <h2 className="text-lg font-bold font-display text-stone-900 mb-1">
        Tschüss Platform
      </h2>
      <p className="text-xs text-stone-500 font-medium animate-pulse">
        {message}
      </p>
    </div>
  );
};
