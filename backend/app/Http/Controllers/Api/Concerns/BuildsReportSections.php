<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Support\ReportPeriod;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

// Small formatting/section/date-filter helpers shared by AdminReportController
// and FarmerReportController so the "Top Selling Products" table layout,
// summary-card formatting, and the 6 date-filter presets only exist in one place.
trait BuildsReportSections
{
    protected function card(string $label, mixed $value, string $type = 'string'): array
    {
        if ($value === null || $value === '') {
            return ['label' => $label, 'value' => '—'];
        }

        $display = match ($type) {
            'currency' => 'KES ' . number_format((float) $value, 2),
            'number'   => number_format((float) $value),
            default    => (string) $value,
        };

        return ['label' => $label, 'value' => $display];
    }

    // Validates period/date_from/date_to (throws a ValidationException —
    // auto-converted by Laravel into a 422 JSON response — if period=custom
    // is missing its dates) and resolves them into a concrete range.
    protected function resolvePeriod(Request $request): array
    {
        Validator::make($request->all(), [
            'period'    => 'nullable|in:' . implode(',', ReportPeriod::PRESETS),
            'date_from' => 'nullable|required_if:period,custom|date',
            'date_to'   => 'nullable|required_if:period,custom|date|after_or_equal:date_from',
        ])->validate();

        [$from, $to] = ReportPeriod::resolve($request->period, $request->date_from, $request->date_to);

        return [$from, $to, ReportPeriod::label($request->period ?: 'last_30_days', $request->date_from, $request->date_to)];
    }

    protected function buildMeta(string $periodLabel, array $extraFilters = []): array
    {
        return [
            'generated_by' => auth()->user()->name,
            'generated_at' => now()->format('d M Y, h:i A'),
            'filters'      => array_merge(['Period' => $periodLabel], $extraFilters),
        ];
    }

    // One data-table section per category — used by both the admin
    // (all sellers) and farmer (own products only) Top Selling Products
    // report, since ReportDataService::topSellingProducts() already
    // returns data grouped the same way for both callers.
    protected function topProductsSections(array $categories): array
    {
        $columns = [
            ['key' => 'product',  'label' => 'Product',       'type' => 'string'],
            ['key' => 'unit',     'label' => 'Unit',          'type' => 'string'],
            ['key' => 'qty_sold', 'label' => 'Quantity Sold', 'type' => 'decimal'],
            ['key' => 'revenue',  'label' => 'Revenue',       'type' => 'currency'],
        ];

        $sections = [];
        foreach ($categories as $categoryName => $products) {
            $sections[] = [
                'heading' => $categoryName,
                'columns' => $columns,
                'rows'    => $products,
            ];
        }

        if (empty($sections)) {
            $sections[] = ['heading' => null, 'columns' => $columns, 'rows' => []];
        }

        return $sections;
    }
}
