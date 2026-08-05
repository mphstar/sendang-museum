<?php

use App\Models\Museum;
use App\Models\Ruangan;
use Database\Seeders\DatabaseSeeder;

it('seeds a navigable museum panorama experience', function () {
    $this->seed(DatabaseSeeder::class);

    $museum = Museum::query()->where('slug', 'museum-digital-jember')->firstOrFail();
    $rooms = Ruangan::query()->where('museum_id', $museum->id)->with('markers')->get();
    $markers = $rooms->flatMap(fn (Ruangan $room) => $room->markers);

    expect($rooms)->toHaveCount(2)
        ->and($rooms->where('is_main', true))->toHaveCount(1)
        ->and($markers)->toHaveCount(3)
        ->and($markers->where('type', 'navigation'))->toHaveCount(2);
});
