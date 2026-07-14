<?php

namespace App\Http\Controllers;

use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;

class EmployeeController extends Controller
{
    /**
     * @return Collection<int, Employee>
     */
    public function index(): Collection
    {
        return Employee::with(['department', 'manager'])->get();
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
