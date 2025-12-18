# Authentication System

## Overview

Security-first authentication with mandatory 2FA. Single admin for MVP, extensible for multi-user later.

## MVP Scope

| Feature | MVP | Future |
|---------|-----|--------|
| Users | Single admin | Multi-user + roles |
| Registration | First user only, then locked | Invite system |
| 2FA | TOTP required | + WebAuthn/Passkeys |
| Password reset | Email link (rate limited) | + Admin reset |
| Sessions | Single active | Multi-device management |
| OAuth | No | GitHub, Google |

---

## User Flow

### First-Time Setup

```
Fresh install
    ↓
/setup (no auth required, only if 0 users exist)
    ↓
Create admin account (email + password)
    ↓
Forced redirect to /2fa/setup
    ↓
Scan QR code with authenticator app
    ↓
Enter TOTP to confirm
    ↓
Download recovery codes (10 single-use codes)
    ↓
Panel access granted
```

### Regular Login

```
/login
    ↓
Email + Password
    ↓
Valid? → /2fa/challenge
    ↓
Enter TOTP code (or recovery code)
    ↓
Valid? → Dashboard
```

### Password Reset

```
/forgot-password
    ↓
Enter email
    ↓
Rate limit check (3 per hour per email)
    ↓
Email sent with reset link (1 hour expiry, single-use)
    ↓
/reset-password?token=xxx
    ↓
Enter new password
    ↓
All other sessions invalidated
    ↓
Redirect to /login (2FA still required)
```

---

## Database Schema

```sql
-- MVP: Single user, extensible for multi-user
CREATE TABLE users (
    id CHAR(26) PRIMARY KEY,              -- ULID
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    two_factor_secret TEXT NULL,          -- Encrypted, null until setup
    two_factor_confirmed_at TIMESTAMP NULL,
    recovery_codes TEXT NULL,             -- Encrypted JSON array
    role ENUM('admin') DEFAULT 'admin',   -- Future: admin, operator, viewer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Laravel database sessions
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id CHAR(26) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity)
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,          -- Hashed
    created_at TIMESTAMP NULL
);

-- Rate limiting & audit trail
CREATE TABLE login_attempts (
    id CHAR(26) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    successful BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(50) NULL,      -- invalid_password, invalid_2fa, rate_limited
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_created (email, created_at),
    INDEX idx_ip_created (ip_address, created_at)
);

-- Future: invite system (create table now, use later)
CREATE TABLE user_invites (
    id CHAR(26) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,          -- Hashed
    invited_by CHAR(26) NULL,
    role ENUM('admin', 'operator', 'viewer') DEFAULT 'operator',
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_token (token)
);
```

---

## Rate Limiting

### Password Reset Limits

| Limit | Value | Scope |
|-------|-------|-------|
| Per email | 3 per hour | Prevents spam to single user |
| Per IP | 10 per hour | Prevents enumeration attacks |
| Global | 100 per hour | Prevents DDoS on mail server |

### Login Limits

| Limit | Value | Action |
|-------|-------|--------|
| Failed attempts | 5 per 15 min | Temporary lockout |
| Continued failures | 15 per hour | Extended lockout + alert |

---

## Bypassing Rate Limits

### During Development/Testing

**Option 1: .env override**

```env
# .env (NEVER in production)
UPANEL_RATE_LIMIT_BYPASS=true
```

```php
// RateLimitServiceProvider
if (config('upanel.auth.rate_limit_bypass') && app()->environment('local', 'testing')) {
    // Skip rate limiting entirely
    return;
}
```

**Option 2: Artisan command**

```bash
# Clear rate limits for specific email
docker compose exec app php artisan upanel:clear-rate-limit --email=admin@example.com

# Clear all rate limits (testing only)
docker compose exec app php artisan upanel:clear-rate-limit --all
```

**Option 3: Tinker (quick fix)**

```bash
docker compose exec app php artisan tinker
```
```php
// Clear password reset rate limit
Cache::forget('password-reset-' . md5('admin@example.com'));

// Clear login rate limit
Cache::forget('login-attempts-' . md5('admin@example.com'));
Cache::forget('login-attempts-ip-' . md5(request()->ip()));
```

### Production Emergency Access

**Scenario:** Legitimate user locked out, rate limited, can't reset password.

**Option 1: Artisan command (requires SSH access)**

```bash
# Clear rate limit for specific user
docker compose exec app php artisan upanel:clear-rate-limit --email=admin@example.com

# Force password reset (generates new reset link, bypasses rate limit)
docker compose exec app php artisan upanel:force-reset --email=admin@example.com
# Outputs: Reset link valid for 1 hour: https://panel.example.com/reset-password?token=xxx
```

**Option 2: Direct database (last resort)**

```bash
docker compose exec app php artisan tinker
```
```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Option A: Reset password directly (user will need their 2FA)
$user = User::where('email', 'admin@example.com')->first();
$user->password = Hash::make('TemporaryPassword123!');
$user->save();

// Option B: Reset password AND clear 2FA (emergency only, re-setup required)
$user = User::where('email', 'admin@example.com')->first();
$user->password = Hash::make('TemporaryPassword123!');
$user->two_factor_secret = null;
$user->two_factor_confirmed_at = null;
$user->recovery_codes = null;
$user->save();

// Clear all sessions for this user
DB::table('sessions')->where('user_id', $user->id)->delete();
```

**Option 3: Environment override (temporary)**

```env
# Add to .env temporarily
UPANEL_EMERGENCY_ACCESS=true
```

```php
// EmergencyAccessMiddleware - allows login without 2FA for 1 hour
// MUST be removed immediately after access restored
// Logged as security event
```

### Recovery Codes

If user has recovery codes, they can bypass 2FA without admin intervention:

```
/2fa/challenge
    ↓
"Use recovery code instead"
    ↓
Enter one of 10 single-use codes
    ↓
Code consumed (can't reuse)
    ↓
Access granted
    ↓
Warning: "You have X recovery codes remaining. Generate new codes in settings."
```

---

## Security Events Logging

All auth events logged for audit:

```php
// Events to log
SecurityEvent::log('login_success', ['ip' => $ip, 'user_agent' => $ua]);
SecurityEvent::log('login_failed', ['reason' => 'invalid_password', 'email' => $email]);
SecurityEvent::log('2fa_failed', ['user_id' => $id]);
SecurityEvent::log('password_reset_requested', ['email' => $email, 'ip' => $ip]);
SecurityEvent::log('password_reset_completed', ['user_id' => $id]);
SecurityEvent::log('rate_limit_hit', ['type' => 'password_reset', 'email' => $email]);
SecurityEvent::log('rate_limit_bypassed', ['type' => 'artisan_command', 'email' => $email]); // Alert!
SecurityEvent::log('emergency_access_enabled', ['by' => 'env_override']); // Critical alert!
```

---

## Configuration

```php
// config/upanel.php
return [
    'auth' => [
        // Registration
        'registration_enabled' => env('UPANEL_REGISTRATION', false),
        
        // 2FA
        'require_2fa' => env('UPANEL_REQUIRE_2FA', true),
        'recovery_codes_count' => 10,
        
        // Sessions
        'session_lifetime' => env('UPANEL_SESSION_LIFETIME', 480), // 8 hours
        'max_sessions' => env('UPANEL_MAX_SESSIONS', 1),
        
        // Rate limiting
        'rate_limit_bypass' => env('UPANEL_RATE_LIMIT_BYPASS', false),
        'password_reset_limit' => 3,  // per hour per email
        'login_attempt_limit' => 5,   // per 15 min
        
        // Emergency
        'emergency_access' => env('UPANEL_EMERGENCY_ACCESS', false),
    ],
];
```

---

## Artisan Commands Reference

```bash
# Clear rate limits
php artisan upanel:clear-rate-limit --email=user@example.com
php artisan upanel:clear-rate-limit --ip=192.168.1.1
php artisan upanel:clear-rate-limit --all  # Dev only

# Force password reset (bypass rate limit)
php artisan upanel:force-reset --email=user@example.com

# Invalidate all sessions for user
php artisan upanel:logout-user --email=user@example.com

# Reset 2FA (user must reconfigure)
php artisan upanel:reset-2fa --email=user@example.com

# List recent security events
php artisan upanel:security-log --last=24h

# Audit: check for suspicious activity
php artisan upanel:security-audit
```

---

## Testing Checklist

```bash
# Run auth tests
docker compose exec app php artisan test --filter=AuthTest

# Test scenarios:
# - [ ] Fresh install redirects to /setup
# - [ ] Setup creates admin and forces 2FA
# - [ ] Login requires email + password + TOTP
# - [ ] Invalid password returns error (no user enumeration)
# - [ ] Invalid TOTP returns error
# - [ ] Recovery code works (single use)
# - [ ] Password reset sends email
# - [ ] Password reset rate limited after 3 attempts
# - [ ] Rate limit bypass works in testing env
# - [ ] Session invalidated after password reset
# - [ ] 2FA still required after password reset
```
