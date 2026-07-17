<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::apiResource('departments', DepartmentController::class);
    Route::get('employees/export', [EmployeeController::class, 'export']);
    Route::apiResource('employees', EmployeeController::class);
    Route::post('employees/{employee}/photo', [EmployeeController::class, 'uploadPhoto']);
    Route::delete('employees/{employee}/photo', [EmployeeController::class, 'removePhoto']);

    Route::middleware('role:admin')->prefix('admin')->group(function (): void {
        Route::apiResource('users', UserController::class);
    });
}
);
