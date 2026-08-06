import MuseumInfoSidebar from '@/components/MuseumInfoSidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router, usePage } from '@inertiajs/react';
import { GalleryModal } from '@/components/organisms/GalleryModal';
import { useAppearance } from '@/hooks/use-appearance';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { DualFisheyeAdapter } from '@photo-sphere-viewer/dual-fisheye-adapter';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import {
    ArrowLeft,
    ArrowRight,
    Camera,
    Circle,
    Compass,
    Hand,
    Image as ImageIcon,
    Menu,
    Monitor,
    Moon,
    MousePointerClick,
    Music,
    Music2,
    Pause,
    Play,
    RotateCw,
    Scan,
    Sparkles,
    Sun,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import '../../../css/photo-sphere-viewer.css';

// Add marker styles
const markerStyles = `
  .info-image-marker {
    border: 3px solid #3b82f6 !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5) !important;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  
  .nav-image-marker {
    border: 3px solid #10b981 !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5) !important;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  
  .info-image-marker:hover,
  .nav-image-marker:hover {
    transform: scale(1.18) !important;
  }
`;

export default function PanoramaViewer() {
    const { appearance, updateAppearance } = useAppearance();

    const ThemeIcon = appearance === 'dark' ? Moon : appearance === 'light' ? Sun : Monitor;
    const { museum, allRuangan } = usePage().props as any;

    const mainRuangan = allRuangan?.find((r: any) => r.is_main) || allRuangan?.[0];

    const [activeRuangan, setActiveRuangan] = useState(mainRuangan);
    const [activeMarkers, setActiveMarkers] = useState(mainRuangan?.markers || []);

    const viewerRef = useRef<HTMLDivElement>(null);
    const [viewer, setViewer] = useState<any>(null);
    const [panoramaLoaded, setPanoramaLoaded] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Marker & Narration dialog state
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState<any>(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // Preloaded image URL cache to prevent duplicate network requests
    const preloadedUrlsRef = useRef<Set<string>>(new Set());

    // Function to preload a single 360 panorama image in the background
    const preloadPanoramaUrl = useCallback((url: string) => {
        if (!url || preloadedUrlsRef.current.has(url)) return;
        preloadedUrlsRef.current.add(url);
        const img = new Image();
        img.src = url;
    }, []);

    // Intelligent Background Idle Preloader:
    // When active room panorama finishes loading, automatically preload connected neighbor rooms
    useEffect(() => {
        if (!panoramaLoaded || !activeRuangan) return;

        const navTargetIds = (activeRuangan.markers || [])
            .filter((m: any) => m.type === 'navigation' && m.navigation_target)
            .map((m: any) => Number(m.navigation_target));

        const targetRooms = allRuangan.filter((r: any) => navTargetIds.includes(r.id));

        const preloadNeighborRooms = () => {
            targetRooms.forEach((room: any) => {
                if (room.panorama_url) {
                    preloadPanoramaUrl(room.panorama_url);
                }
            });
        };

        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(preloadNeighborRooms, { timeout: 3000 });
        } else {
            setTimeout(preloadNeighborRooms, 1000);
        }
    }, [panoramaLoaded, activeRuangan, allRuangan, preloadPanoramaUrl]);

    // Navigation, Guide & Gallery state
    const [showVisitorGuide, setShowVisitorGuide] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [projectionMode, setProjectionMode] = useState<'immersive' | 'planet'>('immersive');

    // Dynamically toggle PhotoSphereViewer projection mode (Immersive 360 vs Globe Little Planet)
    useEffect(() => {
        if (!viewer) return;
        try {
            if (projectionMode === 'planet') {
                viewer.setOption('fisheye', 2);
                viewer.animate({ fov: 130, speed: '2rpm' });
            } else {
                viewer.setOption('fisheye', 0);
                viewer.animate({ fov: 75, speed: '2rpm' });
            }
        } catch (e) {
            console.error('Error toggling projection mode:', e);
        }
    }, [projectionMode, viewer]);

    // Autopilot / Auto-rotate state
    const [isAutoRotating, setIsAutoRotating] = useState(false);
    const autoRotateTimerRef = useRef<any>(null);

    // Camera compass yaw / pitch state
    const [cameraAngle, setCameraAngle] = useState<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const roomAudioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlayingRoomAudio, setIsPlayingRoomAudio] = useState(false);
    const roomAudioDuckedByNarrationRef = useRef(false);
    const roomAudioPrevVolumeRef = useRef<number>(1);
    const roomAudioStartNeededRef = useRef(false);
    const roomAudioStartUnsubsRef = useRef<Array<() => void> | null>(null);

    const tryStartRoomAudioNow = useCallback(() => {
        if (roomAudioRef.current) {
            roomAudioRef.current
                .play()
                .then(() => {
                    setIsPlayingRoomAudio(true);
                    roomAudioStartNeededRef.current = false;
                    try {
                        if (audioRef.current && !audioRef.current.paused && roomAudioRef.current) {
                            roomAudioPrevVolumeRef.current = roomAudioRef.current.volume ?? 1;
                            roomAudioRef.current.volume = 0.2;
                            roomAudioDuckedByNarrationRef.current = true;
                        }
                    } catch {}
                    if (roomAudioStartUnsubsRef.current) {
                        roomAudioStartUnsubsRef.current.forEach((fn) => {
                            try {
                                fn();
                            } catch {}
                        });
                        roomAudioStartUnsubsRef.current = null;
                    }
                })
                .catch(() => {});
        }
    }, []);

    const scheduleRoomAudioStartOnGesture = useCallback(() => {
        if (!roomAudioStartNeededRef.current) return;
        const unsubs: Array<() => void> = [];
        const handler = () => tryStartRoomAudioNow();
        document.addEventListener('pointerdown', handler, { once: false });
        unsubs.push(() => document.removeEventListener('pointerdown', handler));
        document.addEventListener('click', handler, { once: false });
        unsubs.push(() => document.removeEventListener('click', handler));
        if (viewerRef.current) {
            const el = viewerRef.current;
            el.addEventListener('pointerdown', handler, { once: false });
            unsubs.push(() => el.removeEventListener('pointerdown', handler));
        }
        roomAudioStartUnsubsRef.current = unsubs;
    }, [tryStartRoomAudioNow]);

    useEffect(() => {
        const hasSeenGuide = localStorage.getItem('museum-visitor-guide-seen');
        if (hasSeenGuide === 'true') {
            setShowVisitorGuide(false);
        } else {
            const timer = setTimeout(() => {
                setShowVisitorGuide(true);
            }, 2000); // 2 second delay
            return () => clearTimeout(timer);
        }
    }, []);


    const handleCloseVisitorGuide = () => {
        localStorage.setItem('museum-visitor-guide-seen', 'true');
        setShowVisitorGuide(false);
        if (roomAudioStartNeededRef.current) {
            tryStartRoomAudioNow();
        }
    };

    // Room switching function with portal blur state
    const switchToRoom = useCallback(
        (targetRuanganId: number) => {
            if (audioRef.current) {
                try {
                    audioRef.current.pause();
                } catch {}
                audioRef.current = null;
                setIsPlayingAudio(false);
            }
            if (roomAudioRef.current) {
                try {
                    roomAudioRef.current.pause();
                } catch {}
                roomAudioRef.current = null;
                setIsPlayingRoomAudio(false);
            }

            const targetRuangan = allRuangan.find((r: any) => r.id === targetRuanganId);

            if (!targetRuangan) {
                toast.error('Ruangan tidak ditemukan');
                return;
            }

            if (targetRuangan.id === activeRuangan?.id) {
                return;
            }

            setIsTransitioning(true);
            setPanoramaLoaded(false);

            setTimeout(() => {
                setActiveRuangan(targetRuangan);
                setActiveMarkers(targetRuangan.markers || []);

                const newUrl = `/museum/${museum.id}#ruangan-${targetRuangan.id}`;
                window.history.pushState({ ruanganId: targetRuangan.id }, '', newUrl);

                setShowInfoDialog(false);
                setSelectedMarker(null);

                toast.success(`Berpindah ke ${targetRuangan.nama_ruangan}`);
            }, 100);
        },
        [allRuangan, museum.id, activeRuangan],
    );

    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = markerStyles;
        document.head.appendChild(styleElement);

        return () => {
            if (document.head.contains(styleElement)) {
                document.head.removeChild(styleElement);
            }
        };
    }, []);

    // Generate markers for Photo Sphere Viewer
    const generateMarkers = useCallback(() => {
        if (!activeMarkers || activeMarkers.length === 0) return [];

        return activeMarkers
            .map((marker: any) => {
                const baseConfig = {
                    id: marker.id.toString(),
                    position: {
                        yaw: parseFloat(marker.position_yaw || '0'),
                        pitch: parseFloat(marker.position_pitch || '0'),
                    },
                    tooltip: {
                        content: marker.judul,
                        position: 'top center',
                    },
                    data: {
                        ...marker,
                        clickAction: marker.type === 'info' ? 'showInfo' : 'navigate',
                    },
                };

                if (marker.type === 'navigation') {
                    const navElement = document.createElement('div');
                    navElement.className = 'w-12 h-12 mx-auto relative';
                    navElement.setAttribute('role', 'button');
                    navElement.setAttribute('tabindex', '0');
                    navElement.style.touchAction = 'manipulation';
                    navElement.style.cssText = `cursor: pointer;`;

                    navElement.innerHTML = `
          <div style="width: 100%; height: 100%; background: #10b981; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5); display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;">
            <svg style="width: 18px; height: 18px; pointer-events: none;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M9 6l6 6-6 6"/>
            </svg>
          </div>
        `;

                    return {
                        ...baseConfig,
                        element: navElement,
                        anchor: 'center center',
                    };
                } else {
                    if (marker.media_type === 'video' && marker.media_url) {
                        const rawUrl = marker.media_url;
                        const isStringUrl = typeof rawUrl === 'string' && rawUrl.length > 0;
                        let mediaUrl: string | null = null;
                        if (isStringUrl) {
                            try {
                                mediaUrl = new URL(rawUrl, window.location.origin).href;
                            } catch {
                                mediaUrl = null;
                            }
                        }

                        if (!mediaUrl) {
                            const fallbackEl = document.createElement('div');
                            fallbackEl.className = 'w-12 h-12 mx-auto relative';
                            fallbackEl.setAttribute('role', 'button');
                            fallbackEl.setAttribute('tabindex', '0');
                            fallbackEl.style.touchAction = 'manipulation';
                            fallbackEl.style.cssText = `cursor: pointer;`;
                            fallbackEl.innerHTML = `
              <div style="width: 100%; height: 100%; background: #ef4444; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5); display: flex; align-items: center; justify-content: center;">
                <svg style="width: 18px; height: 18px; pointer-events: none;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                  <path d="M12 9v4m0 4h.01"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
            `;
                            return {
                                ...baseConfig,
                                element: fallbackEl,
                                anchor: 'center center',
                                data: { ...baseConfig.data, clickAction: 'showInfo' },
                            } as any;
                        }

                        const width = Number(marker.media_width) || 240;
                        const height = Number(marker.media_height) || 240;
                        return {
                            ...baseConfig,
                            videoLayer: mediaUrl,
                            size: { width, height },
                            style: { cursor: 'pointer' },
                            anchor: 'center center',
                            tooltip: 'Putar Video',
                            chromaKey: {
                                enabled: true,
                                color: '#00FF00',
                                similarity: 0.4,
                                smoothness: 0.1,
                            },
                            data: { ...baseConfig.data, clickAction: 'toggleVideoInfoPlay' },
                        } as any;
                    } else {
                        const infoElement = document.createElement('div');
                        infoElement.className = 'w-12 h-12 mx-auto relative';
                        infoElement.setAttribute('role', 'button');
                        infoElement.setAttribute('tabindex', '0');
                        infoElement.style.touchAction = 'manipulation';
                        infoElement.style.cssText = `cursor: pointer;`;

                        infoElement.innerHTML = `
            <div style="width: 100%; height: 100%; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5); display: flex; align-items: center; justify-content: center;">
              <svg style="width: 18px; height: 18px; pointer-events: none;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4m0-4h.01"/>
              </svg>
            </div>
          `;

                        return {
                            ...baseConfig,
                            element: infoElement,
                            anchor: 'center center',
                        };
                    }
                }
            })
            .filter((marker: any) => marker !== null);
    }, []);

    // Handle hash and popstate navigation
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            const match = hash.match(/#ruangan-(\d+)/);

            if (match) {
                const ruanganIdFromHash = parseInt(match[1]);
                if (ruanganIdFromHash && ruanganIdFromHash !== activeRuangan?.id) {
                    if (audioRef.current) {
                        try {
                            audioRef.current.pause();
                        } catch {}
                        audioRef.current = null;
                        setIsPlayingAudio(false);
                    }
                    if (roomAudioRef.current) {
                        try {
                            roomAudioRef.current.pause();
                        } catch {}
                        roomAudioRef.current = null;
                        setIsPlayingRoomAudio(false);
                    }
                    const targetRuangan = allRuangan.find((r: any) => r.id === ruanganIdFromHash);
                    if (targetRuangan) {
                        setActiveRuangan(targetRuangan);
                        setActiveMarkers(targetRuangan.markers || []);
                    }
                }
            }
        };

        handleHashChange();

        const handlePopState = (event: PopStateEvent) => {
            if (event.state?.ruanganId) {
                const targetRuangan = allRuangan.find((r: any) => r.id === event.state.ruanganId);
                if (targetRuangan) {
                    setActiveRuangan(targetRuangan);
                    setActiveMarkers(targetRuangan.markers || []);
                }
            } else {
                const mainRuangan = allRuangan?.find((r: any) => r.is_main) || allRuangan?.[0];
                if (mainRuangan) {
                    setActiveRuangan(mainRuangan);
                    setActiveMarkers(mainRuangan.markers || []);
                }
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [allRuangan, activeRuangan]);

    useEffect(() => {
        (window as any).handleMarkerClick = (targetId: number) => {
            switchToRoom(targetId);
        };
        return () => {
            delete (window as any).handleMarkerClick;
        };
    }, [switchToRoom]);

    // Initialize Photo Sphere Viewer
    useEffect(() => {
        try {
            if (roomAudioRef.current) {
                try {
                    roomAudioRef.current.pause();
                } catch {}
                roomAudioRef.current = null;
                setIsPlayingRoomAudio(false);
            }
            const guideUrl = (activeRuangan as any)?.audio_guide_url as string | undefined;
            if (guideUrl) {
                let resolvedUrl: string | null = null;
                try {
                    resolvedUrl = new URL(guideUrl, window.location.origin).href;
                } catch {
                    resolvedUrl = guideUrl;
                }
                const audio = new Audio(resolvedUrl);
                audio.loop = true;
                roomAudioRef.current = audio;
                audio
                    .play()
                    .then(() => {
                        setIsPlayingRoomAudio(true);
                        try {
                            if (audioRef.current && !audioRef.current.paused) {
                                roomAudioPrevVolumeRef.current = audio.volume ?? 1;
                                audio.volume = 0.2;
                                roomAudioDuckedByNarrationRef.current = true;
                            }
                        } catch {}
                    })
                    .catch(() => {
                        setIsPlayingRoomAudio(false);
                        roomAudioStartNeededRef.current = true;
                        scheduleRoomAudioStartOnGesture();
                    });
            }
        } catch {}

        if (!activeRuangan?.panorama_url) return;

        setPanoramaLoaded(false);
        setIsTransitioning(false);

        const initViewer = async () => {
            try {
                let attempts = 0;
                while (!viewerRef.current && attempts < 10) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    attempts++;
                }

                if (!viewerRef.current) return;

                if (viewer) {
                    try {
                        viewer.destroy();
                    } catch {}
                    setViewer(null);
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }

                if (viewerRef.current) {
                    viewerRef.current.innerHTML = '';
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }

                const generatedMarkers = generateMarkers();

                let resolvedPanoramaUrl = activeRuangan.panorama_url;
                try {
                    resolvedPanoramaUrl = new URL(activeRuangan.panorama_url, window.location.origin).href;
                } catch {}

                const isLittlePlanetType = activeRuangan?.projection_type === 'little_planet' || projectionMode === 'planet';

                const viewerConfig: any = {
                    container: viewerRef.current,
                    panorama: resolvedPanoramaUrl,
                    plugins: [
                        [
                            MarkersPlugin,
                            {
                                markers: generatedMarkers,
                                clickEventOnMarker: true,
                            },
                        ],
                        [
                            AutorotatePlugin,
                            {
                                autostartDelay: 1200,
                                autorotateSpeed: '0.8rpm',
                                autorotatePitch: 0,
                            },
                        ],
                    ],
                    navbar: [
                        'zoom',
                        'autorotate',
                        'fullscreen',
                    ],
                    loadingTxt: '',
                    loadingImg: '',
                    showLoader: false,
                    defaultZoomLvl: 0,
                    fisheye: isLittlePlanetType ? 2 : 0,
                    defaultPitch: isLittlePlanetType ? -Math.PI / 2 : 0,
                    mousewheel: true,
                    mousemove: true,
                    keyboard: true,
                    size: {
                        width: '100%',
                        height: '100%',
                    },
                    panoData: (image: HTMLImageElement) => {
                        const fullWidth = image.width;
                        const fullHeight = Math.round(image.width / 2);
                        const isStandardEquirect = Math.abs(image.height - fullHeight) < fullHeight * 0.15;

                        if (isStandardEquirect) {
                            return {
                                fullWidth: image.width,
                                fullHeight: image.height,
                                croppedWidth: image.width,
                                croppedHeight: image.height,
                                croppedX: 0,
                                croppedY: 0,
                            };
                        }

                        // Auto-adapt circular fisheye or non 2:1 ratio images for 360 rendering
                        return {
                            fullWidth: image.width,
                            fullHeight: fullHeight,
                            croppedWidth: image.width,
                            croppedHeight: Math.min(image.height, fullHeight),
                            croppedX: 0,
                            croppedY: Math.max(0, Math.round((fullHeight - image.height) / 2)),
                        };
                    },
                };

                if (activeRuangan?.projection_type === 'dual_fisheye') {
                    viewerConfig.adapter = DualFisheyeAdapter;
                }

                const newViewer = new Viewer(viewerConfig);

                setPanoramaLoaded(true);

                // Listen for camera position changes to update HUD compass
                newViewer.addEventListener('position-updated', (e: any) => {
                    if (e.position) {
                        const degYaw = Math.round((e.position.yaw * 180) / Math.PI) % 360;
                        const degPitch = Math.round((e.position.pitch * 180) / Math.PI);
                        setCameraAngle({ yaw: (degYaw + 360) % 360, pitch: degPitch });
                    }
                });

                newViewer.addEventListener('ready', () => {
                    newViewer.addEventListener('click', () => {
                        if (roomAudioStartNeededRef.current) tryStartRoomAudioNow();
                    });

                    const markersPlugin = newViewer.getPlugin(MarkersPlugin);
                    if (markersPlugin) {
                        markersPlugin.addEventListener('select-marker', (e: any) => {
                            const marker = e.marker;
                            const markerData = marker.data || marker.config?.data;

                            if (markerData?.clickAction === 'navigate') {
                                const targetId = parseInt(markerData.navigation_target);
                                if (targetId) {
                                    switchToRoom(targetId);
                                }
                            } else if (markerData?.clickAction === 'showInfo') {
                                setSelectedMarker(markerData);
                                setShowInfoDialog(true);
                            } else if (markerData?.clickAction === 'toggleVideoInfoPlay') {
                                try {
                                    const videoEl: HTMLVideoElement | undefined = (marker as any).video as any;
                                    if (videoEl) {
                                        const isPaused = videoEl.paused;
                                        if (isPaused) {
                                            try {
                                                videoEl.currentTime = 0;
                                            } catch {}
                                            (videoEl as any).playsInline = true;
                                            videoEl.setAttribute('playsinline', 'true');
                                            videoEl.muted = true;
                                            videoEl.play().catch(() => {});
                                            const audioUrl = markerData?.audio_url;
                                            if (audioUrl) {
                                                if (roomAudioRef.current) {
                                                    try {
                                                        roomAudioPrevVolumeRef.current = roomAudioRef.current.volume ?? 1;
                                                        roomAudioRef.current.volume = 0.2;
                                                        roomAudioDuckedByNarrationRef.current = true;
                                                    } catch {}
                                                } else {
                                                    roomAudioDuckedByNarrationRef.current = false;
                                                }
                                                playAudioNarration(audioUrl);
                                            }
                                        } else {
                                            videoEl.pause();
                                            try {
                                                videoEl.currentTime = 0;
                                            } catch {}
                                            stopAudioNarration();
                                            if (roomAudioDuckedByNarrationRef.current && roomAudioRef.current) {
                                                try {
                                                    roomAudioRef.current.volume = roomAudioPrevVolumeRef.current || 1;
                                                } catch {}
                                                roomAudioDuckedByNarrationRef.current = false;
                                            }
                                        }
                                    }
                                } catch (err) {
                                    console.error('Error toggling video play/pause:', err);
                                }
                            }
                        });
                    }
                });

                setViewer(newViewer);
            } catch (error) {
                console.error('Error initializing panorama viewer:', error);
                setPanoramaLoaded(false);
                setIsTransitioning(false);
                toast.error('Gagal memuat panorama');
            }
        };

        const timeoutId = setTimeout(() => {
            initViewer();
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            if (audioRef.current) {
                try {
                    audioRef.current.pause();
                } catch {}
                audioRef.current = null;
                setIsPlayingAudio(false);
            }
            if (roomAudioRef.current) {
                try {
                    roomAudioRef.current.pause();
                } catch {}
                roomAudioRef.current = null;
                setIsPlayingRoomAudio(false);
            }
            if (viewer) {
                try {
                    viewer.destroy();
                } catch {}
            }
        };
    }, [activeRuangan, generateMarkers, projectionMode, switchToRoom]);

    // Audio Narration Controls
    const playAudioNarration = (audioUrl: string) => {
        stopAudioNarration();
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.loop = true;

        audio.addEventListener('loadstart', () => setIsPlayingAudio(true));
        audio.addEventListener('ended', () => {
            if (!audio.loop) setIsPlayingAudio(false);
        });
        audio.addEventListener('error', () => {
            setIsPlayingAudio(false);
            toast.error('Gagal memutar audio narasi');
        });

        audio.play().catch(() => {
            setIsPlayingAudio(false);
            toast.error('Gagal memutar audio narasi');
        });
    };

    const stopAudioNarration = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlayingAudio(false);
    };

    const toggleAudioNarration = () => {
        if (selectedMarker?.audio_url) {
            if (isPlayingAudio) {
                stopAudioNarration();
                if (roomAudioDuckedByNarrationRef.current && roomAudioRef.current) {
                    try {
                        roomAudioRef.current.volume = roomAudioPrevVolumeRef.current || 1;
                    } catch {}
                    roomAudioDuckedByNarrationRef.current = false;
                }
            } else {
                if (roomAudioRef.current) {
                    try {
                        roomAudioPrevVolumeRef.current = roomAudioRef.current.volume ?? 1;
                        roomAudioRef.current.volume = 0.2;
                        roomAudioDuckedByNarrationRef.current = true;
                    } catch {}
                } else {
                    roomAudioDuckedByNarrationRef.current = false;
                }
                playAudioNarration(selectedMarker.audio_url);
            }
        }
    };

    // Autopilot / Auto-Rotate Toggle
    const toggleAutoRotate = () => {
        if (!viewer) return;
        if (isAutoRotating) {
            viewer.stopAutorotate();
            setIsAutoRotating(false);
            toast.info('Tur Otomatis Dinonaktifkan');
        } else {
            viewer.startAutorotate({ autorotateSpeed: '1rpm' });
            setIsAutoRotating(true);
            toast.success('Tur Otomatis Aktif');
        }
    };

    // Virtual Souvenir Snapshot Download
    const takeSouvenirSnapshot = () => {
        if (!viewer) return;
        try {
            const psvCanvas = viewer.container.querySelector('canvas') as HTMLCanvasElement;
            if (!psvCanvas) {
                toast.error('Gagal mengambil gambar canvas 360°');
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = psvCanvas.width;
            canvas.height = psvCanvas.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Draw current 360 view
            ctx.drawImage(psvCanvas, 0, 0);

            // Add futuristic watermarked frame overlay
            const padding = 40;
            ctx.fillStyle = 'rgba(11, 13, 15, 0.75)';
            ctx.fillRect(0, canvas.height - 120, canvas.width, 120);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText(`J-DiMS Virtual Visitor Souvenir`, padding, canvas.height - 70);

            ctx.fillStyle = '#f1b19b';
            ctx.font = '22px sans-serif';
            ctx.fillText(`${museum.title} — ${activeRuangan.nama_ruangan}`, padding, canvas.height - 35);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '18px monospace';
            const dateStr = new Date().toLocaleDateString('id-ID', { dateStyle: 'full' });
            ctx.fillText(dateStr, canvas.width - 450, canvas.height - 45);

            const link = document.createElement('a');
            link.download = `J-DiMS_${activeRuangan.nama_ruangan.replace(/\s+/g, '_')}_Souvenir.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            toast.success('Foto kenangan 360° berhasil diunduh!');
        } catch (e) {
            console.error('Error taking snapshot:', e);
            toast.error('Gagal mengambil foto kenangan');
        }
    };

    return (
        <>
            <Head title={`${activeRuangan.nama_ruangan} — ${museum.title} | J-DiMS`} />

            <div className="museum-panorama relative h-screen w-screen overflow-hidden bg-[#0b0d0f]">
                {/* Sci-Fi Glass HUD Header Bar */}
                <div className="glass-panel absolute top-0 left-0 right-0 z-[70] flex items-center gap-2 border-b border-black/10 px-3 py-2.5 md:px-4 dark:border-white/10 bg-white/40 dark:bg-black/10">
                    {/* Left: Burger Menu + Back Button */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Burger Menu */}
                        <button
                            onClick={() => setShowSidebar(true)}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#d85c3e] bg-[#d85c3e] text-white shadow-md transition hover:bg-[#b94830] active:scale-95 ${
                                showSidebar ? 'opacity-30 pointer-events-none' : 'opacity-100'
                            }`}
                            title="Menu Museum"
                        >
                            <Menu className="h-4 w-4" />
                        </button>

                        {/* Back Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/')}
                            className="flex-shrink-0 rounded-full border border-black/15 bg-black/5 px-2.5 py-1.5 text-xs h-9 dark:border-white/15 dark:bg-white/5 text-gray-700 hover:bg-black/10 dark:text-white dark:hover:bg-white/15"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                            <span className="hidden sm:inline">Kembali</span>
                        </Button>
                    </div>

                    {/* Center: Room Breadcrumb (flex-1 so it takes remaining space) */}
                    <div className="min-w-0 flex-1 flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="museum-kicker text-[9px] tracking-widest text-[#f1b19b] truncate hidden sm:block">
                                {museum.title}
                            </span>
                            /* Room pill + title use adaptive colors over the glass header */
                            <span className="glass-pill rounded-full px-2 py-0.5 text-[9px] font-bold text-gray-700 dark:text-white/80">
                                {allRuangan.findIndex((room: any) => room.id === activeRuangan.id) + 1}/{allRuangan.length}
                            </span>
                        </div>
                        <h1 className="truncate text-sm font-bold text-gray-900 leading-tight dark:text-white">{activeRuangan.nama_ruangan}</h1>
                    </div>

                    {/* Right: HUD Control Ribbon */}
                    <div className="flex scrollbar-none items-center gap-1.5 min-w-0 shrink overflow-x-auto md:overflow-visible">
                        {/* Audio Guide (only if available) */}
                        {activeRuangan?.audio_guide_url && (
                            <button
                                onClick={() => {
                                    if (roomAudioRef.current) {
                                        if (isPlayingRoomAudio) {
                                            roomAudioRef.current.pause();
                                            setIsPlayingRoomAudio(false);
                                        } else {
                                            roomAudioRef.current
                                                .play()
                                                .then(() => setIsPlayingRoomAudio(true))
                                                .catch(() => {});
                                        }
                                    }
                                }}
                                className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                                    isPlayingRoomAudio
                                        ? 'border-[#d85c3e] bg-[#d85c3e]/30 text-[#f1b19b] shadow-[0_0_15px_rgba(216,92,62,0.4)]'
                                        : 'border-black/15 bg-black/5 text-gray-600 hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/15 dark:hover:text-white'
                                }`}
                                title={isPlayingRoomAudio ? 'Matikan Audio Pemandu' : 'Putar Audio Pemandu'}
                            >
                                {isPlayingRoomAudio ? <Music2 className="h-3.5 w-3.5 animate-pulse" /> : <Music className="h-3.5 w-3.5" />}
                            </button>
                        )}

                        {/* Auto-Rotate Toggle */}
                        <button
                            onClick={toggleAutoRotate}
                            className={`flex h-9 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition ${
                                isAutoRotating
                                    ? 'border-[#d85c3e] bg-[#d85c3e]/30 text-[#f1b19b] shadow-[0_0_15px_rgba(216,92,62,0.4)]'
                                    : 'border-black/15 bg-black/5 text-gray-600 hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/15 dark:hover:text-white'
                            }`}
                            title="Tur Otomatis (Autopilot 360)"
                        >
                            <RotateCw className={`h-3.5 w-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
                            <span className="hidden md:inline">{isAutoRotating ? 'Auto On' : 'Auto'}</span>
                        </button>

                        {/* Snapshot Camera — hidden on very small screens */}
                        <button
                            onClick={takeSouvenirSnapshot}
                            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-black/5 text-gray-700 hover:bg-black/10 transition cursor-pointer dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/15"
                            title="Ambil Foto Kenangan 360°"
                        >
                            <Camera className="h-3.5 w-3.5 text-[#f1b19b]" />
                        </button>

                        {/* Gallery Button — hidden on very small screens */}
                        <button
                            onClick={() => setShowGallery(true)}
                            className="hidden sm:flex h-9 items-center gap-1.5 rounded-full border border-black/15 bg-black/5 px-2.5 text-xs font-semibold text-gray-700 hover:bg-black/10 transition cursor-pointer dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/15"
                            title="Galeri Foto & Video Museum"
                        >
                            <ImageIcon className="h-3.5 w-3.5 text-[#f1b19b]" />
                            <span className="hidden lg:inline">Galeri</span>
                            {museum.galleries && museum.galleries.length > 0 && (
                                <span className="rounded-full bg-[#d85c3e] px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    {museum.galleries.length}
                                </span>
                            )}
                        </button>

                        {/* Projection Mode Switcher */}
                        <div className="flex items-center p-0.5 rounded-full border border-black/15 bg-black/5 dark:border-white/15 dark:bg-white/5">
                            <button
                                type="button"
                                onClick={() => setProjectionMode('immersive')}
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                                    projectionMode === 'immersive' ? 'bg-[#d85c3e] text-white' : 'text-gray-600 hover:text-gray-900 dark:text-white/60 dark:hover:text-white'
                                }`}
                                title="Mode 360 Imersif"
                            >
                                <Scan className="h-3 w-3" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setProjectionMode('planet')}
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                                    projectionMode === 'planet' ? 'bg-[#d85c3e] text-white' : 'text-gray-600 hover:text-gray-900 dark:text-white/60 dark:hover:text-white'
                                }`}
                                title="Mode Globe / Little Planet"
                            >
                                <Circle className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* Divider + Theme Toggle pinned outside the scrollable ribbon so it stays visible on mobile */}
                    <span className="hidden md:block h-5 w-px mx-0.5 flex-shrink-0 bg-black/15 dark:bg-white/15" aria-hidden="true" />
                    <button
                        onClick={() => {
                            const next = appearance === 'dark' ? 'light' : appearance === 'light' ? 'system' : 'dark';
                            updateAppearance(next);
                        }}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-black/15 bg-black/5 text-gray-700 hover:bg-black/10 transition dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/15 dark:hover:text-white"
                        title={`Tema: ${appearance === 'dark' ? 'Gelap' : appearance === 'light' ? 'Terang' : 'Sistem'} — klik untuk ganti`}
                    >
                        <ThemeIcon className="h-3.5 w-3.5 text-[#d85c3e] dark:text-[#f1b19b]" />
                    </button>
                </div>

                {/* Camera Orientation Compass Widget (Top Right) */}
                <div className="pointer-events-none fixed top-20 right-6 z-[65] hidden md:flex items-center gap-3 glass-pill px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white/70">
                    <Compass className="h-4 w-4 text-[#f1b19b] animate-spin" style={{ animationDuration: '20s' }} />
                    <span>
                        YAW: {cameraAngle.yaw}° | PITCH: {cameraAngle.pitch}°
                    </span>
                </div>

                {/* Main Photo Sphere Viewer Container */}
                <div
                    ref={viewerRef}
                    className={`h-full w-full overflow-hidden transition-all duration-700 ${
                        panoramaLoaded ? 'opacity-100 scale-100' : 'opacity-20 scale-105'
                    }`}
                />

                {/* Panorama Loading Overlay */}
                {!panoramaLoaded && (
                    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#0b0d0f]/80 backdrop-blur-md">
                        <div className="flex flex-col items-center gap-3 text-center text-white">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#d85c3e]" />
                            <p className="font-semibold text-sm">Memuat Panorama 360°...</p>
                            <p className="text-xs text-white/50">{activeRuangan.nama_ruangan}</p>
                        </div>
                    </div>
                )}

                {/* Marker Info Dialog */}
                <Dialog
                    open={showInfoDialog}
                    onOpenChange={(open) => {
                        setShowInfoDialog(open);
                        if (!open) {
                            stopAudioNarration();
                            if (roomAudioDuckedByNarrationRef.current && roomAudioRef.current) {
                                try {
                                    roomAudioRef.current.volume = roomAudioPrevVolumeRef.current || 1;
                                } catch {}
                                roomAudioDuckedByNarrationRef.current = false;
                            }
                        }
                    }}
                >
                    <DialogContent className="z-[140] max-w-lg border-black/10 bg-white p-6 rounded-2xl dark:border-white/15 dark:bg-[#111417] text-gray-900 dark:text-[#f2efe8]">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="h-4 w-4 text-[#d85c3e]" />
                                <span className="museum-kicker text-[10px] text-[#f1b19b]">Artefak & Koleksi Bersejarah</span>
                            </div>
                            <DialogTitle className="text-xl font-black text-gray-900 dark:text-white">{selectedMarker?.judul}</DialogTitle>
                        </DialogHeader>

                        {selectedMarker?.deskripsi && (
                            <DialogDescription className="mt-3 text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-white/80">
                                {selectedMarker.deskripsi}
                            </DialogDescription>
                        )}

                        {/* Audio Narration Control Box */}
                        {selectedMarker?.audio_url && (
                            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#d85c3e]/30 bg-[#d85c3e]/10 p-3.5">
                                <div className="flex items-center gap-3">
                                    <Button
                                        size="sm"
                                        onClick={toggleAudioNarration}
                                        className="h-9 w-9 rounded-full bg-[#d85c3e] p-0 text-white hover:bg-[#b94830]"
                                    >
                                        {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                                    </Button>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                                            {isPlayingAudio ? 'Memutar Narasi Audio...' : 'Dengarkan Narasi Audio'}
                                        </p>
                                        <p className="text-[10px] text-gray-600 dark:text-white/60">Panduan suara otomatis artefak</p>
                                    </div>
                                </div>
                                {isPlayingAudio && (
                                    <div className="flex items-center gap-0.5">
                                        <span className="h-3 w-1 animate-pulse bg-[#f1b19b]" style={{ animationDelay: '0ms' }} />
                                        <span className="h-4 w-1 animate-pulse bg-[#f1b19b]" style={{ animationDelay: '150ms' }} />
                                        <span className="h-2 w-1 animate-pulse bg-[#f1b19b]" style={{ animationDelay: '300ms' }} />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={() => setShowInfoDialog(false)}
                                className="rounded-full bg-gray-900 text-xs font-semibold text-white px-5 hover:bg-gray-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                            >
                                Tutup Info
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Visitor Guide Dialog */}
                <Dialog open={showVisitorGuide} onOpenChange={setShowVisitorGuide}>
                    <DialogContent className="border-black/10 bg-white text-gray-900 z-[9999] flex max-h-[92dvh] w-[calc(100vw-1rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:w-[92vw] rounded-2xl dark:border-white/15 dark:bg-[#111417] dark:text-[#f2efe8]">
                        <DialogHeader className="relative shrink-0 overflow-hidden border-b border-white/15 bg-[#d85c3e] px-6 py-6 text-left">
                            <p className="relative text-[10px] font-bold tracking-widest text-white/80 uppercase">J-DiMS / Orientasi 360°</p>
                            <DialogTitle className="relative mt-1 text-2xl sm:text-3xl font-black text-white">
                                Panduan Tur Virtual
                            </DialogTitle>
                            <DialogDescription className="relative mt-1 text-xs text-white/80">
                                Gunakan kontrol di bawah untuk melihat sekeliling, mengeklik penanda artefak, dan mendengarkan suara pemandu.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-4">
                            {[
                                {
                                    icon: Hand,
                                    title: 'Rotasi Arah Pandang 360°',
                                    description: 'Geser layar atau drag mouse untuk memutar sudut pandang di dalam ruangan.',
                                },
                                {
                                    icon: ArrowRight,
                                    title: 'Penanda Navigasi Ruangan',
                                    description: 'Klik marker hijau berikon panah untuk melanjutkan tur ke ruangan berikutnya.',
                                },
                                {
                                    icon: MousePointerClick,
                                    title: 'Informasi & Artefak',
                                    description: 'Klik marker biru berikon info untuk membuka detail penjelasan dan narasi audio.',
                                },
                                {
                                    icon: Play,
                                    title: 'Pemutar Media Video',
                                    description: 'Klik penanda video satu kali untuk memutar tayangan visual langsung di dalam ruangan.',
                                },
                            ].map((item, index) => {
                                const GuideIcon = item.icon;
                                return (
                                    <div key={item.title} className="flex items-start gap-4 border-b border-black/10 pb-3 dark:border-white/10">
                                        <span className="font-mono text-xs font-bold text-[#f1b19b] pt-1">
                                            #{String(index + 1).padStart(2, '0')}
                                        </span>
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#d85c3e]/20 text-[#f1b19b]">
                                            <GuideIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</h4>
                                            <p className="text-xs text-gray-600 leading-relaxed dark:text-white/70">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between p-4 border-t border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
                            <Button
                                variant="ghost"
                                onClick={handleCloseVisitorGuide}
                                className="text-xs text-gray-500 hover:text-gray-900 dark:text-white/60 dark:hover:text-white"
                            >
                                Jangan tampilkan lagi
                            </Button>
                            <Button
                                onClick={() => setShowVisitorGuide(false)}
                                className="rounded-full bg-[#d85c3e] px-6 text-xs font-bold text-white hover:bg-[#b94830]"
                            >
                                Mulai Tur Virtual
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Museum Info Sidebar */}
                <MuseumInfoSidebar
                    museum={museum}
                    allRuangan={allRuangan}
                    activeRuangan={activeRuangan}
                    onRoomChange={switchToRoom}
                    isOpen={showSidebar}
                    onClose={() => setShowSidebar(false)}
                    onOpenGuide={() => setShowVisitorGuide(true)}
                    onHoverRoom={preloadPanoramaUrl}
                />
                {/* Museum Media Gallery Modal */}
                <GalleryModal
                    isOpen={showGallery}
                    onClose={() => setShowGallery(false)}
                    museumName={museum.title}
                    galleries={museum.galleries || []}
                />
            </div>
        </>
    );
}
