import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Film, Image as ImageIcon, Plus, Trash2, Upload, Sparkles, Pencil, Eye } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GalleryItem {
    id: number;
    museum_id: number;
    title: string;
    description?: string;
    media_type: 'image' | 'video';
    media_url: string;
    thumbnail_url?: string;
    order: number;
}

interface Museum {
    id: number;
    title: string;
    label?: string;
}

interface Props {
    museum: Museum;
    galleries: GalleryItem[];
}

export default function GalleryManagement({ museum, galleries }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Museum', href: '/museum' },
        { title: `Galeri ${museum.title}`, href: `/museum/${museum.id}/gallery` },
    ];

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
    const [uploading, setUploading] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        media_type: 'image' as 'image' | 'video',
        media_url: '',
        thumbnail_url: '',
        order: 0,
    });

    const getThumbnailUrl = (item: GalleryItem) => {
        if (item.thumbnail_url) return item.thumbnail_url;
        if (item.media_type === 'image') return item.media_url;
        if (item.media_type === 'video') {
            const match = item.media_url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (match) {
                return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
            }
        }
        return item.media_url;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(route('museum.gallery.upload-media', museum.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: formData,
            });

            const result = await response.json();
            if (response.ok && result.url) {
                setData(prev => ({
                    ...prev,
                    media_url: result.url,
                    thumbnail_url: prev.media_type === 'image' ? result.url : prev.thumbnail_url
                }));
                toast.success('Media berhasil diunggah!');
            } else {
                toast.error(result.error || 'Gagal mengunggah file.');
            }
        } catch (err) {
            toast.error('Terjadi kesalahan saat mengunggah.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            router.post(
                route('museum.gallery.update', editingItem.id),
                { ...data },
                {
                    onSuccess: () => {
                        toast.success('Media galeri berhasil diperbarui!');
                        setEditingItem(null);
                        reset();
                    },
                    onError: () => toast.error('Gagal memperbarui galeri.'),
                }
            );
        } else {
            post(route('museum.gallery.store', museum.id), {
                onSuccess: () => {
                    toast.success('Media galeri berhasil ditambahkan!');
                    setIsCreateOpen(false);
                    reset();
                },
                onError: () => toast.error('Gagal menambahkan galeri.'),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus media galeri ini?')) return;
        router.post(
            route('museum.gallery.delete', id),
            {},
            {
                onSuccess: () => toast.success('Media galeri telah dihapus.'),
                onError: () => toast.error('Gagal menghapus media galeri.'),
            }
        );
    };

    const openEdit = (item: GalleryItem) => {
        setEditingItem(item);
        setData({
            title: item.title,
            description: item.description || '',
            media_type: item.media_type,
            media_url: item.media_url,
            thumbnail_url: item.thumbnail_url || '',
            order: item.order || 0,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kelola Galeri Media — ${museum.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Title Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d85c3e]">
                            <Sparkles className="h-4 w-4" />
                            <span>Galeri Media Museum</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{museum.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola koleksi foto dan video digital untuk ditampilkan di Panorama 360 viewer.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('museum.index'))}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Museum
                        </Button>
                        <Button
                            onClick={() => {
                                reset();
                                setEditingItem(null);
                                setIsCreateOpen(true);
                            }}
                            className="gap-2 bg-[#d85c3e] text-white hover:bg-[#b94830]"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Media
                        </Button>
                    </div>
                </div>

                {/* Media Items List Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {galleries.length === 0 ? (
                        <div className="col-span-full flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
                            <ImageIcon className="mb-3 h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-bold">Belum ada media galeri</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Klik tombol "Tambah Media" di atas untuk menambahkan foto atau video baru.
                            </p>
                            <Button
                                onClick={() => {
                                    reset();
                                    setEditingItem(null);
                                    setIsCreateOpen(true);
                                }}
                                className="gap-2 bg-[#d85c3e] text-white hover:bg-[#b94830]"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Media Pertama
                            </Button>
                        </div>
                    ) : (
                        galleries.map((item) => (
                            <div
                                key={item.id}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
                            >
                                <div 
                                    onClick={() => setPreviewItem(item)}
                                    className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
                                >
                                    {item.media_type === 'video' && !item.thumbnail_url && !item.media_url.includes('youtube') && !item.media_url.includes('youtu.be') ? (
                                        <video
                                            src={item.media_url}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                            muted
                                            preload="metadata"
                                        />
                                    ) : (
                                        <img
                                            src={getThumbnailUrl(item)}
                                            alt={item.title}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80';
                                            }}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-900 shadow-md backdrop-blur-sm">
                                            <Eye className="h-3.5 w-3.5 text-[#d85c3e]" /> Preview
                                        </span>
                                    </div>
                                    <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold shadow-sm">
                                        {item.media_type === 'video' ? (
                                            <>
                                                <Film className="h-3 w-3 text-red-500" /> Video
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="h-3 w-3 text-blue-500" /> Foto
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div className="flex flex-1 flex-col p-4">
                                    <h3 className="font-bold line-clamp-1">{item.title}</h3>
                                    {item.description && (
                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                            {item.description}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPreviewItem(item)}
                                            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Preview
                                        </Button>
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEdit(item)}
                                                className="h-8 gap-1 text-xs"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(item.id)}
                                                className="h-8 gap-1 text-xs"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Hapus
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog
                open={isCreateOpen || editingItem !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateOpen(false);
                        setEditingItem(null);
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit Media Galeri' : 'Tambah Media Galeri Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Judul Media</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Contoh: Koleksi Arca Batu Abad ke-14"
                                required
                            />
                            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="media_type">Tipe Media</Label>
                            <Select
                                value={data.media_type}
                                onValueChange={(val: 'image' | 'video') => setData('media_type', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="image">Foto / Gambar</SelectItem>
                                    <SelectItem value="video">Video (MP4 / YouTube)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="media_url">URL Media atau Upload File</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="media_url"
                                    value={data.media_url}
                                    onChange={(e) => setData('media_url', e.target.value)}
                                    placeholder="https://... atau upload file"
                                    required
                                />
                                <label className="flex h-9 items-center justify-center rounded-md border border-input bg-muted px-3 text-xs font-semibold hover:bg-accent cursor-pointer">
                                    <Upload className="h-4 w-4 mr-1" />
                                    {uploading ? 'Uploading...' : 'Browse'}
                                    <input
                                        type="file"
                                        accept={data.media_type === 'video' ? 'video/*' : 'image/*'}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                            {errors.media_url && <p className="text-xs text-red-500">{errors.media_url}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description">Deskripsi Penjelasan (Opsional)</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Tuliskan cerita / konteks sejarah media ini..."
                                rows={3}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsCreateOpen(false);
                                    setEditingItem(null);
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || uploading}
                                className="bg-[#d85c3e] text-white hover:bg-[#b94830]"
                            >
                                {editingItem ? 'Simpan Perubahan' : 'Tambah Media'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Media Preview Modal */}
            {previewItem && (
                <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
                    <DialogContent className="max-w-3xl overflow-hidden p-0 border-black/10 dark:border-white/15 bg-white dark:bg-[#111417] text-gray-900 dark:text-white rounded-2xl">
                        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-[#d85c3e]/10 px-2.5 py-0.5 text-xs font-bold text-[#d85c3e] uppercase">
                                    {previewItem.media_type === 'video' ? 'Video' : 'Foto / Gambar'}
                                </span>
                                <DialogTitle className="text-base font-bold truncate max-w-md">
                                    {previewItem.title}
                                </DialogTitle>
                            </div>
                        </DialogHeader>

                        <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[75vh] overflow-hidden">
                            {previewItem.media_type === 'video' ? (
                                (() => {
                                    const match = previewItem.media_url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                                    if (match) {
                                        return (
                                            <iframe
                                                src={`https://www.youtube.com/embed/${match[1]}?autoplay=1`}
                                                className="w-full aspect-video rounded-xl"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        );
                                    }
                                    return (
                                        <video
                                            src={previewItem.media_url}
                                            controls
                                            autoPlay
                                            className="w-full max-h-[70vh] rounded-xl object-contain"
                                        />
                                    );
                                })()
                            ) : (
                                <img
                                    src={previewItem.media_url}
                                    alt={previewItem.title}
                                    className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                                />
                            )}
                        </div>

                        {previewItem.description && (
                            <div className="p-4 border-t text-xs text-muted-foreground leading-relaxed bg-muted/30">
                                <p className="font-semibold text-foreground mb-1">Deskripsi:</p>
                                <p className="whitespace-pre-line">{previewItem.description}</p>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
