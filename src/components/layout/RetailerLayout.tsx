import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../navigation/Navbar';
import { RetailerSidebar } from '../navigation/RetailerSidebar';
import { Footer } from '../navigation/Footer';

export const RetailerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="hidden md:block shrink-0">
          <RetailerSidebar />
        </div>
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-64px)] pb-12">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
