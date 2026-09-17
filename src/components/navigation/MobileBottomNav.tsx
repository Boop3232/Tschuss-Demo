import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Heart, 
  Calendar, 
  Sparkles,
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

export const MobileBottomNav: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();

  const isRetailerSection = location.pathname.startsWith('/business');

  const consumerItems: NavItem[] = [
    { 
      name: language === 'de' ? 'Entdecken' : t('nav.discover', 'Discover'), 
      path: '/app/discover', 
      icon: Compass 
    },
    { 
      name: language === 'de' ? 'Karte' : t('nav.map', 'Map'), 
      path: '/app/map', 
      icon: MapPin 
    },
    { 
      name: language === 'de' ? 'Gemerkt' : t('nav.saved', 'Saved'), 
      path: '/app/saved', 
      icon: Heart 
    },
    { 
      name: language === 'de' ? 'Reserviert' : t('nav.reservations', 'Reservations'), 
      path: '/app/reservations', 
      icon: Calendar 
    },
    { 
      name: language === 'de' ? 'Impact' : t('nav.impact', 'Impact'), 
      path: '/app/impact', 
      icon: Sparkles 
    }
  ];

  const retailerItems: NavItem[] = [
    { 
      name: language === 'de' ? 'Übersicht' : 'Overview', 
      path: '/business', 
      icon: LayoutDashboard,
      end: true
    },
    { 
      name: language === 'de' ? 'Inventar' : 'Inventory', 
      path: '/business/products', 
      icon: Package,
      end: true
    },
    { 
      name: language === 'de' ? '+ Neu' : '+ New', 
      path: '/business/products/new', 
      icon: PlusCircle,
      end: true
    },
    { 
      name: language === 'de' ? 'Abholung' : 'Pickups', 
      path: '/business/reservations', 
      icon: ShoppingBag,
      end: false
    },
    { 
      name: language === 'de' ? 'Analyse' : 'Analytics', 
      path: '/business/analytics', 
      icon: BarChart3,
      end: false
    }
  ];

  const items = isRetailerSection ? retailerItems : consumerItems;

  return (
    <aside 
      aria-label="Mobile Navigation"
      id="mobile-bottom-navbar"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] box-border w-full max-w-full overflow-hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <nav className="grid grid-cols-5 items-center justify-items-stretch w-full max-w-md mx-auto px-2 pt-1.5 pb-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `no-underline flex flex-col items-center justify-center min-h-[44px] w-full min-w-0 py-1 px-0.5 rounded-2xl transition-all select-none active:scale-95 ${
                  isActive
                    ? 'text-stone-900 font-bold'
                    : 'text-stone-500 hover:text-stone-800 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs'
                      : 'bg-transparent text-stone-500'
                  }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <span className={`text-[10px] leading-tight tracking-tight mt-0.5 max-w-full truncate text-center px-0.5 block ${
                    isActive ? 'text-emerald-800 font-bold' : 'text-stone-500'
                  }`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
