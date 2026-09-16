import React, { useState, useEffect } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Heart, 
  Calendar, 
  Bell, 
  Store, 
  User, 
  LogOut, 
  Shield, 
  ChevronDown, 
  Menu, 
  X, 
  Compass, 
  Sparkles,
  Globe,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import { LocationSelectorModal } from '../common/LocationSelectorModal';
import { notificationService } from '../../services/notificationService';

export const Navbar: React.FC = () => {
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const { 
    currentUser, 
    userProfile, 
    role, 
    logout,
    switchToRetailerDev,
    switchToConsumerDev,
    isDevRoleActive
  } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { location } = useLocation();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userId = currentUser?.uid || userProfile?.uid || 'demo_consumer_123';

  // Listen to unread notifications
  useEffect(() => {
    const unsub = notificationService.subscribeToNotifications(userId, (notifs) => {
      const count = notifs.filter(n => !n.read).length;
      setUnreadCount(count);
    });
    return () => unsub();
  }, [userId]);

  const navLinks = [
    { name: t('nav.discover', 'Discover'), path: '/app/discover', icon: Compass },
    { name: t('nav.map', 'Map'), path: '/app/map', icon: MapPin },
    { name: t('nav.saved', 'Saved'), path: '/app/saved', icon: Heart },
    { name: t('nav.reservations', 'Reservations'), path: '/app/reservations', icon: Calendar },
    { name: t('nav.impact', 'Impact'), path: '/app/impact', icon: Sparkles }
  ];

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const isBusinessRoute = routerLocation.pathname.startsWith('/business');
  const isAdminRoute = routerLocation.pathname.startsWith('/admin');

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl backdrop-saturate-150 border-b border-stone-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all w-full overflow-x-clip">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 w-full min-w-0 gap-2 sm:gap-4">
            
            {/* Left: Brand Logo & Optional Location */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              <Link to="/" className="flex items-center gap-2 group shrink-0 no-underline">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-xs group-hover:scale-105 transition-all duration-200">
                  T
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 font-display leading-none">
                    Tschüss
                  </span>
                  <span className="text-3xs font-semibold text-emerald-700 tracking-tight hidden xl:block leading-none mt-0.5">
                    Surplus Food Rescue
                  </span>
                </div>
              </Link>

              {/* Location Pill */}
              <button
                type="button"
                id="btn-navbar-location"
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3.5 h-9 rounded-full bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-950 border border-emerald-200/50 text-xs font-semibold transition-all max-w-[135px] xl:max-w-[150px] truncate shadow-2xs cursor-pointer"
                title="Change location"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{location.name}</span>
                <ChevronDown className="w-3 h-3 text-emerald-600/70 shrink-0" />
              </button>
            </div>

            {/* Center: Desktop Navigation Links (Proper spacing, zero overlap) */}
            {!isBusinessRoute && !isAdminRoute && (
              <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
                {navLinks.map((item) => {
                  const isActive = routerLocation.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-3 xl:px-3.5 h-9 rounded-full text-xs font-semibold whitespace-nowrap transition-all no-underline ${
                        isActive
                          ? 'bg-emerald-100/80 text-emerald-950 font-bold border border-emerald-200/70 shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right: Actions Bar */}
            <div className="flex items-center gap-2 shrink-0 ms-auto">
              
              {/* Language Switcher (DE / EN) */}
              <div 
                id="lang-switcher-container"
                className="relative flex items-center h-9 bg-stone-100/80 backdrop-blur-sm p-0.5 rounded-full border border-stone-200/60 text-2xs font-bold shadow-2xs shrink-0"
                title="Language / Sprache"
              >
                <button
                  type="button"
                  id="btn-lang-de"
                  onClick={() => setLanguage('de')}
                  className={`px-3 h-full rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                    language === 'de'
                      ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Deutsch"
                >
                  <span>DE</span>
                  {language === 'de' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </button>
                <button
                  type="button"
                  id="btn-lang-en"
                  onClick={() => setLanguage('en')}
                  className={`px-3 h-full rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                    language === 'en'
                      ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="English"
                >
                  <span>EN</span>
                  {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </button>
              </div>

              {/* Notifications Icon */}
              <Link
                to="/app/notifications"
                id="btn-nav-notifications"
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-stone-600 hover:text-emerald-900 hover:bg-white bg-stone-100/80 backdrop-blur-sm transition-all border border-stone-200/60 shadow-2xs shrink-0 no-underline"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-emerald-600 text-white rounded-full text-[10px] leading-none flex items-center justify-center font-black shadow-2xs animate-in zoom-in-50">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Development Shortcut: Switch to Retailer / Consumer - displayed on 2xl screens to avoid crowding on standard desktop */}
              {role !== 'retailer' && role !== 'admin' ? (
                <button
                  type="button"
                  id="btn-nav-dev-switch-retailer"
                  onClick={async () => {
                    await switchToRetailerDev();
                    navigate('/business');
                  }}
                  className="hidden 2xl:inline-flex items-center gap-2 px-3.5 h-9 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/60 text-xs font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
                  title="Development Tool: Switch to Retailer portal"
                >
                  <span className="px-1.5 py-0.5 rounded-full text-3xs font-black bg-purple-600 text-white uppercase">DEV</span>
                  <Store className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Switch to Retailer</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-nav-dev-switch-consumer"
                  onClick={async () => {
                    await switchToConsumerDev();
                    navigate('/app/discover');
                  }}
                  className="hidden 2xl:inline-flex items-center gap-2 px-3.5 h-9 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/60 text-xs font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
                  title="Development Tool: Switch back to Consumer view"
                >
                  <span className="px-1.5 py-0.5 rounded-full text-3xs font-black bg-emerald-600 text-white uppercase">DEV</span>
                  <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Switch to Consumer</span>
                </button>
              )}

              {/* Retailer Portal Link (Visible on 2xl+ screens) */}
              {currentUser && (role === 'retailer' || role === 'admin') && !isBusinessRoute && (
                <Link
                  to="/business"
                  className="hidden 2xl:flex items-center gap-1.5 px-3.5 h-9 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/60 text-xs font-semibold transition-all shadow-2xs whitespace-nowrap no-underline shrink-0"
                >
                  <Store className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Retailer</span>
                </Link>
              )}

              {/* User Avatar Menu Dropdown OR Login/Register Buttons */}
              {currentUser ? (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    id="btn-user-menu-toggle"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-full bg-stone-100/80 hover:bg-white border border-stone-200/60 shadow-2xs transition-all text-xs cursor-pointer"
                    aria-expanded={isUserMenuOpen}
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs uppercase shadow-2xs shrink-0">
                      {userProfile?.name?.charAt(0) || currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden md:inline font-bold text-stone-900 text-xs truncate max-w-[90px]">
                      {userProfile?.name?.split(' ')[0] || currentUser.displayName?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-stone-100 p-2.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="p-2.5 border-b border-stone-100">
                        <p className="font-bold text-xs text-stone-900 truncate">
                          {userProfile?.name || currentUser.displayName || 'Tschüss User'}
                        </p>
                        <p className="text-2xs text-stone-500 truncate">
                          {currentUser.email}
                        </p>
                        <div className="mt-1 inline-flex items-center gap-1 text-3xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold uppercase border border-emerald-200/60">
                          Role: {role || 'consumer'}
                        </div>
                      </div>

                      <div className="p-1 space-y-0.5 text-xs">
                        <Link
                          to="/app/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-3 py-2 rounded-2xl font-medium text-stone-700 hover:bg-stone-100/80 flex items-center gap-2 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span>My Profile</span>
                        </Link>

                        {(role === 'retailer' || role === 'admin') && (
                          <Link
                            to="/business"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full px-3 py-2 rounded-2xl font-medium text-amber-800 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                          >
                            <Store className="w-3.5 h-3.5 text-amber-600" />
                            <span>Retailer Portal</span>
                          </Link>
                        )}

                        {role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full px-3 py-2 rounded-2xl font-medium text-purple-800 hover:bg-purple-50 flex items-center gap-2 transition-colors"
                          >
                            <Shield className="w-3.5 h-3.5 text-purple-600" />
                            <span>Admin Center</span>
                          </Link>
                        )}

                        {/* Development Role Switch in Dropdown */}
                        <div className="pt-1 mt-1 border-t border-stone-100">
                          {role !== 'retailer' ? (
                            <button
                              type="button"
                              id="btn-dropdown-dev-switch-retailer"
                              onClick={async () => {
                                setIsUserMenuOpen(false);
                                await switchToRetailerDev();
                                navigate('/business');
                              }}
                              className="w-full px-3 py-2 rounded-2xl font-bold text-purple-800 hover:bg-purple-50 flex items-center justify-between text-xs transition-colors text-left"
                            >
                              <span className="flex items-center gap-2">
                                <Store className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>Switch to Retailer</span>
                              </span>
                              <span className="text-3xs px-2 py-0.5 rounded-full bg-purple-600 text-white uppercase font-black">DEV</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              id="btn-dropdown-dev-switch-consumer"
                              onClick={async () => {
                                setIsUserMenuOpen(false);
                                await switchToConsumerDev();
                                navigate('/app/discover');
                              }}
                              className="w-full px-3 py-2 rounded-2xl font-bold text-emerald-800 hover:bg-emerald-50 flex items-center justify-between text-xs transition-colors text-left"
                            >
                              <span className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Switch to Consumer</span>
                              </span>
                              <span className="text-3xs px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase font-black">DEV</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          id="btn-navbar-logout"
                          onClick={handleLogout}
                          className="w-full px-3 py-2 rounded-2xl font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <Link
                    to="/login"
                    id="btn-nav-login"
                    className="px-3.5 h-9 flex items-center justify-center text-xs font-bold text-stone-700 hover:text-stone-900 rounded-full hover:bg-stone-100/80 transition-all whitespace-nowrap no-underline cursor-pointer"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    id="btn-nav-register"
                    className="px-4 h-9 flex items-center justify-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-2xs transition-all whitespace-nowrap no-underline cursor-pointer"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile/Tablet Menu Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-100/80 bg-stone-100/60 border border-stone-200/50 shadow-xs"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile/Tablet Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-100 bg-white/95 backdrop-blur-xl p-4 space-y-3 animate-in slide-in-from-top-2 shadow-lg">
            {/* Location selector in mobile drawer */}
            <button
              onClick={() => {
                setIsLocationModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-xs font-semibold text-emerald-950"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Standort: {location.name}</span>
              </div>
              <span className="text-emerald-700 text-2xs font-bold">Ändern</span>
            </button>

            {/* Nav links grid */}
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-2xl border border-stone-100 bg-stone-50/80 text-xs font-semibold text-stone-800 hover:bg-emerald-50"
                  >
                    <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
              <Link
                to="/app/notifications"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-2xl border border-stone-100 bg-stone-50/80 text-xs font-semibold text-stone-800 hover:bg-emerald-50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{language === 'de' ? 'Mitteilungen' : 'Notifications'}</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Quick settings in drawer: Language */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">Sprache / Language:</span>
              <button
                type="button"
                onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
                className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200/70"
              >
                {language === 'de' ? 'Deutsch (DE)' : 'English (EN)'}
              </button>
            </div>

            {/* Development Role Switcher in Mobile Drawer */}
            <div className="p-3 rounded-2xl bg-purple-50/90 border border-purple-200/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded-full text-3xs font-black bg-purple-600 text-white uppercase">DEV</span>
                <span className="text-xs font-bold text-stone-900 truncate">
                  Role: <span className="text-purple-700 capitalize">{role || 'consumer'}</span>
                </span>
              </div>

              {role !== 'retailer' && role !== 'admin' ? (
                <button
                  type="button"
                  id="btn-mobile-dev-switch-retailer"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await switchToRetailerDev();
                    navigate('/business');
                  }}
                  className="px-3 py-1.5 rounded-full bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Switch to Retailer</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-mobile-dev-switch-consumer"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await switchToConsumerDev();
                    navigate('/app/discover');
                  }}
                  className="px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Switch to Consumer</span>
                </button>
              )}
            </div>

            {/* Auth actions in drawer */}
            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
              {currentUser ? (
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to="/app/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-bold text-stone-700"
                  >
                    Mein Profil ({userProfile?.name || 'Konto'})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-rose-600"
                  >
                    Abmelden
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 text-center text-xs font-bold rounded-full border border-stone-200 text-stone-800 hover:bg-stone-50"
                  >
                    Anmelden
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 text-center text-xs font-bold rounded-full bg-emerald-600 text-white shadow-xs"
                  >
                    Registrieren
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};
