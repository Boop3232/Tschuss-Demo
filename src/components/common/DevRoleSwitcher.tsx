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
  X,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DevRoleSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, isDevRoleActive, switchToRetailerDev, switchToConsumerDev, setDevRole } = useAuth();
  
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isRetailer = role === 'retailer' || role === 'admin';
  const isBusinessPage = location.pathname.startsWith('/business');

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

    // If currently on business pages, automatically route to consumer discover
    if (isBusinessPage) {
      navigate('/app/discover');
    }
  };

  const handleReset = async () => {
    await setDevRole(null);
    setStatusMessage('Dev role override cleared');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <aside aria-label="Development Tools" id="dev-role-switcher-container" className="fixed bottom-16 md:bottom-3 right-3 z-50 font-sans select-none">
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
      <div className={`border border-purple-200/70 bg-white/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(147,51,234,0.12)] overflow-hidden transition-all max-w-[340px] ${isExpanded ? 'rounded-3xl' : 'rounded-full'}`}>
        {/* Header Bar / Minimized Bar */}
        <div className="flex items-center justify-between gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-50/90 via-indigo-50/40 to-purple-50/90">
          <button
            type="button"
            id="btn-dev-switcher-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-left flex-1"
          >
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-3xs font-extrabold tracking-wider uppercase bg-purple-600 text-white">
              DEV
            </span>
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              Role: <span className="text-purple-700 font-extrabold capitalize">{role || 'consumer'}</span>
            </span>
            {isDevRoleActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Dev role override active" />
            )}
          </button>

          <div className="flex items-center gap-1">
            {/* Quick 1-click Switch Button right on the header */}
            {!isRetailer ? (
              <button
                type="button"
                id="btn-dev-quick-switch-retailer"
                onClick={handleSwitchToRetailer}
                className="px-3 py-1 rounded-full bg-purple-700 hover:bg-purple-600 text-white text-2xs font-bold flex items-center gap-1 shadow-xs transition-all"
                title="Switch role to retailer and open Store Portal"
              >
                <Store className="w-3 h-3" />
                <span>To Retailer</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-dev-quick-switch-consumer"
                onClick={handleSwitchToConsumer}
                className="px-3 py-1 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-2xs font-bold flex items-center gap-1 shadow-xs transition-all"
                title="Switch role to consumer and open App"
              >
                <UserIcon className="w-3 h-3" />
                <span>To Consumer</span>
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
              Development tool for testing the supermarket/bakery retailer portal, surplus listing, and inventory management.
            </p>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-dev-select-consumer"
                onClick={handleSwitchToConsumer}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  !isRetailer
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-700 flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span>Consumer</span>
                <span className="text-3xs font-normal text-stone-400">Shop surplus</span>
              </button>

              <button
                type="button"
                id="btn-dev-select-retailer"
                onClick={handleSwitchToRetailer}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  isRetailer
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-purple-600/10 text-purple-700 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <span>Retailer</span>
                <span className="text-3xs font-normal text-stone-400">Manage store</span>
              </button>
            </div>

            {/* Quick Navigation Links */}
            <div className="pt-2 border-t border-stone-100 space-y-1">
              <span className="text-3xs font-bold text-stone-400 uppercase tracking-wider block">
                Quick Dev Navigation
              </span>
              <div className="flex flex-col gap-1 text-2xs">
                <button
                  type="button"
                  onClick={() => navigate('/business')}
                  className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-stone-100 text-stone-700 flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5">
                    <Store className="w-3 h-3 text-purple-600" />
                    Retailer Dashboard
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
