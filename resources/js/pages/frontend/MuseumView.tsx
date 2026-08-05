import { Logo } from '@/components/atoms/Logo';
import { ArrowNav } from '@/components/molecules/ArrowNav';
import { NavDots } from '@/components/molecules/NavDots';
import { ScrollProgress } from '@/components/molecules/ScrollProgress';
import { CarouselSection } from '@/components/organisms/CarouselSection';
import { CursorBullet } from '@/components/organisms/CursorBullet';
import { OnboardingDialog } from '@/components/organisms/OnboardingDialog';
import { Section, SectionData } from '@/components/organisms/Section';
import { Header } from '@/components/templates/Header';
import { Head } from '@inertiajs/react';
import MDEditor from '@uiw/react-md-editor';
import { animate, type AnimationPlaybackControls } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import rehypeRaw from 'rehype-raw';

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

// Function to convert database data to SectionData format
function convertToSectionData(museumData: MuseumType[]): SectionData[] {
    return museumData.map((item, index) => {
        // Find main ruangan (is_main = true) or fallback to first ruangan
        const mainRuangan = item.ruangan && item.ruangan.length > 0 ? item.ruangan.find((r) => r.is_main) || item.ruangan[0] : null;

        const ctaHref = mainRuangan ? `/museum/${item.id}` : item.cta_href || '#';

        return {
            id: item.slug || `section-${index}`,
            title: item.title,
            navLabel: item.label || item.title.substring(0, 8),
            subtitle: item.subtitle,
            bg: item.background_url,
            overlays:
                item.overlays?.map((overlay) => ({
                    url: overlay.overlay_url,
                    position_horizontal: overlay.position_horizontal,
                    position_vertical: overlay.position_vertical,
                    object_fit: overlay.object_fit,
                })) || [],
            content: (
                <div className="max-w-xl space-y-4" data-color-mode="dark">
                    <div className="prose prose-invert">
                        <MDEditor.Markdown
                            source={item.content}
                            rehypePlugins={[rehypeRaw]}
                            style={{ backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.9)' }}
                            components={{
                                strong: ({ children }) => <strong className="font-extrabold text-white">{children}</strong>,
                                b: ({ children }) => <b className="font-extrabold text-white">{children}</b>,
                                ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
                                li: ({ children }) => <li className="pl-1 text-white/90">{children}</li>,
                            }}
                        />
                    </div>
                </div>
            ),
            ctaHref,
            align: item.align,
        };
    });
}

export default function MuseumView({ museum, setting }: Props) {
    // Convert database data to existing SectionData format
    const SECTIONS = convertToSectionData(museum);
    const isRowLayout = setting.style === 'row';

    // ==== Visitor Logging ====
    useEffect(() => {
        fetch('/api/visitor-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page_url: window.location.href,
                referrer: document.referrer || null,
            }),
        }).catch(() => {}); // Ignore errors
    }, []);

    // ==== Asset Preloader (background & overlays) ====
    const [progress, setProgress] = useState(0); // 0..1
    const [ready, setReady] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(true);
    const preloadStarted = useRef(false);
    useEffect(() => {
        if (preloadStarted.current) return; // only once
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

        // Preload with higher priority and proper caching
        const loadPromises = urls.map((u) => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                // Set proper cache headers and loading priority
                img.crossOrigin = 'anonymous';
                img.decoding = 'async';
                img.loading = 'eager';

                const done = () => {
                    loaded += 1;
                    setProgress(loaded / urls.length);
                    if (loaded === urls.length) {
                        const elapsed = performance.now() - start;
                        const minDelay = 550; // ms for nicer fade
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

        // Force browser to cache these images immediately
        Promise.all(loadPromises).then(() => {
            // Additional caching optimization
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

    // Konfigurasi kecepatan animasi (mudah diubah)
    const SCROLL_CONF = {
        overshootRatio: 0.08, // semula 0.12 (lebih kecil => lebih tenang)
        overshootMin: 36, // px (semula 48)
        overshootMax: 100, // px (semula 140)
        phase1Duration: 0.38, // semula 0.27
        directDuration: 0.55, // semula 0.42
        springStiffness: 150, // semula 210
        springDamping: 30, // semula 28 (lebih tinggi => cepat settle tanpa bounce liar)
    } as const;
    // gunakan union | null eksplisit agar konsisten dengan prop ScrollProgress
    const containerRef = useRef<HTMLDivElement | null>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [active, setActive] = useState(0);
    const scrollAnimRef = useRef<AnimationPlaybackControls | null>(null);
    const isAnimatingRef = useRef(false);

    // Carousel-specific state
    const carouselRef = useRef<HTMLDivElement | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Observe section masuk viewport untuk highlight nav (re-init setelah ready)
    useEffect(() => {
        if (!ready || isRowLayout) return; // skip for carousel mode
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
    }, [ready, isRowLayout]);

    const scrollToIndex = (idx: number, opts?: { overshoot?: boolean }) => {
        if (isRowLayout) {
            // Carousel navigation
            const carousel = carouselRef.current;
            if (!carousel) return;

            if (idx < 0) idx = 0;
            if (idx >= SECTIONS.length) idx = SECTIONS.length - 1;

            setCurrentSlide(idx);
            setActive(idx);

            return;
        }

        // Original column layout logic
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
        // Matikan overshoot di perangkat sentuh agar tidak terasa "melenting" aneh
        const enableOvershoot = opts?.overshoot !== false && !isTouchLike; // default true kecuali touch
        // Overshoot proporsional; jika disable overshoot (flick cepat), langsung ke target
        let overshoot = target;
        if (enableOvershoot) {
            const dynamic = Math.min(Math.max(distance * SCROLL_CONF.overshootRatio, SCROLL_CONF.overshootMin), SCROLL_CONF.overshootMax);
            overshoot = target + direction * dynamic;
        }
        if (overshoot < 0) overshoot = 0;
        if (overshoot > maxScroll) overshoot = maxScroll;
        scrollAnimRef.current?.stop();
        isAnimatingRef.current = true;
        // Matikan snap sementara supaya overshoot tidak dipotong browser
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
            // langsung target (tanpa overshoot)
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

    // Event listeners for both layouts
    useEffect(() => {
        if (!ready) return;

        if (isRowLayout) {
            // Carousel navigation - simplified
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

            // Touch/swipe support - simplified
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

                // Only trigger if it's a quick swipe with sufficient distance
                if (deltaTime < 300 && Math.abs(deltaX) > 80) {
                    const direction = deltaX > 0 ? -1 : 1; // Swipe right = previous, swipe left = next
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
        }
    }, [active, ready]);

    // ===== Mobile natural snap assist (sederhana anti-glitch) =====

    if (!ready) {
        return (
            <div
                className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black text-white"
                aria-busy="true"
                aria-label="Memuat aset"
            >
                <div className="pointer-events-none absolute inset-0 animate-pulse bg-[conic-gradient(from_0deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_55%,rgba(255,255,255,0.08))] opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)]" />
                <div className="relative z-10 flex flex-col items-center gap-8 px-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Logo />
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold tracking-wide">J-DiMS</span>
                            <span className="text-sm text-white/80">Jember Digital Museum System</span>
                        </div>
                    </div>
                    <div className="h-2 w-64 overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full bg-white transition-[width] duration-300 ease-out"
                            style={{ width: `${Math.round(progress * 100)}%` }}
                        />
                    </div>
                    <div className="font-mono text-xs tracking-wider text-white/70">{Math.round(progress * 100)}%</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Koleksi Museum Digital Jember" />
            {isRowLayout ? (
                // Carousel Layout
                <div className="relative h-screen w-screen overflow-hidden bg-black">
                    <Header
                        active={currentSlide}
                        onJump={scrollToIndex}
                        sections={SECTIONS}
                        brand="J-DiMS"
                        subtitle={`${SECTIONS.length} destinasi digital`}
                    />
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
                            <div key={s.id} className="carousel-slide">
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
                // Column Layout (Original)
                <div
                    ref={containerRef}
                    data-scroll-root="true"
                    className="scrollbar-none relative h-screen w-screen snap-y snap-mandatory overflow-y-scroll bg-black"
                >
                    <Header
                        active={active}
                        onJump={scrollToIndex}
                        sections={SECTIONS}
                        brand="J-DiMS"
                        subtitle={`${SECTIONS.length} destinasi digital`}
                    />
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
            )}
            <OnboardingDialog open={showOnboarding} onClose={() => setShowOnboarding(false)} />
        </>
    );
}

/** ====== UI PARTS ====== */

// Tambahkan keyframes global via injection (sekali)
// (Pendekatan sederhana tanpa file CSS terpisah)
const styleId = '__shine_keyframes';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
    const el = document.createElement('style');
    el.id = styleId;
    el.textContent = `
@keyframes shine {
  0% {opacity:0; transform:translateX(0);} 
  40% {opacity:0.85;} 
  100% {opacity:0; transform:translateX(220%);} 
}
@keyframes overlayZoomIn {
  0% {opacity:0; transform:scale(1.15);} 
  60% {opacity:.85;} 
  100% {opacity:1; transform:scale(1);} 
}

/* Optimize background image rendering */
[style*="background-image"] {
  backface-visibility: hidden;
  transform: translateZ(0);
  image-rendering: optimizeQuality;
  image-rendering: -webkit-optimize-contrast;
}

/* Smooth scroll performance */


/* Prevent layout shifts during image transitions */
section {
  contain: layout style paint;
}

/* Optimize overlay rendering */
.overlay-container {
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Carousel specific optimizations */
.carousel-container {
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Prevent layout shifts in carousel */
.carousel-slide {
  min-width: 100vw;
  max-width: 100vw;
  contain: layout style paint;
}
`;
    document.head.appendChild(el);
}
