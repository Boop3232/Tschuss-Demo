import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../navigation/Navbar';
import { RetailerSidebar } from '../navigation/RetailerSidebar';
import { MobileBottomNav } from '../navigation/MobileBottomNav';
import { Footer } from '../navigation/Footer';

export const RetailerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-stone-900 relative selection:bg-emerald-500/20 selection:text-emerald-950">
      {/* Liquid Glass Ambient Light Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl filter transform-gpu" />
        <div className="absolute top-1/2 right-10 w-[28rem] h-[28rem] bg-teal-200/15 rounded-full blur-3xl filter transform-gpu" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-cyan-200/10 rounded-full blur-3xl filter transform-gpu" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <div className="flex-1 flex flex-col md:flex-row">
          <div className="hidden md:block shrink-0">
            <RetailerSidebar />
          </div>
          <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-64px)] pb-24 md:pb-12">
            <Outlet />
          </main>
        </div>
        <MobileBottomNav />
        <Footer />
      </div>
    </div>
  );
};

