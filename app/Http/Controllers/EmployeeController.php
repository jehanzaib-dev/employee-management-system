<?php

namespace App\Http\Controllers;

use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Models\Employee;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request): LengthAwarePaginator
    {
        $perPage = min((int) $request->integer('per_page', 10), 100);

        return Employee::query()
            ->with(['department', 'manager'])
            ->when($request->string('search')->trim()->toString(), function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('job_title', 'like', "%{$search}%");
                });
            })
            ->orderBy('last_name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $employee = Employee::create($request->validated());

        return response()->json($employee->load(['department', 'manager']), 201);
    }

    public function show(Employee $employee): Employee
    {
        return $employee->load(['department', 'manager', 'subordinates']);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): Employee
    {
        $employee->update($request->validated());

        return $employee->load(['department', 'manager']);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();

        return response()->json(status: 204);
    }
}
