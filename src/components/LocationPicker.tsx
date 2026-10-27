import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Compass,
  Edit3
} from 'lucide-react';
import { LocationData } from '../types';
import { PUNE_LOCALITIES } from '../data/puneData';

interface LocationPickerProps {
  location: LocationData;
  onChange: (loc: LocationData) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ location, onChange }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isManualEdit, setIsManualEdit] = useState(false);

  // Request browser GPS
  const detectGPSLocation = () => {
    setGpsError(null);
    setIsLocating(true);

    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Try OpenStreetMap Nominatim reverse geocoding
        let reverseAddr = `Pune, Maharashtra (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;
        let detectedLocality = 'Pune Urban';
        let detectedPincode = '411001';

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'CivicAIPune/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              reverseAddr = data.display_name;
            }
            if (data.address) {
              detectedLocality = data.address.suburb || data.address.neighbourhood || data.address.road || 'Pune City';
              detectedPincode = data.address.postcode || '411001';
            }
          }
        } catch (fetchErr) {
          console.warn('Reverse geocode fallback:', fetchErr);
        }

        // Check if closer to any predefined Pune locality
        const closest = PUNE_LOCALITIES.slice().sort((a, b) => {
          const distA = Math.hypot(a.lat - lat, a.lng - lng);
          const distB = Math.hypot(b.lat - lat, b.lng - lng);
          return distA - distB;
        })[0];

        onChange({
          latitude: lat,
          longitude: lng,
          address: reverseAddr,
          locality: closest ? closest.name : detectedLocality,
          ward: closest ? closest.ward : 'Pune Municipal Prabhag',
          landmark: location.landmark || (closest ? `Near ${closest.name.split('/')[0].trim()}` : ''),
          pincode: detectedPincode
        });

        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Could not access GPS.';
        if (err.code === 1) {
          msg = 'Location permission denied by user. You can select your Pune locality from the quick list below.';
        } else if (err.code === 2) {
          msg = 'GPS signal unavailable. Please select your locality manually.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please choose a locality manually.';
        }
        setGpsError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Quick select a known Pune locality
  const handleSelectPresetLocality = (item: (typeof PUNE_LOCALITIES)[0]) => {
    onChange({
      latitude: item.lat,
      longitude: item.lng,
      address: `${item.name}, ${item.ward}, Pune, Maharashtra`,
      locality: item.name,
      ward: item.ward,
      landmark: `Main junction / transit point of ${item.name.split('/')[0]}`,
      pincode: '411004'
    });
    setGpsError(null);
  };

  return (
    <div className="space-y-4">
      {/* GPS Trigger & Locality Fast Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={detectGPSLocation}
            disabled={isLocating}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting GPS...' : 'Detect My Location'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsManualEdit(!isManualEdit)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-xl"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
            <span>{isManualEdit ? 'Close Editor' : 'Edit Coordinates / Address'}</span>
          </button>
        </div>

        {location.latitude && location.longitude && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
            </span>
          </div>
        )}
      </div>

      {/* GPS Notice / Error */}
      {gpsError && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">GPS Permission or Signal Unavailable</p>
            <p className="mt-0.5 text-amber-800">{gpsError}</p>
          </div>
        </div>
      )}

      {/* Current Detected Address Card */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Verified Civic Jurisdiction
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <Building2 className="w-3 h-3 text-slate-400" /> {location.ward || 'Municipal Ward'}
              </span>
            </div>
            <p className="font-semibold text-slate-900 text-sm mt-0.5">
              {location.locality || 'Select Locality in Pune'}
            </p>
            <p className="text-xs text-slate-600 truncate mt-0.5">
              {location.address || 'Click Detect Location or pick from the popular Pune localities below.'}
            </p>
          </div>
        </div>

        {/* Manual Address Fields when expanded */}
        {isManualEdit && (
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Full Road / Street Address</label>
              <input
                type="text"
                value={location.address}
                onChange={(e) => onChange({ ...location, address: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Near Goodluck Cafe, FC Road, Deccan Gymkhana"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Landmark (Crucial for Field Staff)</label>
              <input
                type="text"
                value={location.landmark || ''}
                onChange={(e) => onChange({ ...location, landmark: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Opposite Gate 2, beside bus stop"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Ward / Prabhag Name</label>
              <input
                type="text"
                value={location.ward}
                onChange={(e) => onChange({ ...location, ward: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Ghole Road Prabhag 14"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">PIN Code</label>
              <input
                type="text"
                value={location.pincode || ''}
                onChange={(e) => onChange({ ...location, pincode: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 411004"
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Pune Locality Selector Chips */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Or Quick Select Major Pune Area:
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
          {PUNE_LOCALITIES.map((loc, idx) => {
            const isSelected = location.locality === loc.name;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPresetLocality(loc)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all text-left ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 font-medium shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'
                }`}
              >
                {loc.name.split('/')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
