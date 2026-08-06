import { motion } from 'framer-motion';
export function Logo() {
    return (
        <div className="flex gap-2">
            <img className="aspect-square h-8 w-8" src="/images/website/logo/polije.png" alt="Polije Logo" />
            <img className="aspect-square h-8 w-8" src="/images/website/logo/polije-sip.png" alt="Polije SIP Logo" />
            <img className="aspect-square h-8 w-8" src="/images/website/logo/diktisaintek.png" alt="Diktisaintek Logo" />
            <motion.div
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="flex h-8 w-8 items-center justify-center rounded-xl shadow-cyan-500/30"
                aria-label="Logo"
            >
                <img className="aspect-square h-8 w-8" src="/images/website/logo/logo.png" alt="J-DiMS Logo" />
            </motion.div>
        </div>
    );
}
