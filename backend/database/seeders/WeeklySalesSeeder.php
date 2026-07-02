<?php

namespace Database\Seeders;

use App\Models\PosSale;
use App\Models\PosSaleItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class WeeklySalesSeeder extends Seeder
{
    // Populated in run(), used by seedDay()
    private array $sellers = []; // email => user_id

    public function run(): void
    {
        foreach (User::where('role', 'seller')->get() as $s) {
            $this->sellers[$s->email] = $s->user_id;
        }

        $weekStart = Carbon::now()->startOfWeek(Carbon::MONDAY);

        // 0 = Monday ... 6 = Sunday. Only days up to and including today
        // are seeded — future days in the current week are skipped.
        $todayIndex = Carbon::now()->dayOfWeekIso - 1;

        // Each farmer's week: dayIndex => list of sales.
        // Each sale: ['method' => 'Cash'|'M-Pesa', 'time' => 'H:i', 'items' => [[name, qty, unit, price], ...]]
        $weeks = [
            'jane.wambui@sokomoja.co.ke' => [
                0 => [ // Monday
                    ['method' => 'Cash', 'time' => '09:00', 'items' => [['Tomatoes', 10, 'kg', 80]]],
                ],
                1 => [ // Tuesday
                    ['method' => 'M-Pesa', 'time' => '09:30', 'items' => [['Tomatoes', 12, 'kg', 80]]],
                    ['method' => 'M-Pesa', 'time' => '15:00', 'items' => [['Kale (Sukuma Wiki)', 28, 'bunch', 30]]],
                ],
                2 => [ // Wednesday
                    ['method' => 'Cash', 'time' => '10:00', 'items' => [['Kale (Sukuma Wiki)', 20, 'bunch', 30]]],
                ],
                3 => [ // Thursday
                    ['method' => 'M-Pesa', 'time' => '09:15', 'items' => [['Tomatoes', 15, 'kg', 80]]],
                    ['method' => 'M-Pesa', 'time' => '16:30', 'items' => [['Kale (Sukuma Wiki)', 40, 'bunch', 30]]],
                ],
                4 => [ // Friday
                    ['method' => 'Cash', 'time' => '09:00', 'items' => [['Tomatoes', 15, 'kg', 80]]],
                ],
                5 => [ // Saturday — busiest day
                    ['method' => 'M-Pesa', 'time' => '08:30', 'items' => [['Tomatoes', 20, 'kg', 80]]],
                    ['method' => 'Cash',   'time' => '11:00', 'items' => [['Kale (Sukuma Wiki)', 34, 'bunch', 30]]],
                    ['method' => 'M-Pesa', 'time' => '14:00', 'items' => [['Tomatoes', 20, 'kg', 80]]],
                ],
            ],
            'peter.ochieng@sokomoja.co.ke' => [
                0 => [
                    ['method' => 'M-Pesa', 'time' => '08:00', 'items' => [['Fresh Milk', 20, 'litre', 65]]],
                ],
                2 => [
                    ['method' => 'Cash', 'time' => '10:30', 'items' => [['Wheat', 15, 'kg', 55]]],
                ],
                4 => [
                    ['method' => 'M-Pesa', 'time' => '09:00', 'items' => [['Fresh Milk', 25, 'litre', 65]]],
                    ['method' => 'Cash',   'time' => '15:00', 'items' => [['Wheat', 21, 'kg', 55]]],
                ],
                5 => [
                    ['method' => 'M-Pesa', 'time' => '08:15', 'items' => [['Fresh Milk', 30, 'litre', 65]]],
                    ['method' => 'Cash',   'time' => '13:00', 'items' => [['Wheat', 28, 'kg', 55]]],
                ],
            ],
            'samuel.mwangi@sokomoja.co.ke' => [
                1 => [
                    ['method' => 'Cash', 'time' => '09:00', 'items' => [['Dry Maize', 30, 'kg', 45]]],
                ],
                3 => [
                    ['method' => 'M-Pesa', 'time' => '11:00', 'items' => [['Sweet Potatoes', 20, 'kg', 50]]],
                ],
                5 => [
                    ['method' => 'Cash',   'time' => '09:30', 'items' => [['Dry Maize', 40, 'kg', 45]]],
                    ['method' => 'M-Pesa', 'time' => '14:30', 'items' => [['Sweet Potatoes', 40, 'kg', 50]]],
                ],
            ],
            'grace.njeri@sokomoja.co.ke' => [
                0 => [
                    ['method' => 'Cash', 'time' => '09:00', 'items' => [['Carrots', 10, 'kg', 60]]],
                ],
                2 => [
                    ['method' => 'M-Pesa', 'time' => '10:00', 'items' => [['Irish Potatoes', 25, 'kg', 40]]],
                ],
                5 => [
                    ['method' => 'Cash', 'time' => '10:30', 'items' => [['Spinach', 15, 'bunch', 40]]],
                ],
            ],
            'david.kipchoge@sokomoja.co.ke' => [
                1 => [
                    ['method' => 'Cash', 'time' => '09:00', 'items' => [['Free Range Eggs', 50, 'piece', 18]]],
                ],
                4 => [
                    ['method' => 'M-Pesa', 'time' => '11:30', 'items' => [['Free Range Eggs', 100, 'piece', 18]]],
                ],
                5 => [
                    ['method' => 'Cash',   'time' => '09:15', 'items' => [['Free Range Eggs', 80, 'piece', 18]]],
                    ['method' => 'M-Pesa', 'time' => '13:45', 'items' => [['Free Range Eggs', 76, 'piece', 18]]],
                ],
            ],
            'lucy.achieng@sokomoja.co.ke' => [
                0 => [
                    ['method' => 'Cash', 'time' => '09:00', 'items' => [['Avocados', 10, 'kg', 150]]],
                ],
                3 => [
                    ['method' => 'M-Pesa', 'time' => '12:00', 'items' => [['Passion Fruits', 5, 'kg', 200]]],
                ],
                5 => [
                    ['method' => 'Cash',   'time' => '09:45', 'items' => [['Avocados', 12, 'kg', 150]]],
                    ['method' => 'M-Pesa', 'time' => '14:15', 'items' => [['Passion Fruits', 7, 'kg', 200]]],
                ],
            ],
            'john.kamau@sokomoja.co.ke' => [
                2 => [
                    ['method' => 'Cash', 'time' => '10:00', 'items' => [['Bananas', 20, 'bunch', 50]]],
                ],
                4 => [
                    ['method' => 'M-Pesa', 'time' => '11:00', 'items' => [['Mangoes', 15, 'kg', 100]]],
                ],
                5 => [
                    ['method' => 'Cash',   'time' => '09:30', 'items' => [['Bananas', 22, 'bunch', 50]]],
                    ['method' => 'M-Pesa', 'time' => '15:30', 'items' => [['Mangoes', 30, 'kg', 100]]],
                ],
            ],
            'mary.wanjiku@sokomoja.co.ke' => [
                1 => [
                    ['method' => 'Cash', 'time' => '09:00', 'items' => [['Broccoli', 8, 'piece', 120]]],
                ],
                3 => [
                    ['method' => 'M-Pesa', 'time' => '11:30', 'items' => [['Cabbage', 15, 'piece', 35]]],
                ],
                5 => [
                    ['method' => 'Cash',   'time' => '09:15', 'items' => [['Broccoli', 9, 'piece', 120]]],
                    ['method' => 'M-Pesa', 'time' => '13:30', 'items' => [['Cabbage', 52, 'piece', 35]]],
                ],
            ],
        ];

        $created = 0;
        foreach ($weeks as $email => $days) {
            $sellerId = $this->sellers[$email] ?? null;
            if (!$sellerId) {
                continue;
            }

            foreach ($days as $dayIndex => $sales) {
                if ($dayIndex > $todayIndex) {
                    continue; // future day this week — not seeded yet
                }

                $date = $weekStart->copy()->addDays($dayIndex);

                foreach ($sales as $sale) {
                    $saleDate = $date->copy()->setTimeFromTimeString($sale['time']);

                    $totalAmount = 0;
                    foreach ($sale['items'] as [$name, $qty, $unit, $price]) {
                        $totalAmount += $qty * $price;
                    }

                    $posSale = PosSale::firstOrCreate(
                        ['seller_id' => $sellerId, 'sale_date' => $saleDate->toDateTimeString()],
                        [
                            'payment_method' => $sale['method'],
                            'total_amount'   => $totalAmount,
                        ]
                    );

                    if ($posSale->wasRecentlyCreated) {
                        foreach ($sale['items'] as [$name, $qty, $unit, $price]) {
                            PosSaleItem::create([
                                'sale_id'      => $posSale->sale_id,
                                'product_name' => $name,
                                'quantity'     => $qty,
                                'unit'         => $unit,
                                'unit_price'   => $price,
                                'subtotal'     => $qty * $price,
                            ]);
                        }
                        $created++;
                    }
                }
            }
        }

        $this->command->info("  pos_sales (this week) : {$created} new sales created");
    }
}
