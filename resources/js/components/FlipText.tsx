import { motion } from 'framer-motion';

const DURATION = 0.25;
const STAGGER = 0.025;

interface FlipProps {
    children: string;
    className?: string;
}

const Flip = ({ children, className }: FlipProps) => {
    return (
        <motion.div
            initial="initial"
            whileHover="hovered"
            className={
                className ||
                "relative block max-w-full overflow-hidden text-3xl sm:text-5xl lg:text-7xl leading-[0.92] font-black tracking-[-0.03em] text-white uppercase drop-shadow-md"
            }
        >
            <div>
                {children.split('').map((l, i) => (
                    <motion.span
                        key={i}
                        className="inline-block"
                        variants={{
                            initial: { y: 0 },
                            hovered: { y: '-100%' },
                        }}
                        transition={{
                            duration: DURATION,
                            ease: 'easeInOut',
                            delay: STAGGER * i,
                        }}
                    >
                        {l}
                    </motion.span>
                ))}
            </div>

            <div className="absolute inset-0">
                {children.split('').map((l, i) => (
                    <motion.span
                        key={i}
                        className="inline-block text-[#f1b19b]"
                        variants={{
                            initial: { y: '100%' },
                            hovered: { y: 0 },
                        }}
                        transition={{
                            duration: DURATION,
                            ease: 'easeInOut',
                            delay: STAGGER * i,
                        }}
                    >
                        {l}
                    </motion.span>
                ))}
            </div>
        </motion.div>
    );
};
export default Flip;
