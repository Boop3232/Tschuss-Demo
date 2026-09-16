import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../navigation/Navbar';
import { MobileBottomNav } from '../navigation/MobileBottomNav';
import { Footer } from '../navigation/Footer';

export const ConsumerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-stone-900 relative selection:bg-emerald-500/20 selection:text-emerald-950">
      {/* Apple Liquid Glass Ambient Light Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-emerald-300/15 rounded-full blur-3xl filter transform-gpu animate-pulse duration-10000" />
        <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-teal-200/20 rounded-full blur-3xl filter transform-gpu" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-emerald-200/15 rounded-full blur-3xl filter transform-gpu" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-amber-200/10 rounded-full blur-3xl filter transform-gpu" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 pb-24 md:pb-8">
          <Outlet />
        </main>
        <MobileBottomNav />
        <Footer />
      </div>
    </div>
  );
};

