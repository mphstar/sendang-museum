import { motion } from 'framer-motion';

const DURATION = 0.25;
const STAGGER = 0.025;

const Flip = ({ children }: { children: string }) => {
    return (
        <motion.div
            initial="initial"
            whileHover="hovered"
            className="relative block max-w-full overflow-hidden text-4xl leading-[0.92] font-black tracking-[-0.03em] text-white uppercase sm:text-6xl lg:text-8xl"
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
                        className="inline-block"
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
