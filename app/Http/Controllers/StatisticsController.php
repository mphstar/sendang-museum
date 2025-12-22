<?php

namespace App\Http\Controllers;

use App\Models\VisitorLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->get('filter', 'daily');
        $startDate = $request->get('start');
        $endDate = $request->get('end');

        $query = VisitorLog::query();

        // Apply date filter
        switch ($filter) {
            case 'daily':
                $query->whereDate('created_at', Carbon::today());
                $label = 'Hari Ini';
                break;
            case 'weekly':
                $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                $label = 'Minggu Ini';
                break;
            case 'monthly':
                $query->whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year);
                $label = 'Bulan Ini';
                break;
            case 'yearly':
                $query->whereYear('created_at', Carbon::now()->year);
                $label = 'Tahun Ini';
                break;
            case 'range':
                if ($startDate && $endDate) {
                    $query->whereBetween('created_at', [
                        Carbon::parse($startDate)->startOfDay(),
                        Carbon::parse($endDate)->endOfDay()
                    ]);
                    $label = Carbon::parse($startDate)->format('d M Y') . ' - ' . Carbon::parse($endDate)->format('d M Y');
                } else {
                    $label = 'Custom Range';
                }
                break;
            default:
                $label = 'Semua';
        }

        $totalVisits = $query->count();
        $uniqueVisitors = (clone $query)->distinct('session_id')->count('session_id');

        // Get visits by museum
        $visitsByMuseum = VisitorLog::query()
            ->when($filter !== 'range', function ($q) use ($filter) {
                switch ($filter) {
                    case 'daily':
                        $q->whereDate('created_at', Carbon::today());
                        break;
                    case 'weekly':
                        $q->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                        break;
                    case 'monthly':
                        $q->whereMonth('created_at', Carbon::now()->month)
                            ->whereYear('created_at', Carbon::now()->year);
                        break;
                    case 'yearly':
                        $q->whereYear('created_at', Carbon::now()->year);
                        break;
                }
            })
            ->when($filter === 'range' && $startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay()
                ]);
            })
            ->whereNotNull('museum_id')
            ->select('museum_id', DB::raw('count(*) as visits'))
            ->groupBy('museum_id')
            ->with('museum:id,title')
            ->orderByDesc('visits')
            ->limit(10)
            ->get();

        // Chart data - based on filter
        $chartQuery = VisitorLog::query();

        switch ($filter) {
            case 'daily':
                // For daily, show hourly breakdown
                $chartQuery->whereDate('created_at', Carbon::today());
                $chartData = $chartQuery
                    ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('count(*) as visits'))
                    ->groupBy('hour')
                    ->orderBy('hour')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'date' => sprintf('%02d:00', $item->hour),
                            'visits' => $item->visits,
                        ];
                    });
                break;
            case 'weekly':
                $chartQuery->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                $chartData = $chartQuery
                    ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as visits'))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'date' => Carbon::parse($item->date)->format('d M'),
                            'visits' => $item->visits,
                        ];
                    });
                break;
            case 'monthly':
                $chartQuery->whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year);
                $chartData = $chartQuery
                    ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as visits'))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'date' => Carbon::parse($item->date)->format('d'),
                            'visits' => $item->visits,
                        ];
                    });
                break;
            case 'yearly':
                $chartQuery->whereYear('created_at', Carbon::now()->year);
                $chartData = $chartQuery
                    ->select(DB::raw('MONTH(created_at) as month'), DB::raw('count(*) as visits'))
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'date' => Carbon::create()->month($item->month)->format('M'),
                            'visits' => $item->visits,
                        ];
                    });
                break;
            case 'range':
                if ($startDate && $endDate) {
                    $chartQuery->whereBetween('created_at', [
                        Carbon::parse($startDate)->startOfDay(),
                        Carbon::parse($endDate)->endOfDay()
                    ]);
                }
                $chartData = $chartQuery
                    ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as visits'))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'date' => Carbon::parse($item->date)->format('d M'),
                            'visits' => $item->visits,
                        ];
                    });
                break;
            default:
                $chartData = collect();
        }

        // Recent logs
        $recentLogs = VisitorLog::query()
            ->orderByDesc('created_at')
            ->limit(50)
            ->with('museum:id,title')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'page_url' => $log->page_url,
                    'ip_address' => $log->ip_address ? substr($log->ip_address, 0, -3) . '***' : '-',
                    'museum' => $log->museum?->title ?? '-',
                    'created_at' => $log->created_at->format('d M Y H:i'),
                ];
            });

        return Inertia::render('statistics', [
            'stats' => [
                'total_visits' => $totalVisits,
                'unique_visitors' => $uniqueVisitors,
                'visits_by_museum' => $visitsByMuseum,
                'chart_data' => $chartData,
                'recent_logs' => $recentLogs,
            ],
            'filter' => $filter,
            'filterLabel' => $label,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }
}
