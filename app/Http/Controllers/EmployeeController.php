<?php

namespace App\Http\Controllers;

use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Requests\Employee\UploadEmployeePhotoRequest;
use App\Mail\NewTeamMemberMail;
use App\Models\Employee;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeController extends Controller
{
    public function index(Request $request): LengthAwarePaginator
    {
        $perPage = min((int) $request->integer('per_page', 10), 100);

        return $this->filteredEmployeesQuery($request)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function export(Request $request): StreamedResponse
    {
        $employees = $this->filteredEmployeesQuery($request)->get();

        return response()->streamDownload(function () use ($employees): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Name', 'Email', 'Phone', 'Department', 'Job Title', 'Manager', 'Hire Date', 'Salary', 'Status']);

            foreach ($employees as $employee) {
                fputcsv($handle, [
                    "{$employee->first_name} {$employee->last_name}",
                    $employee->email,
                    $employee->phone,
                    $employee->department?->name,
                    $employee->job_title,
                    $employee->manager ? "{$employee->manager->first_name} {$employee->manager->last_name}" : '',
                    $employee->hire_date->format('Y-m-d'),
                    $employee->salary,
                    $employee->status->value,
                ]);
            }

            fclose($handle);
        }, 'employees.csv', ['Content-Type' => 'text/csv']);
    }

    private function filteredEmployeesQuery(Request $request): Builder
    {
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
            ->orderBy('last_name');
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        Gate::authorize('create', Employee::class);

        $employee = Employee::create($request->validated())->load(['department', 'manager']);

        if ($employee->manager?->email) {
            try {
                Mail::to($employee->manager->email)->send(new NewTeamMemberMail($employee));
            } catch (\Throwable $e) {
                Log::warning('Failed to send new team member email', [
                    'employee_id' => $employee->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json($employee, 201);
    }

    public function show(Employee $employee): Employee
    {
        return $employee->load(['department', 'manager', 'subordinates']);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): Employee
    {
        Gate::authorize('update', $employee);

        $employee->update($request->validated());

        return $employee->load(['department', 'manager']);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        Gate::authorize('delete', $employee);

        if ($employee->photo_path) {
            Storage::disk('public')->delete($employee->photo_path);
        }

        $employee->delete();

        return response()->json(status: 204);
    }

    public function uploadPhoto(UploadEmployeePhotoRequest $request, Employee $employee): Employee
    {
        Gate::authorize('update', $employee);

        if ($employee->photo_path) {
            Storage::disk('public')->delete($employee->photo_path);
        }

        $path = $request->file('photo')->store('employees', 'public');

        $employee->update(['photo_path' => $path]);

        return $employee->load(['department', 'manager']);
    }

    public function removePhoto(Employee $employee): Employee
    {
        Gate::authorize('update', $employee);

        if ($employee->photo_path) {
            Storage::disk('public')->delete($employee->photo_path);
        }

        $employee->update(['photo_path' => null]);

        return $employee->load(['department', 'manager']);
    }
}
