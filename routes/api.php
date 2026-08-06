<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MuseumApiController;
use App\Http\Controllers\Api\VisitorLogController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Museum API Routes
Route::prefix('museums')->group(function () {
    // Get all museums with relations
    Route::get('/', [MuseumApiController::class, 'index']);

    // Get museums with statistics
    Route::get('/stats', [MuseumApiController::class, 'withStats']);

    // Get single museum by ID
    Route::get('/{id}', [MuseumApiController::class, 'show'])->where('id', '[0-9]+');

    // Get museum by slug
    Route::get('/slug/{slug}', [MuseumApiController::class, 'showBySlug']);
});

// Visitor Log API Routes
Route::post('/visitor-log', [VisitorLogController::class, 'log']);

// Statistics API Routes (authenticated)
Route::prefix('statistics')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [VisitorLogController::class, 'index']);
    Route::get('/daily', [VisitorLogController::class, 'daily']);
    Route::get('/weekly', [VisitorLogController::class, 'weekly']);
    Route::get('/monthly', [VisitorLogController::class, 'monthly']);
    Route::get('/yearly', [VisitorLogController::class, 'yearly']);
});
