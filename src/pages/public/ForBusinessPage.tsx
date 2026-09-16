import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store as StoreIcon, 
  TrendingUp, 
  Leaf, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Calculator, 
  Send,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../../utils/businessLogic';

export const ForBusinessPage: React.FC = () => {
  // Interactive margin recovery calculator
  const [monthlyShrinkEur, setMonthlyShrinkEur] = useState<number>(3000);
  const estimatedRecovery = Math.round(monthlyShrinkEur * 0.42); // 42% average recovery rate
  const estimatedCo2SavedKg = Math.round((monthlyShrinkEur / 3.5) * 2.5);

  // Partner inquiry form state
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('Supermarket');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Kleve');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-2xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>B2B Retailer Partnership Program</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 font-display tracking-tight leading-tight">
          Turn Supermarket Food Shrink Into Recovered Margin.
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Supermarkets lose between 1.5% and 3.5% of annual turnover to organic waste and write-offs. Tschüss helps you monetize near-expiry stock while driving local footfall into your stores.
        </p>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900">Immediate Revenue Recovery</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Convert unavoidable short-dated stock into cash flow instead of paying disposal fees.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900">New Physical Foot Traffic</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            78% of food rescue shoppers purchase additional full-price items while collecting their order in your store.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900">Auditable ESG Reporting</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Automatic calculation of diverted biomass and avoided greenhouse emissions for corporate sustainability compliance.
          </p>
        </div>
      </div>

      {/* Interactive Shrink Recovery Calculator in Soft Pastel */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-amber-50/40 rounded-3xl p-6 sm:p-10 border border-emerald-200/70 text-stone-900 space-y-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              Interactive ROI Estimator
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-stone-900">
              Calculate Your Store's Recovery Potential
            </h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white text-emerald-700 flex items-center justify-center shadow-2xs border border-emerald-200/60">
            <Calculator className="w-6 h-6" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs sm:text-sm font-semibold">
            <span className="text-stone-700">Estimated Current Monthly Write-Off:</span>
            <span className="text-emerald-800 font-bold">{formatCurrency(monthlyShrinkEur)} / month</span>
          </div>
          <input
            type="range"
            min="500"
            max="15000"
            step="250"
            value={monthlyShrinkEur}
            onChange={(e) => setMonthlyShrinkEur(parseInt(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-2"
          />
          <div className="flex justify-between text-3xs text-stone-500 font-medium">
            <span>€500 (Bakery/Small Deli)</span>
            <span>€15,000+ (Large Supermarket / Hypermarket)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-emerald-200/60">
          <div className="p-4 rounded-2xl bg-white/90 border border-emerald-200/70 shadow-2xs">
            <span className="text-3xs text-stone-500 font-bold uppercase block mb-1">
              Estimated Recovered Margin
            </span>
            <span className="text-3xl font-black text-emerald-800">
              ~ {formatCurrency(estimatedRecovery)}
            </span>
            <span className="text-2xs text-stone-500 block mt-1">per month back into store margin</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-teal-200/70 shadow-2xs">
            <span className="text-3xs text-stone-500 font-bold uppercase block mb-1">
              Annual CO2e Emissions Avoided
            </span>
            <span className="text-3xl font-black text-teal-800">
              ~ {estimatedCo2SavedKg * 12} kg
            </span>
            <span className="text-2xs text-stone-500 block mt-1">annual verified ESG sustainability reduction</span>
          </div>
        </div>
      </div>

      {/* Partner Application Form */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-stone-900 font-display">
            Become a Partner Retailer
          </h3>
          <p className="text-xs text-stone-500">
            Join REWE, EDEKA, and local artisan bakeries in reducing waste and growing revenue.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <h4 className="font-bold text-emerald-950 text-base">Inquiry Received!</h4>
            <p className="text-xs text-emerald-800 max-w-sm mx-auto">
              Thank you {contactName}. A member of our Kleve onboarding team will contact you within 24 hours to set up your store terminal.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-3 text-2xs font-bold text-emerald-900 hover:underline"
            >
              Submit another store
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. EDEKA City Center"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Retail Format *</label>
              <select
                value={storeType}
                onChange={(e) => setStoreType(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              >
                <option value="Supermarket">Supermarket</option>
                <option value="Bakery">Bakery / Patisserie</option>
                <option value="Convenience">Convenience Store</option>
                <option value="Florist">Florist / Garden Center</option>
                <option value="Specialty">Specialty Food / Bio-Markt</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Store Manager Contact Name *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Christian Schneider"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="schneider@store.de"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2 pt-2 flex items-center justify-between">
              <span className="text-2xs text-stone-400">Free 30-day pilot testing in Kleve. No hardware purchase required.</span>
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Request Onboarding</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
