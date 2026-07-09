<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

// Every aggregate query behind Admin Reports and Farmer Reports lives here.
// Admin report methods have no seller scoping; the farmer-facing ones accept
// $sellerId so the "Top Selling Products" logic can be shared verbatim
// between an admin (all sellers) and a farmer (their own products only).
class ReportDataService
{
    // ── Admin: Zone Performance ──────────────────────────────────────
    public function zonePerformance(Carbon $from, Carbon $to): array
    {
        $zones = DB::table('pickup_zones')->select('zone_id', 'zone_name')->orderBy('zone_name')->get();

        $farmerCounts = DB::table('users')
            ->where('role', 'seller')
            ->whereNotNull('zone_id')
            ->select(
                'zone_id',
                DB::raw('COUNT(*) as farmers'),
                DB::raw('SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_farmers'),
                DB::raw('SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active_farmers')
            )
            ->groupBy('zone_id')
            ->get()
            ->keyBy('zone_id');

        $salesStats = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->join('users as sellers', 'products.seller_id', '=', 'sellers.user_id')
            ->whereNotNull('sellers.zone_id')
            ->whereBetween('orders.order_date', [$from, $to])
            ->whereIn('orders.order_status', ['Confirmed', 'Delivered'])
            ->select(
                'sellers.zone_id',
                DB::raw('COUNT(DISTINCT orders.order_id) as orders_count'),
                DB::raw('SUM(order_items.subtotal) as revenue')
            )
            ->groupBy('sellers.zone_id')
            ->get()
            ->keyBy('zone_id');

        $rows = $zones->map(function ($zone) use ($farmerCounts, $salesStats) {
            $farmerRow = $farmerCounts->get($zone->zone_id);
            $saleRow   = $salesStats->get($zone->zone_id);

            $orders  = (int) ($saleRow->orders_count ?? 0);
            $revenue = (float) ($saleRow->revenue ?? 0);

            return [
                'zone_id'          => $zone->zone_id,
                'zone'             => $zone->zone_name,
                'farmers'          => (int) ($farmerRow->farmers ?? 0),
                'orders'           => $orders,
                'revenue'          => $revenue,
                'avg_order_value'  => $orders > 0 ? round($revenue / $orders, 2) : 0.0,
                'verified_farmers' => (int) ($farmerRow->verified_farmers ?? 0),
                'active_farmers'   => (int) ($farmerRow->active_farmers ?? 0),
            ];
        })->values();

        $byRevenue = $rows->sortByDesc('revenue')->values();
        $byOrders  = $rows->sortByDesc('orders')->values();

        return [
            'rows'    => $rows->all(),
            'summary' => [
                'best_performing_zone'  => $byRevenue->first()['zone'] ?? null,
                'highest_revenue_zone'  => $byRevenue->first()['zone'] ?? null,
                'highest_revenue'       => $byRevenue->first()['revenue'] ?? 0.0,
                'highest_orders_zone'   => $byOrders->first()['zone'] ?? null,
                'highest_orders'        => $byOrders->first()['orders'] ?? 0,
                'lowest_performing_zone' => $byRevenue->last()['zone'] ?? null,
            ],
        ];
    }

    // ── Admin: User Activity ─────────────────────────────────────────
    public function userActivity(Carbon $from, Carbon $to): array
    {
        $totalUsers      = DB::table('users')->count();
        $buyers          = DB::table('users')->where('role', 'buyer')->count();
        $farmers         = DB::table('users')->where('role', 'seller')->count();
        $verifiedFarmers = DB::table('users')->where('role', 'seller')->where('is_verified', true)->count();
        $activeUsers     = DB::table('users')->where('status', 'active')->count();
        $suspendedUsers  = DB::table('users')->where('status', 'suspended')->count();
        $newUsers        = DB::table('users')->whereBetween('created_at', [$from, $to])->count();

        $mostActiveFarmers = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->join('users', 'products.seller_id', '=', 'users.user_id')
            ->whereBetween('orders.order_date', [$from, $to])
            ->whereIn('orders.order_status', ['Confirmed', 'Delivered'])
            ->select(
                'users.user_id',
                'users.name',
                DB::raw('COUNT(DISTINCT orders.order_id) as orders_completed'),
                DB::raw('SUM(order_items.subtotal) as revenue_generated')
            )
            ->groupBy('users.user_id', 'users.name')
            ->orderByDesc('revenue_generated')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'name'              => $r->name,
                'orders_completed'  => (int) $r->orders_completed,
                'revenue_generated' => (float) $r->revenue_generated,
            ]);

        $mostActiveBuyers = DB::table('orders')
            ->join('users', 'orders.buyer_id', '=', 'users.user_id')
            ->whereBetween('orders.order_date', [$from, $to])
            ->select(
                'users.user_id',
                'users.name',
                DB::raw('COUNT(DISTINCT orders.order_id) as orders_placed'),
                DB::raw('SUM(orders.total_amount) as amount_spent')
            )
            ->groupBy('users.user_id', 'users.name')
            ->orderByDesc('amount_spent')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'name'          => $r->name,
                'orders_placed' => (int) $r->orders_placed,
                'amount_spent'  => (float) $r->amount_spent,
            ]);

        return [
            'summary' => [
                'total_users'      => $totalUsers,
                'buyers'           => $buyers,
                'farmers'          => $farmers,
                'verified_farmers' => $verifiedFarmers,
                'active_users'     => $activeUsers,
                'suspended_users'  => $suspendedUsers,
                'new_users'        => $newUsers,
            ],
            'most_active_farmers' => $mostActiveFarmers->all(),
            'most_active_buyers'  => $mostActiveBuyers->all(),
        ];
    }

    // ── Shared: Top Selling Products (admin = all sellers, farmer = own) ──
    public function topSellingProducts(Carbon $from, Carbon $to, ?int $sellerId = null): array
    {
        $query = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->whereBetween('orders.order_date', [$from, $to])
            ->whereIn('orders.order_status', ['Confirmed', 'Delivered']);

        if ($sellerId !== null) {
            $query->where('products.seller_id', $sellerId);
        }

        $rows = $query->select(
                'categories.category_id',
                'categories.name as category',
                'products.product_id',
                'products.name as product',
                'products.unit',
                DB::raw('SUM(order_items.quantity) as qty_sold'),
                DB::raw('SUM(order_items.subtotal) as revenue')
            )
            ->groupBy('categories.category_id', 'categories.name', 'products.product_id', 'products.name', 'products.unit')
            ->orderByDesc('revenue')
            ->get();

        $categories = [];
        foreach ($rows as $row) {
            $categories[$row->category] ??= [];
            $categories[$row->category][] = [
                'product'   => $row->product,
                'unit'      => $row->unit,
                'qty_sold'  => (float) $row->qty_sold,
                'revenue'   => (float) $row->revenue,
            ];
        }

        $topProductRow    = $rows->first();
        $categoryRevenue  = $rows->groupBy('category')->map(fn($g) => $g->sum('revenue'));
        $topCategory      = $categoryRevenue->sortDesc()->keys()->first();

        return [
            'categories' => $categories,
            'summary'    => [
                'top_category'        => $topCategory,
                'top_product'         => $topProductRow->product ?? null,
                'top_product_revenue' => (float) ($topProductRow->revenue ?? 0),
                'total_revenue'       => (float) $rows->sum('revenue'),
            ],
        ];
    }

    // ── Farmer: Inventory Movement ──────────────────────────────────────
    // Current Stock is always the live `inventory.quantity_available` — it
    // never moves when the period changes. Only Online/Offline/Total Sold
    // (and the Estimated Remaining Stock + Stock Status derived from them)
    // are scoped to [$from, $to].
    public function farmerInventory(int $sellerId, Carbon $from, Carbon $to): array
    {
        $items = DB::table('inventory')
            ->join('products', 'inventory.product_id', '=', 'products.product_id')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->where('products.seller_id', $sellerId)
            ->select(
                'products.product_id',
                'products.name as product',
                'categories.name as category',
                'inventory.quantity_available',
                'products.unit'
            )
            ->get();

        $onlineSold = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('products.seller_id', $sellerId)
            ->whereBetween('orders.order_date', [$from, $to])
            ->whereIn('orders.order_status', ['Confirmed', 'Delivered'])
            ->groupBy('order_items.product_id')
            ->select('order_items.product_id', DB::raw('SUM(order_items.quantity) as qty'))
            ->get()
            ->keyBy('product_id');

        // Offline (POS) sale items only carry a free-text product_name, so
        // they're matched back to this seller's catalogue the same
        // case-insensitive/trimmed way SellerSalesController deducts stock.
        $offlineSold = DB::table('pos_sale_items')
            ->join('pos_sales', 'pos_sale_items.sale_id', '=', 'pos_sales.sale_id')
            ->where('pos_sales.seller_id', $sellerId)
            ->whereBetween('pos_sales.sale_date', [$from, $to])
            ->groupBy(DB::raw('LOWER(TRIM(pos_sale_items.product_name))'))
            ->select(
                DB::raw('LOWER(TRIM(pos_sale_items.product_name)) as name_key'),
                DB::raw('SUM(pos_sale_items.quantity) as qty')
            )
            ->get()
            ->keyBy('name_key');

        $lowStockCount = 0;
        $totalOnline   = 0.0;
        $totalOffline  = 0.0;

        $rows = $items->map(function ($i) use ($onlineSold, $offlineSold, &$lowStockCount, &$totalOnline, &$totalOffline) {
            $current = (float) $i->quantity_available;
            $online  = (float) ($onlineSold->get($i->product_id)->qty ?? 0);
            $offline = (float) ($offlineSold->get(mb_strtolower(trim($i->product)))->qty ?? 0);
            $sold    = $online + $offline;
            $remaining = max(0, $current - $sold);

            if ($remaining <= 0) {
                $status = 'Out of Stock';
            } elseif ($remaining <= 20) {
                $status = 'Low Stock';
                $lowStockCount++;
            } else {
                $status = 'In Stock';
            }

            $totalOnline  += $online;
            $totalOffline += $offline;

            return [
                'product'         => $i->product,
                'category'        => $i->category,
                'current_stock'   => $current,
                'unit'            => $i->unit,
                'online_sold'     => $online,
                'offline_sold'    => $offline,
                'total_sold'      => $sold,
                'remaining_stock' => $remaining,
                'status'          => $status,
            ];
        });

        return [
            'rows'    => $rows->all(),
            'summary' => [
                'total_products'      => $rows->count(),
                'total_current_stock' => (float) $items->sum('quantity_available'),
                'online_sales'        => round($totalOnline, 2),
                'offline_sales'       => round($totalOffline, 2),
                'total_sales'         => round($totalOnline + $totalOffline, 2),
                'low_stock_products'  => $lowStockCount,
            ],
        ];
    }

    // ── Farmer: Sales (online / offline / combined) ────────────────────
    public function farmerSales(int $sellerId, Carbon $from, Carbon $to, string $source = 'combined'): array
    {
        $onlineRows = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->join('users as buyers', 'orders.buyer_id', '=', 'buyers.user_id')
            ->leftJoin('payments', 'orders.order_id', '=', 'payments.order_id')
            ->where('products.seller_id', $sellerId)
            ->whereBetween('orders.order_date', [$from, $to])
            ->whereIn('orders.order_status', ['Confirmed', 'Delivered'])
            ->select(
                'orders.order_date as date',
                'buyers.name as buyer',
                'products.name as product',
                'order_items.quantity',
                DB::raw("COALESCE(payments.payment_method, 'M-Pesa') as payment_method"),
                DB::raw("'Online' as order_type"),
                'order_items.subtotal as revenue'
            )
            ->get();

        $offlineRows = DB::table('pos_sale_items')
            ->join('pos_sales', 'pos_sale_items.sale_id', '=', 'pos_sales.sale_id')
            ->where('pos_sales.seller_id', $sellerId)
            ->whereBetween('pos_sales.sale_date', [$from, $to])
            ->select(
                'pos_sales.sale_date as date',
                DB::raw("COALESCE(pos_sales.buyer_name, 'Walk-in buyer') as buyer"),
                'pos_sale_items.product_name as product',
                'pos_sale_items.quantity',
                'pos_sales.payment_method',
                DB::raw("'Offline' as order_type"),
                'pos_sale_items.subtotal as revenue'
            )
            ->get();

        $onlineRevenue  = (float) $onlineRows->sum('revenue');
        $offlineRevenue = (float) $offlineRows->sum('revenue');

        $selected = match ($source) {
            'online'  => $onlineRows,
            'offline' => $offlineRows,
            default   => $onlineRows->concat($offlineRows),
        };

        $selected = $selected->sortByDesc('date')->values();
        $count    = $selected->count();
        $selectedRevenue = (float) $selected->sum('revenue');

        return [
            'rows' => $selected->map(fn($r) => [
                'date'           => (string) $r->date,
                'buyer'          => $r->buyer,
                'product'        => $r->product,
                'quantity'       => (float) $r->quantity,
                'payment_method' => $r->payment_method,
                'order_type'     => $r->order_type,
                'revenue'        => (float) $r->revenue,
            ])->all(),
            'summary' => [
                'online_revenue'   => $onlineRevenue,
                'offline_revenue'  => $offlineRevenue,
                'combined_revenue' => $onlineRevenue + $offlineRevenue,
                'number_of_sales'  => $count,
                'average_sale'     => $count > 0 ? round($selectedRevenue / $count, 2) : 0.0,
            ],
        ];
    }
}
