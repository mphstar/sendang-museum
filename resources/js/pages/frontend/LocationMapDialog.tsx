import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import 'leaflet/dist/leaflet.css';
import { ExternalLink, MapPin, Navigation2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LocationMapDialogProps {
    isOpen: boolean;
    onClose: () => void;
    latitude: number | string;
    longitude: number | string;
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
    googleMapsLink,
}: LocationMapDialogProps) {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);
    const [leafletComponents, setLeafletComponents] = useState<any>(null);

    const latNum = typeof latitude === 'number' ? latitude : parseFloat(String(latitude)) || -8.17211;
    const lngNum = typeof longitude === 'number' ? longitude : parseFloat(String(longitude)) || 113.70011;

    useEffect(() => {
        if (!isOpen) return;

        let mounted = true;

        const loadMap = async () => {
            try {
                const [{ MapContainer, TileLayer, Marker, Popup }, L] = await Promise.all([import('react-leaflet'), import('leaflet')]);

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
        return () => {
            mounted = false;
        };
    }, [isOpen]);

    const openGoogleMaps = () => {
        if (googleMapsLink) {
            window.open(googleMapsLink, '_blank');
        } else {
            window.open(`https://www.google.com/maps?q=${latNum},${lngNum}`, '_blank');
        }
    };

    const renderMap = () => {
        if (!leafletComponents) return null;
        const { MapContainer, TileLayer, Marker, Popup } = leafletComponents;

        return (
            <MapContainer center={[latNum, lngNum]} zoom={15} style={{ height: '100%', width: '100%' }} className="rounded-none">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[latNum, lngNum]}>
                    <Popup>
                        <div className="p-1 text-center">
                            <h3 className="text-sm font-semibold text-gray-900">{museumName}</h3>
                            {address && <p className="mt-1 text-xs text-gray-600">{address}</p>}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="z-[130] flex h-[78dvh] max-h-[calc(100vh-7rem)] w-[calc(100vw-1.5rem)] max-w-5xl flex-col overflow-hidden border-black/10 dark:border-white/15 bg-white dark:bg-[#111417] p-0 text-gray-900 dark:text-[#f2efe8] sm:w-[92vw] top-[calc(50%+1.5rem)] rounded-2xl shadow-2xl transition-colors duration-300">
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
                <DialogHeader className="flex-shrink-0 border-b border-black/10 dark:border-white/15 px-5 py-4 sm:px-7">
                    <p className="museum-kicker text-xs text-[#d85c3e] dark:text-[#f1b19b]">Lokasi Fisik Museum</p>
                    <DialogTitle className="mt-1 flex items-center gap-2 text-lg sm:text-xl font-black tracking-[-0.03em] text-gray-900 dark:text-white">
                        <MapPin className="h-5 w-5 flex-shrink-0 text-[#d85c3e] dark:text-[#f1b19b]" />
                        <span className="truncate">{museumName}</span>
                    </DialogTitle>
                    {address && <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-white/55">{address}</p>}
                    <p className="font-mono text-[11px] text-gray-500 dark:text-white/35">
                        {latNum.toFixed(6)}, {lngNum.toFixed(6)}
                    </p>
                </DialogHeader>

                {/* Map Container */}
                <div className="min-h-0 flex-1 p-2 sm:p-4">
                    {!mapLoaded && !mapError && (
                        <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-white/5">
                            <div className="text-center">
                                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-400 dark:border-white/15 border-t-[#d85c3e] dark:border-t-[#f1b19b]"></div>
                                <p className="text-sm text-gray-600 dark:text-white/55">Memuat peta...</p>
                            </div>
                        </div>
                    )}

                    {mapError && (
                        <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-white/5">
                            <div className="text-center">
                                <div className="mb-4 text-red-500">
                                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <p className="mb-3 text-gray-700 dark:text-gray-300">Gagal memuat peta</p>
                                <Button variant="outline" size="sm" onClick={openGoogleMaps} className="gap-2 text-gray-900 dark:text-gray-300">
                                    <ExternalLink className="h-4 w-4" />
                                    Buka di Google Maps
                                </Button>
                            </div>
                        </div>
                    )}

                    {mapLoaded && !mapError && <div className="h-full overflow-hidden rounded-xl">{renderMap()}</div>}
                </div>

                {/* Footer with Google Maps Button */}
                <div className="flex flex-shrink-0 items-center justify-between gap-4 border-t border-black/10 dark:border-white/15 px-5 py-3.5 sm:px-7">
                    <p className="hidden text-xs text-gray-500 dark:text-white/40 sm:block">Rute dibuka pada tab baru.</p>
                    <Button onClick={openGoogleMaps} className="w-full gap-2 bg-[#d85c3e] text-white hover:bg-[#b94830] sm:w-auto shadow-md">
                        <Navigation2 className="h-4 w-4" />
                        Buka di Google Maps
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
