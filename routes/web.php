<?php

use App\Http\Controllers\Admin\MuseumController;
use App\Http\Controllers\Admin\RuanganController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FrontendController;
use App\Http\Controllers\StatisticsController;
use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return redirect()->route('login');
// })->name('home');

Route::get('/glitchtip/error', function () {
    throw new Exception('My first GlitchTip error!');
});

use Illuminate\Support\Facades\Artisan;
use Illuminate\Http\Request;

// Helper API endpoint to run artisan commands via URL
Route::get('/artisan/migrate-fresh', function (Request $request) {
    $secretKey = env('ARTISAN_KEY', 'sendang-secret-123');

    if ($request->query('key') !== $secretKey) {
        return response()->json([
            'status' => 'error',
            'message' => 'Unauthorized: Invalid or missing security key.',
        ], 403);
    }

    try {
        Artisan::call('migrate:fresh', [
            '--seed' => true,
            '--force' => true,
        ]);

        $output = Artisan::output();

        return response()->json([
            'status' => 'success',
            'message' => 'Database migrated fresh and seeded successfully!',
            'output' => array_values(array_filter(explode("\n", str_replace("\r", "", $output)))),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

Route::get('/', [FrontendController::class, 'index'])->name('home');

// Public panorama viewer routes
Route::get('/museum/{museum}', [FrontendController::class, 'showPanorama'])
    ->name('frontend.panorama')
    ->where(['museum' => '[0-9]+']);

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');

    // Statistics
    Route::get('statistics', [StatisticsController::class, 'index'])->name('statistics.index');


    Route::prefix('user')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('user.index');
        Route::post('store', [UserController::class, 'store'])->name('user.store');
        Route::post('delete-multiple', [UserController::class, 'deleteMultiple'])->name('user.delete-multiple');
        Route::post('delete', [UserController::class, 'delete'])->name('user.delete');
        Route::post('update', [UserController::class, 'update'])->name('user.update');
    });

    Route::prefix('museum')->group(function () {
        Route::get('/', [MuseumController::class, 'index'])->name('museum.index');
        Route::get('create', [MuseumController::class, 'create'])->name('museum.create');
        Route::post('store', [MuseumController::class, 'store'])->name('museum.store');
        Route::get('edit/{museum}', [MuseumController::class, 'edit'])->name('museum.edit');
        Route::post('update/{museum}', [MuseumController::class, 'update'])->name('museum.update');
        Route::post('delete/{museum}', [MuseumController::class, 'destroy'])->name('museum.destroy');
        Route::post('delete-multiple', [MuseumController::class, 'deleteMultiple'])->name('museum.delete-multiple');
        Route::post('upload-background', [MuseumController::class, 'uploadBackground'])->name('museum.upload-background');

        // Overlays
        Route::post('{museum}/overlays', [MuseumController::class, 'storeOverlay'])->name('museum.overlays.store');
        Route::post('overlays/{overlay}', [MuseumController::class, 'updateOverlay'])->name('museum.overlays.update');
        Route::post('overlays/{overlay}/delete', [MuseumController::class, 'deleteOverlay'])->name('museum.overlays.delete');

        // Ruangan routes nested under museum
        Route::prefix('{museum}/ruangan')->where(['museum' => '[0-9]+', 'ruangan' => '[0-9]+'])->group(function () {
            Route::get('/', [RuanganController::class, 'index'])->name('museum.ruangan.index');
            Route::get('create', [RuanganController::class, 'create'])->name('museum.ruangan.create');
            Route::post('store', [RuanganController::class, 'store'])->name('museum.ruangan.store');
            Route::get('edit/{ruangan}', [RuanganController::class, 'edit'])->name('museum.ruangan.edit');
            Route::post('update/{ruangan}', [RuanganController::class, 'update'])->name('museum.ruangan.update');
            Route::post('delete/{ruangan}', [RuanganController::class, 'destroy'])->name('museum.ruangan.destroy');
            Route::post('delete-multiple', [RuanganController::class, 'deleteMultiple'])->name('museum.ruangan.delete-multiple');
            Route::post('upload-panorama', [RuanganController::class, 'uploadPanorama'])->name('museum.ruangan.upload-panorama');
            Route::post('upload-audio-guide', [RuanganController::class, 'uploadAudioGuide'])->name('museum.ruangan.upload-audio-guide');

            // Markers
            Route::get('{ruangan}/markers', [RuanganController::class, 'manageMarkers'])->name('museum.ruangan.markers.manage');
            Route::post('{ruangan}/markers', [RuanganController::class, 'storeMarker'])->name('museum.ruangan.markers.store');
            Route::post('{ruangan}/markers/{marker}', [RuanganController::class, 'updateMarker'])->name('museum.ruangan.markers.update')->where('marker', '[0-9]+');
            Route::delete('{ruangan}/markers/{marker}/media', [RuanganController::class, 'deleteMarkerMedia'])->name('museum.ruangan.markers.delete-media')->where('marker', '[0-9]+');
            Route::delete('{ruangan}/markers/{marker}', [RuanganController::class, 'destroyMarker'])->name('museum.ruangan.markers.destroy')->where('marker', '[0-9]+');
        });

        // Gallery routes
        Route::prefix('gallery')->group(function () {
            Route::post('update/{gallery}', [\App\Http\Controllers\Admin\GalleryController::class, 'update'])->name('museum.gallery.update');
            Route::post('delete/{gallery}', [\App\Http\Controllers\Admin\GalleryController::class, 'destroy'])->name('museum.gallery.destroy');
        });

        Route::prefix('{museum}/gallery')->where(['museum' => '[0-9]+'])->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\GalleryController::class, 'index'])->name('museum.gallery.index');
            Route::post('store', [\App\Http\Controllers\Admin\GalleryController::class, 'store'])->name('museum.gallery.store');
            Route::post('upload-media', [\App\Http\Controllers\Admin\GalleryController::class, 'uploadMedia'])->name('museum.gallery.upload-media');
        });
    });

    Route::prefix('ruangan')->group(function () {
        Route::get('/', [RuanganController::class, 'index'])->name('ruangan.index');
        Route::get('create', [RuanganController::class, 'create'])->name('ruangan.create');
        Route::post('store', [RuanganController::class, 'store'])->name('ruangan.store');
        Route::get('edit/{ruangan}', [RuanganController::class, 'edit'])->name('ruangan.edit');
        Route::post('update/{ruangan}', [RuanganController::class, 'update'])->name('ruangan.update');
        Route::post('delete/{ruangan}', [RuanganController::class, 'destroy'])->name('ruangan.destroy');
        Route::post('delete-multiple', [RuanganController::class, 'deleteMultiple'])->name('ruangan.delete-multiple');
        Route::post('upload-panorama', [RuanganController::class, 'uploadPanorama'])->name('ruangan.upload-panorama');
        Route::post('upload-audio-guide', [RuanganController::class, 'uploadAudioGuide'])->name('ruangan.upload-audio-guide');

        // Markers
        Route::post('{ruangan}/markers', [RuanganController::class, 'storeMarker'])->name('ruangan.markers.store');
        Route::post('markers/{marker}', [RuanganController::class, 'updateMarker'])->name('ruangan.markers.update');
        Route::post('markers/{marker}/delete', [RuanganController::class, 'deleteMarker'])->name('ruangan.markers.delete');
    });

    Route::prefix('settings')->group(function () {
        Route::post('update', [SettingController::class, 'update'])->name('settings.update');
        Route::get('/', [SettingController::class, 'getSettings'])->name('settings.get');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
