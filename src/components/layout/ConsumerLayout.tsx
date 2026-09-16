import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../navigation/Navbar';
import { MobileBottomNav } from '../navigation/MobileBottomNav';
import { Footer } from '../navigation/Footer';

export const ConsumerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF8] text-stone-900">
      <Navbar />
      <main className="flex-1 pb-24 md:pb-8">
        <Outlet />
      </main>
      <MobileBottomNav />
      <Footer />
    </div>
  );
};
