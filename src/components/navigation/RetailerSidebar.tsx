import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ShoppingBag, 
  BarChart3, 
  MessageSquare, 
  Store as StoreIcon, 
  ArrowLeft, 
  ExternalLink,
  Code2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RetailerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, isDevRoleActive, switchToConsumerDev } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/business', icon: LayoutDashboard, end: true },
    { label: 'Inventory & Deals', path: '/business/products', icon: Package, end: true },
    { label: 'Add Rescue Product', path: '/business/products/new', icon: PlusCircle, end: true },
    { label: 'Reservations', path: '/business/reservations', icon: ShoppingBag },
    { label: 'Analytics & Waste', path: '/business/analytics', icon: BarChart3 },
    { label: 'Messages', path: '/business/messages', icon: MessageSquare },
    { label: 'Store Profile', path: '/business/store', icon: StoreIcon }
  ];

  return (
    <aside className="w-64 glass-surface text-stone-700 min-h-[calc(100vh-64px)] p-4 flex flex-col justify-between border-r border-white/60 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
      <div className="space-y-6">
        {/* Store Profile Card */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-800 text-white font-bold flex items-center justify-center text-base shrink-0 shadow-2xs">
            R
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-stone-900 truncate">
              {userProfile?.name || 'Partner Store'}
            </h4>
            <span className="text-2xs text-stone-500 font-medium block">Verified Partner Store</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="text-3xs font-bold text-stone-400 uppercase tracking-wider px-3 mb-2">
            Store Management
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-stone-900 text-white font-bold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Dev Mode Banner & Switch in Retailer Sidebar */}
      {isDevRoleActive && (
        <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 space-y-2 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-black uppercase tracking-wider text-stone-800 bg-stone-200 px-1.5 py-0.5 rounded shadow-2xs">
              DEV MODE ACTIVE
            </span>
            <Code2 className="w-3.5 h-3.5 text-stone-600" />
          </div>
          <p className="text-3xs text-stone-600 font-medium leading-tight">
            Operating as mock retailer. Click below to switch back to consumer.
          </p>
          <button
            type="button"
            id="btn-sidebar-dev-switch-consumer"
            onClick={async () => {
              await switchToConsumerDev();
              navigate('/app/discover');
            }}
            className="w-full py-2 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-98 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Consumer</span>
          </button>
        </div>
      )}

      {/* Switch to Consumer View footer */}
      <div className="pt-4 border-t border-white/60 space-y-2">
        <Link
          to="/app/discover"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl glass-pill text-stone-700 hover:text-emerald-950 text-xs font-semibold transition-all hover:bg-white shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Consumer App</span>
          </div>
          <ExternalLink className="w-3 h-3 text-stone-400" />
        </Link>
      </div>
    </aside>
  );
};
