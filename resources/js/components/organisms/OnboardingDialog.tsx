import { Logo } from '@/components/atoms/Logo';
import { appConfig } from '@/config/app';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    open?: boolean;
    isOpen?: boolean;
    onClose: () => void;
}

export function OnboardingDialog({ open, isOpen, onClose }: Props) {
    const isVisible = open ?? isOpen ?? false;
    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111417] p-6 sm:p-8 text-center shadow-2xl"
                    >
                        {/* Top Gradient Accent Line */}
                        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#d85c3e] via-[#f1b19b] to-[#8B8DFF]" />

                        <div className="mb-6 flex justify-center">
                            <Logo />
                        </div>

                        <h2 className="mb-1 text-3xl font-black tracking-tight text-[#d85c3e] dark:text-[#8B8DFF]">{appConfig.name.toUpperCase()}</h2>
                        <h3 className="mb-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {appConfig.fullName}
                        </h3>

                        <p className="mb-8 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                            Selamat datang di {appConfig.name}. Jelajahi ragam museum dan warisan sejarah di Jember dengan pengalaman digital yang imersif dan informatif.
                        </p>

                        <div className="mb-8 border-t border-black/10 dark:border-white/10 pt-4">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                Developed by
                            </p>
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                Politeknik Negeri Jember
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">1 / 1</span>
                            <button
                                onClick={onClose}
                                className="rounded-xl bg-[#d85c3e] dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
