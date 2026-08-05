import { motion, useInView } from 'framer-motion';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { FancyButton } from '../atoms/FancyButton';
import Flip from '../FlipText';
import { SectionData } from './Section';

export const CarouselSection = forwardRef<HTMLDivElement, { data: SectionData; index: number; isActive: boolean }>(
    ({ data, index, isActive }, ref) => {
        const { bg, title, subtitle, content, ctaHref, overlays, align = 'left' } = data;
        const sectionRef = useRef<HTMLDivElement | null>(null);
        const overlayRef = sectionRef;
        const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
        const scrollProg = useRef(0);
        const lastTime = useRef<number | null>(null);
        const inView = useInView(sectionRef, { amount: 0.55 });
        const prev = useRef(false);
        const [cycle, setCycle] = useState(0);

        // Parallax mouse movement effect
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
                className={`relative isolate flex h-full w-full flex-shrink-0 items-end bg-[#111417] pb-20 ${align === 'right' ? 'justify-end' : 'justify-start'}`}
            >
                {/* Black background layer */}
                <div className="absolute inset-0 -z-20 bg-black" />

                {bg && (
                    <motion.div
                        className="absolute inset-0 -z-10 bg-black bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${bg})` }}
                        initial={{ scale: 1.05 }}
                        animate={isActive ? { scale: 1 } : { scale: 1.05 }}
                        transition={{
                            duration: 1.2,
                            ease: 'easeOut',
                        }}
                        role="img"
                        aria-label={title}
                    />
                )}

                <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(17,20,23,0.2)_0%,rgba(17,20,23,0.2)_38%,rgba(17,20,23,0.92)_100%)]" />

                {overlays && overlays.length > 0 && (
                    <motion.div
                        key={cycle}
                        className="overlay-container pointer-events-none absolute inset-0 -z-[8] select-none"
                        initial={{ scale: 1.08 }}
                        animate={isActive ? { scale: 1 } : { scale: 1.08 }}
                        transition={{
                            duration: 1.2,
                            ease: 'easeOut',
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

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 12 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`w-full max-w-5xl px-6 md:px-8 ${align === 'right' ? 'mr-12 items-end text-right' : 'text-left'}`}
                >
                    <div className="mb-5 flex items-center gap-3">
                        <span className="museum-kicker">{String(index + 1).padStart(2, '0')} / destination</span>
                        <span className="h-px w-16 bg-[#f1b19b]/70" />
                    </div>
                    {title
                        .trim()
                        .split(/\s+/)
                        .map((w) => (
                            <Flip key={w}>{w}</Flip>
                        ))}
                    {subtitle && (
                        <p className="mt-5 max-w-xl text-base leading-relaxed font-light tracking-wide text-white/85 md:text-xl">{subtitle}</p>
                    )}
                    {content && <div className="mt-8 w-fit">{content}</div>}
                    {ctaHref && (
                        <div className="mt-10">
                            <FancyButton href={ctaHref}>Lihat</FancyButton>
                        </div>
                    )}
                </motion.div>

                <div className="absolute bottom-6 left-6 font-mono text-white/60">{String(index + 1).padStart(2, '0')}</div>
            </div>
        );
    },
);

CarouselSection.displayName = 'CarouselSection';
