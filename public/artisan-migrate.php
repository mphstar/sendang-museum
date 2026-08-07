<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Artisan;

define('LARAVEL_START', microtime(true));

// Register the Composer autoloader
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require __DIR__ . '/../vendor/autoload.php';
} else {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Composer vendor autoload not found.']);
    exit;
}

// Bootstrap Laravel Framework
/** @var Application $app */
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Bootstrap Console Kernel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: application/json');

$key = $_GET['key'] ?? '';
$secretKey = env('ARTISAN_KEY', 'sendang-secret-123');

if ($key !== $secretKey) {
    http_response_code(403);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized: Invalid or missing security key parameter ?key=...',
    ], JSON_PRETTY_PRINT);
    exit;
}

try {
    // Clear route and config cache so new routes are registered
    Artisan::call('route:clear');
    Artisan::call('config:clear');

    // Run migrate:fresh --seed --force
    Artisan::call('migrate:fresh', [
        '--seed' => true,
        '--force' => true,
    ]);

    $output = Artisan::output();

    echo json_encode([
        'status' => 'success',
        'message' => 'Database migrated fresh and seeded successfully!',
        'output' => array_values(array_filter(explode("\n", str_replace("\r", "", $output)))),
    ], JSON_PRETTY_PRINT);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
