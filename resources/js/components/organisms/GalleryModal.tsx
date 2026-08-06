import { AnimatePresence, motion } from 'framer-motion';
import { Download, ExternalLink, Film, Image as ImageIcon, Play, Sparkles, X, ZoomIn } from 'lucide-react';
import React, { useState } from 'react';

export interface GalleryItem {
    id: number;
    museum_id: number;
    title: string;
    description?: string;
    media_type: 'image' | 'video';
    media_url: string;
    thumbnail_url?: string;
    order?: number;
    created_at?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    museumName: string;
    galleries: GalleryItem[];
}

export function GalleryModal({ isOpen, onClose, museumName, galleries }: Props) {
    const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video'>('all');
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

    const filteredGalleries = galleries.filter((item) => {
        if (activeFilter === 'image') return item.media_type === 'image';
        if (activeFilter === 'video') return item.media_type === 'video';
        return true;
    });

    const isYouTubeUrl = (url: string) => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeEmbedUrl = (url: string) => {
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        } else if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            videoId = urlParams.get('v') || '';
        }
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 md:p-10">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Main Dialog Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative z-10 flex h-full max-h-[88dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#0f1218]/95 text-gray-900 dark:text-white shadow-2xl backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-black/10 dark:border-white/10 px-6 py-5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-[#d85c3e] dark:text-[#f1b19b]" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#d85c3e] dark:text-[#f1b19b]">
                                        Galeri Media Digital
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                                    {museumName}
                                </h2>
                            </div>

                            <button
                                onClick={onClose}
                                className="group flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 text-gray-700 dark:text-white transition hover:bg-black/10 dark:hover:bg-white/20 cursor-pointer"
                            >
                                <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                            </button>
                        </div>

                        {/* Filter Tabs & Counter */}
                        <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] px-6 py-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                                        activeFilter === 'all'
                                            ? 'bg-[#d85c3e] text-white shadow-md'
                                            : 'border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-gray-700 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/15'
                                    }`}
                                >
                                    Semua ({galleries.length})
                                </button>
                                <button
                                    onClick={() => setActiveFilter('image')}
                                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                                        activeFilter === 'image'
                                            ? 'bg-[#d85c3e] text-white shadow-md'
                                            : 'border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-gray-700 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/15'
                                    }`}
                                >
                                    <ImageIcon className="h-3.5 w-3.5" />
                                    Foto ({galleries.filter((g) => g.media_type === 'image').length})
                                </button>
                                <button
                                    onClick={() => setActiveFilter('video')}
                                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                                        activeFilter === 'video'
                                            ? 'bg-[#d85c3e] text-white shadow-md'
                                            : 'border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-gray-700 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/15'
                                    }`}
                                >
                                    <Film className="h-3.5 w-3.5" />
                                    Video ({galleries.filter((g) => g.media_type === 'video').length})
                                </button>
                            </div>

                            <span className="text-xs text-gray-500 dark:text-white/50">
                                Menampilkan {filteredGalleries.length} media
                            </span>
                        </div>

                        {/* Gallery Grid */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
                            {filteredGalleries.length === 0 ? (
                                <div className="flex h-64 flex-col items-center justify-center text-center">
                                    <ImageIcon className="mb-3 h-12 w-12 text-gray-400 dark:text-white/30" />
                                    <p className="text-base font-semibold text-gray-700 dark:text-white/70">
                                        Belum ada media di galeri ini.
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-white/40">
                                        Foto dan video koleksi museum akan ditampilkan di sini.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {filteredGalleries.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -4 }}
                                            onClick={() => setSelectedItem(item)}
                                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 shadow-md transition-all hover:border-[#d85c3e]/50 hover:shadow-xl cursor-pointer"
                                        >
                                            {/* Thumbnail Container */}
                                            <div className="relative aspect-video w-full overflow-hidden bg-black/20">
                                                <img
                                                    src={item.thumbnail_url || item.media_url}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

                                                {/* Type Badge */}
                                                <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                                                    {item.media_type === 'video' ? (
                                                        <>
                                                            <Film className="h-3 w-3 text-red-400" />
                                                            Video
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ImageIcon className="h-3 w-3 text-blue-400" />
                                                            Foto
                                                        </>
                                                    )}
                                                </span>

                                                {/* Action Play / Zoom Overlay Icon */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md text-white transition-transform group-hover:scale-110 shadow-lg">
                                                        {item.media_type === 'video' ? (
                                                            <Play className="h-5 w-5 fill-white ml-0.5" />
                                                        ) : (
                                                            <ZoomIn className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Item Info */}
                                            <div className="flex flex-1 flex-col p-4">
                                                <h3 className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#d85c3e] dark:group-hover:text-[#f1b19b]">
                                                    {item.title}
                                                </h3>
                                                {item.description && (
                                                    <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-white/60">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Lightbox / Video Viewer Modal */}
                    <AnimatePresence>
                        {selectedItem && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                                />

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative z-10 flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#0b0d0f] text-white shadow-2xl"
                                >
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#f1b19b]">
                                                {selectedItem.media_type === 'video' ? 'Video' : 'Foto'}
                                            </span>
                                            <h3 className="truncate text-base font-bold text-white">
                                                {selectedItem.title}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => setSelectedItem(null)}
                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* Media Viewing Canvas */}
                                    <div className="relative flex min-h-[300px] max-h-[65dvh] items-center justify-center bg-black/60 p-4">
                                        {selectedItem.media_type === 'video' ? (
                                            isYouTubeUrl(selectedItem.media_url) ? (
                                                <iframe
                                                    src={getYouTubeEmbedUrl(selectedItem.media_url)}
                                                    title={selectedItem.title}
                                                    className="aspect-video h-full w-full max-w-4xl rounded-xl border border-white/10 shadow-2xl"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <video
                                                    src={selectedItem.media_url}
                                                    controls
                                                    autoPlay
                                                    className="max-h-[60dvh] w-full rounded-xl object-contain shadow-2xl"
                                                />
                                            )
                                        ) : (
                                            <img
                                                src={selectedItem.media_url}
                                                alt={selectedItem.title}
                                                className="max-h-[60dvh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
                                            />
                                        )}
                                    </div>

                                    {/* Footer details */}
                                    {selectedItem.description && (
                                        <div className="border-t border-white/10 bg-[#111417] px-6 py-4 text-xs text-gray-300">
                                            <p className="leading-relaxed">{selectedItem.description}</p>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </AnimatePresence>
    );
}
