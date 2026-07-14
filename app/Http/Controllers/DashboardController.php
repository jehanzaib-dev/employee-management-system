<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;

class DashboardController extends Controller
{
    public function index(): array
    {
        return [
            'total_employees' => Employee::count(),
            'total_departments' => Department::count(),
            'employees_by_status' => Employee::query()
                ->select('status')
                ->selectRaw('count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'employees_by_department' => Department::withCount('employees')
                ->orderByDesc('employees_count')
                ->get(['id', 'name']),
            'recent_hires' => Employee::with('department')
                ->orderByDesc('hire_date')
                ->limit(5)
                ->get(['id', 'first_name', 'last_name', 'department_id', 'job_title', 'hire_date']),
        ];
    }
}
