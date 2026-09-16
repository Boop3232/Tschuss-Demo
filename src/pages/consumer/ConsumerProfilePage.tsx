import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Bell, 
  Globe, 
  Shield, 
  Check, 
  LogOut,
  Save,
  Store,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import { UserRole } from '../../types';

export const ConsumerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    userProfile, 
    updateUserProfile, 
    logout, 
    role, 
    currentUser,
    switchToRetailerDev,
    switchToConsumerDev,
    isDevRoleActive
  } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { location } = useLocation();

  const [name, setName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || currentUser?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [dealsNearMe, setDealsNearMe] = useState(userProfile?.notificationPreferences?.dealsNearMe ?? true);
  const [reservationUpdates, setReservationUpdates] = useState(userProfile?.notificationPreferences?.reservationUpdates ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.email) setEmail(userProfile.email);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.notificationPreferences) {
        setDealsNearMe(userProfile.notificationPreferences.dealsNearMe ?? true);
        setReservationUpdates(userProfile.notificationPreferences.reservationUpdates ?? true);
      }
    } else if (currentUser) {
      if (currentUser.displayName) setName(currentUser.displayName);
      if (currentUser.email) setEmail(currentUser.email);
    }
  }, [
    userProfile?.uid,
    userProfile?.name,
    userProfile?.email,
    userProfile?.phone,
    currentUser?.uid,
    currentUser?.displayName,
    currentUser?.email
  ]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        notificationPreferences: {
          email: true,
          push: true,
          dealsNearMe,
          reservationUpdates,
          savedPriceDrops: true
        }
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
            Account & Preferences
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your personal contact details, location and notifications.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
          Role: {role || 'consumer'}
        </span>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-100/90 text-emerald-900 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>Profile changes updated successfully!</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Phone (for order pickup SMS)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-500 cursor-not-allowed"
              />
              <span className="text-3xs text-stone-400 mt-1 block">
                Email is tied to your login credentials.
              </span>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Active Discovery City
          </h3>
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-800" />
              <div>
                <span className="text-xs font-bold text-stone-900 block">{location.name}</span>
                <span className="text-2xs text-stone-500">{location.address}</span>
              </div>
            </div>
            <span className="text-2xs font-bold text-emerald-800">Selected</span>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Notification Preferences
          </h3>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/70 border border-stone-200/80 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-stone-900 block">Deals near me</span>
              <span className="text-2xs text-stone-500">Alert me when stores within my radius discount high-demand items</span>
            </div>
            <input
              type="checkbox"
              checked={dealsNearMe}
              onChange={(e) => setDealsNearMe(e.target.checked)}
              className="w-4 h-4 accent-emerald-800 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/70 border border-stone-200/80 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-stone-900 block">Reservation status updates</span>
              <span className="text-2xs text-stone-500">Receive alerts when orders are ready for pickup or nearing deadline</span>
            </div>
            <input
              type="checkbox"
              checked={reservationUpdates}
              onChange={(e) => setReservationUpdates(e.target.checked)}
              className="w-4 h-4 accent-emerald-800 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Language Options */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Language Settings
          </h3>

          <div className="p-3.5 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-stone-900">Application Language</span>
            </div>
            <div className="flex items-center gap-2 max-w-md">
              <button
                type="button"
                id="btn-profile-lang-en"
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  language === 'en'
                    ? 'bg-white text-emerald-900 border-emerald-300 shadow-2xs'
                    : 'bg-stone-100/80 text-stone-600 border-transparent hover:bg-white'
                }`}
              >
                <span>English (EN)</span>
              </button>
              <button
                type="button"
                id="btn-profile-lang-de"
                onClick={() => setLanguage('de')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  language === 'de'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                    : 'bg-stone-100/80 text-stone-600 border-transparent hover:bg-white'
                }`}
              >
                <span>Deutsch (DE)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Development Mode Role Switcher */}
      <div className="p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-4 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 flex items-center justify-center">
              <Store className="w-4 h-4 text-purple-700 dark:text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  Developer Mode: Role Switcher
                </h3>
                <span className="px-1.5 py-0.5 rounded text-3xs font-black bg-purple-600 text-white uppercase">
                  DEV
                </span>
              </div>
              <p className="text-2xs text-stone-500 dark:text-stone-400">
                Instant development simulation to toggle between Consumer and Retailer portal with mock inventory access.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-900 dark:text-purple-200 text-xs font-bold uppercase tracking-wider border border-purple-300 dark:border-purple-700">
            Active Role: {role || 'consumer'}
          </span>
        </div>

        <div className="pt-3 border-t border-purple-100 dark:border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-stone-600 dark:text-stone-300">
            Test business workflows, product uploads, and reservation management:
          </p>
          <div className="flex items-center gap-2">
            {role !== 'retailer' && role !== 'admin' ? (
              <button
                type="button"
                id="btn-profile-dev-switch-retailer"
                onClick={async () => {
                  await switchToRetailerDev();
                  navigate('/business');
                }}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 active:scale-98 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span>Switch to Retailer & Open Portal</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-profile-dev-switch-consumer"
                onClick={async () => {
                  await switchToConsumerDev();
                  navigate('/app/discover');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Switch back to Consumer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account Security & Sign Out */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/80 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Account Security & Access Role
              </h3>
              <p className="text-2xs text-stone-500">
                Your role is enforced server-side via Firebase Authentication and Firestore Security Rules.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
            {role || 'consumer'}
          </span>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            Finished your session on this device?
          </p>
          <button
            type="button"
            id="btn-profile-logout"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/80 text-rose-700 text-xs font-bold transition-all flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
