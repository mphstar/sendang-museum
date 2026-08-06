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
        <header className="glass-panel fixed top-0 left-0 z-[60] w-full border-b border-black/10 dark:border-white/10 bg-white/85 dark:bg-[#0b0d0f]/80 backdrop-blur-md px-4 py-3 md:px-8 transition-colors duration-300 shadow-sm">
            {/* Mobile layout */}
            <div className="flex h-10 w-full items-center justify-between md:hidden">
                <div className="flex items-center gap-2.5">
                    {backHref && (
                        <Link
                            href={backHref}
                            className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 text-gray-800 dark:text-white/80 transition hover:bg-black/10 dark:hover:bg-white/15 hover:text-black dark:hover:text-white"
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
                        <span className="museum-kicker text-[9px] tracking-widest text-[#d85c3e] dark:text-[#f1b19b]">J-DiMS / Digital Museum</span>
                        <span className="truncate text-xs font-semibold tracking-wide text-gray-900 dark:text-white">{label}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {actions}
                </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden items-center justify-between gap-6 md:flex">
                <div className="flex items-center gap-4">
                    {backHref && (
                        <Link
                            href={backHref}
                            className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 pr-3 pl-2.5 text-xs font-medium tracking-wide text-gray-800 dark:text-white/80 transition hover:border-black/30 dark:hover:border-white/30 hover:bg-black/10 dark:hover:bg-white/15 hover:text-black dark:hover:text-white"
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
                            <span>Kembali</span>
                        </Link>
                    )}

                    <a
                        href="#intro"
                        className="group flex items-center gap-3"
                        onClick={(e) => {
                            e.preventDefault();
                            if (onJump) onJump(0);
                        }}
                    >
                        <Logo />
                        <div className="flex flex-col">
                            <span className="museum-kicker text-[10px] tracking-widest text-[#d85c3e] dark:text-[#f1b19b]">J-DiMS / Jember Digital Museum System</span>
                            <span className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white group-hover:opacity-90">{label}</span>
                        </div>
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    {actions}
                </div>
            </div>
        </header>
    );
}
