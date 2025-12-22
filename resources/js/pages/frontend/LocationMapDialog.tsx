import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation2, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface LocationMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  museumName: string;
  address?: string;
  googleMapsLink?: string;
}

export default function LocationMapDialog({
  isOpen,
  onClose,
  latitude,
  longitude,
  museumName,
  address,
  googleMapsLink
}: LocationMapDialogProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [leafletComponents, setLeafletComponents] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const loadMap = async () => {
      try {
        const [
          { MapContainer, TileLayer, Marker, Popup },
          L
        ] = await Promise.all([
          import('react-leaflet'),
          import('leaflet')
        ]);

        if (!mounted) return;

        const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
        const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
        const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl,
          iconUrl,
          shadowUrl,
        });

        setLeafletComponents({ MapContainer, TileLayer, Marker, Popup });
        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading map:', error);
        if (mounted) setMapError(true);
      }
    };

    loadMap();
    return () => { mounted = false; };
  }, [isOpen]);

  const openGoogleMaps = () => {
    if (googleMapsLink) {
      window.open(googleMapsLink, '_blank');
    } else {
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
    }
  };

  const renderMap = () => {
    if (!leafletComponents) return null;
    const { MapContainer, TileLayer, Marker, Popup } = leafletComponents;

    return (
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-center p-1">
              <h3 className="font-semibold text-sm text-gray-900">{museumName}</h3>
              {address && <p className="text-xs text-gray-600 mt-1">{address}</p>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 z-[80] max-w-4xl w-[95vw] h-[85vh] flex flex-col dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
        {/* Leaflet dark mode styles */}
        <style>{`
          .dark .leaflet-container .leaflet-control-attribution {
            background-color: rgba(17, 24, 39, 0.8);
            color: #e5e7eb;
            border-radius: 0.375rem;
          }
          .dark .leaflet-container .leaflet-control-zoom a {
            background-color: #1f2937;
            color: #e5e7eb;
            border: 1px solid #374151;
          }
          .dark .leaflet-container .leaflet-popup-content-wrapper,
          .dark .leaflet-container .leaflet-popup-tip {
            background: #1f2937;
            color: #e5e7eb;
          }
        `}</style>

        {/* Header */}
        <DialogHeader className="p-4 pb-3 border-b dark:border-gray-700 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold dark:text-gray-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="truncate">{museumName}</span>
          </DialogTitle>
          {address && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{address}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </DialogHeader>

        {/* Map Container */}
        <div className="flex-1 p-4 pt-2 min-h-0">
          {!mapLoaded && !mapError && (
            <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Memuat peta...</p>
              </div>
            </div>
          )}

          {mapError && (
            <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">Gagal memuat peta</p>
                <Button variant="outline" size="sm" onClick={openGoogleMaps} className="gap-2 dark:text-gray-300">
                  <ExternalLink className="w-4 h-4" />
                  Buka di Google Maps
                </Button>
              </div>
            </div>
          )}

          {mapLoaded && !mapError && (
            <div className="h-full rounded-lg overflow-hidden">
              {renderMap()}
            </div>
          )}
        </div>

        {/* Footer with Google Maps Button */}
        <div className="flex-shrink-0 p-4 pt-0">
          <Button
            onClick={openGoogleMaps}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 dark:text-gray-300"
          >
            <Navigation2 className="w-4 h-4" />
            Buka di Google Maps
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}