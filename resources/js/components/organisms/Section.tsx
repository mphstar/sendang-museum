import { motion, useInView } from 'framer-motion';
import { MapPin, Sparkles, Tag } from 'lucide-react';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { FancyButton } from '../atoms/FancyButton';
import Flip from '../FlipText';

export type SectionData = {
    id: string;
    title: string;
    navLabel?: string;
    label?: string;
    subtitle?: string;
    bg?: string;
    content?: React.ReactNode;
    ctaHref?: string;
    ctaLabel?: string;
    onOpenDetail?: () => void;
    onOpenMap?: () => void;
    openingHours?: string;
    ticketPrice?: string;
    distanceFromCityCenter?: string;
    roomCount?: number;
    rooms?: { id: number; nama_ruangan: string; is_main: boolean }[];
    overlays?: {
        url: string;
        position_horizontal: 'left' | 'center' | 'right' | null;
        position_vertical: 'top' | 'center' | 'bottom' | null;
        object_fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'crop' | null;
    }[];
    align?: 'left' | 'right';
};

// Calm luxury easing curve
const CALM_EASE = [0.16, 1, 0.3, 1] as const;

export const Section = forwardRef<HTMLDivElement, { data: SectionData; index: number }>(({ data, index }, ref) => {
    const {
        bg,
        title,
        subtitle,
        content,
        ctaHref,
        ctaLabel,
        onOpenDetail,
        onOpenMap,
        label,
        overlays,
        align = 'left',
    } = data;

    const sectionRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = sectionRef;
    const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
    const scrollProg = useRef(0);
    const lastTime = useRef<number | null>(null);
    const inView = useInView(sectionRef, { amount: 0.4 });
    const prev = useRef(false);
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const container = el.parentElement;
        if (!container) return;
        let ticking = false;
        const calc = () => {
            ticking = false;
            const h = container.clientHeight;
            const top = el.offsetTop;
            const start = top - h;
            const end = top + el.offsetHeight;
            const st = container.scrollTop;
            const p = (st - start) / (end - start);
            scrollProg.current = Math.min(1, Math.max(0, p));
        };
        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(calc);
            }
        };
        container.addEventListener('scroll', onScroll, { passive: true });
        calc();
        return () => container.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        let raf: number | null = null;
        const lerp = (a: number, b: number, n: number) => a + (b - a) * n;
        const loop = () => {
            pos.current.x = lerp(pos.current.x, pos.current.tx, 0.12);
            pos.current.y = lerp(pos.current.y, pos.current.ty, 0.12);
            const el = overlayRef.current;
            if (el) {
                const w = el.clientWidth || 1;
                const h = el.clientHeight || 1;
                const rx = pos.current.x / w - 0.5;
                const ry = pos.current.y / h - 0.5;
                const now = performance.now();
                if (lastTime.current == null) lastTime.current = now;
                const t = now / 1000;
                const driftX = Math.sin(t * 0.35) * 12;
                const driftY = Math.cos(t * 0.28) * 10;
                const sShift = (scrollProg.current - 0.5) * 50;
                el.style.setProperty('--ox', pos.current.x + 'px');
                el.style.setProperty('--oy', pos.current.y + 'px');
                el.style.setProperty('--oxp', rx.toFixed(4));
                el.style.setProperty('--oyp', ry.toFixed(4));
                el.style.setProperty('--dx', driftX.toFixed(2));
                el.style.setProperty('--dy', driftY.toFixed(2));
                el.style.setProperty('--sShift', sShift.toFixed(2) + 'px');
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => {
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    useEffect(() => {
        if (inView && !prev.current) {
            setCycle((c) => c + 1);
        }
        prev.current = inView;
    }, [inView]);

    const handleMove = (e: React.MouseEvent) => {
        if (!window.matchMedia('(pointer:fine)').matches) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        pos.current.tx = e.clientX - rect.left;
        pos.current.ty = e.clientY - rect.top;
    };

    return (
        <section
            id={data.id}
            ref={(el: HTMLDivElement | null) => {
                sectionRef.current = el;
                if (typeof ref === 'function') ref(el as any);
                else if (ref && 'current' in ref) (ref as any).current = el;
            }}
            onMouseMove={handleMove}
            className="relative isolate flex h-screen h-[100dvh] w-screen max-w-full overflow-hidden snap-start items-center justify-center bg-[#0b0d0f] text-[#f2efe8] pt-24 sm:pt-28 pb-10 px-6 sm:px-12 md:px-16 lg:px-24"
        >
            {/* Base solid background layer */}
            <div className="absolute inset-0 -z-20 bg-[#0b0d0f]" />

            {bg && (
                <motion.div
                    className="absolute inset-0 -z-10 bg-[#0b0d0f] bg-cover bg-center bg-no-repeat overflow-hidden"
                    style={{ backgroundImage: `url(${bg})` }}
                    initial={{ scale: 1.05, opacity: 0.85 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.05, opacity: 0.85 }}
                    viewport={{ amount: 0.3, once: false }}
                    transition={{
                        duration: 2.2,
                        ease: CALM_EASE,
                    }}
                    role="img"
                    aria-label={title}
                />
            )}

            {/* Cinematic Dark Vignette Mask */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,13,15,0.45)_0%,rgba(11,13,15,0.65)_50%,rgba(11,13,15,0.98)_100%)]" />

            {/* 3D Overlays */}
            {overlays && overlays.length > 0 && (
                <motion.div
                    key={cycle}
                    className="overlay-container pointer-events-none absolute inset-0 -z-[8] select-none overflow-hidden"
                    initial={{ scale: 1.05 }}
                    whileInView={{ scale: 1 }}
                    exit={{ scale: 1.05 }}
                    viewport={{ amount: 0.3, once: false }}
                    transition={{
                        duration: 1.8,
                        ease: CALM_EASE,
                    }}
                >
                    {overlays.map((overlay, i) => {
                        let stylePos: React.CSSProperties = {};
                        if (overlay.position_horizontal && overlay.position_vertical) {
                            if (overlay.position_horizontal === 'center' && overlay.position_vertical === 'center') {
                                stylePos = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
                            } else {
                                if (overlay.position_vertical === 'top') stylePos.top = 0;
                                if (overlay.position_vertical === 'center') stylePos.top = '50%';
                                if (overlay.position_vertical === 'bottom') stylePos.bottom = 0;
                                if (overlay.position_horizontal === 'left') stylePos.left = 0;
                                if (overlay.position_horizontal === 'center') stylePos.left = '50%';
                                if (overlay.position_horizontal === 'right') stylePos.right = 0;
                                if (overlay.position_horizontal === 'center' && overlay.position_vertical !== 'center')
                                    stylePos.transform = 'translateX(-50%)';
                                if (overlay.position_vertical === 'center' && overlay.position_horizontal !== 'center')
                                    stylePos.transform = 'translateY(-50%)';
                            }
                        }
                        return (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    backgroundImage: `url(${overlay.url})`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    backgroundSize: overlay.object_fit || 'cover',
                                    width: '180px',
                                    height: '180px',
                                    ...stylePos,
                                    willChange: 'transform',
                                }}
                                aria-hidden="true"
                            />
                        );
                    })}
                </motion.div>
            )}

            {/* Watermark Number Entry Animation */}
            <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.3, once: false }}
                transition={{ duration: 2.0, delay: 0.1, ease: CALM_EASE }}
                className={`pointer-events-none absolute select-none font-black text-white/[0.05] text-[18rem] sm:text-[24rem] md:text-[28rem] leading-none tracking-tighter ${
                    align === 'right' ? 'left-6 sm:left-12 top-1/2 -translate-y-1/2' : 'right-6 sm:right-12 top-1/2 -translate-y-1/2'
                }`}
            >
                {String(index + 1).padStart(2, '0')}
            </motion.div>

            {/* Main Centered Content Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-center my-auto">
                <div
                    className={`w-full max-w-2xl flex flex-col ${
                        align === 'right' ? 'ml-auto text-right items-end' : 'mr-auto text-left items-start'
                    }`}
                >
                    {/* Top Badges Row */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ amount: 0.4, once: false }}
                        transition={{ duration: 1.0, delay: 0.1, ease: CALM_EASE }}
                        className={`mb-3 sm:mb-4 flex flex-wrap items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}
                    >
                        <span className="glass-pill flex items-center gap-1.5 rounded-full border border-[#d85c3e]/40 bg-black/50 px-3.5 py-1.5 font-mono text-[10px] sm:text-[11px] font-bold text-[#f1b19b] shadow-sm">
                            <Sparkles className="h-3.5 w-3.5 text-[#d85c3e]" />
                            #{String(index + 1).padStart(2, '0')} DESTINASI EXHIBITION
                        </span>

                        {label && (
                            <span className="glass-pill flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3.5 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                                <Tag className="h-3.5 w-3.5 text-[#d85c3e]" />
                                {label}
                            </span>
                        )}
                    </motion.div>

                    {/* Headline Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        viewport={{ amount: 0.4, once: false }}
                        transition={{ duration: 1.2, delay: 0.25, ease: CALM_EASE }}
                        className="mb-3 sm:mb-4 leading-none max-w-full text-white"
                    >
                        {title
                            .trim()
                            .split(/\s+/)
                            .map((w) => (
                                <Flip key={w}>{w}</Flip>
                            ))}
                    </motion.div>

                    {/* Subtitle */}
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ amount: 0.4, once: false }}
                            transition={{ duration: 1.2, delay: 0.4, ease: CALM_EASE }}
                            className="mb-3 sm:mb-4 text-base sm:text-lg md:text-xl leading-relaxed font-semibold sm:font-light tracking-wide text-white/90 max-w-xl line-clamp-2"
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    {/* Markdown Description */}
                    {content && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ amount: 0.4, once: false }}
                            transition={{ duration: 1.2, delay: 0.55, ease: CALM_EASE }}
                            className={`mb-6 w-full text-xs sm:text-sm leading-relaxed text-white/80 max-w-xl line-clamp-3 sm:line-clamp-4 ${
                                align === 'right' ? 'text-right ml-auto' : 'text-left mr-auto'
                            }`}
                        >
                            {content}
                        </motion.div>
                    )}

                    {/* Action Buttons Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ amount: 0.4, once: false }}
                        transition={{ duration: 1.2, delay: 0.7, ease: CALM_EASE }}
                        className={`flex flex-wrap items-center gap-3 ${align === 'right' ? 'justify-end' : 'justify-start'}`}
                    >
                        {onOpenDetail ? (
                            <FancyButton onClick={onOpenDetail}>{ctaLabel || 'Mulai Jelajah'}</FancyButton>
                        ) : ctaHref ? (
                            <FancyButton href={ctaHref}>{ctaLabel || 'Mulai Jelajah'}</FancyButton>
                        ) : null}

                        {onOpenMap && (
                            <button
                                onClick={onOpenMap}
                                className="glass-pill flex items-center gap-2 rounded-none border border-white/70 bg-black/40 px-5 py-3 text-xs sm:text-sm font-bold tracking-wide text-white transition hover:bg-white hover:text-black cursor-pointer shadow-md"
                            >
                                <MapPin className="h-4 w-4 text-[#f1b19b]" />
                                <span>Lihat Peta Lokasi</span>
                            </button>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
});

Section.displayName = 'Section';
