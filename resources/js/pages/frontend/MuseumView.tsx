import { Logo } from '@/components/atoms/Logo';
import { appConfig } from '@/config/app';
import { ArrowNav } from '@/components/molecules/ArrowNav';
import { NavDots } from '@/components/molecules/NavDots';
import { ScrollProgress } from '@/components/molecules/ScrollProgress';
import { CarouselSection } from '@/components/organisms/CarouselSection';
import { CursorBullet } from '@/components/organisms/CursorBullet';
import { OnboardingDialog } from '@/components/organisms/OnboardingDialog';
import { Section, SectionData } from '@/components/organisms/Section';
import { Header } from '@/components/templates/Header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, Link } from '@inertiajs/react';
import MDEditor from '@uiw/react-md-editor';
import { animate, type AnimationPlaybackControls } from 'framer-motion';
import { Clock, Compass, Eye, Grid, HelpCircle, Layers, MapPin, MoveRight, Search, Sparkles, Tag, Ticket } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import rehypeRaw from 'rehype-raw';
import LocationMapDialog from './LocationMapDialog';

// Database interfaces
interface OverlayType {
    id: number;
    overlay_url: string;
    position_horizontal: 'left' | 'center' | 'right' | null;
    position_vertical: 'top' | 'center' | 'bottom' | null;
    object_fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'crop' | null;
}

interface MuseumType {
    id: number;
    title: string;
    label: string;
    subtitle: string;
    slug: string;
    content: string;
    background_url: string;
    cta_href: string;
    cta_label: string;
    align: 'left' | 'right';
    latitude?: number;
    longitude?: number;
    address?: string;
    opening_hours?: string;
    ticket_price?: string;
    distance_from_city_center?: string;
    contact_person?: string;
    google_maps_link?: string;
    overlays: OverlayType[];
    ruangan: RuanganType[];
}

interface RuanganType {
    id: number;
    nama_ruangan: string;
    panorama_url: string;
    is_main: boolean;
}

interface SettingType {
    style: 'column' | 'row';
}

interface Props {
    museum: MuseumType[];
    setting: SettingType;
}

function convertToSectionData(
    museumData: MuseumType[],
    onOpenDetail: (m: MuseumType) => void,
    onOpenMap: (m: MuseumType) => void,
): SectionData[] {
    return museumData.map((item, index) => {
        const mainRuangan = item.ruangan && item.ruangan.length > 0 ? item.ruangan.find((r) => r.is_main) || item.ruangan[0] : null;
        const ctaHref = mainRuangan ? `/museum/${item.id}` : item.cta_href || '#';

        return {
            id: item.slug || `section-${index}`,
            title: item.title,
            navLabel: item.label || item.title.substring(0, 8),
            label: item.label,
            subtitle: item.subtitle,
            bg: item.background_url,
            ctaHref,
            ctaLabel: item.cta_label,
            onOpenDetail: () => onOpenDetail(item),
            onOpenMap: () => onOpenMap(item),
            openingHours: item.opening_hours,
            ticketPrice: item.ticket_price,
            distanceFromCityCenter: item.distance_from_city_center,
            roomCount: item.ruangan?.length || 0,
            rooms: item.ruangan?.map((r) => ({ id: r.id, nama_ruangan: r.nama_ruangan, is_main: r.is_main })),
            overlays:
                item.overlays?.map((overlay) => ({
                    url: overlay.overlay_url,
                    position_horizontal: overlay.position_horizontal,
                    position_vertical: overlay.position_vertical,
                    object_fit: overlay.object_fit,
                })) || [],
            content: (
                <div className="space-y-4">
                    <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-white/90">
                        <MDEditor.Markdown
                            source={item.content}
                            rehypePlugins={[rehypeRaw]}
                            style={{ backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.9)' }}
                            className="!bg-transparent !text-inherit"
                            components={{
                                strong: ({ children }) => <strong className="font-extrabold text-[#f1b19b]">{children}</strong>,
                                b: ({ children }) => <b className="font-extrabold text-[#f1b19b]">{children}</b>,
                                ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5 text-white/80">{children}</ul>,
                                li: ({ children }) => <li className="pl-1 text-white/90">{children}</li>,
                                p: ({ children }) => <p className="text-white/90">{children}</p>,
                            }}
                        />
                    </div>
                </div>
            ),
            align: item.align,
        };
    });
}

export default function MuseumView({ museum, setting }: Props) {
    // Initial layout mode dynamically driven by admin setting: 'column' or 'row'
    const defaultMode = setting?.style === 'row' ? 'row' : 'column';
    const [viewMode, setViewMode] = useState<'column' | 'row' | 'grid'>(defaultMode);
    const [searchQuery, setSearchQuery] = useState('');

    // Selected Museum modal state
    const [selectedMuseumModal, setSelectedMuseumModal] = useState<MuseumType | null>(null);

    // Location Map Dialog state
    const [mapMuseum, setMapMuseum] = useState<MuseumType | null>(null);

    const SECTIONS = convertToSectionData(
        museum,
        (item) => setSelectedMuseumModal(item),
        (item) => setMapMuseum(item),
    );

    // Update view mode if admin setting changes
    useEffect(() => {
        if (setting?.style) {
            setViewMode(setting.style === 'row' ? 'row' : 'column');
        }
    }, [setting?.style]);

    // Visitor logging
    useEffect(() => {
        fetch('/api/visitor-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page_url: window.location.href,
                referrer: document.referrer || null,
            }),
        }).catch(() => {});
    }, []);

    // Asset Preloader
    const [progress, setProgress] = useState(0);
    const [ready, setReady] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const preloadStarted = useRef(false);

    // Delayed onboarding popup after page is ready
    useEffect(() => {
        if (!ready) return;
        const timer = setTimeout(() => {
            setShowOnboarding(true);
        }, 2000); // 2 second delay
        return () => clearTimeout(timer);
    }, [ready]);

    useEffect(() => {
        if (preloadStarted.current) return;
        preloadStarted.current = true;
        const urls = Array.from(
            new Set(SECTIONS.flatMap((s) => [s.bg, ...(s.overlays || []).map((overlay) => overlay.url)].filter(Boolean) as string[])),
        );
        if (urls.length === 0) {
            setProgress(1);
            setReady(true);
            return;
        }
        let loaded = 0;
        const start = performance.now();

        const loadPromises = urls.map((u) => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.decoding = 'async';
                img.loading = 'eager';

                const done = () => {
                    loaded += 1;
                    setProgress(loaded / urls.length);
                    if (loaded === urls.length) {
                        const elapsed = performance.now() - start;
                        const minDelay = 450;
                        const wait = Math.max(0, minDelay - elapsed);
                        setTimeout(() => setReady(true), wait);
                    }
                    resolve();
                };
                img.onload = done;
                img.onerror = done;
                img.src = u;
            });
        });

        Promise.all(loadPromises).then(() => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    urls.forEach((url) => {
                        const link = document.createElement('link');
                        link.rel = 'prefetch';
                        link.href = url;
                        document.head.appendChild(link);
                    });
                });
            }
        });
    }, []);

    // Scroll & Deck state
    const SCROLL_CONF = {
        overshootRatio: 0.08,
        overshootMin: 36,
        overshootMax: 100,
        phase1Duration: 0.38,
        directDuration: 0.55,
        springStiffness: 150,
        springDamping: 30,
    } as const;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [active, setActive] = useState(0);
    const scrollAnimRef = useRef<AnimationPlaybackControls | null>(null);
    const isAnimatingRef = useRef(false);

    const carouselRef = useRef<HTMLDivElement | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Viewport intersection observer for column layout
    useEffect(() => {
        if (!ready || viewMode !== 'column') return;
        const rootEl = containerRef.current;
        if (!rootEl) return;
        const els = sectionRefs.current.filter(Boolean) as HTMLDivElement[];
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        const idx = els.findIndex((el) => el === e.target);
                        if (idx !== -1) setActive(idx);
                    }
                });
            },
            { root: rootEl, threshold: 0.5 },
        );
        els.forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, [ready, viewMode]);

    const scrollToIndex = (idx: number, opts?: { overshoot?: boolean }) => {
        if (viewMode === 'row') {
            const carousel = carouselRef.current;
            if (!carousel) return;

            if (idx < 0) idx = 0;
            if (idx >= SECTIONS.length) idx = SECTIONS.length - 1;

            setCurrentSlide(idx);
            setActive(idx);
            return;
        }

        const container = containerRef.current;
        const targetEl = sectionRefs.current[idx];
        if (!container || !targetEl) return;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        const start = container.scrollTop;
        const target = targetEl.offsetTop;
        if (Math.abs(target - start) < 2) return;
        const maxScroll = container.scrollHeight - container.clientHeight;
        const direction = target > start ? 1 : -1;
        const distance = Math.abs(target - start);
        const isTouchLike = window.matchMedia('(pointer:coarse)').matches;
        const enableOvershoot = opts?.overshoot !== false && !isTouchLike;
        let overshoot = target;
        if (enableOvershoot) {
            const dynamic = Math.min(Math.max(distance * SCROLL_CONF.overshootRatio, SCROLL_CONF.overshootMin), SCROLL_CONF.overshootMax);
            overshoot = target + direction * dynamic;
        }
        if (overshoot < 0) overshoot = 0;
        if (overshoot > maxScroll) overshoot = maxScroll;
        scrollAnimRef.current?.stop();
        isAnimatingRef.current = true;
        const prevSnap = container.style.scrollSnapType;
        container.style.scrollSnapType = 'none';
        const goPhase2 = () => {
            scrollAnimRef.current = animate(overshoot, target, {
                type: 'spring',
                stiffness: enableOvershoot ? SCROLL_CONF.springStiffness : SCROLL_CONF.springStiffness + 40,
                damping: enableOvershoot ? SCROLL_CONF.springDamping : SCROLL_CONF.springDamping + 6,
                mass: 1,
                restDelta: 0.4,
                onUpdate: (v: number) => {
                    container.scrollTop = v;
                },
                onComplete: () => {
                    isAnimatingRef.current = false;
                    container.style.scrollSnapType = prevSnap || '';
                },
                onStop: () => {
                    isAnimatingRef.current = false;
                    container.style.scrollSnapType = prevSnap || '';
                },
            });
        };
        if (overshoot !== target) {
            const phase1 = animate(start, overshoot, {
                duration: SCROLL_CONF.phase1Duration,
                ease: [0.3, 0.95, 0.55, 0.98],
                onUpdate: (v: number) => {
                    container.scrollTop = v;
                },
            });
            phase1.finished.then(goPhase2).catch(() => {
                isAnimatingRef.current = false;
                container.style.scrollSnapType = prevSnap || '';
            });
        } else {
            const direct = animate(start, target, {
                duration: SCROLL_CONF.directDuration,
                ease: [0.25, 0.85, 0.35, 1],
                onUpdate: (v: number) => {
                    container.scrollTop = v;
                },
                onComplete: () => {
                    isAnimatingRef.current = false;
                    container.style.scrollSnapType = prevSnap || '';
                },
                onStop: () => {
                    isAnimatingRef.current = false;
                    container.style.scrollSnapType = prevSnap || '';
                },
            });
            direct.finished.catch(() => {
                isAnimatingRef.current = false;
                container.style.scrollSnapType = prevSnap || '';
            });
        }
    };

    // Keyboard & Gesture controls for row view
    useEffect(() => {
        if (!ready || viewMode !== 'row') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isAnimatingRef.current) return;

            let nextSlide = currentSlide;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                nextSlide = Math.max(0, currentSlide - 1);
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                nextSlide = Math.min(SECTIONS.length - 1, currentSlide + 1);
            }

            if (nextSlide !== currentSlide) {
                scrollToIndex(nextSlide);
            }
        };

        const handleWheel = (e: WheelEvent) => {
            if (isAnimatingRef.current) return;
            e.preventDefault();
            const direction = Math.sign(e.deltaY);
            const nextSlide = Math.max(0, Math.min(SECTIONS.length - 1, currentSlide + direction));

            if (nextSlide !== currentSlide) {
                scrollToIndex(nextSlide);
            }
        };

        let touchStartX = 0;
        let touchStartTime = 0;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX;
            touchStartTime = Date.now();
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (isAnimatingRef.current) return;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndTime = Date.now();
            const deltaX = touchEndX - touchStartX;
            const deltaTime = touchEndTime - touchStartTime;

            if (deltaTime < 300 && Math.abs(deltaX) > 80) {
                const direction = deltaX > 0 ? -1 : 1;
                const nextSlide = Math.max(0, Math.min(SECTIONS.length - 1, currentSlide + direction));

                if (nextSlide !== currentSlide) {
                    scrollToIndex(nextSlide);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener('wheel', handleWheel, { passive: false });
            carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
            carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (carousel) {
                carousel.removeEventListener('wheel', handleWheel);
                carousel.removeEventListener('touchstart', handleTouchStart);
                carousel.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [currentSlide, ready, viewMode]);

    // Filter museums for Grid mode
    const filteredMuseums = museum.filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return m.title.toLowerCase().includes(q) || m.subtitle?.toLowerCase().includes(q) || m.content?.toLowerCase().includes(q) || m.label?.toLowerCase().includes(q);
    });

    if (!ready) {
        return (
            <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#0b0d0f] text-white">
                <div className="pointer-events-none absolute inset-0 animate-pulse bg-[conic-gradient(from_0deg,rgba(216,92,62,0.15),rgba(0,0,0,0)_55%,rgba(216,92,62,0.15))] opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)]" />
                <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
                    <div className="glow-soft rounded-full bg-white/5 p-4 ring-1 ring-white/20">
                        <Logo />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="museum-kicker text-xs tracking-widest text-[#f1b19b]">{appConfig.brandKicker}</span>
                        <span className="text-xl font-bold tracking-tight text-white">Memuat Koleksi Museum...</span>
                    </div>
                    <div className="h-1.5 w-72 overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full bg-gradient-to-r from-[#d85c3e] to-[#f1b19b] transition-[width] duration-300 ease-out"
                            style={{ width: `${Math.round(progress * 100)}%` }}
                        />
                    </div>
                    <div className="font-mono text-xs tracking-widest text-white/50">{Math.round(progress * 100)}%</div>
                </div>
            </div>
        );
    }

    // Header actions component (Grid Katalog toggle and HelpCircle guide)
    const headerActions = (
        <div className="flex items-center gap-2">
            <button
                onClick={() => setViewMode(viewMode === 'grid' ? (setting.style || 'column') : 'grid')}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                    viewMode === 'grid'
                        ? 'bg-[#d85c3e] border-[#d85c3e] text-white shadow-md'
                        : 'border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 text-gray-800 dark:text-white/80 hover:bg-black/10 dark:hover:bg-white/15 hover:text-black dark:hover:text-white'
                }`}
                title="Katalog Grid Explorer"
            >
                <Grid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Katalog Grid</span>
            </button>

            <button
                onClick={() => setShowOnboarding(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 text-gray-800 dark:text-white/70 transition hover:bg-black/10 dark:hover:bg-white/15 hover:text-black dark:hover:text-white cursor-pointer"
                title="Panduan Pengunjung"
            >
                <HelpCircle className="h-4 w-4" />
            </button>
        </div>
    );

    return (
        <>
            <Head title={`Koleksi Museum Digital Jember — ${appConfig.name}`} />

            <div className="relative min-h-screen w-screen overflow-hidden bg-[#f4f5f7] dark:bg-[#0b0d0f] text-gray-900 dark:text-[#f2efe8] transition-colors duration-300">
                {/* Header Navigation */}
                <Header
                    active={viewMode === 'row' ? currentSlide : active}
                    onJump={scrollToIndex}
                    sections={SECTIONS}
                    brand={appConfig.name}
                    subtitle={`${museum.length} destinasi museum digital (${viewMode === 'grid' ? 'Katalog Grid' : 'Pameran Museum'})`}
                    actions={headerActions}
                />

                {/* Ambient particle grid background */}
                <div className="pointer-events-none fixed inset-0 -z-30 bg-[radial-gradient(circle_at_50%_0%,rgba(216,92,62,0.12),transparent_70%)]" />
                <div className="pointer-events-none fixed inset-0 -z-20 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

                {/* Main Content Area according to View Mode */}
                {viewMode === 'column' ? (
                    // MODE 1: Column Layout (Vertical Snap Scrolling sections)
                    <div
                        ref={containerRef}
                        data-scroll-root="true"
                        className="scrollbar-none relative h-screen w-screen snap-y snap-mandatory overflow-y-scroll bg-[#f4f5f7] dark:bg-[#0b0d0f] transition-colors duration-300"
                    >
                        <NavDots count={SECTIONS.length} active={active} onJump={scrollToIndex} />
                        {SECTIONS.map((s, i) => (
                            <Section
                                key={s.id}
                                ref={(el: HTMLDivElement | null) => {
                                    sectionRefs.current[i] = el;
                                }}
                                data={s}
                                index={i}
                            />
                        ))}
                        <ScrollProgress targetRef={containerRef} />
                        <ArrowNav active={active} onJump={scrollToIndex} total={SECTIONS.length} />
                        <CursorBullet />
                    </div>
                ) : viewMode === 'row' ? (
                    // MODE 2: Row / Carousel Layout (Horizontal Sliding sections)
                    <div className="relative h-screen w-screen overflow-hidden">
                        <NavDots count={SECTIONS.length} active={currentSlide} onJump={scrollToIndex} />

                        <div
                            ref={carouselRef}
                            className="carousel-container flex h-full w-full"
                            style={{
                                transform: `translateX(-${currentSlide * 100}%)`,
                                transition: isAnimatingRef.current ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.85, 0.35, 1)',
                            }}
                        >
                            {SECTIONS.map((s, i) => (
                                <div key={s.id} className="carousel-slide relative h-full w-full flex-shrink-0">
                                    <CarouselSection
                                        ref={(el: HTMLDivElement | null) => {
                                            sectionRefs.current[i] = el;
                                        }}
                                        data={s}
                                        index={i}
                                        isActive={i === currentSlide}
                                    />
                                </div>
                            ))}
                        </div>

                        <ArrowNav active={currentSlide} onJump={scrollToIndex} total={SECTIONS.length} />
                        <CursorBullet />
                    </div>
                ) : (
                    // MODE 3: Interactive Grid Explorer Layout
                    <div className="scrollbar-none relative h-screen w-screen overflow-y-auto pt-24 pb-16 px-4 sm:px-8 md:px-16 bg-[#f4f5f7] dark:bg-[#0b0d0f] text-gray-900 dark:text-white transition-colors duration-300">
                        <div className="mx-auto max-w-7xl">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/10 dark:border-white/10">
                                <div>
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <Sparkles className="h-4 w-4 text-[#d85c3e]" />
                                        <span className="museum-kicker text-[#d85c3e] dark:text-[#f1b19b]">Katalog Pameran Jember</span>
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                                        Jelajahi Museum Digital
                                    </h1>
                                    <p className="mt-2 text-sm md:text-base text-gray-700 dark:text-white/70 max-w-xl">
                                        Pilih destinasi pameran bersejarah Jember dan nikmati wisata edukasi berbasis tur panorama virtual 360 derajat interaktif.
                                    </p>
                                </div>

                                {/* Live Search Input */}
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama museum..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="glass-pill w-full rounded-full pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white bg-white dark:bg-black/40 border border-black/15 dark:border-white/20 placeholder-gray-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#d85c3e] transition"
                                    />
                                </div>
                            </div>

                            {/* Museum Grid List */}
                            {filteredMuseums.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Search className="h-12 w-12 text-gray-400 dark:text-white/20 mb-4" />
                                    <p className="text-lg font-semibold text-gray-800 dark:text-white/80">Museum tidak ditemukan</p>
                                    <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Coba gunakan kata kunci pencarian yang berbeda.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                    {filteredMuseums.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className="glass-card group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111417]/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
                                        >
                                            {/* Card Header Background Image */}
                                            <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-black">
                                                {item.background_url ? (
                                                    <img
                                                        src={item.background_url}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-white/5">
                                                        <Layers className="h-8 w-8 text-gray-400 dark:text-white/20" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#111417] via-transparent to-transparent opacity-90 dark:opacity-100" />

                                                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                                                    <span className="glass-pill rounded-full px-2.5 py-1 font-mono text-[10px] font-bold text-[#d85c3e] dark:text-[#f1b19b] bg-white/90 dark:bg-black/60 shadow-sm">
                                                        #{String(idx + 1).padStart(2, '0')}
                                                    </span>
                                                    {item.label && (
                                                        <span className="glass-pill flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white bg-white/90 dark:bg-black/60 shadow-sm">
                                                            <Tag className="h-3 w-3 text-[#d85c3e]" />
                                                            {item.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="flex flex-1 flex-col p-6">
                                                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-[#d85c3e] dark:group-hover:text-[#f1b19b] transition">
                                                    {item.title}
                                                </h3>
                                                {item.subtitle && (
                                                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-white/70">
                                                        {item.subtitle}
                                                    </p>
                                                )}

                                                {/* Meta Pills */}
                                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                                    {item.ruangan && item.ruangan.length > 0 && (
                                                        <span className="glass-pill flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-gray-800 dark:text-white/90 border border-black/10 dark:border-white/10">
                                                            <Compass className="h-3 w-3 text-[#d85c3e]" />
                                                            {item.ruangan.length} Ruangan 360°
                                                        </span>
                                                    )}
                                                    {item.ticket_price && (
                                                        <span className="glass-pill flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                            <Ticket className="h-3 w-3" />
                                                            {item.ticket_price}
                                                        </span>
                                                    )}
                                                    {item.opening_hours && (
                                                        <span className="glass-pill flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium text-gray-700 dark:text-white/70 border border-black/10 dark:border-white/10">
                                                            <Clock className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                                                            {item.opening_hours}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Card Actions */}
                                                <div className="mt-auto pt-6 flex items-center justify-between gap-3 border-t border-black/10 dark:border-white/10">
                                                    <button
                                                        onClick={() => setMapMuseum(item)}
                                                        className="text-xs font-semibold text-gray-700 dark:text-white/70 hover:text-black dark:hover:text-white transition flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <MapPin className="h-3.5 w-3.5 text-[#d85c3e] dark:text-[#f1b19b]" />
                                                        <span>Peta Lokasi</span>
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedMuseumModal(item)}
                                                        className="inline-flex items-center gap-2 rounded-full bg-[#d85c3e] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#b94830] cursor-pointer shadow-sm"
                                                    >
                                                        <span>{item.cta_label || 'Lihat'}</span>
                                                        <MoveRight className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Onboarding Dialog */}
                <OnboardingDialog open={showOnboarding} onClose={() => setShowOnboarding(false)} />

                {/* Location Map Dialog */}
                {mapMuseum && (
                    <LocationMapDialog
                        isOpen={!!mapMuseum}
                        onClose={() => setMapMuseum(null)}
                        latitude={mapMuseum.latitude || -8.17211}
                        longitude={mapMuseum.longitude || 113.70011}
                        museumName={mapMuseum.title}
                        address={mapMuseum.address}
                        googleMapsLink={mapMuseum.google_maps_link}
                    />
                )}

                {/* Selected Museum Detail Modal */}
                {selectedMuseumModal && (
                    <Dialog open={!!selectedMuseumModal} onOpenChange={() => setSelectedMuseumModal(null)}>
                        <DialogContent className="z-[130] flex h-[78dvh] max-h-[calc(100vh-7rem)] w-[calc(100vw-1.5rem)] max-w-3xl flex-col overflow-hidden border-black/10 dark:border-white/15 bg-white dark:bg-[#111417] p-0 text-gray-900 dark:text-[#f2efe8] rounded-2xl top-[calc(50%+1.5rem)] shadow-2xl">
                            <DialogHeader className="relative h-48 w-full overflow-hidden p-6 flex flex-col justify-end bg-black">
                                {selectedMuseumModal.background_url && (
                                    <img
                                        src={selectedMuseumModal.background_url}
                                        alt={selectedMuseumModal.title}
                                        className="absolute inset-0 h-full w-full object-cover opacity-60"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#111417] via-black/40 to-transparent" />
                                <div className="relative z-10">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="museum-kicker text-xs text-[#d85c3e] dark:text-[#f1b19b]">Detail Koleksi Museum</span>
                                        {selectedMuseumModal.label && (
                                            <span className="glass-pill rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white uppercase bg-black/60">
                                                {selectedMuseumModal.label}
                                            </span>
                                        )}
                                    </div>
                                    <DialogTitle className="text-2xl sm:text-3xl font-black text-white">
                                        {selectedMuseumModal.title}
                                    </DialogTitle>
                                    {selectedMuseumModal.subtitle && (
                                        <p className="text-xs text-white/90 mt-1">{selectedMuseumModal.subtitle}</p>
                                    )}
                                </div>
                            </DialogHeader>

                            <div className="scrollbar-none overflow-y-auto p-6 space-y-6">
                                {/* Extra Meta Info Grid */}
                                {(selectedMuseumModal.opening_hours || selectedMuseumModal.ticket_price || selectedMuseumModal.address || selectedMuseumModal.contact_person) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs">
                                        {selectedMuseumModal.opening_hours && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                                <div>
                                                    <span className="text-gray-500 dark:text-white/50 block text-[10px]">Jam Operasional</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{selectedMuseumModal.opening_hours}</span>
                                                </div>
                                            </div>
                                        )}
                                        {selectedMuseumModal.ticket_price && (
                                            <div className="flex items-center gap-2">
                                                <Ticket className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                <div>
                                                    <span className="text-gray-500 dark:text-white/50 block text-[10px]">Harga Tiket Masuk</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{selectedMuseumModal.ticket_price}</span>
                                                </div>
                                            </div>
                                        )}
                                        {selectedMuseumModal.address && (
                                            <div className="flex items-center gap-2 sm:col-span-2">
                                                <MapPin className="h-4 w-4 text-[#d85c3e] dark:text-[#f1b19b]" />
                                                <div>
                                                    <span className="text-gray-500 dark:text-white/50 block text-[10px]">Alamat Lengkap</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{selectedMuseumModal.address}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Markdown Description */}
                                {selectedMuseumModal.content && (
                                    <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-800 dark:text-white/90">
                                        <MDEditor.Markdown
                                            source={selectedMuseumModal.content}
                                            rehypePlugins={[rehypeRaw]}
                                            style={{ backgroundColor: 'transparent', color: 'inherit' }}
                                            className="!bg-transparent !text-inherit"
                                            components={{
                                                strong: ({ children }) => <strong className="font-extrabold text-[#d85c3e] dark:text-[#f1b19b]">{children}</strong>,
                                                b: ({ children }) => <b className="font-extrabold text-[#d85c3e] dark:text-[#f1b19b]">{children}</b>,
                                                p: ({ children }) => <p className="text-gray-800 dark:text-white/90 leading-relaxed mb-3">{children}</p>,
                                                ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5 text-gray-800 dark:text-white/80">{children}</ul>,
                                                li: ({ children }) => <li className="pl-1 text-gray-800 dark:text-white/90">{children}</li>,
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Available Rooms List */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#d85c3e] dark:text-[#f1b19b] mb-3">
                                        Daftar Ruangan Panorama 360° ({selectedMuseumModal.ruangan?.length || 0})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedMuseumModal.ruangan?.map((ruang) => (
                                            <Link
                                                key={ruang.id}
                                                href={`/museum/${selectedMuseumModal.id}#ruangan-${ruang.id}`}
                                                className="glass-card flex items-center justify-between p-3 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-[#d85c3e] transition group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Compass className="h-4 w-4 text-[#d85c3e]" />
                                                    <span className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-[#d85c3e] dark:group-hover:text-[#f1b19b]">
                                                        {ruang.nama_ruangan}
                                                    </span>
                                                </div>
                                                {ruang.is_main && (
                                                    <span className="rounded-full bg-[#d85c3e]/20 px-2 py-0.5 text-[10px] font-bold text-[#d85c3e] dark:text-[#f1b19b]">
                                                        Utama
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="flex items-center justify-between p-4 border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const target = selectedMuseumModal;
                                        setSelectedMuseumModal(null);
                                        setMapMuseum(target);
                                    }}
                                    className="gap-2 text-xs border-gray-800 dark:border-white/20 text-gray-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                >
                                    <MapPin className="h-3.5 w-3.5 text-[#d85c3e] dark:text-[#f1b19b]" />
                                    <span>Lihat Peta Lokasi</span>
                                </Button>

                                <Link
                                    href={`/museum/${selectedMuseumModal.id}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#d85c3e] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#b94830]"
                                >
                                    <span>Jelajahi Penuh 360°</span>
                                    <MoveRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
}
