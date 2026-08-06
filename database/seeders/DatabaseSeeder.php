<?php

namespace Database\Seeders;

use App\Models\Gallery;
use App\Models\MarkerRuangan;
use App\Models\Museum;
use App\Models\Ruangan;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(['email' => 'admin@sendang.test'], [
            'name' => 'Admin Sendang',
            'password' => Hash::make('password'),
        ]);

        Setting::updateOrCreate(['id' => 1], [
            'style' => 'column',
        ]);

        // Museum 1: Museum Digital Jember
        $museum1 = Museum::updateOrCreate(['slug' => 'museum-digital-jember'], [
            'title' => 'Museum Digital Jember',
            'label' => 'Koleksi Utama',
            'subtitle' => 'Menjelajahi benda, cerita, dan ruang budaya Jember dari sudut pandang 360 derajat.',
            'content' => "Koleksi digital ini mempertemukan arsip lokal dengan pengalaman ruang yang dapat dijelajahi.\n\nPilih penanda informasi untuk membaca konteks koleksi, atau gunakan penanda navigasi untuk berpindah ruangan.",
            'background_url' => '/uploads/ruangan/panorama/20260805_145625_kn1adxxN.jpg',
            'cta_href' => null,
            'cta_label' => 'Mulai Jelajah',
            'align' => 'left',
            'latitude' => -8.1724,
            'longitude' => 113.7003,
            'address' => 'Kabupaten Jember, Jawa Timur',
            'opening_hours' => 'Akses digital 24 jam',
            'contact_person' => 'Tim Sendang',
            'distance_from_city_center' => 'Pusat Kota Jember',
            'ticket_price' => 'Gratis',
            'google_maps_link' => 'https://www.google.com/maps?q=-8.1724,113.7003',
        ]);

        $lobby1 = Ruangan::updateOrCreate(['slug' => 'lobi-koleksi'], [
            'museum_id' => $museum1->id,
            'nama_ruangan' => 'Lobi Koleksi Utama',
            'is_main' => true,
            'panorama_url' => '/uploads/ruangan/panorama/20260805_145625_kn1adxxN.jpg',
            'audio_guide_url' => null,
        ]);

        $gallery1 = Ruangan::updateOrCreate(['slug' => 'galeri-warisan'], [
            'museum_id' => $museum1->id,
            'nama_ruangan' => 'Galeri Warisan Budaya',
            'is_main' => false,
            'panorama_url' => '/uploads/ruangan/panorama/20260805_145625_kn1adxxN.jpg',
            'audio_guide_url' => null,
        ]);

        MarkerRuangan::updateOrCreate(
            ['ruangan_id' => $lobby1->id, 'judul' => 'Tentang Koleksi Utama'],
            [
                'deskripsi' => 'Titik awal untuk mengenal koleksi digital dan cara membaca penanda di dalam ruang.',
                'type' => 'info',
                'navigation_target' => null,
                'position_yaw' => -0.55,
                'position_pitch' => 0.05,
            ],
        );

        MarkerRuangan::updateOrCreate(
            ['ruangan_id' => $lobby1->id, 'judul' => 'Masuk Galeri Warisan'],
            [
                'deskripsi' => 'Lanjutkan kunjungan ke Galeri Warisan Budaya.',
                'type' => 'navigation',
                'navigation_target' => $gallery1->id,
                'position_yaw' => 0.72,
                'position_pitch' => -0.18,
            ],
        );

        MarkerRuangan::updateOrCreate(
            ['ruangan_id' => $gallery1->id, 'judul' => 'Kembali ke Lobi Utama'],
            [
                'deskripsi' => 'Kembali ke titik awal kunjungan Lobi Utama.',
                'type' => 'navigation',
                'navigation_target' => $lobby1->id,
                'position_yaw' => -1.1,
                'position_pitch' => -0.12,
            ],
        );

        // Seed galleries for Museum 1
        Gallery::updateOrCreate(
            ['museum_id' => $museum1->id, 'title' => 'Arca Batu Megalitikum Jember'],
            [
                'description' => 'Penemuan arca megalitikum sejarah di kawasan pegunungan Jember abad pertengahan.',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=600&q=80',
                'order' => 1,
            ]
        );

        Gallery::updateOrCreate(
            ['museum_id' => $museum1->id, 'title' => 'Dokumentasi Tur Virtual Museum'],
            [
                'description' => 'Video dokumentasi singkat pengenalan koleksi budaya digital Jember.',
                'media_type' => 'video',
                'media_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=600&q=80',
                'order' => 2,
            ]
        );

        // Museum 2: Museum Tembakau Jember
        $museum2 = Museum::updateOrCreate(['slug' => 'museum-tembakau-jember'], [
            'title' => 'Museum Tembakau & Budaya Jember',
            'label' => 'Museum Tematik',
            'subtitle' => 'Menyimpan rekam jejak emas komoditas tembakau dan kekayaan seni budaya lokal khas Jember.',
            'content' => "Museum Tembakau Jember menyajikan koleksi sejarah industri tembakau Besuki Na-Oogst, peralatan tradisional pengolahan tembakau, beragam sampel daun tembakau kualitas ekspor, serta ragam busana dan motif batik tembakau khas Jember.\n\nJelajahi setiap sudut ruangan pameran melalui tur virtual interaktif 360° ini.",
            'background_url' => '/uploads/ruangan/panorama/20260805_145625_kn1adxxN.jpg',
            'cta_href' => null,
            'cta_label' => 'Jelajahi Museum Tembakau',
            'align' => 'right',
            'latitude' => -8.1689,
            'longitude' => 113.7025,
            'address' => 'Jl. Kalimantan No. 1, Sumbersari, Kabupaten Jember',
            'opening_hours' => 'Selasa - Minggu (08:00 - 15:30 WIB)',
            'contact_person' => 'Pengelola Museum Tembakau',
            'distance_from_city_center' => '2 km dari Alun-Alun Jember',
            'ticket_price' => 'Gratis / Donasi',
            'google_maps_link' => 'https://www.google.com/maps?q=-8.1689,113.7025',
        ]);

        $lobby2 = Ruangan::updateOrCreate(['slug' => 'ruang-pameran-tembakau'], [
            'museum_id' => $museum2->id,
            'nama_ruangan' => 'Ruang Pamer Tembakau Na-Oogst',
            'is_main' => true,
            'panorama_url' => '/uploads/ruangan/panorama/20260805_145625_kn1adxxN.jpg',
            'audio_guide_url' => null,
        ]);

        $gallery2 = Ruangan::updateOrCreate(['slug' => 'ruang-artifak-budaya'], [
            'museum_id' => $museum2->id,
            'nama_ruangan' => 'Ruang Artifak & Batik Tembakau',
            'is_main' => false,
            'panorama_url' => '/uploads/ruangan/panorama/20260805_145625_kn1adxxN.jpg',
            'audio_guide_url' => null,
        ]);

        MarkerRuangan::updateOrCreate(
            ['ruangan_id' => $lobby2->id, 'judul' => 'Sejarah Tembakau Besuki Na-Oogst'],
            [
                'deskripsi' => 'Tembakau Besuki Na-Oogst adalah tembakau kualitas mutiara hitam legendaris dari Jember yang diekspor sebagai bahan cerutu terbaik dunia.',
                'type' => 'info',
                'navigation_target' => null,
                'position_yaw' => -0.35,
                'position_pitch' => 0.08,
            ],
        );

        MarkerRuangan::updateOrCreate(
            ['ruangan_id' => $lobby2->id, 'judul' => 'Ke Ruang Batik & Artifak'],
            [
                'deskripsi' => 'Berpindah ke ruang pameran batik tembakau dan koleksi artifak bersejarah.',
                'type' => 'navigation',
                'navigation_target' => $gallery2->id,
                'position_yaw' => 0.85,
                'position_pitch' => -0.10,
            ],
        );

        MarkerRuangan::updateOrCreate(
            ['ruangan_id' => $gallery2->id, 'judul' => 'Kembali ke Ruang Tembakau'],
            [
                'deskripsi' => 'Kembali ke Ruang Pamer Tembakau Utama.',
                'type' => 'navigation',
                'navigation_target' => $lobby2->id,
                'position_yaw' => -0.9,
                'position_pitch' => -0.15,
            ],
        );

        // Seed galleries for Museum 2
        Gallery::updateOrCreate(
            ['museum_id' => $museum2->id, 'title' => 'Daun Tembakau Besuki Na-Oogst Legendaris'],
            [
                'description' => 'Daun tembakau pilihan kualitas ekspor premium untuk balutan cerutu terbaik dunia.',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
                'order' => 1,
            ]
        );

        Gallery::updateOrCreate(
            ['museum_id' => $museum2->id, 'title' => 'Proses Pengeringan Tembakau Tradisional'],
            [
                'description' => 'Proses pengeringan daun tembakau di dalam gudang atap bambu khas Jember.',
                'media_type' => 'image',
                'media_url' => 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
                'order' => 2,
            ]
        );
    }
}
