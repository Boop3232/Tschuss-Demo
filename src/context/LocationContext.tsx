import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserLocation } from '../types';

interface LocationContextType {
  location: UserLocation;
  setLocation: (loc: UserLocation) => void;
  requestCurrentLocation: () => Promise<boolean>;
  isLoadingLocation: boolean;
  locationError: string | null;
  popularLocations: UserLocation[];
  searchLocations: (query: string) => Promise<UserLocation[]>;
}

// Default to Kleve, Germany as specified in product presentation guidelines
export const DEFAULT_LOCATION: UserLocation = {
  name: 'Kleve, Germany',
  lat: 51.7891,
  lng: 6.1381,
  address: 'Kleve, North Rhine-Westphalia, Germany'
};

export const POPULAR_LOCATIONS: UserLocation[] = [
  { name: 'Kleve', lat: 51.7891, lng: 6.1381, address: 'Kleve, NRW' },
  { name: 'Kleve Oberstadt', lat: 51.7850, lng: 6.1350, address: 'Kleve Oberstadt, NRW' },
  { name: 'Kleve Kellen', lat: 51.7980, lng: 6.1520, address: 'Kleve Kellen, NRW' },
  { name: 'Kleve Materborn', lat: 51.7780, lng: 6.1200, address: 'Kleve Materborn, NRW' },
  { name: 'Kleve Rindern', lat: 51.8100, lng: 6.1250, address: 'Kleve Rindern, NRW' }
];

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<UserLocation>(() => {
    const saved = localStorage.getItem('tschuess_user_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved location', e);
      }
    }
    return DEFAULT_LOCATION;
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const setLocation = useCallback((newLoc: UserLocation) => {
    setLocationState(newLoc);
    setLocationError(null);
    localStorage.setItem('tschuess_user_location', JSON.stringify(newLoc));
  }, []);

  const requestCurrentLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return false;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Attempt reverse geocoding via OpenStreetMap Nominatim for human readable city name
          let cityName = 'Current Location';
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
            );
            if (res.ok) {
              const data = await res.json();
              cityName = data.address?.city || data.address?.town || data.address?.municipality || data.display_name?.split(',')[0] || 'Current Location';
            }
          } catch {
            cityName = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
          }

          const detectedLoc: UserLocation = {
            name: cityName,
            lat,
            lng,
            address: `Near ${cityName}`
          };

          setLocation(detectedLoc);
          setIsLoadingLocation(false);
          resolve(true);
        },
        (error) => {
          setIsLoadingLocation(false);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationError('Location permission was denied. You can select your city manually.');
          } else {
            setLocationError('Unable to retrieve your current location.');
          }
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, [setLocation]);

  // Search locations constrained to Kleve
  const searchLocations = useCallback(async (query: string): Promise<UserLocation[]> => {
    if (!query || query.trim().length < 2) return [];

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent('Kleve ' + query)}&countrycodes=de&limit=5`
      );
      if (!res.ok) throw new Error('Geocoding query failed');
      const data = await res.json();

      return data.map((item: any) => ({
        name: item.name || item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name
      }));
    } catch (err) {
      console.warn('Online geocoding search failed, fallback to Kleve list:', err);
      return POPULAR_LOCATIONS.filter(l => 
        l.name.toLowerCase().includes(query.toLowerCase()) || 
        l.address?.toLowerCase().includes(query.toLowerCase())
      );
    }
  }, []);

  const contextValue = useMemo<LocationContextType>(() => ({
    location,
    setLocation,
    requestCurrentLocation,
    isLoadingLocation,
    locationError,
    popularLocations: POPULAR_LOCATIONS,
    searchLocations
  }), [
    location,
    setLocation,
    requestCurrentLocation,
    isLoadingLocation,
    locationError,
    searchLocations
  ]);

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
