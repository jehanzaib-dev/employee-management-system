<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Requests are made to look like they originate from the SPA's own
     * origin, matching real browser same-origin requests, so Sanctum's
     * stateful middleware starts a session instead of falling back to
     * token auth.
     *
     * @var array<string, string>
     */
    protected $defaultHeaders = [
        'referer' => 'http://localhost',
    ];
}
