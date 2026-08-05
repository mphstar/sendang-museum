import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { Check, Monitor, Moon, Sun } from 'lucide-react';

const options = [
    { value: 'light' as const, label: 'Terang', icon: Sun },
    { value: 'dark' as const, label: 'Gelap', icon: Moon },
    { value: 'system' as const, label: 'Ikuti sistem', icon: Monitor },
];

export function GlobalAppearanceToggle() {
    const { appearance, updateAppearance } = useAppearance();
    const ActiveIcon = options.find((option) => option.value === appearance)?.icon ?? Monitor;

    return (
        <div className="fixed right-4 bottom-4 z-[10000] print:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="border-border/80 bg-background/90 hover:bg-accent h-10 w-10 rounded-full shadow-lg backdrop-blur-md"
                        aria-label="Ubah tema tampilan"
                        title="Tema tampilan"
                    >
                        <ActiveIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="z-[10001] mb-1 w-44">
                    {options.map(({ value, label, icon: Icon }) => (
                        <DropdownMenuItem key={value} onClick={() => updateAppearance(value)} className="justify-between">
                            <span className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {label}
                            </span>
                            {appearance === value && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
