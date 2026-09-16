import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <footer className="bg-[#F5F4EE] text-stone-600 text-xs border-t border-stone-200/70 pb-16 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-2xs">
                T
              </div>
              <span className="font-extrabold text-lg text-stone-900 font-display">Tschüss</span>
            </div>
            <p className="text-stone-500 text-xs max-w-md leading-relaxed">
              "Connecting Retailers and Consumers to Profit from Near Food Expiry."
              Empowering local supermarkets, bakeries, and shoppers to convert surplus food into recovered margin and delicious meals.
            </p>
            <div className="flex items-center gap-2 text-2xs text-emerald-700 font-semibold pt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pilot deployment in Kleve (Kreis Kleve, North Rhine-Westphalia)</span>
            </div>
          </div>

          {/* Consumer Links */}
          <div className="space-y-3">
            <h4 className="text-3xs font-bold text-stone-700 uppercase tracking-wider">
              Consumer Platform
            </h4>
            <ul className="space-y-2 text-stone-500">
              <li>
                <Link to="/app/discover" className="hover:text-emerald-700 transition-colors">
                  Explore Deals
                </Link>
              </li>
              <li>
                <Link to="/app/map" className="hover:text-emerald-700 transition-colors">
                  Store Map
                </Link>
              </li>
              <li>
                <Link to="/app/saved" className="hover:text-emerald-700 transition-colors">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link to="/app/reservations" className="hover:text-emerald-700 transition-colors">
                  My Reservations
                </Link>
              </li>
              <li>
                <Link to="/app/impact" className="hover:text-emerald-700 transition-colors">
                  CO2e & Savings Impact
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Legal */}
          <div className="space-y-3">
            <h4 className="text-3xs font-bold text-stone-700 uppercase tracking-wider">
              Retailer & System
            </h4>
            <ul className="space-y-2 text-stone-500">
              <li>
                <Link to="/business" className="hover:text-emerald-700 transition-colors">
                  Retailer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/for-business" className="hover:text-emerald-700 transition-colors">
                  Become a Partner Store
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-700 transition-colors">
                  MHD & Food Safety Standards
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-700 transition-colors">
                  System Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-stone-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-3xs text-stone-500">
          <p>© {new Date().getFullYear()} Tschüss Platform. Clean & sustainable food rescue.</p>

          <div className="flex items-center gap-4">
            <span className="font-semibold text-stone-600">Language:</span>
            <button
              onClick={() => setLanguage('de')}
              className={`hover:text-stone-800 font-bold ${language === 'de' ? 'text-emerald-700' : ''}`}
            >
              Deutsch
            </button>
            <span>•</span>
            <button
              onClick={() => setLanguage('en')}
              className={`hover:text-stone-800 font-bold ${language === 'en' ? 'text-emerald-700' : ''}`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
