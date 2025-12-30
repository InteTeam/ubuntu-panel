# Password Generator Feature

**Status:** Planning
**Priority:** Low
**Phase:** Enhancement

---

## Overview

Add a password/secret generator tool to help users create strong, random values for environment variables, database passwords, API keys, and other secrets. The goal is to make security "stupid-proof" by removing the friction of creating strong passwords.

---

## User Stories

- As an admin, I want to generate a strong password when adding environment variables
- As an admin, I want to customize password length and character types
- As an admin, I want to copy generated passwords easily
- As an admin, I want to generate Laravel APP_KEY values in the correct format

---

## Acceptance Criteria

- [ ] Generate button appears next to value fields in EnvEditor
- [ ] Clicking generate shows popover with options
- [ ] Password length configurable (12-64 characters, default 32)
- [ ] Toggle options: uppercase, lowercase, numbers, symbols
- [ ] Generated password previewed before applying
- [ ] One-click to apply generated value to field
- [ ] Copy to clipboard functionality
- [ ] Special "Laravel APP_KEY" preset generates base64 format
- [ ] Cryptographically secure random generation (Web Crypto API)

---

## Guideline Compliance

See [FEATURE_DESIGN_CHECKLIST.md](/docs/FEATURE_DESIGN_CHECKLIST.md)

### Backend Checklist

**Not applicable** - This is a frontend-only feature. Password generation happens client-side using Web Crypto API for security (no secrets transmitted over network).

### Frontend Checklist

- [x] Listed existing components FIRST
- [x] Identified reusable components: `ui/button`, `ui/popover`, `ui/checkbox`, `ui/input`, `ui/label`, `ui/slider` (need to add)
- [x] Only planning components that DON'T exist
- [x] Import paths documented for reused components

**Status:** Frontend-only feature, no backend changes needed.

---

## Technical Design

### Why Client-Side Only?

1. **Security**: Generated secrets never leave the browser
2. **Simplicity**: No API endpoints to secure
3. **Performance**: Instant generation, no network latency
4. **Offline capable**: Works without server connection

### Cryptographic Approach

Using Web Crypto API (`crypto.getRandomValues()`) for cryptographically secure random number generation:

```typescript
// Secure random generation
const array = new Uint32Array(length);
crypto.getRandomValues(array);
```

This is the same approach used by password managers like 1Password and Bitwarden.

---

## Frontend Components

### Components (Reuse)

| Component | Import Path | Usage |
|-----------|-------------|-------|
| Button | `@/components/ui/button` | Generate button, Apply button |
| Popover | `@/components/ui/popover` | Options dropdown |
| Checkbox | `@/components/ui/checkbox` | Character type toggles |
| Input | `@/components/ui/input` | Length input, preview |
| Label | `@/components/ui/label` | Option labels |
| Slider | `@/components/ui/slider` | Length slider (if exists) |

### Components (Create)

| Component | Type | Location | Description |
|-----------|------|----------|-------------|
| PasswordGenerator | Molecule | `Molecules/PasswordGenerator.tsx` | Main generator popover with options |

### Component Design

```
┌─────────────────────────────────────────────────────────────────┐
│ EnvEditor Row                                                   │
├─────────────────────────────────────────────────────────────────┤
│ [KEY________] [value________________] [🎲] [👁] [🗑]            │
│                                        │                        │
│                    ┌───────────────────┴────────────────────┐   │
│                    │ Generate Password                      │   │
│                    ├────────────────────────────────────────┤   │
│                    │                                        │   │
│                    │ Length: [====●==============] 32       │   │
│                    │                                        │   │
│                    │ ☑ Uppercase (A-Z)                      │   │
│                    │ ☑ Lowercase (a-z)                      │   │
│                    │ ☑ Numbers (0-9)                        │   │
│                    │ ☑ Symbols (!@#$%^&*)                   │   │
│                    │                                        │   │
│                    │ Preview:                               │   │
│                    │ ┌──────────────────────────────────┐   │   │
│                    │ │ xK9#mP2$vL5nQ8@jR3wT6yU1iO4pA   │   │   │
│                    │ └──────────────────────────────────┘   │   │
│                    │                                        │   │
│                    │ [🔄 Regenerate]  [📋 Copy]  [✓ Use]   │   │
│                    └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Presets

| Preset | Length | Characters | Use Case |
|--------|--------|------------|----------|
| Default | 32 | All | General passwords |
| Database | 24 | Alphanumeric | DB_PASSWORD (no special chars that break shells) |
| API Key | 48 | Alphanumeric | Long API tokens |
| Laravel APP_KEY | 32 | base64 output | `base64:...` format |

---

## Integration Points

### 1. EnvEditor Enhancement

Modify `Molecules/EnvEditor.tsx` to add generate button per row:

```tsx
// Add generate button between value input and delete button
<PasswordGenerator
    onGenerate={(password) => updateValue(key, password)}
/>
```

### 2. Standalone Usage (Future)

Could be used in:
- Git Credentials form (for tokens)
- Setup page (admin password)
- Any password/secret input field

---

## API Endpoints

**None** - Client-side only feature.

---

## Testing

### Unit Tests (Vitest)

- [ ] Generates password of specified length
- [ ] Respects character type options
- [ ] Generates different passwords on each call
- [ ] Handles edge cases (length 1, length 64)
- [ ] Laravel APP_KEY format is valid base64

### Component Tests (React Testing Library)

- [ ] Popover opens on button click
- [ ] Options update preview
- [ ] Copy button copies to clipboard
- [ ] Use button calls onGenerate callback
- [ ] Regenerate creates new password

### Manual Testing

- [ ] Generator works in EnvEditor
- [ ] Generated passwords look random (visual check)
- [ ] Copy to clipboard works across browsers

---

## Implementation Tasks

### Phase 1: Core Component

1. Create `lib/password-generator.ts` utility
   - `generatePassword(options)` function
   - `generateLaravelKey()` function
   - Web Crypto API integration

2. Create `Molecules/PasswordGenerator.tsx`
   - Popover with options
   - Preview display
   - Action buttons

3. Add Slider component to `ui/` if not exists

### Phase 2: Integration

4. Update `Molecules/EnvEditor.tsx`
   - Add generate button per row
   - Wire up PasswordGenerator component

### Phase 3: Polish

5. Add presets dropdown
6. Add keyboard shortcuts (Enter to apply)
7. Add success toast on copy

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Weak randomness | Use Web Crypto API, not Math.random() |
| Password exposure | Generated in browser, never sent to server |
| Clipboard security | Standard browser clipboard API |
| Memory exposure | No persistent storage of generated passwords |

---

## Alternatives Considered

### 1. Server-Side Generation

**Rejected** because:
- Adds API endpoint to secure
- Secrets transmitted over network
- More complex implementation
- No benefit over client-side

### 2. External Library (e.g., `generate-password`)

**Rejected** because:
- Additional dependency
- Simple enough to implement ourselves
- Full control over crypto implementation

---

## Open Questions

1. Should we add password strength indicator?
2. Should presets be user-configurable?
3. Add to Setup page for admin password?

---

## References

- [Web Crypto API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
