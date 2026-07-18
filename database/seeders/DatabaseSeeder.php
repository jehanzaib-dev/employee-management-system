<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@ems.test',
            'password' => 'password',
            'role' => UserRole::Admin,
        ]);

        User::factory()->create([
            'name' => 'Hr User',
            'email' => 'hr@ems.test',
            'password' => 'password',
            'role' => UserRole::Hr,
        ]);

        User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@ems.test',
            'password' => 'password',
            'role' => UserRole::Manager,
        ]);

        User::factory()->create([
            'name' => 'Employee User',
            'email' => 'employee@ems.test',
            'password' => 'password',
            'role' => UserRole::Employee,
        ]);

        Department::factory(5)->create()->each(function (Department $department): void {
            $employees = Employee::factory(5)->for($department)->create();

            $employees->random(min(2, $employees->count()))->each(
                fn (Employee $employee) => $employee->update([
                    'manager_id' => $employees->except($employee->id)->random()->id,
                ])
            );
        }
        );
    }
}
