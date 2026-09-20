import React, { useState, useEffect, useRef } from 'react';
import { 
  Store as StoreIcon, 
  MapPin, 
  Clock, 
  Phone, 
  Info, 
  Check, 
  Save, 
  ExternalLink,
  UploadCloud,
  Camera,
  X,
  AlertCircle
} from 'lucide-react';
import { Store } from '../../types';
import { storeService } from '../../services/storeService';

export const RetailerStorePage: React.FC = () => {
  const storeId = 'store_rewe_kleve';

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const s = await storeService.getStoreById(storeId);
        if (s) {
          setStore(s);
          setName(s.name);
          setAddress(s.address);
          setCity(s.city);
          setOpeningHours(s.openingHours);
          setPhone(s.phone);
          setPickupInstructions(s.pickupInstructions || '');
          setImageUrl(s.imageUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80');
        }
      } catch (err) {
        console.error('Error loading store profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [storeId]);

  const handlePhotoUpload = (file: File) => {
    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size is too large (max 5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setImageUrl(e.target.result);
      }
    };
    reader.onerror = () => {
      setPhotoError('Could not process photo file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await storeService.updateStore(storeId, {
      name,
      address,
      city,
      openingHours,
      phone,
      pickupInstructions,
      imageUrl
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
          Store Profile & Pickup Settings
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Keep your store address, pickup instructions, and working hours up to date for consumers.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>Store profile changes saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Storefront Image Upload */}
        <div className="space-y-3 pb-6 border-b border-stone-100">
          <label className="text-xs font-bold text-stone-700 block">
            Storefront Photo / Brand Image
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-28 h-24 rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-100 shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt="Storefront" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  <StoreIcon className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="space-y-2 flex-1 w-full">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                }}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <UploadCloud className="w-4 h-4 text-emerald-700" />
                  <span>Upload Store Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl('https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80')}
                  className="px-3 py-2 text-stone-500 hover:text-stone-800 text-2xs font-semibold"
                >
                  Reset to Default
                </button>
              </div>
              <p className="text-3xs text-stone-400">
                Shown to consumers on store pages and map pins. Recommended ratio: 4:3 or 16:9.
              </p>
            </div>
          </div>
          {photoError && (
            <p className="text-xs text-rose-600 font-semibold">{photoError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Store Legal & Trading Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Street Address *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              City / Postal Code *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Store Pickup & Opening Hours *
            </label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="e.g. Mon-Sat 08:00 - 21:00"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Contact Phone (Store Desk) *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Shopper Pickup Instructions (Displayed on consumer reservation voucher)
            </label>
            <textarea
              rows={3}
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              placeholder="e.g. Please go to customer service counter at the store entrance. Show your Tschüss pickup code to the staff member."
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
