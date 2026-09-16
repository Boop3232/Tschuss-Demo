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
    { label: 'Inventory & Deals', path: '/business/products', icon: Package },
    { label: 'Add Rescue Product', path: '/business/products/new', icon: PlusCircle },
    { label: 'Reservations', path: '/business/reservations', icon: ShoppingBag },
    { label: 'Analytics & Waste', path: '/business/analytics', icon: BarChart3 },
    { label: 'Messages', path: '/business/messages', icon: MessageSquare },
    { label: 'Store Profile', path: '/business/store', icon: StoreIcon }
  ];

  return (
    <aside className="w-64 bg-white text-stone-700 min-h-[calc(100vh-64px)] p-4 flex flex-col justify-between border-r border-stone-200/70 shrink-0 shadow-2xs">
      <div className="space-y-6">
        {/* Store Profile Card */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-base shrink-0 shadow-2xs">
            R
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-stone-900 truncate">
              {userProfile?.name || 'Partner Store'}
            </h4>
            <span className="text-2xs text-emerald-700 font-semibold block">Verified Partner Store</span>
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
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-100/80 text-emerald-950 font-bold border border-emerald-200/70 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-emerald-700" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Dev Mode Banner & Switch in Retailer Sidebar */}
      {isDevRoleActive && (
        <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-2 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-black uppercase tracking-wider text-purple-800 bg-purple-200/80 px-1.5 py-0.5 rounded">
              DEV MODE ACTIVE
            </span>
            <Code2 className="w-3.5 h-3.5 text-purple-700" />
          </div>
          <p className="text-3xs text-purple-900 leading-tight">
            Operating as mock retailer. Click below to switch back to consumer.
          </p>
          <button
            type="button"
            id="btn-sidebar-dev-switch-consumer"
            onClick={async () => {
              await switchToConsumerDev();
              navigate('/app/discover');
            }}
            className="w-full py-1.5 px-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 active:scale-98 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Consumer</span>
          </button>
        </div>
      )}

      {/* Switch to Consumer View footer */}
      <div className="pt-4 border-t border-stone-100 space-y-2">
        <Link
          to="/app/discover"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200/70 text-xs font-semibold transition-colors"
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
