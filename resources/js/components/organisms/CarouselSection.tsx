import { motion, useInView } from 'framer-motion';
import { MapPin, Sparkles, Tag } from 'lucide-react';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { FancyButton } from '../atoms/FancyButton';
import Flip from '../FlipText';
import { SectionData } from './Section';

// Calm luxury easing curve
const CALM_EASE = [0.16, 1, 0.3, 1] as const;

export const CarouselSection = forwardRef<HTMLDivElement, { data: SectionData; index: number; isActive: boolean }>(
    ({ data, index, isActive }, ref) => {
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
        const lastTime = useRef<number | null>(null);
        const inView = useInView(sectionRef, { amount: 0.4 });
        const prev = useRef(false);
        const [cycle, setCycle] = useState(0);

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
                    el.style.setProperty('--ox', pos.current.x + 'px');
                    el.style.setProperty('--oy', pos.current.y + 'px');
                    el.style.setProperty('--oxp', rx.toFixed(4));
                    el.style.setProperty('--oyp', ry.toFixed(4));
                    el.style.setProperty('--dx', driftX.toFixed(2));
                    el.style.setProperty('--dy', driftY.toFixed(2));
                }
                raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
            return () => {
                if (raf) cancelAnimationFrame(raf);
            };
        }, []);

        useEffect(() => {
            if (isActive && !prev.current) {
                setCycle((c) => c + 1);
            }
            prev.current = isActive;
        }, [isActive]);

        const handleMove = (e: React.MouseEvent) => {
            if (!window.matchMedia('(pointer:fine)').matches) return;
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            pos.current.tx = e.clientX - rect.left;
            pos.current.ty = e.clientY - rect.top;
        };

        return (
            <div
                id={data.id}
                ref={(el: HTMLDivElement | null) => {
                    sectionRef.current = el;
                    if (typeof ref === 'function') ref(el as any);
                    else if (ref && 'current' in ref) (ref as any).current = el;
                }}
                onMouseMove={handleMove}
                className="relative isolate flex h-full h-[100dvh] w-full max-w-full flex-shrink-0 overflow-hidden items-center justify-center bg-[#0b0d0f] text-[#f2efe8] pt-24 sm:pt-28 pb-10 px-6 sm:px-12 md:px-16 lg:px-24"
            >
                {/* Base solid background layer */}
                <div className="absolute inset-0 -z-20 bg-[#0b0d0f]" />

                {bg && (
                    <motion.div
                        className="absolute inset-0 -z-10 bg-[#0b0d0f] bg-cover bg-center bg-no-repeat overflow-hidden"
                        style={{ backgroundImage: `url(${bg})` }}
                        initial={{ scale: 1.05, opacity: 0.85 }}
                        animate={isActive ? { scale: 1, opacity: 1 } : { scale: 1.05, opacity: 0.85 }}
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
                        animate={isActive ? { scale: 1 } : { scale: 1.05 }}
                        transition={{
                            duration: 1.8,
                            ease: CALM_EASE,
                        }}
                    >
                        {overlays.map((overlay, i) => {
                            const depth = (i + 1) / overlays.length;
                            const mul = 6 * depth;
                            const driftMul = depth / 10;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundImage: `url(${overlay.url})`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center',
                                        backgroundSize: overlay.object_fit || 'cover',
                                        transform: `translate3d(calc(var(--oxp,0)*${mul}%) , calc(var(--oyp,0)*${mul}% + var(--dy,0)*${driftMul}),0) rotate(calc(var(--oxp,0)*${(depth * 5).toFixed(3)}deg)) scale(${(1 + depth * 0.05).toFixed(3)})`,
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
                    animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
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
                            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
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
                            animate={isActive ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 18, filter: 'blur(6px)' }}
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
                                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
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
                                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
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
                            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
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
            </div>
        );
    },
);

CarouselSection.displayName = 'CarouselSection';
