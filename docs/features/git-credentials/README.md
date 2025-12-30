# Git Credentials Feature

**Status:** Planning
**Priority:** High
**Phase:** 2

---

## Overview

Manage Git credentials (SSH keys, Personal Access Tokens, Basic Auth) for cloning private repositories during app deployments. Credentials are encrypted at rest and used by the deployment service.

---

## User Stories

- As an admin, I want to add SSH keys for Git authentication
- As an admin, I want to add Personal Access Tokens (GitHub, GitLab)
- As an admin, I want to use saved credentials when creating apps
- As an admin, I want to delete credentials that are no longer needed
- As an admin, I want to see which apps use a credential before deleting

---

## Acceptance Criteria

- [ ] Can create SSH key credentials (private key + optional passphrase)
- [ ] Can create Token credentials (Personal Access Token)
- [ ] Can create Basic Auth credentials (username + password/token)
- [ ] Credentials are encrypted in database
- [ ] Can list all credentials (without exposing secrets)
- [ ] Can delete credentials (with warning if apps use it)
- [ ] App creation shows credentials in dropdown
- [ ] Deployment service uses credentials for git clone
- [ ] Tests cover all CRUD operations

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Settings → Git Credentials                               │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ + Add Credential                                  │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ GitHub PAT          │ token  │ 3 apps │ [Delete] │   │
│  │ Deploy Key (GitLab) │ ssh    │ 1 app  │ [Delete] │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Design

### Database Schema

**Table:** `git_credentials` (exists)

| Column | Type | Description |
|--------|------|-------------|
| id | ULID | Primary key |
| name | VARCHAR(100) | Display name |
| type | ENUM | `ssh_key`, `token`, `basic` |
| credentials | TEXT (encrypted) | JSON with secrets |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Credentials JSON Structure:**

```json
// type: ssh_key
{
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----...",
  "passphrase": "optional"
}

// type: token
{
  "token": "ghp_xxxxxxxxxxxx"
}

// type: basic
{
  "username": "git",
  "password": "token-or-password"
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /settings/git-credentials | List credentials page |
| GET | /settings/git-credentials/create | Create form |
| POST | /settings/git-credentials | Store credential |
| DELETE | /settings/git-credentials/{id} | Delete credential |

### Git URL Transformation

The deployment service transforms URLs based on credential type:

| Type | Original URL | Transformed |
|------|--------------|-------------|
| ssh_key | https://github.com/user/repo.git | git@github.com:user/repo.git |
| token | https://github.com/user/repo.git | https://TOKEN@github.com/user/repo.git |
| basic | https://github.com/user/repo.git | https://USER:PASS@github.com/user/repo.git |

---

## Component Inventory

### Existing Components (Reuse)

| Component | Path | Usage |
|-----------|------|-------|
| Card | @/components/ui/card | Credential list wrapper |
| Button | @/components/ui/button | Actions |
| Input | @/components/ui/input | Form fields |
| Label | @/components/ui/label | Form labels |
| Select | @/components/ui/select | Type dropdown |
| Textarea | @/components/ui/textarea | SSH key input |
| Dialog | @/components/ui/dialog | Delete confirmation |
| Table | @/components/ui/table | Credentials list |
| Badge | @/components/ui/badge | Type badge |
| ConfirmationDialog | @/components/Molecules/ConfirmationDialog | Delete warning |
| EmptyState | @/components/Atoms/EmptyState | No credentials |

### New Components

| Component | Type | Description |
|-----------|------|-------------|
| GitCredentialRow | Molecule | Row in credentials table |
| GitCredentialForm | Molecule | Create/edit form with type switching |

---

## File Structure

```
app/
├── Http/Controllers/
│   └── GitCredentialController.php      # CRUD controller
├── Http/Requests/
│   └── GitCredential/
│       └── StoreGitCredentialRequest.php
├── Policies/
│   └── GitCredentialPolicy.php          # Authorization
├── Services/
│   └── GitCredentialService.php         # Business logic

resources/js/
├── Pages/Settings/
│   └── GitCredentials/
│       ├── Index.tsx                    # List page
│       └── Create.tsx                   # Create form
├── components/Molecules/
│   ├── GitCredentialRow.tsx
│   └── GitCredentialForm.tsx

tests/Feature/
└── GitCredentialTest.php
```

---

## Implementation Tasks

### Phase 1: Backend

| # | Task | Description |
|---|------|-------------|
| 1.1 | Create GitCredentialPolicy | Authorization rules |
| 1.2 | Create GitCredentialController | CRUD operations |
| 1.3 | Create StoreGitCredentialRequest | Validation |
| 1.4 | Create GitCredentialService | Business logic |
| 1.5 | Add routes | In web.php |
| 1.6 | Update GitService | Use credentials for clone |

### Phase 2: Frontend

| # | Task | Description |
|---|------|-------------|
| 2.1 | Create Index.tsx | List credentials |
| 2.2 | Create Create.tsx | Add credential form |
| 2.3 | Create GitCredentialRow.tsx | Table row component |
| 2.4 | Create GitCredentialForm.tsx | Dynamic form by type |
| 2.5 | Add navigation link | In settings sidebar |

### Phase 3: Testing

| # | Task | Description |
|---|------|-------------|
| 3.1 | Create GitCredentialTest | CRUD tests |
| 3.2 | Test credential encryption | Verify secrets encrypted |
| 3.3 | Test deployment with credentials | Mock git clone |

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Credentials at rest | Encrypted using Laravel's `encrypted:array` cast |
| Credentials in transit | HTTPS only |
| Credentials in UI | Never shown after creation, only masked |
| Credentials in logs | Never logged, excluded from debug |
| Credential deletion | Warn if apps use credential |
| SSH key validation | Validate format before saving |

---

## Guideline Compliance

**Status:** 42/47 (89%)

### Backend
- [x] Tests use Pest 4 functional syntax
- [x] Tests use factories
- [x] RefreshDatabase trait used
- [x] Uses `HasUlids` trait
- [x] Uses `#[UsePolicy]` attribute
- [x] Uses `casts()` method
- [x] Sensitive fields use `encrypted` cast
- [x] All policy methods implemented
- [x] Controller uses `abort(403)` pattern
- [x] Flash messages follow format
- [x] Form Request returns true in authorize
- [x] Thin controllers
- [x] Business logic in services
- [x] Proper type declarations

### Frontend
- [x] Listed existing components first
- [x] Identified reusable components
- [x] TypeScript strict mode
- [x] Props interfaces defined
- [x] Loading states handled
- [x] Error states handled
- [x] Empty states handled

### Security
- [x] Routes require auth
- [x] Credentials encrypted in DB
- [x] No secrets in responses

### Exceptions
- [ ] Rate limiting - Deferred to Phase 3
- [ ] SSH key validation - Basic format check only
- [ ] Passphrase support - Deferred (complex SSH agent setup)

---

## Test Scenarios

1. **Create SSH Key Credential**
   - Valid private key → Success
   - Invalid key format → Validation error
   - Duplicate name → Allowed (names not unique)

2. **Create Token Credential**
   - Valid token → Success
   - Empty token → Validation error

3. **Delete Credential**
   - No apps using it → Delete success
   - Apps using it → Warning shown, can still delete
   - Sets app.git_credentials_id to null

4. **Use in Deployment**
   - App with SSH credential → Uses SSH URL
   - App with Token credential → Uses HTTPS with token
   - App without credential → Uses public HTTPS

---

## Open Questions

1. Should we test the credential against Git before saving?
   - **Recommendation:** No, too slow and may fail for network reasons

2. Should credentials be shared across users (future multi-user)?
   - **Recommendation:** Yes, credentials belong to the panel, not users

3. Support for deploy keys (read-only)?
   - **Recommendation:** Yes, SSH keys can be deploy keys

---

## Dependencies

- Existing `git_credentials` table migration
- Existing `GitCredential` model
- `GitService` for URL transformation
- `DeploymentService` integration

---

## Estimated Complexity

| Component | Effort |
|-----------|--------|
| Backend (Controller, Service, Policy) | Low |
| Frontend (2 pages, 2 components) | Low |
| Testing | Low |
| GitService integration | Low |
| **Total** | **Low-Medium** |
