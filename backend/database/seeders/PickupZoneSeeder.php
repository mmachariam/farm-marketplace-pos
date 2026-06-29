<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PickupZone;

class PickupZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            [
                'zone_name'      => 'Kiambu Zone',
                'pickup_address' => 'Kiambu Town Market, Thika Road, Kiambu',
                'region'         => 'Kiambu',
            ],
            [
                'zone_name'      => 'Nakuru Zone',
                'pickup_address' => 'Nakuru Municipal Market, Kenyatta Avenue, Nakuru',
                'region'         => 'Nakuru',
            ],
            [
                'zone_name'      => 'Meru Zone',
                'pickup_address' => 'Meru Main Market, Moi Avenue, Meru',
                'region'         => 'Meru',
            ],
            [
                'zone_name'      => 'Nairobi CBD',
                'pickup_address' => 'City Market, Muindi Mbingu Street, Nairobi',
                'region'         => 'Nairobi',
            ],
            [
                'zone_name'      => 'Eldoret Zone',
                'pickup_address' => 'Eldoret Municipal Market, Uganda Road, Eldoret',
                'region'         => 'Eldoret',
            ],
            [
                'zone_name'      => 'Kisumu Zone',
                'pickup_address' => 'Kisumu Main Market, Oginga Odinga Street, Kisumu',
                'region'         => 'Kisumu',
            ],
            [
                'zone_name'      => 'Nyeri Zone',
                'pickup_address' => 'Nyeri Municipal Market, Kimathi Way, Nyeri',
                'region'         => 'Nyeri',
            ],
            [
                'zone_name'      => 'Machakos Zone',
                'pickup_address' => "Machakos People's Market, Machakos Town",
                'region'         => 'Machakos',
            ],
        ];

        foreach ($zones as $zone) {
            PickupZone::firstOrCreate(['zone_name' => $zone['zone_name']], $zone);
        }

        $this->command->info('  pickup_zones : ' . PickupZone::count());
    }
}
