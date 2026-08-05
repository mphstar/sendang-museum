import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MDEditor from '@uiw/react-md-editor';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowUpRight,
    Building2,
    Car,
    ChevronDown,
    Clock,
    Compass,
    ExternalLink,
    Headphones,
    HelpCircle,
    Info,
    Layers3,
    MapPin,
    Navigation,
    Phone,
    Ticket,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import rehypeRaw from 'rehype-raw';
import RoomListDialog from './RoomListDialog';

// Dynamic import for Leaflet to avoid SSR issues
// NOTE: path casing must match actual filesystem path to avoid TS casing conflicts
const LocationMapDialog = React.lazy(() => import('../pages/frontend/LocationMapDialog'));

interface MuseumInfoSidebarProps {
    museum: any;
    allRuangan: any[];
    activeRuangan: any;
    onRoomChange: (ruanganId: number) => void;
    isOpen: boolean;
    onClose: () => void;
    onOpenGuide?: () => void;
}

export default function MuseumInfoSidebar({ museum, allRuangan, activeRuangan, onRoomChange, isOpen, onClose, onOpenGuide }: MuseumInfoSidebarProps) {
    const [showLocationMap, setShowLocationMap] = useState(false);
    const [showRoomList, setShowRoomList] = useState(false);
    const [showMuseumInfo, setShowMuseumInfo] = useState(false);
    const [showUtilities, setShowUtilities] = useState(false);

    const hasCoordinates = museum.latitude && museum.longitude;

    const menuItems = [
        {
            icon: Info,
            label: 'Informasi Museum',
            description: 'Cerita, alamat, dan detail kunjungan',
            onClick: () => {
                onClose();
                setShowMuseumInfo(true);
            },
            available: true,
        },
        {
            icon: HelpCircle,
            label: 'Panduan Pengunjung',
            description: 'Pelajari kontrol panorama',
            onClick: () => {
                onClose();
                onOpenGuide && onOpenGuide();
            },
            available: true,
        },
        {
            icon: Navigation,
            label: 'Daftar Panorama',
            description: `${allRuangan.length} ruang untuk dijelajahi`,
            onClick: () => {
                onClose();
                setShowRoomList(true);
            },
            available: true,
        },
        {
            icon: MapPin,
            label: 'Peta Lokasi',
            description: 'Temukan lokasi museum',
            onClick: () => {
                onClose();
                setShowLocationMap(true);
            },
            available: hasCoordinates,
        },
    ];

    return (
        <>
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-y-0 left-0 z-[120] flex w-[min(92vw,390px)] flex-col overflow-hidden border-r border-white/15 bg-[#111417] text-[#f2efe8] shadow-2xl"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
                aria-label="Menu eksplorasi museum"
            >
                <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
                    <div>
                        <p className="museum-kicker">J-DiMS / field guide</p>
                        <h2 className="mt-1 text-lg font-semibold tracking-tight">Menu Museum</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white/70 hover:bg-white/10 hover:text-white"
                        aria-label="Tutup menu"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                    <div className="relative overflow-hidden border border-[#f1b19b]/40 bg-[#d85c3e] p-5">
                        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full border border-white/25" />
                        <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full border border-white/20" />
                        <div className="relative">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase">Sedang dijelajahi</p>
                                    <h3 className="mt-2 text-2xl leading-none font-black tracking-[-0.04em]">
                                        {activeRuangan?.nama_ruangan || 'Belum dipilih'}
                                    </h3>
                                </div>
                                <Compass className="h-7 w-7 shrink-0 text-white/85" />
                            </div>
                            <div className="mt-5 flex items-center gap-2 text-xs text-white/80">
                                <span className="h-2 w-2 rounded-full bg-[#f2efe8] shadow-[0_0_0_4px_rgba(242,239,232,0.2)]" />
                                Panorama aktif
                                <span className="ml-auto font-mono text-white/60">
                                    {String(Math.max(1, allRuangan.findIndex((room) => room.id === activeRuangan?.id) + 1)).padStart(2, '0')} /{' '}
                                    {String(allRuangan.length).padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 flex items-center justify-between">
                        <div>
                            <p className="museum-kicker">Index ruang</p>
                            <p className="mt-1 text-sm text-white/60">Pilih titik kunjungan berikutnya</p>
                        </div>
                        <Layers3 className="h-5 w-5 text-white/35" />
                    </div>

                    <div className="mt-3 divide-y divide-white/10 border-y border-white/15">
                        {allRuangan.map((room, index) => {
                            const isActive = room.id === activeRuangan?.id;
                            return (
                                <button
                                    key={room.id}
                                    type="button"
                                    onClick={() => {
                                        if (!isActive) onRoomChange(room.id);
                                    }}
                                    className={`group flex w-full items-center gap-3 py-4 text-left transition-colors ${isActive ? 'text-white' : 'text-white/55 hover:text-white'}`}
                                    aria-current={isActive ? 'location' : undefined}
                                >
                                    <span className={`font-mono text-xs ${isActive ? 'text-[#f1b19b]' : 'text-white/30'}`}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-semibold">{room.nama_ruangan}</span>
                                        <span className="mt-1 block text-[11px] text-white/35">
                                            {room.markers?.length || 0} titik interaktif{room.is_main ? ' · titik awal' : ''}
                                        </span>
                                    </span>
                                    <ArrowUpRight
                                        className={`h-4 w-4 transition-transform ${isActive ? 'text-[#f1b19b]' : 'text-white/20 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'}`}
                                    />
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowUtilities((value) => !value)}
                        className="mt-6 flex w-full items-center justify-between border-b border-white/15 pb-3 text-left text-sm font-semibold text-white/80 hover:text-white"
                    >
                        <span className="flex items-center gap-2">
                            <Headphones className="h-4 w-4 text-[#f1b19b]" /> Alat kunjungan
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${showUtilities ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                        {showUtilities && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-2 gap-2 pt-3">
                                    {menuItems.map((item) => {
                                        const IconComponent = item.icon;
                                        return (
                                            <button
                                                key={item.label}
                                                type="button"
                                                onClick={item.onClick}
                                                disabled={!item.available}
                                                className={`min-h-24 border p-3 text-left transition-colors ${item.available ? 'border-white/15 bg-white/5 hover:border-[#f1b19b]/60 hover:bg-[#d85c3e]/15' : 'cursor-not-allowed border-white/10 opacity-35'}`}
                                            >
                                                <IconComponent className="h-4 w-4 text-[#f1b19b]" />
                                                <span className="mt-3 block text-xs font-semibold text-white">{item.label}</span>
                                                <span className="mt-1 block text-[10px] leading-snug text-white/45">{item.description}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="border-t border-white/15 bg-black/15 px-5 py-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
                    <p className="text-[10px] tracking-[0.18em] text-white/35 uppercase">Jember Digital Museum System</p>
                    <p className="mt-1 truncate text-xs text-white/65">Geser, pilih penanda, dan ikuti cerita.</p>
                </div>
            </motion.aside>

            {/* Overlay */}
            {isOpen && <div className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-[2px]" onClick={onClose} />}

            {/* Museum Info Dialog */}
            <Dialog open={showMuseumInfo} onOpenChange={setShowMuseumInfo}>
                <DialogContent className="z-[130] max-h-[88dvh] w-[calc(100vw-1rem)] max-w-3xl overflow-y-auto border-white/15 bg-[#111417] p-0 text-[#f2efe8] sm:w-[92vw]">
                    <DialogHeader className="border-b border-white/15 px-5 py-5 sm:px-7">
                        <p className="museum-kicker">Museum dossier</p>
                        <DialogTitle className="mt-1 flex items-center gap-2 text-xl font-black tracking-[-0.03em] sm:text-2xl">
                            <Building2 className="h-5 w-5 text-[#f1b19b]" />
                            Profil Museum
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-5 py-6 sm:px-7">
                        <div className="grid gap-6 border-b border-white/15 pb-6 sm:grid-cols-[minmax(0,1fr)_12rem]">
                            <div className="min-w-0">
                                <h3 className="text-2xl leading-tight font-black tracking-[-0.04em] text-white sm:text-3xl">{museum.title}</h3>
                                {museum.subtitle && <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">{museum.subtitle}</p>}
                                {museum.address && (
                                    <p className="mt-4 flex items-start gap-2 text-xs text-white/40">
                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f1b19b]" />
                                        {museum.address}
                                    </p>
                                )}
                            </div>
                            <div className="border-l border-white/15 pl-5">
                                <p className="text-[10px] tracking-[0.18em] text-white/35 uppercase">Koleksi digital</p>
                                <p className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#f1b19b]">
                                    {String(allRuangan.length).padStart(2, '0')}
                                </p>
                                <p className="mt-1 text-xs text-white/50">ruang panorama</p>
                            </div>
                        </div>

                        {museum.content && (
                            <div className="border-b border-white/15 py-6 text-sm text-white/70">
                                <p className="museum-kicker mb-3">Tentang koleksi</p>
                                <div className="prose prose-sm prose-p:leading-relaxed prose-p:text-white/65 prose-strong:text-white max-w-none">
                                    <MDEditor.Markdown
                                        source={museum.content}
                                        rehypePlugins={[rehypeRaw]}
                                        style={{ backgroundColor: 'transparent', color: 'inherit' }}
                                        className="!bg-transparent !text-inherit"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid gap-px bg-white/10 py-px sm:grid-cols-2">
                            {museum.opening_hours && (
                                <div className="flex items-start gap-3 bg-[#171b1f] p-4">
                                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#f1b19b]" />
                                    <div>
                                        <span className="block text-[10px] tracking-[0.15em] text-white/35 uppercase">Jam operasional</span>
                                        <span className="mt-1 block text-sm font-semibold text-white/80">{museum.opening_hours}</span>
                                    </div>
                                </div>
                            )}
                            {museum.contact_person && (
                                <div className="flex items-start gap-3 bg-[#171b1f] p-4">
                                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#f1b19b]" />
                                    <div>
                                        <span className="block text-[10px] tracking-[0.15em] text-white/35 uppercase">Kontak</span>
                                        <span className="mt-1 block text-sm font-semibold text-white/80">{museum.contact_person}</span>
                                    </div>
                                </div>
                            )}
                            {museum.distance_from_city_center && (
                                <div className="flex items-start gap-3 bg-[#171b1f] p-4">
                                    <Car className="mt-0.5 h-4 w-4 shrink-0 text-[#f1b19b]" />
                                    <div>
                                        <span className="block text-[10px] tracking-[0.15em] text-white/35 uppercase">Akses</span>
                                        <span className="mt-1 block text-sm font-semibold text-white/80">{museum.distance_from_city_center}</span>
                                    </div>
                                </div>
                            )}
                            {museum.ticket_price && (
                                <div className="flex items-start gap-3 bg-[#171b1f] p-4">
                                    <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-[#f1b19b]" />
                                    <div>
                                        <span className="block text-[10px] tracking-[0.15em] text-white/35 uppercase">Tiket</span>
                                        <span className="mt-1 block text-sm font-semibold text-white/80">{museum.ticket_price}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 border-t border-white/15 px-5 py-4 sm:px-7">
                        {museum.google_maps_link && (
                            <Button
                                variant="default"
                                onClick={() => window.open(museum.google_maps_link, '_blank')}
                                className="gap-2 bg-[#d85c3e] text-white hover:bg-[#b94830]"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Buka di Google Maps
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setShowMuseumInfo(false)}
                            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        >
                            Tutup
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Room List Dialog */}
            <RoomListDialog
                isOpen={showRoomList}
                onClose={() => setShowRoomList(false)}
                allRuangan={allRuangan}
                activeRuangan={activeRuangan}
                onRoomChange={onRoomChange}
            />

            {/* Location Map Dialog */}
            {showLocationMap && hasCoordinates && (
                <React.Suspense
                    fallback={
                        <Dialog open={showLocationMap} onOpenChange={setShowLocationMap}>
                            <DialogContent className="z-[80] h-[80vh] w-[95vw] max-w-4xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                                <DialogHeader>
                                    <DialogTitle>Memuat Peta...</DialogTitle>
                                </DialogHeader>
                                <div className="flex h-full items-center justify-center">
                                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    }
                >
                    <LocationMapDialog
                        isOpen={showLocationMap}
                        onClose={() => setShowLocationMap(false)}
                        latitude={parseFloat(museum.latitude)}
                        longitude={parseFloat(museum.longitude)}
                        museumName={museum.title}
                        address={museum.address}
                        googleMapsLink={museum.google_maps_link}
                    />
                </React.Suspense>
            )}
        </>
    );
}
