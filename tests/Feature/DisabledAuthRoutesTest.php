<?php

namespace Tests\Feature;

use Tests\TestCase;

class DisabledAuthRoutesTest extends TestCase
{
    public function test_visitors_cannot_access_register_route(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(404); // or 403 if you manually block it
    }
    
    public function test_visitors_cannot_access_forgot_password_route(): void
    {
        $response = $this->get('/forgot-password');
        $response->assertStatus(404); // or 403 if blocked
    }
}
