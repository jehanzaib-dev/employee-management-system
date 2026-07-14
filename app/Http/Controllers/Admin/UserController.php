<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * @return Collection<int, User>
     */
    public function index(): Collection
    {
        return User::orderBy('name')->get();
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return response()->json($user, 201);
    }

    public function show(User $user): User
    {
        return $user;
    }

    public function update(UpdateUserRequest $request, User $user): User
    {
        $data = $request->validated();

        if ($request->user()->id === $user->id && $data['role'] !== $user->role->value) {
            abort(422, "You can't change your own role.");
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return $user;
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            abort(422, "You can't delete your own account.");
        }

        $user->delete();

        return response()->json(status: 204);
    }
}
