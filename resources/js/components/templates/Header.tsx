import { Link } from '@inertiajs/react';
import React from 'react';
import { Logo } from '../atoms/Logo';
import type { SectionData } from '../organisms/Section';

interface HeaderProps {
    active: number;
    onJump: (i: number) => void;
    sections: SectionData[];
    brand?: string;
    subtitle?: string;
    backHref?: string;
    actions?: React.ReactNode;
}

export function Header({ active, onJump, sections, brand, subtitle, backHref, actions }: HeaderProps) {
    const label = brand || 'Education';
    return (
        <div className="fixed top-0 left-0 z-[60] w-full border-b border-white/15 bg-[#111417]/30 px-4 py-4 backdrop-blur-md md:px-8">
            {/* Mobile layout */}
            <div className="flex h-10 w-full items-center justify-between md:hidden">
                {/* Left: Brand name (and back button if exists) */}
                <div className="flex items-center gap-3">
                    {backHref && (
                        <Link
                            href={backHref}
                            className="group inline-flex h-9 items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2 text-xs font-medium text-white/80 transition hover:bg-white/15 hover:text-white"
                            aria-label="Kembali"
                        >
                            <svg
                                className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </Link>
                    )}
                    <div className="flex min-w-0 flex-col">
                        <span className="museum-kicker">J-DiMS / collection</span>
                        <span className="truncate text-sm leading-tight font-semibold tracking-wide text-white">{label}</span>
                        {subtitle && <span className="truncate text-[10px] tracking-wide text-white/65">{subtitle}</span>}
                    </div>
                </div>

                {/* Right: Logos */}
                <a
                    href="#intro"
                    onClick={(e) => {
                        e.preventDefault();
                        onJump(0);
                    }}
                    className="flex origin-right scale-75 items-center"
                >
                    <Logo />
                </a>
            </div>

            {/* Desktop layout */}
            <div className="hidden items-center gap-6 md:flex">
                {backHref && (
                    <Link
                        href={backHref}
                        className="group inline-flex h-9 items-center gap-1.5 rounded-md border border-white/15 bg-white/5 pr-3 pl-2 text-xs font-medium tracking-wide text-white/70 transition hover:bg-white/15 hover:text-white"
                        aria-label="Kembali ke daftar"
                    >
                        <svg
                            className="-ml-0.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        <span className="hidden sm:inline">Kembali</span>
                    </Link>
                )}
                <a
                    href="#intro"
                    className="group flex items-center gap-3"
                    onClick={(e) => {
                        e.preventDefault();
                        onJump(0);
                    }}
                >
                    <Logo />
                    <div className="flex flex-col">
                        <span className="museum-kicker">J-DiMS / collection</span>
                        <span className="text-base leading-tight font-semibold tracking-wide text-white group-hover:opacity-90">{label}</span>
                        {subtitle && <span className="text-xs tracking-wide text-white/70 group-hover:opacity-90">{subtitle}</span>}
                    </div>
                </a>
                {/* <nav className="flex gap-5 text-sm">
          {sections.map((s,i)=>{
            const lab = s.navLabel || s.title.split(' ')[0];
            return (
              <button key={s.id} onClick={()=>onJump(i)} className={`relative text-white/65 hover:text-white transition font-medium after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-white after:rounded-full after:transition-[width,opacity] after:opacity-70 ${i===active?'after:w-full text-white':'after:w-0 hover:after:w-full'}`} aria-current={i===active? 'true':undefined}>
                {lab}
              </button>
            );
          })}
        </nav> */}
                <div className="ml-auto flex items-center gap-3">{actions}</div>
            </div>
        </div>
    );
}
