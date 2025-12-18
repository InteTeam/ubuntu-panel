# Documentation Standards

**Project:** UPanel  
**Last Updated:** 2024-12-15

---

## Structure

```
docs/
├── DOCUMENTATION_STANDARDS.md    # This file
├── FEATURE_DESIGN_CHECKLIST.md   # Compliance checklist
├── WORKFLOW_ENFORCEMENT.md       # Mandatory workflow
├── DEVELOPMENT_GUIDELINES.md     # Coding standards
├── TESTING_GUIDELINES.md         # Test standards
│
├── architecture/                 # System architecture
│   └── overview.md
│
├── database/
│   ├── README.md                 # Database overview
│   └── migrations/
│       ├── 001_create_users_table.md
│       ├── 002_create_servers_table.md
│       └── ...
│
├── features/
│   ├── authentication/
│   │   ├── README.md             # Feature overview
│   │   ├── architecture.md       # Technical design
│   │   └── components.md         # UI components
│   ├── server-management/
│   ├── app-deployments/
│   └── ...
│
└── reference/                    # Quick reference docs
    ├── 01-overview.md
    ├── 02-security-baseline.md
    └── ...
```

---

## Feature Documentation Template

Location: `/docs/features/{feature_name}/README.md`

```markdown
# {Feature Name}

**Status:** Planning | In Progress | Complete
**Priority:** Critical | High | Medium | Low
**Phase:** 1 | 2 | 3

---

## Overview

[What this feature does and why]

---

## User Stories

- As an admin, I want [goal] so that [benefit]

---

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

---

## Guideline Compliance

See [FEATURE_DESIGN_CHECKLIST.md](/docs/FEATURE_DESIGN_CHECKLIST.md)

**Status:** X/Y items (XX%)

---

## Technical Design

### Database Tables
- `table_name` - [Link to migration doc]

### Models
- `App\Models\ModelName`

### Services
- `App\Services\ServiceName`

### Controllers
- `App\Http\Controllers\ControllerName`

---

## Frontend Components

### Pages
- `Pages/Feature/Index.tsx`

### Components (New)
- `components/feature/ComponentName.tsx`

### Components (Reused)
- `ui/button.tsx` - from InteTeam CRM

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/resource | List |
| POST | /api/resource | Create |

---

## Testing

- [ ] Feature tests
- [ ] Unit tests
- [ ] 80%+ coverage

---

## Tasks

- [ ] Task 1
- [ ] Task 2
```

---

## Migration Documentation Template

Location: `/docs/database/migrations/{number}_{name}.md`

```markdown
# Migration: {number}_{name}

**File:** `database/migrations/YYYY_MM_DD_HHMMSS_{name}.php`
**Status:** Pending | Applied

---

## Purpose

[Why this table exists]

---

## Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | CHAR(26) | NO | ULID | Primary key |
| ... | ... | ... | ... | ... |

---

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| idx_... | col1, col2 | ... |

---

## Foreign Keys

| Column | References | On Delete |
|--------|------------|-----------|
| ... | ... | CASCADE |

---

## Model Configuration

```php
protected $fillable = [...];

protected function casts(): array
{
    return [...];
}
```

---

## Relationships

- BelongsTo: ...
- HasMany: ...
```

---

## Component Documentation Template

Location: `/docs/features/{feature}/components.md`

```markdown
# Components: {Feature}

---

## Existing Components (REUSE)

Inventory check: `resources/js/components/`

| Component | Path | Usage |
|-----------|------|-------|
| Button | ui/button.tsx | Form actions |
| Input | ui/input.tsx | Form fields |
| ... | ... | ... |

---

## New Components (CREATE)

### Atoms
| Component | Purpose | Props |
|-----------|---------|-------|
| ... | ... | ... |

### Molecules
| Component | Purpose | Composition |
|-----------|---------|-------------|
| ... | ... | Uses: Atom1, Atom2 |

### Organisms
| Component | Purpose | Composition |
|-----------|---------|-------------|
| ... | ... | Uses: Molecule1, Atom1 |

---

## Component Tree

```
Page
└── Organism
    ├── Molecule
    │   └── Atom
    └── Atom
```

---

## Import Map

```typescript
// REUSE existing
import { Button } from '@/components/ui/button'

// CREATE new
import { NewComponent } from '@/components/feature/NewComponent'
```
```
