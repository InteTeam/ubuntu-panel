# Authentication Feature

**Status:** Planning  
**Priority:** Critical  
**Phase:** 1

---

## Overview

Complete authentication system with 2FA enforcement for UPanel admin access.

---

## User Stories

- As an admin, I want to create the first account via setup wizard
- As an admin, I want to log in with email and password
- As an admin, I want to be forced to set up 2FA after first login
- As an admin, I want to reset my password via email
- As an admin, I want recovery codes if I lose my 2FA device

---

## Acceptance Criteria

- [ ] First user can register via setup wizard (registration locked after)
- [ ] Login requires valid email + password
- [ ] 2FA setup is mandatory after first login
- [ ] Cannot access panel without confirmed 2FA
- [ ] Password reset sends email with single-use link
- [ ] Rate limiting prevents brute force (5 attempts/min)
- [ ] Sessions stored in database
- [ ] 8 hour idle timeout, 24 hour absolute timeout

---

## Guideline Compliance

See [FEATURE_DESIGN_CHECKLIST.md](/docs/FEATURE_DESIGN_CHECKLIST.md)

**Status:** 0/47 (0%) - Not started

---

## Technical Design

### Database Tables
- `users` - [/docs/database/migrations/001_create_users_table.md]
- `sessions` - [/docs/database/migrations/002_create_sessions_table.md]
- `password_reset_tokens` - [/docs/database/migrations/003_create_password_reset_tokens_table.md]
- `login_attempts` - [/docs/database/migrations/004_create_login_attempts_table.md]

### Models
- `App\Models\User`

### Services
- `App\Services\AuthService`
- `App\Services\TwoFactorService`

### Controllers
- `App\Http\Controllers\Auth\SetupController`
- `App\Http\Controllers\Auth\LoginController`
- `App\Http\Controllers\Auth\TwoFactorController`
- `App\Http\Controllers\Auth\PasswordResetController`

### Middleware
- `EnsureTwoFactorConfirmed`
- `ThrottleRequests`

---

## Frontend Components

### Pages
- `Pages/Auth/Setup.tsx` - First user creation
- `Pages/Auth/Login.tsx` - Email + password
- `Pages/Auth/TwoFactor/Challenge.tsx` - Enter TOTP
- `Pages/Auth/TwoFactor/Setup.tsx` - QR code + confirm
- `Pages/Auth/ForgotPassword.tsx` - Request reset
- `Pages/Auth/ResetPassword.tsx` - New password

### Components (Reuse)
- `ui/button` - Form buttons
- `ui/input` - Text fields
- `ui/label` - Field labels
- `ui/card` - Form containers
- `Molecules/FormField` - Field wrapper

### Components (Create)
- `atoms/QRCode` - 2FA QR display
- `molecules/RecoveryCodesList` - Display recovery codes
- `organisms/LoginForm` - Login form
- `organisms/SetupForm` - First user form
- `organisms/TwoFactorSetupForm` - 2FA setup

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/setup/status | Check if setup needed |
| POST | /api/setup | Create first user |
| POST | /login | Login |
| POST | /logout | Logout |
| POST | /2fa/challenge | Verify TOTP |
| GET | /2fa/setup | Get QR code |
| POST | /2fa/confirm | Confirm 2FA setup |
| POST | /forgot-password | Request reset |
| POST | /reset-password | Complete reset |

---

## Testing

- [ ] Setup wizard creates admin when no users exist
- [ ] Setup blocked when users exist
- [ ] Login succeeds with valid credentials
- [ ] Login fails with invalid credentials
- [ ] 2FA challenge required after login
- [ ] 2FA setup generates valid QR code
- [ ] 2FA confirm validates TOTP
- [ ] Recovery code works (single use)
- [ ] Password reset sends email
- [ ] Password reset token expires after 1 hour
- [ ] Rate limiting blocks after 5 attempts
- [ ] Session timeout works

---

## Tasks

See [IMPLEMENTATION_TASKS.md](/docs/IMPLEMENTATION_TASKS.md) - Phase 1.3
