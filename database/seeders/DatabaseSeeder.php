<?php

namespace Database\Seeders;

use App\Models\Museum;
use App\Models\MarkerRuangan;
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
        User::updateOrCreate(['email' => 'admin@jdims.test'], [
            'name' => 'Admin J-DiMS',
            'password' => Hash::make('password'),
        ]);

        Setting::updateOrCreate(['id' => 1], [
            'style' => 'column',
        ]);

        $museum = Museum::updateOrCreate(['slug' => 'museum-digital-jember'], [
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
            'contact_person' => 'Tim J-DiMS',
            'distance_from_city_center' => 'Pusat Kota Jember',
            'ticket_price' => 'Gratis',
            'google_maps_link' => 'https://www.google.com/maps?q=-8.1724,113.7003',
        ]);

        $lobby = Ruangan::updateOrCreate(['slug' => 'lobi-koleksi'], [
            'museum_id' => $museum->id,
            'nama_ruangan' => 'Lobi Koleksi',
            'is_main' => true,
            'panorama_url' => '/uploads/ruangan/panorama/20260805_145625_kn1adxxN.jpg',
            'audio_guide_url' => null,
        ]);

        $gallery = Ruangan::updateOrCreate(['slug' => 'galeri-warisan'], [
            'museum_id' => $museum->id,
            'nama_ruangan' => 'Galeri Warisan',
            'is_main' => false,
            'panorama_url' => '/uploads/ruangan/panorama/20260805_145625_kn1adxxN.jpg',
            'audio_guide_url' => null,
        ]);

        MarkerRuangan::updateOrCreate(
            ['ruangan_id' => $lobby->id, 'judul' => 'Tentang Koleksi'],
            [
                'deskripsi' => 'Titik awal untuk mengenal koleksi digital dan cara membaca penanda di dalam ruang.',
                'type' => 'info',
                'navigation_target' => null,
                'position_yaw' => -0.55,
                'position_pitch' => 0.05,
            ],
        );

        MarkerRuangan::updateOrCreate(
            ['ruangan_id' => $lobby->id, 'judul' => 'Masuk Galeri Warisan'],
            [
                'deskripsi' => 'Lanjutkan kunjungan ke Galeri Warisan.',
                'type' => 'navigation',
                'navigation_target' => $gallery->id,
                'position_yaw' => 0.72,
                'position_pitch' => -0.18,
            ],
        );

        MarkerRuangan::updateOrCreate(
            ['ruangan_id' => $gallery->id, 'judul' => 'Kembali ke Lobi'],
            [
                'deskripsi' => 'Kembali ke titik awal kunjungan.',
                'type' => 'navigation',
                'navigation_target' => $lobby->id,
                'position_yaw' => -1.1,
                'position_pitch' => -0.12,
            ],
        );
    }
}
