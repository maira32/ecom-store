'use client';

import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LocationFetcherProps {
  onLocationFound: (address: string, coords: { lat: number; lng: number }) => void;
}

export default function LocationFetcher({ onLocationFound }: LocationFetcherProps) {
  const [loading, setLoading] = useState(false);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          if (data.display_name) {
            toast.success('Location found!');
            onLocationFound(data.display_name, { lat: latitude, lng: longitude });
          } else {
            toast.error('Could not determine exact address.');
          }
        } catch (error) {
          console.error(error);
          toast.error('Failed to get address.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error('Please allow location permissions.');
        setLoading(false);
      }
    );
  };

  return (
    <button
      onClick={captureLocation}
      disabled={loading}
      type="button"
      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-semibold transition-colors disabled:opacity-50 mb-4"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
      {loading ? 'Finding location...' : 'Use My Current Location'}
    </button>
  );
}