import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <footer className="bg-stone-50 text-stone-600 text-xs border-t border-stone-200 pb-20 md:pb-8 relative overflow-hidden">
      {/* Background ambient subtle glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 no-underline group w-fit">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                T
              </div>
              <span className="font-extrabold text-lg text-stone-900 font-display">Tschüss</span>
            </Link>
            <p className="text-stone-600 text-xs max-w-md leading-relaxed">
              "Connecting Retailers and Consumers to Profit from Near Food Expiry."
              High-precision surplus inventory recovery platform empowering local supermarkets, bakeries, and smart shoppers to eliminate organic discard.
            </p>
            <div className="flex items-center gap-2 text-2xs text-emerald-700 font-semibold pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shadow-xs" />
              <span>Pilot deployment in Kleve (Kreis Kleve, North Rhine-Westphalia)</span>
            </div>
          </div>

          {/* Consumer Links */}
          <div className="space-y-3">
            <h4 className="text-3xs font-bold text-stone-900 uppercase tracking-widest">
              Consumer Platform
            </h4>
            <ul className="space-y-2.5 text-stone-600">
              <li>
                <Link to="/app/discover" className="hover:text-emerald-700 transition-colors">
                  Explore Deals
                </Link>
              </li>
              <li>
                <Link to="/app/map" className="hover:text-emerald-700 transition-colors">
                  Store Radar & Map
                </Link>
              </li>
              <li>
                <Link to="/app/saved" className="hover:text-emerald-700 transition-colors">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link to="/app/reservations" className="hover:text-emerald-700 transition-colors">
                  Active Reservations
                </Link>
              </li>
              <li>
                <Link to="/app/impact" className="hover:text-emerald-700 transition-colors">
                  CO2e & Savings Telemetry
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Legal */}
          <div className="space-y-3">
            <h4 className="text-3xs font-bold text-stone-900 uppercase tracking-widest">
              Enterprise & Retailer
            </h4>
            <ul className="space-y-2.5 text-stone-600">
              <li>
                <Link to="/business" className="hover:text-emerald-700 transition-colors">
                  Retailer Operations Hub
                </Link>
              </li>
              <li>
                <Link to="/for-business" className="hover:text-emerald-700 transition-colors">
                  Partner Supermarket Onboarding
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-700 transition-colors">
                  MHD & DIN Food Safety Standards
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tschüss Company Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-3xs text-stone-500">
          <div className="space-y-1 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Tschüss Platform. High-efficiency food rescue infrastructure.</p>
            <p className="text-stone-600 font-medium flex items-center justify-center sm:justify-start gap-1">
              <span>Made with</span>
              <span className="text-rose-500 inline-block animate-pulse">❤️</span>
              <span>by Eddy Nakaana and Abhiraj Singh Anand</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-semibold text-stone-600">Language:</span>
            <button
              onClick={() => setLanguage('de')}
              className={`hover:text-stone-900 font-bold transition-colors ${language === 'de' ? 'text-emerald-700' : ''}`}
            >
              Deutsch
            </button>
            <span className="text-stone-300">•</span>
            <button
              onClick={() => setLanguage('en')}
              className={`hover:text-stone-900 font-bold transition-colors ${language === 'en' ? 'text-emerald-700' : ''}`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
