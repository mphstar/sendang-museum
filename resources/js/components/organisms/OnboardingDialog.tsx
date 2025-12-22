import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/atoms/Logo';

interface Props {
    open: boolean;
    onClose: () => void;
}

export function OnboardingDialog({ open, onClose }: Props) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Dialog Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0F1218]/90 p-8 text-center text-white shadow-2xl backdrop-blur-md"
                    >
                        {/* Top Gradient Line */}
                        <div className="absolute left-0 top-0 h-1 w-1/3 bg-gradient-to-r from-blue-500 to-purple-500" />

                        <div className="mb-6 flex justify-center">
                            <Logo />
                        </div>

                        <h2 className="mb-1 text-3xl font-bold tracking-tight text-[#8B8DFF]">J-DIMS</h2>
                        <h3 className="mb-6 text-sm font-medium text-gray-300">
                            Jember Digital Museum System
                        </h3>

                        <p className="mb-8 text-sm leading-relaxed text-gray-400">
                            Selamat datang di J-DIMS. Jelajahi ragam museum dan warisan sejarah di Jember dengan pengalaman digital yang imersif dan informatif.
                        </p>

                        <div className="mb-8 border-t border-white/5 pt-4">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500">
                                Developed by
                            </p>
                            <p className="text-xs font-semibold text-gray-300">
                                Politeknik Negeri Jember
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">1 / 1</span>
                            <button
                                onClick={onClose}
                                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-purple-500/25 active:scale-95"
                            >
                                Tutup
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
