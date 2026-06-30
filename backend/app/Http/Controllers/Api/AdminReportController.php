<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminReportController extends Controller
{
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
            'report_type'          => 'required|in:Sales summary,Inventory,User activity,Zone performance',
            'parameters'           => 'nullable|array',
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

    // ── Helper ───────────────────────────────────────────────────────
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
