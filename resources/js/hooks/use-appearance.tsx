import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';
const APPEARANCE_EVENT = 'appearance-change';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(() => {
        if (typeof window === 'undefined') return 'system';
        return (localStorage.getItem('appearance') as Appearance | null) || 'system';
    });

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);
        window.dispatchEvent(new CustomEvent<Appearance>(APPEARANCE_EVENT, { detail: mode }));
    }, []);

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        const mode = savedAppearance || 'system';
        setAppearance(mode);
        applyTheme(mode);

        const handleAppearanceChange = (event: Event) => {
            setAppearance((event as CustomEvent<Appearance>).detail);
        };

        window.addEventListener(APPEARANCE_EVENT, handleAppearanceChange);

        return () => window.removeEventListener(APPEARANCE_EVENT, handleAppearanceChange);
    }, []);

    return { appearance, updateAppearance } as const;
}
