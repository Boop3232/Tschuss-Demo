import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Store as StoreIcon, Check, Search } from 'lucide-react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface RetailerOnboardingMapProps {
  initialCoordinates?: Coordinates;
  storeName?: string;
  storeType?: string;
  city?: string;
  address?: string;
  onCoordinatesChange: (coords: Coordinates, calculatedAddress?: string) => void;
}

const CITY_PRESETS: { name: string; lat: number; lng: number }[] = [
  { name: 'Kleve Center', lat: 51.7891, lng: 6.1381 },
  { name: 'Kleve Oberstadt', lat: 51.7850, lng: 6.1350 },
  { name: 'Kleve Kellen', lat: 51.7980, lng: 6.1520 },
  { name: 'Kleve Materborn', lat: 51.7780, lng: 6.1200 },
  { name: 'Kleve Rindern', lat: 51.8100, lng: 6.1250 },
  { name: 'Kleve Donsbrüggen', lat: 51.8150, lng: 6.0950 },
];

export const RetailerOnboardingMap: React.FC<RetailerOnboardingMapProps> = ({
  initialCoordinates = { lat: 51.7891, lng: 6.1381 }, // Default Kleve center
  storeName,
  storeType = 'Supermarket',
  city = 'Kleve',
  address,
  onCoordinatesChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  const [coords, setCoords] = useState<Coordinates>(initialCoordinates);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [catchmentRadiusKm, setCatchmentRadiusKm] = useState<number>(1.5);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [initialCoordinates.lat, initialCoordinates.lng],
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create Custom Draggable Store Marker
    const storePinIcon = L.divIcon({
      className: 'retailer-pin-marker',
      html: `
        <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
          <div class="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl shadow-xl flex items-center justify-center border-2 border-white ring-4 ring-emerald-500/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="absolute -bottom-2 w-2 h-2 bg-emerald-800 rotate-45 border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 36],
    });

    const marker = L.marker([initialCoordinates.lat, initialCoordinates.lng], {
      icon: storePinIcon,
      draggable: true,
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px;">
        <strong style="font-size: 13px; color: #064e3b;">${storeName || 'Your Store Pin'}</strong><br/>
        <span style="font-size: 11px; color: #64748b;">Drag pin or click map to adjust location</span>
      </div>
    `);

    // Radius Circle around store
    const circle = L.circle([initialCoordinates.lat, initialCoordinates.lng], {
      radius: catchmentRadiusKm * 1000,
      color: '#059669',
      fillColor: '#10b981',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);

    markerRef.current = marker;
    radiusCircleRef.current = circle;
    mapInstanceRef.current = map;

    // Marker Drag End Handler
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      const newPos = { lat: position.lat, lng: position.lng };
      setCoords(newPos);
      circle.setLatLng(position);
      onCoordinatesChange(newPos);
    });

    // Map Click Handler to Move Marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const newPos = { lat, lng };
      marker.setLatLng([lat, lng]);
      circle.setLatLng([lat, lng]);
      setCoords(newPos);
      onCoordinatesChange(newPos);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Map Position when preset city changes
  useEffect(() => {
    const matched = CITY_PRESETS.find((c) => c.name.toLowerCase() === city.toLowerCase());
    if (matched && mapInstanceRef.current && markerRef.current && radiusCircleRef.current) {
      const newPos = { lat: matched.lat, lng: matched.lng };
      mapInstanceRef.current.setView([matched.lat, matched.lng], 14);
      markerRef.current.setLatLng([matched.lat, matched.lng]);
      radiusCircleRef.current.setLatLng([matched.lat, matched.lng]);
      setCoords(newPos);
      onCoordinatesChange(newPos);
    }
  }, [city]);

  // Update Catchment Radius
  useEffect(() => {
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setRadius(catchmentRadiusKm * 1000);
    }
  }, [catchmentRadiusKm]);

  // Handle Search Geocoding (Nominatim OpenStreetMap)
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const queryWithCity = searchQuery.includes(city) ? searchQuery : `${searchQuery}, ${city}, Germany`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryWithCity)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        const newPos = { lat: newLat, lng: newLng };

        if (mapInstanceRef.current && markerRef.current && radiusCircleRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 16);
          markerRef.current.setLatLng([newLat, newLng]);
          radiusCircleRef.current.setLatLng([newLat, newLng]);
          setCoords(newPos);
          onCoordinatesChange(newPos, item.display_name);
        }
      }
    } catch (err) {
      console.warn('Geocoding search failed, manual pin placement available:', err);
    }
  };

  // Handle Browser Geolocation
  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (mapInstanceRef.current && markerRef.current && radiusCircleRef.current) {
          mapInstanceRef.current.setView([newPos.lat, newPos.lng], 16);
          markerRef.current.setLatLng([newPos.lat, newPos.lng]);
          radiusCircleRef.current.setLatLng([newPos.lat, newPos.lng]);
          setCoords(newPos);
          onCoordinatesChange(newPos);
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-4">
      {/* Map Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200">
        {/* Address Search Form */}
        <form onSubmit={handleSearchAddress} className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search store address in ${city} (e.g. Hoffmannallee 24)...`}
              className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            Find
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={isLocating}
            className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-700 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'My Location'}</span>
          </button>

          {/* Catchment Radius Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1.5 rounded-xl text-3xs font-semibold text-stone-600">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shopper Reach:</span>
            <select
              value={catchmentRadiusKm}
              onChange={(e) => setCatchmentRadiusKm(parseFloat(e.target.value))}
              className="bg-transparent text-emerald-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value={0.5}>500m (Walking)</option>
              <option value={1.5}>1.5 km (Neighborhood)</option>
              <option value={3.0}>3.0 km (City Zone)</option>
              <option value={5.0}>5.0 km (Regional)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Map Box */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-stone-200/80 shadow-xs bg-stone-100">
        <div ref={mapContainerRef} className="w-full h-[320px] sm:h-[400px] z-0" />

        {/* Live Map Overlay Helper Badge */}
        <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-3xs sm:text-2xs font-bold text-stone-800">
            📍 Click map or drag pin to your store's customer entrance
          </span>
        </div>

        {/* Live Coordinate & Coverage Preview HUD */}
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200/90 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <StoreIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-stone-900 truncate max-w-[200px] sm:max-w-[300px]">
                {storeName || 'Your Store Profile'} · <span className="text-emerald-700">{storeType}</span>
              </div>
              <div className="text-3xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>
                  Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)} ({city})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <span className="text-3xs font-semibold text-stone-400 uppercase tracking-wider block">
                Estimated Shopper Catchment
              </span>
              <span className="text-2xs font-bold text-emerald-800">
                ~ {Math.round(catchmentRadiusKm * 1450)} active food rescuers within {catchmentRadiusKm}km
              </span>
            </div>
            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-3xs font-bold flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Location Set</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
