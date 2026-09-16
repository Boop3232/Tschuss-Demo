import React, { useState, useEffect } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl backdrop-saturate-200 border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.03),inset_0_-1px_0_rgba(0,0,0,0.03)] transition-all w-full overflow-x-clip">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 w-full min-w-0 gap-2 sm:gap-4">
            
            {/* Left: Brand Logo & Optional Location */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              <Link to="/" className="flex items-center gap-2.5 group shrink-0 no-underline">
                <div className="w-9 h-9 rounded-2xl bg-[#23382b] text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 group-active:scale-95 transition-all duration-200">
                  T
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 font-display leading-none">
                    Tschüss
                  </span>
                  <span className="text-3xs font-semibold text-stone-500 tracking-tight hidden xl:block leading-none mt-0.5 opacity-90">
                    Surplus Food Rescue
                  </span>
                </div>
              </Link>

              {/* Location Pill */}
              <button
                type="button"
                id="btn-navbar-location"
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3.5 h-8.5 rounded-full bg-white/70 hover:bg-white text-stone-800 hover:text-stone-950 border border-stone-200/80 hover:border-stone-300 text-xs font-semibold transition-all max-w-[135px] xl:max-w-[150px] truncate shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer backdrop-blur-md"
                title="Change location"
              >
                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span className="truncate">{location.name}</span>
                <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
              </button>
            </div>

            {/* Center: Desktop Navigation Links (Apple segmented glass pill with sliding animation) */}
            {!isBusinessRoute && !isAdminRoute && (
              <nav className="hidden lg:flex items-center gap-1 p-1 bg-stone-200/40 backdrop-blur-md rounded-full border border-white/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 relative">
                {navLinks.map((item) => {
                  const isActive = routerLocation.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center gap-1.5 px-3.5 h-7.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors no-underline ${
                        isActive
                          ? 'text-stone-900 font-bold'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="desktop-nav-active-pill"
                          className="absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
                          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-stone-900' : 'text-stone-400'}`} />
                        <span>{item.name}</span>
                      </span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right: Actions Bar */}
            <div className="flex items-center gap-2 shrink-0 ms-auto">
              
              {/* Language Switcher (DE / EN with sliding pill animation) */}
              <div 
                id="lang-switcher-container"
                className="relative flex items-center h-8.5 bg-stone-200/40 backdrop-blur-md p-0.5 rounded-full border border-white/60 text-2xs font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0"
                title="Language / Sprache"
              >
                <button
                  type="button"
                  id="btn-lang-de"
                  onClick={() => setLanguage('de')}
                  className={`relative px-2.5 h-full rounded-full transition-colors flex items-center gap-1 cursor-pointer ${
                    language === 'de'
                      ? 'text-stone-900 font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Deutsch"
                >
                  {language === 'de' && (
                    <motion.div
                      layoutId="lang-switcher-active-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    <span>DE</span>
                    {language === 'de' && <span className="w-1.5 h-1.5 rounded-full bg-stone-800 shadow-xs" />}
                  </span>
                </button>
                <button
                  type="button"
                  id="btn-lang-en"
                  onClick={() => setLanguage('en')}
                  className={`relative px-2.5 h-full rounded-full transition-colors flex items-center gap-1 cursor-pointer ${
                    language === 'en'
                      ? 'text-stone-900 font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="English"
                >
                  {language === 'en' && (
                    <motion.div
                      layoutId="lang-switcher-active-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    <span>EN</span>
                    {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-stone-800 shadow-xs" />}
                  </span>
                </button>
              </div>

              {/* Notifications Icon */}
              <Link
                to="/app/notifications"
                id="btn-nav-notifications"
                className="relative w-8.5 h-8.5 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 bg-white/70 hover:bg-white border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md transition-all shrink-0 no-underline active:scale-95"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-stone-900 text-white rounded-full text-[10px] leading-none flex items-center justify-center font-bold shadow-xs animate-in zoom-in-50">
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
                  className="hidden 2xl:inline-flex items-center gap-2 px-3.5 h-8.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold transition-all shadow-2xs whitespace-nowrap cursor-pointer shrink-0 backdrop-blur-md active:scale-95"
                  title="Development Tool: Switch to Retailer portal"
                >
                  <span className="px-1.5 py-0.2 rounded-full text-3xs font-black bg-stone-800 text-white uppercase shadow-xs">DEV</span>
                  <Store className="w-3.5 h-3.5 text-stone-600 shrink-0" />
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
                  className="hidden 2xl:inline-flex items-center gap-2 px-3.5 h-8.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold transition-all shadow-2xs whitespace-nowrap cursor-pointer shrink-0 backdrop-blur-md active:scale-95"
                  title="Development Tool: Switch back to Consumer view"
                >
                  <span className="px-1.5 py-0.2 rounded-full text-3xs font-black bg-stone-800 text-white uppercase shadow-xs">DEV</span>
                  <User className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                  <span>Switch to Consumer</span>
                </button>
              )}
                  {/* Retailer Portal Link (Visible on 2xl+ screens) */}
              {currentUser && (role === 'retailer' || role === 'admin') && !isBusinessRoute && (
                <Link
                  to="/business"
                  className="hidden 2xl:flex items-center gap-1.5 px-3.5 h-8.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold transition-all shadow-2xs whitespace-nowrap no-underline shrink-0 backdrop-blur-md active:scale-95"
                >
                  <Store className="w-3.5 h-3.5 text-stone-600 shrink-0" />
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
                    className="flex items-center gap-2 h-8.5 pl-1 pr-3 rounded-full bg-white/70 hover:bg-white border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md transition-all text-xs cursor-pointer active:scale-95"
                    aria-expanded={isUserMenuOpen}
                    aria-label="User menu"
                  >
                    <div className="w-6.5 h-6.5 rounded-full bg-stone-800 text-white font-bold flex items-center justify-center text-xs uppercase shadow-xs shrink-0">
                      {userProfile?.name?.charAt(0) || currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden md:inline font-bold text-stone-900 text-xs truncate max-w-[90px]">
                      {userProfile?.name?.split(' ')[0] || currentUser.displayName?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu Liquid Glass Modal */}
                  {isUserMenuOpen && (
                    <>
                      {/* Invisible backdrop to dismiss on click outside */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsUserMenuOpen(false)} 
                      />
                      
                      <div className="absolute right-0 mt-2 w-68 bg-white/95 backdrop-blur-3xl backdrop-saturate-200 rounded-3xl p-3 z-50 border border-white/90 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.18),0_8px_24px_-4px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] animate-in fade-in zoom-in-95 origin-top-right">
                        <div className="p-3 bg-stone-100/70 rounded-2xl border border-stone-200/60 mb-2">
                          <p className="font-bold text-xs text-stone-900 truncate">
                            {userProfile?.name || currentUser.displayName || (language === 'de' ? 'Tschüss Benutzer' : 'Tschüss User')}
                          </p>
                          <p className="text-2xs text-stone-500 truncate mt-0.5">
                            {currentUser.email}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1.5 text-3xs px-2.5 py-0.5 rounded-full bg-stone-200/80 text-stone-800 font-bold uppercase tracking-wider border border-stone-300 shadow-2xs">
                            <span>{language === 'de' ? 'Rolle' : 'Role'}: {role === 'retailer' ? (language === 'de' ? 'Händler' : 'Retailer') : (role === 'admin' ? 'Admin' : (language === 'de' ? 'Käufer' : 'Consumer'))}</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs">
                          <Link
                            to="/app/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full px-3 py-2 rounded-2xl font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100/80 flex items-center gap-2.5 transition-colors no-underline"
                          >
                            <User className="w-4 h-4 text-stone-500" />
                            <span>{language === 'de' ? 'Mein Profil' : 'My Profile'}</span>
                          </Link>

                          {(role === 'retailer' || role === 'admin') && (
                            <Link
                              to="/business"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full px-3 py-2 rounded-2xl font-semibold text-stone-800 hover:bg-stone-100 flex items-center gap-2.5 transition-colors no-underline"
                            >
                              <Store className="w-4 h-4 text-stone-600" />
                              <span>{language === 'de' ? 'Händlerportal' : 'Retailer Portal'}</span>
                            </Link>
                          )}

                          {role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full px-3 py-2 rounded-2xl font-semibold text-stone-800 hover:bg-stone-100 flex items-center gap-2.5 transition-colors no-underline"
                            >
                              <Shield className="w-4 h-4 text-stone-600" />
                              <span>{language === 'de' ? 'Admin-Bereich' : 'Admin Center'}</span>
                            </Link>
                          )}

                          {/* Development Role Switch in Dropdown */}
                          <div className="pt-1.5 mt-1.5 border-t border-stone-200/60">
                            {role !== 'retailer' ? (
                              <button
                                type="button"
                                id="btn-dropdown-dev-switch-retailer"
                                onClick={async () => {
                                  setIsUserMenuOpen(false);
                                  await switchToRetailerDev();
                                  navigate('/business');
                                }}
                                className="w-full px-3 py-2 rounded-2xl font-semibold text-stone-800 hover:bg-stone-100 flex items-center justify-between text-xs transition-colors text-left cursor-pointer"
                              >
                                <span className="flex items-center gap-2.5">
                                  <Store className="w-4 h-4 text-stone-600 shrink-0" />
                                  <span>{language === 'de' ? 'Zu Händler wechseln' : 'Switch to Retailer'}</span>
                                </span>
                                <span className="text-3xs px-2 py-0.5 rounded-full bg-stone-800 text-white uppercase font-bold shadow-2xs">DEV</span>
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
                                className="w-full px-3 py-2 rounded-2xl font-semibold text-stone-800 hover:bg-stone-100 flex items-center justify-between text-xs transition-colors text-left cursor-pointer"
                              >
                                <span className="flex items-center gap-2.5">
                                  <User className="w-4 h-4 text-stone-600 shrink-0" />
                                  <span>{language === 'de' ? 'Zu Käufer wechseln' : 'Switch to Consumer'}</span>
                                </span>
                                <span className="text-3xs px-2 py-0.5 rounded-full bg-stone-800 text-white uppercase font-bold shadow-2xs">DEV</span>
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            id="btn-navbar-logout"
                            onClick={handleLogout}
                            className="w-full px-3 py-2 rounded-2xl font-semibold text-stone-700 hover:bg-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-stone-500" />
                            <span>{language === 'de' ? 'Abmelden' : 'Log Out'}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <Link
                    to="/login"
                    id="btn-nav-login"
                    className="px-3.5 h-8.5 flex items-center justify-center text-xs font-semibold text-stone-700 hover:text-stone-900 rounded-full hover:bg-white/70 border border-transparent hover:border-white/80 transition-all whitespace-nowrap no-underline cursor-pointer"
                  >
                    {language === 'de' ? 'Anmelden' : 'Log in'}
                  </Link>
                  <Link
                    to="/register"
                    id="btn-nav-register"
                    className="px-4 h-8.5 flex items-center justify-center text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 active:scale-95 rounded-full shadow-xs transition-all whitespace-nowrap no-underline cursor-pointer"
                  >
                    {language === 'de' ? 'Registrieren' : 'Sign up'}
                  </Link>
                </div>
              )}

              {/* Mobile/Tablet Menu Toggle */}
              <button
                type="button"
                id="btn-hamburger-menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-8.5 h-8.5 rounded-full flex items-center justify-center text-stone-700 hover:bg-white bg-white/60 border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md cursor-pointer active:scale-95"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile/Tablet Drawer Menu Liquid Glass */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/60 bg-white/80 backdrop-blur-2xl p-4 space-y-3 animate-in slide-in-from-top-2 shadow-xl">
            {/* Location selector in mobile drawer */}
            <button
              type="button"
              id="btn-mobile-location"
              onClick={() => {
                setIsLocationModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl glass-surface text-xs font-semibold text-emerald-950 cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{language === 'de' ? 'Standort' : 'Location'}: {location.name}</span>
              </div>
              <span className="text-emerald-700 text-2xs font-bold">
                {language === 'de' ? 'Ändern' : 'Change'}
              </span>
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
                    className="flex items-center gap-2 p-3 rounded-2xl glass-pill text-xs font-semibold text-stone-800 hover:text-emerald-950 transition-colors shadow-2xs"
                  >
                    <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
              <Link
                to="/app/notifications"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl glass-pill text-xs font-semibold text-stone-800 hover:text-emerald-950 transition-colors shadow-2xs"
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

            {/* Quick settings in drawer: Language Switcher */}
            <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">
                {language === 'de' ? 'Sprache' : 'Language'}:
              </span>
              <div className="flex items-center gap-1 p-0.5 bg-stone-200/40 rounded-full border border-white/60 relative">
                <button
                  type="button"
                  id="btn-drawer-lang-de"
                  onClick={() => setLanguage('de')}
                  className={`relative px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                    language === 'de'
                      ? 'text-emerald-950 font-extrabold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {language === 'de' && (
                    <motion.div
                      layoutId="drawer-lang-switcher-active-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                    />
                  )}
                  <span className="relative z-10">Deutsch (DE)</span>
                </button>
                <button
                  type="button"
                  id="btn-drawer-lang-en"
                  onClick={() => setLanguage('en')}
                  className={`relative px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                    language === 'en'
                      ? 'text-emerald-950 font-extrabold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {language === 'en' && (
                    <motion.div
                      layoutId="drawer-lang-switcher-active-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                    />
                  )}
                  <span className="relative z-10">English (EN)</span>
                </button>
              </div>
            </div>

            {/* Development Role Switcher in Mobile Drawer */}
            <div className="p-3 rounded-2xl glass-surface flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded-full text-3xs font-black bg-purple-600 text-white uppercase shadow-xs">DEV</span>
                <span className="text-xs font-bold text-stone-900 truncate">
                  {language === 'de' ? 'Rolle' : 'Role'}: <span className="text-purple-700 capitalize">
                    {role === 'retailer' ? (language === 'de' ? 'Händler' : 'Retailer') : (role === 'admin' ? 'Admin' : (language === 'de' ? 'Käufer' : 'Consumer'))}
                  </span>
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
                  className="px-3 py-1.5 rounded-full bg-purple-700 hover:bg-purple-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{language === 'de' ? 'Zu Händler' : 'Switch to Retailer'}</span>
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
                  className="px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{language === 'de' ? 'Zu Käufer' : 'Switch to Consumer'}</span>
                </button>
              )}
            </div>

            {/* Auth actions in drawer */}
            <div className="pt-2 border-t border-stone-200/50 flex flex-col gap-2">
              {currentUser ? (
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to="/app/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-bold text-stone-700 hover:text-stone-900"
                  >
                    {language === 'de' ? 'Mein Profil' : 'My Profile'} ({userProfile?.name || (language === 'de' ? 'Konto' : 'Account')})
                  </Link>
                  <button
                    type="button"
                    id="btn-mobile-logout"
                    onClick={handleLogout}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    {language === 'de' ? 'Abmelden' : 'Log out'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 text-center text-xs font-bold rounded-full glass-pill text-stone-800 hover:bg-white"
                  >
                    {language === 'de' ? 'Anmelden' : 'Log in'}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 text-center text-xs font-bold rounded-full bg-emerald-600 text-white shadow-xs"
                  >
                    {language === 'de' ? 'Registrieren' : 'Sign up'}
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
