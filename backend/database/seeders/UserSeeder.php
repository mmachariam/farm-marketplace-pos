<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\PickupZone;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('SokoMoja2026!');

        // Look up zone IDs by name
        $zones = PickupZone::pluck('zone_id', 'zone_name');

        // ── Admin ─────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@sokomoja.co.ke'],
            [
                'name'        => 'Admin SokoMoja',
                'password'    => $password,
                'role'        => 'admin',
                'region'      => 'Nairobi',
                'is_verified' => true,
                'status'      => 'active',
            ]
        );

        // ── Farmers / Sellers ─────────────────────────────────────────
        $sellers = [
            [
                'name'         => 'Jane Wambui Kamau',
                'email'        => 'jane.wambui@sokomoja.co.ke',
                'phone_number' => '0712345678',
                'region'       => 'Kiambu',
                'zone'         => 'Kiambu',
            ],
            [
                'name'         => 'Peter Ochieng Otieno',
                'email'        => 'peter.ochieng@sokomoja.co.ke',
                'phone_number' => '0723456789',
                'region'       => 'Nakuru',
                'zone'         => 'Nakuru',
            ],
            [
                'name'         => 'Samuel Mwangi Kariuki',
                'email'        => 'samuel.mwangi@sokomoja.co.ke',
                'phone_number' => '0734567890',
                'region'       => 'Meru',
                'zone'         => 'Meru',
            ],
            [
                'name'         => 'Grace Njeri Gitau',
                'email'        => 'grace.njeri@sokomoja.co.ke',
                'phone_number' => '0745678901',
                'region'       => 'Kiambu',
                'zone'         => 'Kiambu',
            ],
            [
                'name'         => 'David Kipchoge Rotich',
                'email'        => 'david.kipchoge@sokomoja.co.ke',
                'phone_number' => '0756789012',
                'region'       => 'Eldoret',
                'zone'         => 'Eldoret',
            ],
            [
                'name'         => 'Lucy Achieng Owino',
                'email'        => 'lucy.achieng@sokomoja.co.ke',
                'phone_number' => '0767890123',
                'region'       => 'Kisumu',
                'zone'         => 'Kisumu',
            ],
            [
                'name'         => 'John Kamau Mwangi',
                'email'        => 'john.kamau@sokomoja.co.ke',
                'phone_number' => '0778901234',
                'region'       => 'Nyeri',
                'zone'         => 'Nyeri',
            ],
            [
                'name'         => 'Mary Wanjiku Ndungu',
                'email'        => 'mary.wanjiku@sokomoja.co.ke',
                'phone_number' => '0789012345',
                'region'       => 'Kiambu',
                'zone'         => 'Kiambu',
            ],
        ];

        foreach ($sellers as $seller) {
            User::firstOrCreate(
                ['email' => $seller['email']],
                [
                    'name'         => $seller['name'],
                    'password'     => $password,
                    'phone_number' => $seller['phone_number'],
                    'role'         => 'seller',
                    'region'       => $seller['region'],
                    'zone_id'      => $zones[$seller['zone']] ?? null,
                    'is_verified'  => true,
                    'status'       => 'active',
                ]
            );
        }

        // ── Buyers ────────────────────────────────────────────────────
        $buyers = [
            [
                'name'         => 'Brian Otieno Ouma',
                'email'        => 'brian.otieno@gmail.com',
                'phone_number' => '0790123456',
                'region'       => 'Nairobi',
            ],
            [
                'name'         => 'Faith Muthoni Kamau',
                'email'        => 'faith.muthoni@gmail.com',
                'phone_number' => '0701234567',
                'region'       => 'Nairobi',
            ],
            [
                'name'         => 'Kevin Njoroge Gitau',
                'email'        => 'kevin.njoroge@gmail.com',
                'phone_number' => '0711234567',
                'region'       => 'Kiambu',
            ],
            [
                'name'         => 'Mercy Akinyi Otieno',
                'email'        => 'mercy.akinyi@gmail.com',
                'phone_number' => '0722345678',
                'region'       => 'Kisumu',
            ],
            [
                'name'         => 'James Mwenda Kirimi',
                'email'        => 'james.mwenda@gmail.com',
                'phone_number' => '0733456789',
                'region'       => 'Meru',
            ],
            [
                'name'         => 'Sandra Wanjiru Ngugi',
                'email'        => 'sandra.wanjiru@gmail.com',
                'phone_number' => '0744567890',
                'region'       => 'Nakuru',
            ],
        ];

        foreach ($buyers as $buyer) {
            User::firstOrCreate(
                ['email' => $buyer['email']],
                [
                    'name'         => $buyer['name'],
                    'password'     => $password,
                    'phone_number' => $buyer['phone_number'],
                    'role'         => 'buyer',
                    'region'       => $buyer['region'],
                    'is_verified'  => true,
                    'status'       => 'active',
                ]
            );
        }

        $total = User::count();
        $this->command->info("  users        : {$total} (1 admin, 8 sellers, 6 buyers — password: SokoMoja2026!)");
    }
}
