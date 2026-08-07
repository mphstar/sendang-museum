import React, { useState, useEffect } from 'react';

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  className?: string;
}

export default function LocationPicker({ 
  latitude, 
  longitude, 
  onLocationChange, 
  className = "h-64 w-full" 
}: LocationPickerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    const loadMapComponent = async () => {
      try {
        const [leafletModule, reactLeafletModule] = await Promise.all([
          import('leaflet'),
          import('react-leaflet')
        ]);

        if (cancelled) return;

        const L = leafletModule.default;
        const { MapContainer, TileLayer, Marker, useMapEvents, useMap } = reactLeafletModule;

        // Configure default icon for Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        function RecenterMap({ position }: { position: [number, number] | null }) {
          const map = useMap();
          useEffect(() => {
            if (position) {
              map.flyTo(position, Math.max(map.getZoom(), 15), { animate: true });
            }
          }, [position, map]);
          return null;
        }

        function LocationMarker({ position, onLocationChange }: { 
          position: [number, number] | null; 
          onLocationChange: (lat: number, lng: number, address?: string) => void;
        }) {
          useMapEvents({
            async click(e: any) {
              const lat = e.latlng.lat;
              const lng = e.latlng.lng;
              
              let address = undefined;
              try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await response.json();
                address = data.display_name;
              } catch (e) {
                console.error("Geocoding failed", e);
              }
              
              onLocationChange(lat, lng, address);
            },
          });

          return position === null ? null : <Marker position={position} />;
        }

        function MapComponentInner({ 
          latitude, 
          longitude, 
          onLocationChange 
        }: LocationPickerProps) {
          const [position, setPosition] = useState<[number, number] | null>(null);
          
          // Default to Indonesia center if no coordinates provided
          const defaultCenter: [number, number] = [-2.5489, 118.0149];
          const center: [number, number] = latitude && longitude ? [latitude, longitude] : defaultCenter;

          useEffect(() => {
            if (latitude && longitude) {
              setPosition([latitude, longitude]);
            }
          }, [latitude, longitude]);

          const handleLocationChange = (lat: number, lng: number, address?: string) => {
            setPosition([lat, lng]);
            onLocationChange(lat, lng, address);
          };

          return (
            <MapContainer
              center={center}
              zoom={latitude && longitude ? 15 : 5}
              style={{ height: '100%', width: '100%' }}
              className="rounded-md border"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker 
                position={position} 
                onLocationChange={handleLocationChange}
              />
              <RecenterMap position={position} />
            </MapContainer>
          );
        }

        setMapComponent(() => MapComponentInner);
        setIsLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load map components');
          console.error('Error loading map:', err);
        }
      }
    };

    loadMapComponent();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center border rounded-md bg-gray-50`}>
        <div className="text-center">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <p className="text-xs text-gray-500">Map tidak dapat dimuat</p>
          <p className="text-xs text-gray-400 mt-1">
            Koordinat manual: Lat: {latitude || 'belum diset'}, Lng: {longitude || 'belum diset'}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded || !MapComponent) {
    return (
      <div className={`${className} flex items-center justify-center border rounded-md bg-gray-50`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-2 text-xs text-gray-600 flex justify-between items-center">
        <span>Klik pada peta untuk menentukan lokasi museum</span>
        {latitude && longitude && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        )}
      </div>
      <MapComponent
        latitude={latitude}
        longitude={longitude}
        onLocationChange={onLocationChange}
      />
    </div>
  );
}