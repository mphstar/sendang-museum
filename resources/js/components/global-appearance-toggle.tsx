import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { usePage } from '@inertiajs/react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';

const options = [
    { value: 'light' as const, label: 'Terang', icon: Sun },
    { value: 'dark' as const, label: 'Gelap', icon: Moon },
    { value: 'system' as const, label: 'Ikuti sistem', icon: Monitor },
];

export function GlobalAppearanceToggle() {
    const { appearance, updateAppearance } = useAppearance();
    const ActiveIcon = options.find((option) => option.value === appearance)?.icon ?? Monitor;

    // Hide on panorama viewer — it has its own inline theme toggle in the header
    const { component } = usePage();
    if (component === 'frontend/PanoramaViewer') return null;

    return (
        <div className="fixed right-5 bottom-32 z-[10000] print:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 rounded-full border border-black/20 dark:border-white/30 bg-white/80 dark:bg-black/60 text-gray-900 dark:text-white shadow-xl backdrop-blur-md transition hover:bg-gray-100 dark:hover:bg-white/20 active:scale-95 cursor-pointer"
                        aria-label="Ubah tema tampilan"
                        title="Tema tampilan"
                    >
                        <ActiveIcon className="h-5 w-5 text-[#d85c3e] dark:text-[#f1b19b]" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="z-[10001] mb-2 w-44 border-black/10 dark:border-white/15 bg-white dark:bg-[#111417] text-gray-900 dark:text-white shadow-2xl">
                    {options.map(({ value, label, icon: Icon }) => (
                        <DropdownMenuItem
                            key={value}
                            onClick={() => updateAppearance(value)}
                            className="justify-between focus:bg-gray-100 dark:focus:bg-white/10 focus:text-gray-900 dark:focus:text-white cursor-pointer"
                        >
                            <span className="flex items-center gap-2 text-xs font-medium">
                                <Icon className="h-4 w-4 text-[#d85c3e] dark:text-[#f1b19b]" />
                                {label}
                            </span>
                            {appearance === value && <Check className="h-4 w-4 text-[#d85c3e]" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
