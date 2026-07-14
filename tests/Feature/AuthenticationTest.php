<?php

use App\Enums\UserRole;
use App\Models\User;

test('a user can log in with valid credentials', function () {
    $user = User::factory()->create([
        'password' => 'password',
    ]);

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSuccessful();
    $this->assertAuthenticatedAs($user);
});

test('a user cannot log in with an invalid password', function () {
    $user = User::factory()->create([
        'password' => 'password',
    ]);

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertUnprocessable();
    $this->assertGuest();
});

test('login is rate limited after too many attempts', function () {
    $user = User::factory()->create([
        'password' => 'password',
    ]);

    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);
    }

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertUnprocessable();
    $this->assertGuest();
});

test('an authenticated user can log out', function () {
    $user = User::factory()->create([
        'password' => 'password',
    ]);

    $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSuccessful();

    $response = $this->postJson('/api/logout');

    $response->assertNoContent();

    // The sanctum guard caches its resolved user for the lifetime of the
    // test's container; forgetGuards() clears that cache so the next
    // request re-resolves auth state instead of reusing the stale result,
    // matching real usage where every request is a fresh process.
    $this->app['auth']->forgetGuards();

    $this->getJson('/api/user')->assertUnauthorized();
});

test('a guest cannot log out', function () {
    $response = $this->postJson('/api/logout');

    $response->assertUnauthorized();
});

test('an authenticated user can fetch their own user data', function () {
    $user = User::factory()->create(['role' => UserRole::Hr]);

    $response = $this->actingAs($user)->getJson('/api/user');

    $response->assertSuccessful();
    $response->assertJson([
        'id' => $user->id,
        'email' => $user->email,
        'role' => UserRole::Hr->value,
    ]);
});

test('a guest cannot fetch user data', function () {
    $response = $this->getJson('/api/user');

    $response->assertUnauthorized();
});
