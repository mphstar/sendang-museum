import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

export function ArrowNav({ active, onJump, total }: { active: number; onJump: (i: number) => void; total: number }) {
    const disabledUp = active === 0;
    const disabledDown = active === total - 1;
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
            <button
                aria-label="Sebelumnya"
                disabled={disabledUp}
                onClick={() => !disabledUp && onJump(active - 1)}
                className={`h-11 w-11 rounded-full border flex items-center justify-center text-gray-900 dark:text-white transition group backdrop-blur-md bg-white/80 dark:bg-white/10 border-black/20 dark:border-white/30 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95 shadow-md ${
                    disabledUp ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                }`}
            >
                <MdKeyboardArrowUp className="h-5 w-5" />
            </button>
            <button
                aria-label="Berikutnya"
                disabled={disabledDown}
                onClick={() => !disabledDown && onJump(active + 1)}
                className={`h-11 w-11 rounded-full border flex items-center justify-center text-gray-900 dark:text-white transition group backdrop-blur-md bg-white/80 dark:bg-white/10 border-black/20 dark:border-white/30 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95 shadow-md ${
                    disabledDown ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                }`}
            >
                <MdKeyboardArrowDown className="h-5 w-5" />
            </button>
        </div>
    );
}
