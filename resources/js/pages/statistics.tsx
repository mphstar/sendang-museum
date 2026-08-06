import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BarChart3, Calendar as CalendarIcon, Eye, Users, TrendingUp, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Statistik Kunjungan',
        href: '/statistics',
    },
];

interface StatisticsData {
    total_visits: number;
    unique_visitors: number;
    visits_by_museum: Array<{
        museum_id: number;
        visits: number;
        museum: { id: number; title: string } | null;
    }>;
    chart_data: Array<{ date: string; visits: number }>;
    recent_logs: Array<{
        id: number;
        page_url: string;
        ip_address: string;
        museum: string;
        created_at: string;
    }>;
}

interface Props {
    stats: StatisticsData;
    filter: string;
    filterLabel: string;
    startDate?: string;
    endDate?: string;
}

// Dynamic import for ApexCharts (client-side only)
type ApexChartsType = typeof import('react-apexcharts').default;

export default function Statistics({ stats, filter, filterLabel, startDate, endDate }: Props) {
    const [selectedFilter, setSelectedFilter] = useState(filter);
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [ApexChart, setApexChart] = useState<ApexChartsType | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Load ApexCharts dynamically on client side only
    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            import('react-apexcharts').then((mod) => {
                setApexChart(() => mod.default);
            }).catch((err) => {
                console.error('Failed to load ApexCharts:', err);
            });
        }
    }, []);

    const handleFilterChange = (value: string) => {
        setSelectedFilter(value);
        if (value === 'range') {
            setShowDatePicker(true);
            return;
        }
        router.get('/statistics', { filter: value }, { preserveState: true });
    };

    const applyDateRange = () => {
        if (dateRange.from && dateRange.to) {
            router.get('/statistics', {
                filter: 'range',
                start: format(dateRange.from, 'yyyy-MM-dd'),
                end: format(dateRange.to, 'yyyy-MM-dd'),
            }, { preserveState: true });
        }
        setShowDatePicker(false);
    };

    // Chart configuration - using bar chart for better single-data visibility
    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            background: 'transparent',
        },
        colors: ['#3b82f6'],
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: stats.chart_data.length === 1 ? '40%' : '60%',
                distributed: false,
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.3,
                opacityFrom: 1,
                opacityTo: 0.8,
                stops: [0, 100]
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number) => val > 0 ? val.toString() : '',
            style: { colors: ['#fff'] }
        },
        xaxis: {
            categories: stats.chart_data.map(d => d.date),
            labels: { style: { colors: '#9ca3af' } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: { style: { colors: '#9ca3af' } },
            min: 0,
        },
        grid: {
            borderColor: '#374151',
            strokeDashArray: 3,
        },
        tooltip: {
            theme: 'dark',
            y: { formatter: (val: number) => `${val} kunjungan` }
        },
    };

    const chartSeries = [{
        name: 'Kunjungan',
        data: stats.chart_data.map(d => d.visits)
    }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statistik Kunjungan" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <BarChart3 className="h-8 w-8" />
                            Statistik Kunjungan
                        </h1>
                        <p className="text-muted-foreground">Periode: {filterLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={selectedFilter} onValueChange={handleFilterChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Hari Ini</SelectItem>
                                <SelectItem value="weekly">Minggu Ini</SelectItem>
                                <SelectItem value="monthly">Bulan Ini</SelectItem>
                                <SelectItem value="yearly">Tahun Ini</SelectItem>
                                <SelectItem value="range">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>

                        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn("gap-2", !showDatePicker && selectedFilter !== 'range' && "hidden")}
                                >
                                    <CalendarIcon className="h-4 w-4" />
                                    {dateRange.from && dateRange.to
                                        ? `${format(dateRange.from, 'dd/MM/yy')} - ${format(dateRange.to, 'dd/MM/yy')}`
                                        : 'Pilih tanggal'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="range"
                                    selected={{ from: dateRange.from, to: dateRange.to }}
                                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                    numberOfMonths={2}
                                />
                                <div className="p-3 border-t flex justify-end">
                                    <Button size="sm" onClick={applyDateRange} disabled={!dateRange.from || !dateRange.to}>
                                        Terapkan
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <Card className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Kunjungan</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_visits.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Views di periode ini</p>
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pengunjung Unik</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.unique_visitors.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Berdasarkan session</p>
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Museum Populer</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.visits_by_museum[0]?.museum?.title || '-'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.visits_by_museum[0]?.visits?.toLocaleString() || 0} kunjungan
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart & Museum Stats */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    {/* ApexChart Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Trend Kunjungan
                            </CardTitle>
                            <CardDescription>Periode: {filterLabel}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                {isMounted && ApexChart && stats.chart_data.length > 0 ? (
                                    <ApexChart
                                        type="bar"
                                        height="100%"
                                        width="100%"
                                        options={chartOptions}
                                        series={chartSeries}
                                    />
                                ) : !isMounted ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : stats.chart_data.length === 0 ? (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        Belum ada data
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Museum Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Kunjungan per Museum
                            </CardTitle>
                            <CardDescription>Top 10 museum terpopuler</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.visits_by_museum.length > 0 ? (
                                    stats.visits_by_museum.map((item) => (
                                        <div key={item.museum_id} className="flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {item.museum?.title || 'Unknown'}
                                                </p>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                                                    <div
                                                        className="h-full bg-primary rounded-full"
                                                        style={{
                                                            width: `${(item.visits / (stats.visits_by_museum[0]?.visits || 1)) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium">{item.visits}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-sm">Belum ada data</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Log Kunjungan Terbaru</CardTitle>
                        <CardDescription>50 kunjungan terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Waktu</TableHead>
                                        <TableHead>Halaman</TableHead>
                                        <TableHead>Museum</TableHead>
                                        <TableHead>IP Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.recent_logs.length > 0 ? (
                                        stats.recent_logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-sm">{log.created_at}</TableCell>
                                                <TableCell className="text-sm max-w-[200px] truncate">{log.page_url}</TableCell>
                                                <TableCell className="text-sm">{log.museum}</TableCell>
                                                <TableCell className="text-sm font-mono text-muted-foreground">{log.ip_address}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                                Belum ada data kunjungan
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
