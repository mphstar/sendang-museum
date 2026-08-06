import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, Check, Compass, LoaderCircle, Map } from 'lucide-react';
import { useState } from 'react';

interface RoomListDialogProps {
    isOpen: boolean;
    onClose: () => void;
    allRuangan: any[];
    activeRuangan: any;
    onRoomChange: (ruanganId: number) => void;
    onHoverRoom?: (panoramaUrl: string) => void;
}

export default function RoomListDialog({ isOpen, onClose, allRuangan, activeRuangan, onRoomChange, onHoverRoom }: RoomListDialogProps) {
    const [isNavigating, setIsNavigating] = useState(false);

    const handleRoomClick = async (ruangan: any) => {
        if (ruangan.id !== activeRuangan?.id && !isNavigating) {
            setIsNavigating(true);
            try {
                onRoomChange(ruangan.id);
                // Small delay before closing to ensure navigation starts
                setTimeout(() => {
                    onClose();
                    setIsNavigating(false);
                }, 200);
            } catch (error) {
                console.error('Error navigating to room:', error);
                setIsNavigating(false);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="z-[130] max-h-[88dvh] w-[calc(100vw-1rem)] max-w-3xl overflow-hidden border-black/10 bg-white p-0 text-gray-900 sm:w-[92vw] dark:border-white/15 dark:bg-[#111417] dark:text-[#f2efe8]">
                <DialogHeader
                    className="sticky top-0 z-10 border-b border-black/10 bg-white/95 px-5 py-5 backdrop-blur-md sm:px-7 dark:border-white/15 dark:bg-[#111417]/95"
                    style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.25rem)' }}
                >
                    <p className="museum-kicker">Panorama directory</p>
                    <DialogTitle className="mt-1 flex items-center gap-3 text-xl font-black tracking-[-0.03em] sm:text-2xl">
                        <Map className="h-5 w-5 text-[#d85c3e] dark:text-[#f1b19b]" />
                        Indeks Ruang
                    </DialogTitle>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-gray-500 dark:text-white/50">
                        Pilih ruang untuk berpindah. Penanda dan narasi akan diperbarui mengikuti panorama yang aktif.
                    </p>
                </DialogHeader>

                <div className="grid max-h-[58dvh] grid-cols-1 gap-px overflow-y-auto bg-black/10 p-px sm:grid-cols-2 dark:bg-white/10">
                    {allRuangan.map((ruangan: any, index: number) => (
                        <button
                            type="button"
                            key={ruangan.id}
                            className={`group relative min-h-40 overflow-hidden p-5 text-left transition-colors ${
                                ruangan.id === activeRuangan?.id
                                    ? 'bg-[#d85c3e] text-white'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:bg-[#171b1f] dark:text-white/65 dark:hover:bg-[#20252a] dark:hover:text-white'
                            }`}
                            onClick={() => handleRoomClick(ruangan)}
                            onMouseEnter={() => ruangan.panorama_url && onHoverRoom?.(ruangan.panorama_url)}
                            disabled={isNavigating && ruangan.id !== activeRuangan?.id}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <span className={`font-mono text-xs ${ruangan.id === activeRuangan?.id ? 'text-white/65' : 'text-[#d85c3e] dark:text-[#f1b19b]'}`}>
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                {ruangan.id === activeRuangan?.id ? (
                                    <Check className="h-5 w-5" />
                                ) : isNavigating ? (
                                    <LoaderCircle className="h-5 w-5 animate-spin text-gray-400 dark:text-white/35" />
                                ) : (
                                    <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#d85c3e] dark:text-white/25 dark:group-hover:text-[#f1b19b]" />
                                )}
                            </div>
                            <div className="mt-8">
                                <p className="truncate text-lg font-bold tracking-tight">{ruangan.nama_ruangan}</p>
                                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] tracking-[0.14em] text-gray-400 uppercase dark:text-white/45">
                                    {ruangan.is_main && <span>Titik awal</span>}
                                    <span>{ruangan.markers?.length || 0} penanda</span>
                                    {ruangan.id === activeRuangan?.id && <span className="text-gray-900 dark:text-white">Sedang dilihat</span>}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div
                    className="flex items-center justify-between gap-3 border-t border-black/15 px-5 py-4 sm:px-7 dark:border-white/15"
                    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
                >
                    <span className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/40">
                        <Compass className="h-4 w-4" /> {allRuangan.length} ruang tersedia
                    </span>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-black/20 bg-transparent text-gray-700 hover:bg-black/10 hover:text-gray-900 dark:border-white/20 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        Kembali ke panorama
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
