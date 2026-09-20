import React, { useState } from 'react';
import { MapPin, Navigation, Search, X, Check, Loader2 } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserLocation } from '../../types';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({ isOpen, onClose }) => {
  const { 
    location, 
    setLocation, 
    requestCurrentLocation, 
    isLoadingLocation, 
    locationError,
    popularLocations,
    searchLocations
  } = useLocation();
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleUseCurrentLocation = async () => {
    const success = await requestCurrentLocation();
    if (success) {
      onClose();
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchLocations(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelect = (loc: UserLocation) => {
    setLocation(loc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        id="location-selector-modal"
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900">
                {language === 'de' ? 'Standort wählen' : 'Select Location'}
              </h3>
              <p className="text-xs text-stone-500">
                {language === 'de' ? 'Entdecke Rettungsangebote in deiner Nähe' : 'Discover rescue food deals near you'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current GPS button */}
        <div className="mt-4">
          <button
            type="button"
            id="btn-use-current-gps"
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/60 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                {isLoadingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-sm font-bold block">
                  {language === 'de' ? 'Meinen aktuellen Standort nutzen' : 'Use my current location'}
                </span>
                <span className="text-xs text-emerald-700/90">
                  {language === 'de' ? 'GPS über Browser erkennen' : 'Detect GPS via browser'}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold bg-emerald-200/60 px-2 py-1 rounded-md text-emerald-800">
              {language === 'de' ? 'Automatisch' : 'Auto-detect'}
            </span>
          </button>

          {locationError && (
            <p className="text-xs text-rose-600 mt-2 px-1">{locationError}</p>
          )}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-city-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'de' ? 'PLZ oder Stadtteil in Kleve suchen...' : 'Search district or area in Kleve...'}
              className="w-full pl-10 pr-20 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              {isSearching ? (language === 'de' ? 'Suchen...' : 'Searching...') : (language === 'de' ? 'Suchen' : 'Search')}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-3 max-h-40 overflow-y-auto space-y-1 border border-stone-100 rounded-xl p-1 bg-stone-50/50">
            {searchResults.map((res, i) => (
              <button
                key={i}
                onClick={() => handleSelect(res)}
                className="w-full text-left p-2 rounded-lg hover:bg-white hover:shadow-xs flex items-center justify-between text-xs text-stone-800 transition-colors cursor-pointer"
              >
                <span className="truncate font-medium">{res.name} — {res.address}</span>
                <span className="text-emerald-700 font-semibold text-2xs uppercase">
                  {language === 'de' ? 'Auswählen' : 'Select'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Popular Locations */}
        <div className="mt-5">
          <p className="text-2xs font-bold text-stone-400 uppercase tracking-wider mb-2">
            {language === 'de' ? 'Standorte in Kleve' : 'Locations in Kleve'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {popularLocations.map((loc) => {
              const isSelected = location.name === loc.name;
              return (
                <button
                  key={loc.name}
                  onClick={() => handleSelect(loc)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <span className="font-semibold truncate">{loc.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <span>{language === 'de' ? 'Aktuell' : 'Current'}: <strong className="text-stone-800">{location.name}</strong></span>
          <button onClick={onClose} className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full font-semibold text-xs transition-colors cursor-pointer">
            {language === 'de' ? 'Fertig' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
