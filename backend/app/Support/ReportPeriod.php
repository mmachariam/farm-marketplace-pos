<?php

namespace App\Support;

use Carbon\Carbon;
use InvalidArgumentException;

// Resolves the 6 date-filter presets shared by every report (admin + farmer)
// into a concrete [from, to] Carbon range. Used by ReportDataService and by
// the export endpoints so the on-screen report and the downloaded file are
// always built from the exact same window.
class ReportPeriod
{
    public const PRESETS = ['today', 'last_7_days', 'last_30_days', 'this_month', 'this_year', 'custom'];

    public static function resolve(?string $period, ?string $from = null, ?string $to = null): array
    {
        $period = $period ?: 'last_30_days';
        $now    = Carbon::now();

        return match ($period) {
            'today'        => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
            'last_7_days'  => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()],
            'last_30_days' => [$now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay()],
            'this_month'   => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            'this_year'    => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            'custom'       => self::resolveCustom($from, $to),
            default        => throw new InvalidArgumentException("Unknown report period: {$period}"),
        };
    }

    private static function resolveCustom(?string $from, ?string $to): array
    {
        if (!$from || !$to) {
            throw new InvalidArgumentException('Custom period requires both date_from and date_to.');
        }

        return [Carbon::parse($from)->startOfDay(), Carbon::parse($to)->endOfDay()];
    }

    // Human-readable label for the PDF/Excel "filters" section.
    public static function label(string $period, ?string $from, ?string $to): string
    {
        return match ($period) {
            'today'        => 'Today',
            'last_7_days'  => 'Last 7 Days',
            'last_30_days' => 'Last 30 Days',
            'this_month'   => 'This Month',
            'this_year'    => 'This Year',
            'custom'       => "Custom range ({$from} to {$to})",
            default        => $period,
        };
    }
}
