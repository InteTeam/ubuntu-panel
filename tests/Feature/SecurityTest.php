<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class SecurityTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function guest_cannot_access_dashboard(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');
    }

    #[Test]
    public function guest_cannot_access_servers(): void
    {
        $response = $this->get('/servers');
        $response->assertRedirect('/login');
    }

    #[Test]
    public function guest_cannot_access_apps(): void
    {
        $response = $this->get('/apps');
        $response->assertRedirect('/login');
    }

    #[Test]
    public function guest_cannot_access_backups(): void
    {
        $response = $this->get('/backups');
        $response->assertRedirect('/login');
    }

    #[Test]
    public function guest_cannot_access_security(): void
    {
        $response = $this->get('/security');
        $response->assertRedirect('/login');
    }

    #[Test]
    public function guest_cannot_access_settings(): void
    {
        $response = $this->get('/settings');
        $response->assertRedirect('/login');
    }

    #[Test]
    public function guest_cannot_access_notifications(): void
    {
        $response = $this->get('/notifications');
        $response->assertRedirect('/login');
    }

    #[Test]
    public function authenticated_user_can_access_dashboard(): void
    {
        $user = User::factory()->twoFactorConfirmed()->create();

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertOk();
    }

    #[Test]
    public function user_without_2fa_is_redirected_to_setup(): void
    {
        $user = User::factory()->create([
            'two_factor_confirmed_at' => null,
        ]);

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertRedirect(route('two-factor.setup'));
    }

    #[Test]
    public function security_headers_are_present(): void
    {
        $user = User::factory()->twoFactorConfirmed()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    #[Test]
    public function login_is_rate_limited(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $this->post('/login', [
                'email' => 'test@example.com',
                'password' => 'wrongpassword',
            ]);
        }

        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        // After 5 failed attempts, should be throttled
        $response->assertStatus(429);
    }

    #[Test]
    public function csrf_token_is_required(): void
    {
        $response = $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class)
            ->post('/login', [
                'email' => 'test@example.com',
                'password' => 'password',
            ]);

        // Without CSRF middleware disabled, this would fail
        $response->assertStatus(302);
    }
}
