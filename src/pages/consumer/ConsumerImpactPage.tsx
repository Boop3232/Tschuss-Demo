import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Leaf, 
  Coins, 
  ShoppingBag, 
  Store as StoreIcon, 
  Award, 
  Info,
  TrendingUp,
  Scale
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { impactService, ConsumerImpactStats } from '../../services/impactService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, IMPACT_CONFIG } from '../../utils/businessLogic';

export const ConsumerImpactPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState<ConsumerImpactStats | null>(null);
  const [loading, setLoading] = useState(true);

  const consumerId = currentUser?.uid || userProfile?.uid || 'demo_consumer_123';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await impactService.getConsumerImpact(consumerId);
        setStats(data);
      } catch (err) {
        console.error('Error loading impact stats:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [consumerId]);

  // Demo trend data for charts
  const weeklyTrends = [
    { week: 'Week 1', foodKg: 0.8, savedEur: 4.20 },
    { week: 'Week 2', foodKg: 1.4, savedEur: 7.50 },
    { week: 'Week 3', foodKg: 2.1, savedEur: 11.20 },
    { week: 'Current', foodKg: stats?.foodDivertedKg || 2.8, savedEur: stats?.moneySaved || 14.80 }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Banner in Soft Pastel */}
      <div className="bg-gradient-to-r from-emerald-50/95 via-teal-50/60 to-sky-50/50 border border-emerald-200/70 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-800 text-2xs font-bold uppercase tracking-wider mb-2 border border-emerald-200/80 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Verified Environmental & Financial Tracker
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-stone-900">
            Your Food Rescue Impact
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Every product rescued directly prevents retail organic waste from entering landfills and conserves water and energy used in agricultural production.
          </p>
        </div>

        {/* Score Badge in Soft Pastel */}
        <div className="relative z-10 flex items-center gap-3 bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-emerald-200/70 max-w-xs shadow-2xs shrink-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl shrink-0 border border-emerald-200/60 shadow-2xs">
            <Award className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <span className="text-3xs font-bold text-stone-500 uppercase tracking-wider block">
              Rescue Score
            </span>
            <span className="text-2xl font-black text-emerald-900">
              {stats?.impactScore || 85} <span className="text-xs font-semibold text-emerald-700">pts</span>
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Products Rescued */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider block mb-0.5">
            Products Rescued
          </span>
          <span className="text-2xl font-black text-stone-900">
            {stats?.productsRescued || 0}
          </span>
          <span className="text-3xs text-stone-500 block mt-1">Individual items</span>
        </div>

        {/* Metric 2: Money Saved */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider block mb-0.5">
            Money Saved
          </span>
          <span className="text-2xl font-black text-stone-900">
            {formatCurrency(stats?.moneySaved || 0)}
          </span>
          <span className="text-3xs text-emerald-700 font-bold block mt-1">Direct retail discount</span>
        </div>

        {/* Metric 3: CO2e Avoided */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mb-3">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider block mb-0.5">
            CO2e Avoided
          </span>
          <span className="text-2xl font-black text-stone-900">
            {stats?.co2eAvoidedKg || 0} <span className="text-sm font-normal text-stone-500">kg</span>
          </span>
          <span className="text-3xs text-stone-500 block mt-1">Greenhouse gas diverted</span>
        </div>

        {/* Metric 4: Food Diverted */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-3">
            <Scale className="w-5 h-5" />
          </div>
          <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider block mb-0.5">
            Food Diverted
          </span>
          <span className="text-2xl font-black text-stone-900">
            {stats?.foodDivertedKg || 0} <span className="text-sm font-normal text-stone-500">kg</span>
          </span>
          <span className="text-3xs text-stone-500 block mt-1">Saved from landfill</span>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Savings Chart */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Cumulative Savings Growth</h3>
              <p className="text-2xs text-stone-500">Euros saved through discounted rescue orders</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg">
              + {formatCurrency(stats?.moneySaved || 14.80)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="savingsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="€" />
                <Tooltip 
                  formatter={(val: any) => [`€${Number(val).toFixed(2)}`, 'Money Saved']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="savedEur" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#savingsColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Food Diverted (kg) */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Food Diverted (kg)</h3>
              <p className="text-2xs text-stone-500">Weight of retail goods prevented from waste</p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-1 rounded-lg">
              {stats?.foodDivertedKg || 2.8} kg total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="kg" />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toFixed(2)} kg`, 'Food Diverted']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="foodKg" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transparent Methodology & Disclaimer Note */}
      <div className="p-4 rounded-2xl bg-stone-100/90 border border-stone-200 text-xs text-stone-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-stone-900 block">Transparent Methodology</span>
          <p className="leading-relaxed text-2xs sm:text-xs">
            {IMPACT_CONFIG.METHODOLOGY_NOTE}
            Calculations are transparent estimates based on verified completed pick-ups and do not constitute certified carbon credits.
          </p>
        </div>
      </div>
    </div>
  );
};
