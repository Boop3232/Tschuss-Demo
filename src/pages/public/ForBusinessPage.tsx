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
  ArrowRight,
  MapPin,
  Clock,
  QrCode,
  FileCheck2,
  Mail,
  Phone,
  Building2,
  Copy,
  ExternalLink,
  HelpCircle,
  Percent,
  Check
} from 'lucide-react';
import { formatCurrency } from '../../utils/businessLogic';
import { RetailerOnboardingMap } from '../../components/retailer/RetailerOnboardingMap';
import { onboardingService, RetailerOnboardingPayload, OnboardingResponse } from '../../services/onboardingService';

export const ForBusinessPage: React.FC = () => {
  // Interactive margin recovery calculator
  const [monthlyShrinkEur, setMonthlyShrinkEur] = useState<number>(3000);
  const estimatedRecovery = Math.round(monthlyShrinkEur * 0.42); // 42% average recovery rate
  const estimatedCo2SavedKg = Math.round((monthlyShrinkEur / 3.5) * 2.5);

  // Partner onboarding form state
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('Supermarket');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('47533');
  const [city, setCity] = useState('Kleve');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 51.7891, lng: 6.1381 });
  const [pickupStartTime, setPickupStartTime] = useState('17:00');
  const [pickupEndTime, setPickupEndTime] = useState('20:30');
  const [operationalNotes, setOperationalNotes] = useState('');
  const [acceptsTerms, setAcceptsTerms] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<OnboardingResponse | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Handle Coordinates Change from Interactive Map
  const handleMapCoordsChange = (newCoords: { lat: number; lng: number }, detectedAddress?: string) => {
    setCoordinates(newCoords);
    if (detectedAddress && !address) {
      setAddress(detectedAddress.split(',')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload: RetailerOnboardingPayload = {
      storeName,
      storeType,
      contactName,
      email,
      phone: phone || '+49 (0) 2821 555-0',
      address: address || 'Store Location In Kleve',
      postalCode: postalCode || '47533',
      city,
      coordinates,
      monthlyShrinkEur,
      pickupStartTime,
      pickupEndTime,
      operationalNotes,
      acceptsTerms,
    };

    try {
      const result = await onboardingService.submitOnboarding(payload);
      setSubmissionResult(result);
    } catch (err) {
      console.error('Onboarding submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (submissionResult?.referenceId) {
      navigator.clipboard.writeText(submissionResult.referenceId);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-950 text-2xs font-bold uppercase tracking-wider shadow-2xs border border-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>B2B Retailer Partnership Program</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-900 font-display tracking-tight leading-tight">
          Turn Supermarket Food Shrink Into Recovered Margin.
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Supermarkets lose between 1.5% and 3.5% of annual turnover to organic waste and write-offs. Tschüss helps you monetize near-expiry stock while driving local footfall into your stores with zero hardware costs.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#onboarding"
            className="px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <span>Start Store Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            to="/business"
            className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs font-bold transition-all shadow-2xs"
          >
            Preview Retailer Terminal
          </Link>
        </div>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900">Immediate Revenue Recovery</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Convert unavoidable short-dated stock into direct cash flow instead of paying organic disposal fees.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900">New Physical Foot Traffic</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            78% of food rescue shoppers purchase additional full-price items while collecting their order in your aisles.
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

      {/* Section 2: Step-by-Step Onboarding Roadmap & Instructions */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider">
            Clear 4-Step Roadmap
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-stone-900">
            How Retailer Onboarding Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            From registration to your first rescued meal in less than 24 hours. No expensive hardware or POS modifications needed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                1
              </span>
              <MapPin className="w-4 h-4 text-emerald-700" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">Pin & Geolocation</h4>
            <p className="text-3xs text-stone-600 leading-relaxed">
              Use our interactive map below to pinpoint your storefront customer entrance so local shoppers can navigate to your door.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                2
              </span>
              <Clock className="w-4 h-4 text-emerald-700" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">Define Pickup Windows</h4>
            <p className="text-3xs text-stone-600 leading-relaxed">
              Specify your preferred pickup hours (e.g. 17:00–20:30) and pickup counter instructions (e.g. Express Checkout or Bakery Counter).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                3
              </span>
              <Percent className="w-4 h-4 text-emerald-700" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">60-Sec Listing</h4>
            <p className="text-3xs text-stone-600 leading-relaxed">
              Staff snap a photo or pick category presets. Discounts of 30%–70% go live instantly on the consumer map.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                4
              </span>
              <QrCode className="w-4 h-4 text-emerald-700" />
            </div>
            <h4 className="font-bold text-sm text-stone-900">Instant Verification</h4>
            <p className="text-3xs text-stone-600 leading-relaxed">
              Customer presents reservation PIN code or QR ticket. Cashless pre-payment or store counter payment supported.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Shrink Recovery Calculator */}
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
            <span className="text-stone-700">Estimated Current Monthly Write-Off / Shrink:</span>
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
            <span>€500 (Small Bakery/Café)</span>
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
            <span className="text-2xs text-stone-500 block mt-1">per month back into store net margin</span>
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

      {/* DEDICATED FULL-FLEDGED ONBOARDING MAP & APPLICATION SECTION */}
      <div id="onboarding" className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8 scroll-mt-20">
        
        {/* Section Header */}
        <div className="border-b border-stone-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-3xs font-bold uppercase tracking-wider mb-2">
              <StoreIcon className="w-3 h-3 text-emerald-800" />
              <span>Retailer Onboarding Portal</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              Store Registration & Onboarding Map
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Complete your store details and pinpoint your storefront location. Our operations team receives your application instantly.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
              PENDING
            </div>
            <div className="text-left">
              <span className="text-3xs font-bold text-stone-400 uppercase tracking-wider block">
                Target Destination
              </span>
              <span className="text-xs font-bold text-stone-800">
                Admin Dashboard (Pending Review)
              </span>
            </div>
          </div>
        </div>

        {/* SUBMISSION SUCCESS SCREEN */}
        {submissionResult ? (
          <div className="p-8 bg-amber-50/80 border-2 border-amber-300 rounded-3xl text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto shadow-xs border-2 border-amber-200 font-bold text-2xl">
              ⏳
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 text-2xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span>Status: Pending Review</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-amber-950 font-display">
                Application Sent to Admin Dashboard!
              </h4>
              <p className="text-xs sm:text-sm text-stone-700">
                Thank you <strong>{contactName}</strong>. Your onboarding application for <strong>{storeName}</strong> ({city}) has been recorded and submitted directly to the <strong>Admin Dashboard</strong> with status <strong className="text-amber-900">pending</strong>.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200 max-w-md mx-auto flex items-center justify-between gap-3 shadow-2xs">
              <div className="text-left">
                <span className="text-3xs font-bold text-stone-400 uppercase tracking-wider block">
                  Application Tracking Reference
                </span>
                <span className="text-base font-black text-amber-950 font-mono">
                  {submissionResult.referenceId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyReference}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-amber-200"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRef ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Summary Details */}
            <div className="bg-white/90 rounded-2xl p-4 max-w-md mx-auto border border-amber-200/80 text-left text-xs text-stone-700 space-y-1.5">
              <div><strong>Status:</strong> <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-3xs uppercase">pending</span></div>
              <div><strong>Store:</strong> {storeName} ({storeType})</div>
              <div><strong>Location:</strong> {address}, {postalCode} {city}</div>
              <div><strong>Pickup Hours:</strong> {pickupStartTime} – {pickupEndTime}</div>
              <div><strong>Target Margin:</strong> ~ {formatCurrency(estimatedRecovery)} / month</div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/admin"
                className="px-6 py-3 bg-amber-900 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Admin Dashboard Applications</span>
              </Link>

              <button
                type="button"
                onClick={() => setSubmissionResult(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                Submit another application
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1 in Form: Interactive Map Pinning */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-3xs font-bold flex items-center justify-center">
                      1
                    </span>
                    Store Geolocation & Entrance Pin
                  </h4>
                  <p className="text-3xs sm:text-2xs text-stone-500 mt-0.5">
                    Search your street or drag the emerald pin to your customer pickup entrance.
                  </p>
                </div>
                <span className="text-3xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  OpenStreetMap GPS Enabled
                </span>
              </div>

              {/* Embed Interactive Leaflet Onboarding Map */}
              <RetailerOnboardingMap
                initialCoordinates={coordinates}
                storeName={storeName || 'Your Store'}
                storeType={storeType}
                city={city}
                address={address}
                onCoordinatesChange={handleMapCoordsChange}
              />
            </div>

            {/* Step 2 in Form: Store & Contact Particulars */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-3xs font-bold flex items-center justify-center">
                  2
                </span>
                Store & Management Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Store / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. EDEKA Kleve City Center"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Retail Format *
                  </label>
                  <select
                    value={storeType}
                    onChange={(e) => setStoreType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white cursor-pointer"
                  >
                    <option value="Supermarket">Supermarket</option>
                    <option value="Bakery">Bakery / Patisserie</option>
                    <option value="Organic">Organic Bio-Markt</option>
                    <option value="Convenience">Convenience Store / Kiosk</option>
                    <option value="Deli">Butcher / Delicatessen</option>
                    <option value="Florist">Florist / Plant Nursery</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Region / City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white cursor-pointer"
                  >
                    <option value="Kleve">Kleve</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Hoffmannallee 24"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 47533"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Store Manager / Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Christian Schneider"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Manager Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="c.schneider@store.de"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Direct Phone / Store Extension *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+49 (0) 2821 555-123"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Daily Pickup Window (Start & End)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={pickupStartTime}
                      onChange={(e) => setPickupStartTime(e.target.value)}
                      className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                    <input
                      type="time"
                      value={pickupEndTime}
                      onChange={(e) => setPickupEndTime(e.target.value)}
                      className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Operational Pickup / Counter Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={operationalNotes}
                  onChange={(e) => setOperationalNotes(e.target.value)}
                  placeholder="e.g. Rescued food bags can be picked up at Express Register 3 or the Bakery counter near entrance."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                />
              </div>
            </div>

            {/* Step 3: Terms & Dispatch Action */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-start gap-2.5 cursor-pointer max-w-lg">
                <input
                  type="checkbox"
                  checked={acceptsTerms}
                  onChange={(e) => setAcceptsTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-800 accent-emerald-800"
                />
                <span className="text-3xs sm:text-2xs text-stone-600 leading-snug">
                  I agree to participating in the 30-day free program and confirm compliance with German Food Hygiene (§ LFGB / LMIV) standards.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting || !acceptsTerms}
                className={`px-8 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                  submitting || !acceptsTerms
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-emerald-900 hover:bg-emerald-800 text-white hover:scale-[1.01]'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transmitting to abhirajsingh1226@gmail.com...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Store Onboarding</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Retailer FAQ & Compliance Accordion */}
      <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">Frequently Asked Questions</h3>
            <p className="text-3xs text-stone-500">Everything you need to know about the onboarding process</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 space-y-1.5">
            <h4 className="font-bold text-stone-900">Are there any upfront hardware costs?</h4>
            <p className="text-stone-600 text-3xs leading-relaxed">
              None. Staff can use any existing checkout smartphone, tablet, or PC browser. No expensive proprietary barcode hardware required.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 space-y-1.5">
            <h4 className="font-bold text-stone-900">How is compliance with German food law handled?</h4>
            <p className="text-stone-600 text-3xs leading-relaxed">
              Tschüss fully satisfies German LFGB and LMIV regulations. Only items within acceptable sensory and best-before criteria are listed.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 space-y-1.5">
            <h4 className="font-bold text-stone-900">When does revenue payout occur?</h4>
            <p className="text-stone-600 text-3xs leading-relaxed">
              Settlements for reserved and collected products are paid out on a bi-weekly cycle with automated VAT invoices and ESG reduction logs.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 space-y-1.5">
            <h4 className="font-bold text-stone-900">How fast does our store go live?</h4>
            <p className="text-stone-600 text-3xs leading-relaxed">
              Upon form submission, our Kleve regional team confirms your coordinates and activates your terminal within 24 business hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
