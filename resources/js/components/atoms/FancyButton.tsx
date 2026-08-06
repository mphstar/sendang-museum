import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import React from 'react';

interface FancyButtonProps {
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
    children: React.ReactNode;
}

export function FancyButton({ href, onClick, children }: FancyButtonProps) {
    const Component = href ? motion.a : motion.button;
    const props = href ? { href } : { onClick, type: 'button' as const };

    return (
        <Component
            {...props}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 overflow-hidden border border-white/75 bg-black/40 px-6 py-3.5 text-xs sm:text-sm font-bold tracking-wide text-white focus:outline-none cursor-pointer shadow-lg transition-colors duration-300"
        >
            <span className="absolute inset-0">
                <span className="absolute inset-0 origin-left scale-x-0 bg-[#d85c3e] transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </span>
            <span className="relative z-10 flex items-center gap-2">
                <span className="transition-colors duration-500 group-hover:text-white font-extrabold">{children}</span>
                <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:stroke-white"
                    aria-hidden="true"
                />
            </span>
        </Component>
    );
}
