<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\Museum;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GalleryController extends Controller
{
    private function deleteFileIfExists(?string $url): void
    {
        if (!$url) return;
        $publicPath = public_path();
        $parsed = parse_url($url, PHP_URL_PATH);
        if (!$parsed) return;
        $relative = ltrim($parsed, '/');
        if (!str_starts_with($relative, 'uploads/gallery/')) return;
        $full = $publicPath . DIRECTORY_SEPARATOR . $relative;
        if (is_file($full)) {
            @unlink($full);
        }
    }

    private function resolveThumbnailUrl(string $mediaType, string $mediaUrl, ?string $thumbnailUrl): ?string
    {
        if (!empty($thumbnailUrl)) {
            return $thumbnailUrl;
        }

        if ($mediaType === 'image') {
            return $mediaUrl;
        }

        if ($mediaType === 'video') {
            if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $mediaUrl, $matches)) {
                return 'https://img.youtube.com/vi/' . $matches[1] . '/hqdefault.jpg';
            }
        }

        return $thumbnailUrl;
    }

    public function index(Museum $museum)
    {
        $museum->load('galleries');
        return Inertia::render('gallery/index', [
            'museum' => $museum,
            'galleries' => $museum->galleries,
        ]);
    }

    public function store(Request $request, Museum $museum)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'media_type' => 'required|in:image,video',
            'media_url' => 'required|string',
            'thumbnail_url' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        $thumbnail = $this->resolveThumbnailUrl($validated['media_type'], $validated['media_url'], $validated['thumbnail_url'] ?? null);

        $museum->galleries()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'media_type' => $validated['media_type'],
            'media_url' => $validated['media_url'],
            'thumbnail_url' => $thumbnail,
            'order' => $validated['order'] ?? 0,
        ]);

        return redirect()->back()->with('success', 'Media galeri berhasil ditambahkan.');
    }

    public function update(Request $request, Gallery $gallery)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'media_type' => 'required|in:image,video',
            'media_url' => 'required|string',
            'thumbnail_url' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        $thumbnail = $this->resolveThumbnailUrl($validated['media_type'], $validated['media_url'], $validated['thumbnail_url'] ?? null);

        $gallery->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'media_type' => $validated['media_type'],
            'media_url' => $validated['media_url'],
            'thumbnail_url' => $thumbnail,
            'order' => $validated['order'] ?? $gallery->order,
        ]);

        return redirect()->back()->with('success', 'Media galeri berhasil diperbarui.');
    }

    public function destroy(Gallery $gallery)
    {
        $this->deleteFileIfExists($gallery->media_url);
        $this->deleteFileIfExists($gallery->thumbnail_url);
        $gallery->delete();

        return redirect()->back()->with('success', 'Media galeri berhasil dihapus.');
    }

    public function uploadMedia(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,webp,gif,mp4,webm,ogg,mov|max:102400', // 100MB max
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

            $uploadPath = public_path('uploads/gallery');
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }

            $file->move($uploadPath, $filename);
            $url = asset('uploads/gallery/' . $filename);

            return response()->json([
                'url' => $url,
                'path' => '/uploads/gallery/' . $filename,
            ]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }
}
