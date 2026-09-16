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
  Sun,
  Moon,
  Globe,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import { LocationSelectorModal } from '../common/LocationSelectorModal';
import { notificationService } from '../../services/notificationService';

export const Navbar: React.FC = () => {
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, role, logout } = useAuth();
  const { language, setLanguage, t, isApiTranslated } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { location } = useLocation();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userId = currentUser?.uid;

  // Listen to unread notifications only if logged in
  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
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
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors w-full overflow-x-clip shadow-2xs">
        {/* Bootstrap fluid container for guaranteed responsiveness */}
        <div className="container-fluid max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 w-full min-w-0 gap-2 sm:gap-4">
            
            {/* Left: Brand Logo & Optional Location */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-xs group-hover:scale-105 transition-all duration-200">
                  T
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 dark:text-white font-display leading-none">
                    Tschüss
                  </span>
                  <span className="text-3xs font-semibold text-emerald-700 dark:text-emerald-400 tracking-tight hidden xl:block leading-none mt-0.5">
                    Surplus Food Rescue
                  </span>
                </div>
              </Link>

              {/* Location Pill (Compact & Hidden on small screens to avoid overflow) */}
              <button
                type="button"
                id="btn-navbar-location"
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50/80 dark:bg-emerald-950/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 text-xs font-semibold transition-all max-w-[140px] truncate"
                title="Change location"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{location.name}</span>
                <ChevronDown className="w-3 h-3 text-emerald-600/70 dark:text-emerald-400/70 shrink-0" />
              </button>
            </div>

            {/* Center: Desktop Navigation Links (Visible on lg+ screens with compact padding) */}
            {!isBusinessRoute && !isAdminRoute && (
              <nav className="hidden lg:flex items-center gap-1 min-w-0 shrink">
                {navLinks.map((item) => {
                  const isActive = routerLocation.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-100 font-bold border border-emerald-200/70 dark:border-emerald-700/60 shadow-2xs'
                          : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800/60 font-medium'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right: Simplistic Actions Bar - shrink-0 GUARANTEES it never pushes out of window */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ms-auto">
              
              {/* Dark Mode Toggle Button */}
              <button
                type="button"
                id="btn-navbar-theme-toggle"
                onClick={toggleTheme}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200/60 dark:border-stone-700/60"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-stone-600 hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* Simplistic Language Switcher (DE / EN) with whole-website API translation */}
              <div 
                id="lang-switcher-container"
                className="relative flex items-center bg-stone-100/90 dark:bg-stone-800 p-0.5 rounded-xl border border-stone-200/80 dark:border-stone-700 text-2xs font-bold"
                title="Translate Website (API Powered)"
              >
                <button
                  type="button"
                  id="btn-lang-de"
                  onClick={() => setLanguage('de')}
                  className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    language === 'de'
                      ? 'bg-white dark:bg-stone-700 text-emerald-900 dark:text-emerald-300 shadow-2xs font-bold'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                  title="Translate whole website to German via API"
                >
                  <span>DE</span>
                  {language === 'de' && <span className="w-1 h-1 rounded-full bg-emerald-500" />}
                </button>
                <button
                  type="button"
                  id="btn-lang-en"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    language === 'en'
                      ? 'bg-white dark:bg-stone-700 text-emerald-900 dark:text-emerald-300 shadow-2xs font-bold'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                  title="View in English"
                >
                  <span>EN</span>
                  {language === 'en' && <span className="w-1 h-1 rounded-full bg-emerald-500" />}
                </button>
              </div>

              {/* Notifications Icon (Authenticated) */}
              {currentUser && (
                <Link
                  to="/app/notifications"
                  id="btn-nav-notifications"
                  className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-emerald-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200/60 dark:border-stone-700/60"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-3xs flex items-center justify-center font-bold shadow-2xs">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Retailer Portal Link (Visible on xl+ screens) */}
              {currentUser && (role === 'retailer' || role === 'admin') && !isBusinessRoute && (
                <Link
                  to="/business"
                  className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 text-xs font-semibold transition-all shadow-2xs whitespace-nowrap"
                >
                  <Store className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span>Retailer</span>
                </Link>
              )}

              {/* User Avatar Menu Dropdown OR Login/Register Buttons */}
              {currentUser ? (
                <div className="relative">
                  <button
                    type="button"
                    id="btn-user-menu-toggle"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-2xl bg-stone-100/90 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 border border-stone-200/70 dark:border-stone-700 transition-all text-xs"
                    aria-expanded={isUserMenuOpen}
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs uppercase shadow-2xs shrink-0">
                      {userProfile?.name?.charAt(0) || currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden md:inline font-bold text-stone-900 dark:text-stone-100 text-xs truncate max-w-[90px]">
                      {userProfile?.name?.split(' ')[0] || currentUser.displayName?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="p-2.5 border-b border-stone-100 dark:border-stone-800">
                        <p className="font-bold text-xs text-stone-900 dark:text-white truncate">
                          {userProfile?.name || currentUser.displayName || 'Tschüss User'}
                        </p>
                        <p className="text-2xs text-stone-500 dark:text-stone-400 truncate">
                          {currentUser.email}
                        </p>
                        <div className="mt-1 inline-flex items-center gap-1 text-3xs px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold uppercase border border-emerald-200/60 dark:border-emerald-800/60">
                          Role: {role || 'consumer'}
                        </div>
                      </div>

                      <div className="p-1 space-y-0.5 text-xs">
                        <Link
                          to="/app/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-2.5 py-1.5 rounded-xl font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span>My Profile</span>
                        </Link>

                        {(role === 'retailer' || role === 'admin') && (
                          <Link
                            to="/business"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full px-2.5 py-1.5 rounded-xl font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center gap-2 transition-colors"
                          >
                            <Store className="w-3.5 h-3.5 text-amber-600" />
                            <span>Retailer Portal</span>
                          </Link>
                        )}

                        {role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full px-2.5 py-1.5 rounded-xl font-medium text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center gap-2 transition-colors"
                          >
                            <Shield className="w-3.5 h-3.5 text-purple-600" />
                            <span>Admin Center</span>
                          </Link>
                        )}

                        <button
                          type="button"
                          id="btn-navbar-logout"
                          onClick={handleLogout}
                          className="w-full px-2.5 py-1.5 rounded-xl font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Link
                    to="/login"
                    id="btn-nav-login"
                    className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-white rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all whitespace-nowrap"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    id="btn-nav-register"
                    className="px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-all whitespace-nowrap"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile/Tablet Menu Toggle (Visible on < lg screens) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>

        {/* Translation Indicator Pill (if DE API translation is active) */}
        {language === 'de' && (
          <div className="bg-emerald-50/90 dark:bg-emerald-950/80 border-t border-emerald-100 dark:border-emerald-900/60 py-1 px-4 text-center">
            <span className="text-3xs sm:text-2xs font-medium text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Webseite wird per API auf Deutsch übersetzt</span>
              <button 
                onClick={() => setLanguage('en')}
                className="underline hover:text-emerald-950 dark:hover:text-emerald-100 font-bold ml-1 cursor-pointer"
              >
                Zurück zu EN
              </button>
            </span>
          </div>
        )}

        {/* Mobile/Tablet Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 space-y-3 animate-in slide-in-from-top-2">
            {/* Location selector in mobile drawer */}
            <button
              onClick={() => {
                setIsLocationModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-semibold text-emerald-950 dark:text-emerald-200"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Standort: {location.name}</span>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 text-2xs font-bold">Ändern</span>
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
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-stone-700"
                  >
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick settings in drawer: Dark Mode & Language */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-500 dark:text-stone-400">Design & Sprache:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{theme === 'dark' ? 'Hell' : 'Dunkel'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800"
                >
                  {language === 'de' ? 'Sprache: DE' : 'Language: EN'}
                </button>
              </div>
            </div>

            {/* Auth actions in drawer */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-2">
              {currentUser ? (
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to="/app/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xs font-bold text-stone-700 dark:text-stone-300"
                  >
                    Mein Profil ({userProfile?.name || 'Konto'})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400"
                  >
                    Abmelden
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-center text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                  >
                    Anmelden
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-center text-xs font-bold rounded-xl bg-emerald-600 text-white"
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
