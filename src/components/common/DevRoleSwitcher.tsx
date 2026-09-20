import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Store, 
  User as UserIcon, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DevRoleSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, isDevRoleActive, switchToRetailerDev, switchToConsumerDev, switchToAdminDev, setDevRole } = useAuth();
  
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isAdmin = role === 'admin';
  const isRetailer = role === 'retailer';
  const isBusinessPage = location.pathname.startsWith('/business');
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleSwitchToRetailer = async () => {
    await switchToRetailerDev();
    setStatusMessage('Switched to Retailer mode');
    setTimeout(() => setStatusMessage(null), 3500);

    // If currently on consumer pages or landing, automatically route to the retailer portal
    if (!isBusinessPage) {
      navigate('/business');
    }
  };

  const handleSwitchToConsumer = async () => {
    await switchToConsumerDev();
    setStatusMessage('Switched to Consumer mode');
    setTimeout(() => setStatusMessage(null), 3500);

    // If currently on business/admin pages, automatically route to consumer discover
    if (isBusinessPage || isAdminPage) {
      navigate('/app/discover');
    }
  };

  const handleSwitchToAdmin = async () => {
    await switchToAdminDev();
    setStatusMessage('Switched to Tschüss Company Admin mode');
    setTimeout(() => setStatusMessage(null), 3500);

    if (!isAdminPage) {
      navigate('/admin');
    }
  };

  const handleReset = async () => {
    await setDevRole(null);
    setStatusMessage('Dev role override cleared');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <aside 
      aria-label="Development Tools" 
      id="dev-role-switcher-container" 
      className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:bottom-3 right-2.5 md:right-3 z-30 font-sans select-none max-w-[calc(100vw-1.25rem)]"
    >
      {/* Toast Alert */}
      {statusMessage && (
        <div 
          id="dev-switcher-toast"
          className="mb-2 px-3.5 py-2 rounded-full bg-purple-950/90 text-white text-xs font-semibold shadow-lg border border-purple-700/60 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className={`border border-purple-200/70 bg-white/95 backdrop-blur-xl shadow-[0_12px_36px_rgba(147,51,234,0.14)] overflow-hidden transition-all max-w-[360px] ${isExpanded ? 'rounded-3xl' : 'rounded-full'}`}>
        {/* Header Bar / Minimized Bar */}
        <div className="flex items-center justify-between gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-50/90 via-indigo-50/40 to-purple-50/90">
          <button
            type="button"
            id="btn-dev-switcher-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-left flex-1"
          >
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-3xs font-extrabold tracking-wider uppercase bg-purple-600 text-white">
              ROLE
            </span>
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <span className="text-purple-700 font-extrabold capitalize">{role || 'consumer'}</span>
            </span>
            {isDevRoleActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Dev role override active" />
            )}
          </button>

          <div className="flex items-center gap-1">
            {/* Quick 1-click Switch Buttons */}
            {isAdmin ? (
              <button
                type="button"
                id="btn-dev-quick-switch-consumer"
                onClick={handleSwitchToConsumer}
                className="px-2.5 py-1 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-2xs font-bold flex items-center gap-1 shadow-xs transition-all"
                title="Switch to Consumer"
              >
                <UserIcon className="w-3 h-3" />
                <span>Consumer</span>
              </button>
            ) : isRetailer ? (
              <button
                type="button"
                id="btn-dev-quick-switch-admin"
                onClick={handleSwitchToAdmin}
                className="px-2.5 py-1 rounded-full bg-indigo-700 hover:bg-indigo-600 text-white text-2xs font-bold flex items-center gap-1 shadow-xs transition-all"
                title="Switch to Admin"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Admin</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-dev-quick-switch-retailer"
                onClick={handleSwitchToRetailer}
                className="px-2.5 py-1 rounded-full bg-purple-700 hover:bg-purple-600 text-white text-2xs font-bold flex items-center gap-1 shadow-xs transition-all"
                title="Switch role to retailer and open Store Portal"
              >
                <Store className="w-3 h-3" />
                <span>Retailer</span>
              </button>
            )}

            <button
              type="button"
              id="btn-dev-switcher-expand"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-full transition-colors"
              aria-label={isExpanded ? "Collapse Dev Menu" : "Expand Dev Menu"}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="p-4 space-y-3 animate-in fade-in slide-in-from-bottom-1 border-t border-purple-100">
            <p className="text-2xs text-stone-500 leading-relaxed">
              Test consumer shopping, retailer surplus management, or Tschüss company administration.
            </p>

            {/* Primary Action Buttons (3 Roles) */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                id="btn-dev-select-consumer"
                onClick={handleSwitchToConsumer}
                className={`p-2.5 rounded-2xl border text-center font-bold flex flex-col items-center gap-1 transition-all ${
                  role === 'consumer' || (!role && !isAdmin && !isRetailer)
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600/10 text-emerald-700 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">Consumer</span>
                <span className="text-3xs font-normal text-stone-400">Shop</span>
              </button>

              <button
                type="button"
                id="btn-dev-select-retailer"
                onClick={handleSwitchToRetailer}
                className={`p-2.5 rounded-2xl border text-center font-bold flex flex-col items-center gap-1 transition-all ${
                  isRetailer
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-purple-600/10 text-purple-700 flex items-center justify-center">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">Retailer</span>
                <span className="text-3xs font-normal text-stone-400">Stores</span>
              </button>

              <button
                type="button"
                id="btn-dev-select-admin"
                onClick={handleSwitchToAdmin}
                className={`p-2.5 rounded-2xl border text-center font-bold flex flex-col items-center gap-1 transition-all ${
                  isAdmin
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600/10 text-indigo-700 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">Admin</span>
                <span className="text-3xs font-normal text-stone-400">Tschüss HQ</span>
              </button>
            </div>

            {/* Quick Navigation Links */}
            <div className="pt-2 border-t border-stone-100 space-y-1">
              <span className="text-3xs font-bold text-stone-400 uppercase tracking-wider block">
                Quick Portal Navigation
              </span>
              <div className="flex flex-col gap-1 text-2xs">
                <button
                  type="button"
                  onClick={() => {
                    handleSwitchToAdmin();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-indigo-50 text-stone-800 flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5 font-semibold text-indigo-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Tschüss Admin Dashboard
                  </span>
                  <ArrowRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/business')}
                  className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-stone-100 text-stone-700 flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5">
                    <Store className="w-3 h-3 text-purple-600" />
                    Retailer Portal Hub
                  </span>
                  <ArrowRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/business/products/new')}
                  className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-stone-100 text-stone-700 flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Add Rescue Product
                  </span>
                  <ArrowRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/app/discover')}
                  className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-stone-100 text-stone-700 flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="w-3 h-3 text-emerald-600" />
                    Consumer Discover
                  </span>
                  <ArrowRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Reset Override Footer */}
            {isDevRoleActive && (
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-3xs text-stone-400">Override active</span>
                <button
                  type="button"
                  id="btn-dev-reset-role"
                  onClick={handleReset}
                  className="text-3xs text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors font-semibold"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Reset to default
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
