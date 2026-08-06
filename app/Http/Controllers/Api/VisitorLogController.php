<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitorLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VisitorLogController extends Controller
{
    /**
     * Log a visitor access (public endpoint)
     */
    public function log(Request $request)
    {
        $validated = $request->validate([
            'page_url' => 'required|string|max:500',
            'museum_id' => 'nullable|integer|exists:museum,id',
            'referrer' => 'nullable|string|max:500',
        ]);

        // Generate session ID from IP + User Agent hash (for stateless API)
        $sessionId = null;
        try {
            $sessionId = $request->session()->getId();
        } catch (\Exception $e) {
            // Fallback for stateless requests
            $sessionId = md5($request->ip() . $request->userAgent() . date('Y-m-d'));
        }

        VisitorLog::create([
            'session_id' => $sessionId,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'page_url' => $validated['page_url'],
            'referrer' => $validated['referrer'] ?? $request->header('referer'),
            'museum_id' => $validated['museum_id'] ?? null,
        ]);

        return response()->json(['success' => true], 201);
    }

    /**
     * Get statistics summary
     */
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
                break;
            case 'weekly':
                $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                break;
            case 'monthly':
                $query->whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year);
                break;
            case 'yearly':
                $query->whereYear('created_at', Carbon::now()->year);
                break;
            case 'range':
                if ($startDate && $endDate) {
                    $query->whereBetween('created_at', [
                        Carbon::parse($startDate)->startOfDay(),
                        Carbon::parse($endDate)->endOfDay()
                    ]);
                }
                break;
        }

        $totalVisits = $query->count();
        $uniqueVisitors = $query->distinct('session_id')->count('session_id');

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
            ->get();

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
                    'ip_address' => substr($log->ip_address, 0, -3) . '***', // Mask last 3 chars
                    'museum' => $log->museum?->title,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'filter' => $filter,
            'total_visits' => $totalVisits,
            'unique_visitors' => $uniqueVisitors,
            'visits_by_museum' => $visitsByMuseum,
            'recent_logs' => $recentLogs,
        ]);
    }

    /**
     * Get chart data for daily breakdown
     */
    public function daily(Request $request)
    {
        $days = $request->get('days', 7);

        $data = VisitorLog::query()
            ->where('created_at', '>=', Carbon::now()->subDays($days))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as visits'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    /**
     * Get chart data for weekly breakdown
     */
    public function weekly(Request $request)
    {
        $weeks = $request->get('weeks', 4);

        $data = VisitorLog::query()
            ->where('created_at', '>=', Carbon::now()->subWeeks($weeks))
            ->select(DB::raw('YEARWEEK(created_at) as week'), DB::raw('count(*) as visits'))
            ->groupBy('week')
            ->orderBy('week')
            ->get();

        return response()->json($data);
    }

    /**
     * Get chart data for monthly breakdown
     */
    public function monthly(Request $request)
    {
        $months = $request->get('months', 12);

        $data = VisitorLog::query()
            ->where('created_at', '>=', Carbon::now()->subMonths($months))
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('count(*) as visits')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return response()->json($data);
    }

    /**
     * Get chart data for yearly breakdown
     */
    public function yearly()
    {
        $data = VisitorLog::query()
            ->select(DB::raw('YEAR(created_at) as year'), DB::raw('count(*) as visits'))
            ->groupBy('year')
            ->orderBy('year')
            ->get();

        return response()->json($data);
    }
}
