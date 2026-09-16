import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, MapPin, Heart, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const MobileBottomNav: React.FC = () => {
  const { t } = useLanguage();

  const items = [
    { name: t('nav.discover'), path: '/app/discover', icon: Compass },
    { name: t('nav.map'), path: '/app/map', icon: MapPin },
    { name: t('nav.saved'), path: '/app/saved', icon: Heart },
    { name: t('nav.reservations'), path: '/app/reservations', icon: Calendar },
    { name: t('nav.impact'), path: '/app/impact', icon: Sparkles }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/80 px-2 py-1 shadow-lg">
      <nav className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-900 font-bold'
                    : 'text-stone-400 hover:text-stone-600 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-900' : ''}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-3xs mt-0.5 tracking-tight">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
