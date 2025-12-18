# Feature Design Checklist - UPanel

**Purpose:** Ensure all features comply with project guidelines from design stage  
**When:** During feature planning, BEFORE implementation

---

## Backend Guidelines

### Testing (Pest 4)
- [ ] Tests use Pest 4 functional syntax (no PHPUnit classes)
- [ ] Tests use factories (not seeders)
- [ ] RefreshDatabase trait used
- [ ] Test datasets planned for edge cases
- [ ] SSH commands mocked in tests
- [ ] Agent API calls mocked in tests

### Models
- [ ] `declare(strict_types=1)` at top
- [ ] Uses `HasUlids` trait (not auto-increment)
- [ ] Uses `#[UsePolicy(PolicyClass::class)]` attribute
- [ ] Relationships have return types
- [ ] Uses `casts()` method (not `$casts` property)
- [ ] Sensitive fields use `encrypted` cast

### Policies
- [ ] All methods: `viewAny, view, create, update, delete`
- [ ] Registered via `#[UsePolicy]` on model
- [ ] Single-admin MVP: simplified checks

### Controllers
- [ ] `#[UsePolicy(PolicyClass::class)]` attribute
- [ ] Authorization: `if (!auth()->user()->can(...)) { abort(403); }`
- [ ] NO `$this->authorize()` method
- [ ] Flash messages: `['alert' => 'The message.', 'type' => 'success']`
- [ ] Messages: Start "The", end ".", past tense
- [ ] Form Requests return `true` in `authorize()`
- [ ] Thin controllers (< 10 lines per method)
- [ ] Business logic in Services

### Services
- [ ] `final` class
- [ ] Business logic here (not controllers)
- [ ] Database transactions where needed
- [ ] Proper type declarations
- [ ] SSH operations via SshService
- [ ] Logging for debugging

### Migrations
- [ ] `declare(strict_types=1)`
- [ ] Using `ulid()` and `foreignUlid()`
- [ ] Foreign keys: `constrained()->cascadeOnDelete()`
- [ ] Indexes on frequently queried columns
- [ ] Encrypted columns for sensitive data

### Validation
- [ ] Form Request classes
- [ ] Array-based rules (not pipe strings)
- [ ] PHPDoc annotations

### Quality
- [ ] PHPStan Level 9
- [ ] Laravel Pint formatting

---

## Frontend Guidelines

### Component Inventory (MANDATORY FIRST)

Before planning ANY components:
```bash
# Check existing components
list_directory: resources/js/components/ui/
list_directory: resources/js/components/Atoms/
list_directory: resources/js/components/Molecules/
```

- [ ] Listed existing components FIRST
- [ ] Identified reusable components
- [ ] Only planning components that DON'T exist
- [ ] Import paths documented for reused components

### Atomic Design
- [ ] Atoms: Basic elements (< 20 lines)
- [ ] Molecules: Atom combinations (< 50 lines)
- [ ] Organisms: Complex sections (< 150 lines)
- [ ] Pages: Route endpoints

### TypeScript
- [ ] Strict mode
- [ ] Props interfaces defined
- [ ] No `any` types
- [ ] Return types on functions

### State Management
- [ ] React Query for server state
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled

---

## Security Guidelines

### Authentication
- [ ] All routes require auth (except setup, login)
- [ ] 2FA enforced after first login
- [ ] Session management via database driver
- [ ] Rate limiting on auth endpoints

### SSH Operations
- [ ] Private keys encrypted in DB
- [ ] Commands escaped/sanitized
- [ ] No user input in raw commands
- [ ] Timeouts on SSH operations

### Agent Communication
- [ ] Agent tokens hashed before storage
- [ ] HTTPS only for agent API
- [ ] Token rotation capability
- [ ] No sensitive data in heartbeats

### Secrets
- [ ] Env vars encrypted in DB
- [ ] Git credentials encrypted
- [ ] Backup credentials encrypted
- [ ] APP_KEY properly set

---

## API Guidelines

### Endpoints
- [ ] RESTful naming
- [ ] Named routes
- [ ] Proper HTTP methods
- [ ] Consistent JSON structure

### Responses
- [ ] Proper status codes
- [ ] Error messages user-friendly
- [ ] Pagination for lists
- [ ] Rate limiting headers

---

## Documentation Requirements

Before implementation:
- [ ] Feature README created
- [ ] Architecture documented
- [ ] Database migrations documented
- [ ] Component tree documented
- [ ] API endpoints documented
- [ ] Test scenarios documented
- [ ] This checklist completed

---

## How to Use

1. Copy this checklist into feature README
2. Check items as you plan
3. Document exceptions with justification
4. Achieve 100% before implementation

**Example:**
```markdown
## Guideline Compliance

**Status:** 45/47 (96%)

**Exceptions:**
- [ ] Rate limiting - Deferred to Phase 2
```
