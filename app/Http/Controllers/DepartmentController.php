<?php

namespace App\Http\Controllers;

use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Models\Department;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class DepartmentController extends Controller
{
    /**
     * @return Collection<int, Department>
     */
    public function index(): Collection
    {
        return Department::withCount('employees')->get();
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create($request->validated());

        return response()->json($department, 201);
    }

    public function show(Department $department): Department
    {
        return $department->loadCount('employees');
    }

    public function update(UpdateDepartmentRequest $request, Department $department): Department
    {
        $department->update($request->validated());

        return $department;
    }

    public function destroy(Department $department): JsonResponse
    {
        try {
            $department->delete();
        } catch (QueryException) {
            return response()->json([
                'message' => 'This department still has employees assigned to it and cannot be deleted.',
            ], 422);
        }

        return response()->json(status: 204);
    }
}
