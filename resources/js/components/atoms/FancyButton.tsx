import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import React from 'react';
export function FancyButton({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <motion.a
            href={href}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 overflow-hidden border border-white/75 bg-transparent px-5 py-3 text-sm font-semibold tracking-wide text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
            <span className="absolute inset-0">
                <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </span>
            <span className="relative z-10 flex items-center gap-2">
                <span className="transition-colors duration-500 group-hover:text-black">{children}</span>
                <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:stroke-black"
                    aria-hidden="true"
                />
            </span>
        </motion.a>
    );
}
