<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\BuildsReportSections;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Report;
use App\Models\User;
use App\Services\ReportDataService;
use App\Services\ReportExportService;
use App\Support\ReportPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminReportController extends Controller
{
    use BuildsReportSections;

    private const TYPES = ['zone-performance', 'user-activity', 'top-products'];

    public function __construct(
        private readonly ReportDataService $reportData,
        private readonly ReportExportService $exporter,
    ) {}

    // ── GET /api/admin/overview ──────────────────────────────────────
    public function overview()
    {
        $totalUsers       = User::count();
        $totalFarmers     = User::where('role', 'seller')->count();
        $totalBuyers      = User::where('role', 'buyer')->count();
        $verifiedFarmers  = User::where('role', 'seller')->where('is_verified', true)->count();
        $totalOrders      = Order::count();
        $totalRevenue     = Payment::where('payment_status', 'Completed')->sum('amount');
        $newUsersMonth    = User::where('created_at', '>=', Carbon::now()->startOfMonth())->count();

        $ordersByStatus = Order::select('order_status', DB::raw('count(*) as count'))
            ->groupBy('order_status')
            ->pluck('count', 'order_status');

        $statuses        = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];
        $ordersByStatusMap = [];
        foreach ($statuses as $status) {
            $ordersByStatusMap[$status] = (int) ($ordersByStatus[$status] ?? 0);
        }

        $topCategories = DB::table('categories')
            ->join('products', 'categories.category_id', '=', 'products.category_id')
            ->join('order_items', 'products.product_id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->select('categories.name as category', DB::raw('count(order_items.order_item_id) as order_volume'))
            ->groupBy('categories.category_id', 'categories.name')
            ->orderByDesc('order_volume')
            ->limit(3)
            ->get();

        return response()->json([
            'data' => [
                'total_users'          => $totalUsers,
                'total_farmers'        => $totalFarmers,
                'total_buyers'         => $totalBuyers,
                'verified_farmers'     => $verifiedFarmers,
                'total_orders'         => $totalOrders,
                'orders_by_status'     => $ordersByStatusMap,
                'total_revenue'        => (float) $totalRevenue,
                'top_categories'       => $topCategories,
                'new_users_this_month' => $newUsersMonth,
            ],
        ]);
    }

    // ── GET /api/admin/reports ───────────────────────────────────────
    public function index()
    {
        $reports = Report::with('admin:user_id,name')
            ->orderByDesc('generated_date')
            ->paginate(15);

        return response()->json([
            'data' => $reports->through(fn($r) => $this->formatReport($r)),
        ]);
    }

    // ── POST /api/admin/reports ──────────────────────────────────────
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'report_type'          => 'required|in:Zone performance,User activity,Top selling products',
            'parameters'           => 'nullable|array',
            'parameters.period'    => 'nullable|in:' . implode(',', ReportPeriod::PRESETS),
            'parameters.date_from' => 'nullable|date',
            'parameters.date_to'   => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $report = Report::create([
            'admin_id'    => auth()->id(),
            'report_type' => $request->report_type,
            'parameters'  => $request->parameters,
        ]);

        $report->load('admin:user_id,name');

        return response()->json([
            'data'    => $this->formatReport($report),
            'message' => 'Report created successfully',
        ], 201);
    }

    // ── GET /api/admin/reports/zone-performance ──────────────────────
    public function zonePerformance(Request $request)
    {
        [$from, $to, $periodLabel] = $this->resolvePeriod($request);

        return response()->json(['data' => $this->buildZonePerformanceReport($from, $to, $periodLabel)]);
    }

    // ── GET /api/admin/reports/user-activity ─────────────────────────
    public function userActivity(Request $request)
    {
        [$from, $to, $periodLabel] = $this->resolvePeriod($request);

        return response()->json(['data' => $this->buildUserActivityReport($from, $to, $periodLabel)]);
    }

    // ── GET /api/admin/reports/top-products ──────────────────────────
    public function topProducts(Request $request)
    {
        [$from, $to, $periodLabel] = $this->resolvePeriod($request);

        return response()->json(['data' => $this->buildTopProductsReport($from, $to, $periodLabel)]);
    }

    // ── GET /api/admin/reports/export ────────────────────────────────
    public function export(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type'   => 'required|in:' . implode(',', self::TYPES),
            'format' => 'required|in:pdf,xlsx',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        [$from, $to, $periodLabel] = $this->resolvePeriod($request);

        $report = match ($request->type) {
            'zone-performance' => $this->buildZonePerformanceReport($from, $to, $periodLabel),
            'user-activity'    => $this->buildUserActivityReport($from, $to, $periodLabel),
            'top-products'     => $this->buildTopProductsReport($from, $to, $periodLabel),
        };

        Report::create([
            'admin_id'    => auth()->id(),
            'report_type' => $report['title_short'],
            'parameters'  => $request->only(['period', 'date_from', 'date_to']),
        ]);

        $filename = str($report['title'])->slug() . '-' . now()->format('Y-m-d');

        return $request->format === 'pdf'
            ? $this->exporter->pdf($report)->download("{$filename}.pdf")
            : $this->exporter->streamXlsx($this->exporter->xlsx($report), "{$filename}.xlsx");
    }

    // ── Report builders (shared by the JSON + export endpoints) ─────

    private function buildZonePerformanceReport(Carbon $from, Carbon $to, string $periodLabel): array
    {
        $data = $this->reportData->zonePerformance($from, $to);
        $s    = $data['summary'];

        $columns = [
            ['key' => 'zone',             'label' => 'Zone',              'type' => 'string'],
            ['key' => 'farmers',          'label' => 'Farmers',           'type' => 'number'],
            ['key' => 'orders',           'label' => 'Orders',            'type' => 'number'],
            ['key' => 'revenue',          'label' => 'Revenue',           'type' => 'currency'],
            ['key' => 'avg_order_value',  'label' => 'Avg Order Value',   'type' => 'currency'],
            ['key' => 'verified_farmers', 'label' => 'Verified Farmers',  'type' => 'number'],
            ['key' => 'active_farmers',   'label' => 'Active Farmers',    'type' => 'number'],
        ];

        return [
            'title'       => 'Zone Performance Report',
            'title_short' => 'Zone performance',
            'meta'        => $this->buildMeta($periodLabel),
            'summary'     => [
                $this->card('Best Performing Zone', $s['best_performing_zone']),
                $this->card('Highest Revenue', $s['highest_revenue_zone'] . ' — KES ' . number_format($s['highest_revenue'], 2)),
                $this->card('Highest Orders', $s['highest_orders_zone'] . ' — ' . number_format($s['highest_orders']) . ' orders'),
                $this->card('Lowest Performing Zone', $s['lowest_performing_zone']),
            ],
            'sections'    => [
                ['heading' => null, 'columns' => $columns, 'rows' => $data['rows']],
            ],
            'orientation' => 'landscape',
        ];
    }

    private function buildUserActivityReport(Carbon $from, Carbon $to, string $periodLabel): array
    {
        $data = $this->reportData->userActivity($from, $to);
        $s    = $data['summary'];

        $farmerColumns = [
            ['key' => 'name',              'label' => 'Farmer',             'type' => 'string'],
            ['key' => 'orders_completed',  'label' => 'Orders Completed',   'type' => 'number'],
            ['key' => 'revenue_generated', 'label' => 'Revenue Generated',  'type' => 'currency'],
        ];

        $buyerColumns = [
            ['key' => 'name',           'label' => 'Buyer',          'type' => 'string'],
            ['key' => 'orders_placed',  'label' => 'Orders Placed',  'type' => 'number'],
            ['key' => 'amount_spent',   'label' => 'Amount Spent',   'type' => 'currency'],
        ];

        return [
            'title'       => 'User Activity Report',
            'title_short' => 'User activity',
            'meta'        => $this->buildMeta($periodLabel),
            'summary'     => [
                $this->card('Total Users', $s['total_users'], 'number'),
                $this->card('Buyers', $s['buyers'], 'number'),
                $this->card('Farmers', $s['farmers'], 'number'),
                $this->card('Verified Farmers', $s['verified_farmers'], 'number'),
                $this->card('Active Users', $s['active_users'], 'number'),
                $this->card('Suspended Users', $s['suspended_users'], 'number'),
                $this->card('New Users (Selected Period)', $s['new_users'], 'number'),
            ],
            'sections'    => [
                ['heading' => 'Most Active Farmers', 'columns' => $farmerColumns, 'rows' => $data['most_active_farmers']],
                ['heading' => 'Most Active Buyers',  'columns' => $buyerColumns,  'rows' => $data['most_active_buyers']],
            ],
            'orientation' => 'landscape',
        ];
    }

    private function buildTopProductsReport(Carbon $from, Carbon $to, string $periodLabel): array
    {
        $data = $this->reportData->topSellingProducts($from, $to, null);
        $s    = $data['summary'];

        return [
            'title'       => 'Top Selling Products Report',
            'title_short' => 'Top selling products',
            'meta'        => $this->buildMeta($periodLabel),
            'summary'     => [
                $this->card('Top Category', $s['top_category']),
                $this->card('Top Product', $s['top_product']),
                $this->card('Total Revenue', $s['total_revenue'], 'currency'),
            ],
            'sections'    => $this->topProductsSections($data['categories']),
            'orientation' => 'portrait',
        ];
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private function formatReport(Report $report): array
    {
        return [
            'report_id'      => $report->report_id,
            'report_type'    => $report->report_type,
            'parameters'     => $report->parameters,
            'generated_date' => $report->generated_date,
            'generated_by'   => $report->admin?->name ?? 'Admin',
        ];
    }
}
