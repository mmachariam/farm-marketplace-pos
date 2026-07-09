<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\BuildsReportSections;
use App\Models\Report;
use App\Services\ReportDataService;
use App\Services\ReportExportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FarmerReportController extends Controller
{
    use BuildsReportSections;

    private const TYPES = ['inventory', 'sales', 'top-products'];

    public function __construct(
        private readonly ReportDataService $reportData,
        private readonly ReportExportService $exporter,
    ) {}

    // ── GET /api/seller/reports/inventory ────────────────────────────
    public function inventory(Request $request)
    {
        [$from, $to, $periodLabel] = $this->resolvePeriod($request);

        return response()->json(['data' => $this->buildInventoryReport(auth()->id(), $from, $to, $periodLabel)]);
    }

    // ── GET /api/seller/reports/sales ────────────────────────────────
    public function sales(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'source' => 'nullable|in:online,offline,combined',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        [$from, $to, $periodLabel] = $this->resolvePeriod($request);
        $source = $request->source ?: 'combined';

        return response()->json(['data' => $this->buildSalesReport(auth()->id(), $from, $to, $periodLabel, $source)]);
    }

    // ── GET /api/seller/reports/top-products ─────────────────────────
    public function topProducts(Request $request)
    {
        [$from, $to, $periodLabel] = $this->resolvePeriod($request);

        return response()->json(['data' => $this->buildTopProductsReport(auth()->id(), $from, $to, $periodLabel)]);
    }

    // ── GET /api/seller/reports/export ───────────────────────────────
    public function export(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type'   => 'required|in:' . implode(',', self::TYPES),
            'format' => 'required|in:pdf,xlsx',
            'source' => 'nullable|in:online,offline,combined',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $sellerId = auth()->id();
        [$from, $to, $periodLabel] = $this->resolvePeriod($request);
        $source = $request->source ?: 'combined';

        $report = match ($request->type) {
            'inventory'    => $this->buildInventoryReport($sellerId, $from, $to, $periodLabel),
            'sales'        => $this->buildSalesReport($sellerId, $from, $to, $periodLabel, $source),
            'top-products' => $this->buildTopProductsReport($sellerId, $from, $to, $periodLabel),
        };

        Report::create([
            'admin_id'    => $sellerId,
            'report_type' => $report['title_short'],
            'parameters'  => $request->only(['period', 'date_from', 'date_to', 'source']),
        ]);

        $filename = str($report['title'])->slug() . '-' . now()->format('Y-m-d');

        return $request->format === 'pdf'
            ? $this->exporter->pdf($report)->download("{$filename}.pdf")
            : $this->exporter->streamXlsx($this->exporter->xlsx($report), "{$filename}.xlsx");
    }

    // ── Report builders (shared by the JSON + export endpoints) ─────

    private function buildInventoryReport(int $sellerId, Carbon $from, Carbon $to, string $periodLabel): array
    {
        $data = $this->reportData->farmerInventory($sellerId, $from, $to);
        $s    = $data['summary'];

        $columns = [
            ['key' => 'product',         'label' => 'Product',                  'type' => 'string'],
            ['key' => 'category',        'label' => 'Category',                 'type' => 'string'],
            ['key' => 'current_stock',   'label' => 'Current Stock',            'type' => 'decimal'],
            ['key' => 'online_sold',     'label' => 'Online Sold',              'type' => 'decimal'],
            ['key' => 'offline_sold',    'label' => 'Offline Sold',             'type' => 'decimal'],
            ['key' => 'total_sold',      'label' => 'Total Sold',               'type' => 'decimal'],
            ['key' => 'remaining_stock', 'label' => 'Estimated Remaining Stock','type' => 'decimal'],
            ['key' => 'status',          'label' => 'Stock Status',             'type' => 'string'],
        ];

        return [
            'title'       => 'Inventory Report',
            'title_short' => 'Inventory',
            'meta'        => $this->buildMeta($periodLabel),
            'summary'     => [
                $this->card('Total Products', $s['total_products'], 'number'),
                $this->card('Total Current Stock', $s['total_current_stock'], 'decimal'),
                $this->card('Online Sales', $s['online_sales'], 'decimal'),
                $this->card('Offline Sales', $s['offline_sales'], 'decimal'),
                $this->card('Total Sales', $s['total_sales'], 'decimal'),
                $this->card('Low Stock Products', $s['low_stock_products'], 'number'),
            ],
            'sections'    => [
                ['heading' => null, 'columns' => $columns, 'rows' => $data['rows']],
            ],
            'orientation' => 'landscape',
        ];
    }

    private function buildSalesReport(int $sellerId, Carbon $from, Carbon $to, string $periodLabel, string $source): array
    {
        $data = $this->reportData->farmerSales($sellerId, $from, $to, $source);
        $s    = $data['summary'];

        $columns = [
            ['key' => 'date',            'label' => 'Date',            'type' => 'string'],
            ['key' => 'buyer',           'label' => 'Buyer',           'type' => 'string'],
            ['key' => 'product',         'label' => 'Product',         'type' => 'string'],
            ['key' => 'quantity',        'label' => 'Quantity',        'type' => 'decimal'],
            ['key' => 'payment_method',  'label' => 'Payment Method',  'type' => 'string'],
            ['key' => 'order_type',      'label' => 'Order Type',      'type' => 'string'],
            ['key' => 'revenue',         'label' => 'Revenue',         'type' => 'currency'],
        ];

        $rows = array_map(function ($row) {
            $row['date'] = Carbon::parse($row['date'])->format('d M Y, h:i A');
            return $row;
        }, $data['rows']);

        $sourceLabel = ['online' => 'Online Orders', 'offline' => 'Offline POS', 'combined' => 'Combined'][$source];

        return [
            'title'       => 'Sales Report',
            'title_short' => 'Sales',
            'meta'        => $this->buildMeta($periodLabel, ['Sales Source' => $sourceLabel]),
            'summary'     => [
                $this->card('Online Revenue', $s['online_revenue'], 'currency'),
                $this->card('Offline Revenue', $s['offline_revenue'], 'currency'),
                $this->card('Combined Revenue', $s['combined_revenue'], 'currency'),
                $this->card('Number of Sales', $s['number_of_sales'], 'number'),
                $this->card('Average Sale', $s['average_sale'], 'currency'),
            ],
            'sections'    => [
                ['heading' => null, 'columns' => $columns, 'rows' => $rows],
            ],
            'orientation' => 'landscape',
        ];
    }

    private function buildTopProductsReport(int $sellerId, Carbon $from, Carbon $to, string $periodLabel): array
    {
        $data = $this->reportData->topSellingProducts($from, $to, $sellerId);
        $s    = $data['summary'];

        return [
            'title'       => 'Top Selling Products Report',
            'title_short' => 'Top selling products',
            'meta'        => $this->buildMeta($periodLabel),
            'summary'     => [
                $this->card('Best Category', $s['top_category']),
                $this->card('Best Product', $s['top_product']),
                $this->card(
                    'Highest Revenue Product',
                    $s['top_product'] ? $s['top_product'] . ' — KES ' . number_format($s['top_product_revenue'], 2) : null
                ),
            ],
            'sections'    => $this->topProductsSections($data['categories']),
            'orientation' => 'portrait',
        ];
    }
}
