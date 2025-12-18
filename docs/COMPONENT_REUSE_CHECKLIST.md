# Component Reuse Checklist

**Purpose:** Ensure DRY compliance by checking existing components BEFORE planning new ones  
**When:** Step 4 of feature planning, BEFORE designing any frontend components

---

## 🚨 MANDATORY First Step

**BEFORE planning ANY frontend components, you MUST:**

```bash
# 1. List ALL existing UI components
list_directory: resources/js/components/ui/ (depth=2)

# 2. List ALL existing atomic components  
list_directory: resources/js/components/Atoms/ (depth=2)

# 3. List ALL existing molecules
list_directory: resources/js/components/Molecules/ (depth=2)

# 4. List ALL existing organisms
list_directory: resources/js/components/Organisms/ (depth=2)

# 5. List existing feature components
list_directory: resources/js/components/ (depth=3)
```

**⛔ STOP:** If you have NOT run these commands → DO NOT plan components

---

## Expected Components from InteTeam CRM Import

Based on `/docs/06-components-import.md`, these should exist after import:

### UI Layer (shadcn/ui)

| Component | Path | Usage |
|-----------|------|-------|
| Button | `ui/button.tsx` | All buttons |
| Input | `ui/input.tsx` | Text inputs |
| Label | `ui/label.tsx` | Form labels |
| Checkbox | `ui/checkbox.tsx` | Checkboxes |
| Select | `ui/select.tsx` | Dropdowns |
| Card | `ui/card.tsx` | Card containers |
| Badge | `ui/badge.tsx` | Status badges |
| Dialog | `ui/dialog.tsx` | Modals |
| Form | `ui/form.tsx` | Form wrapper |
| Table | `ui/table.tsx` | Data tables |
| Tabs | `ui/tabs.tsx` | Tab navigation |
| Tooltip | `ui/tooltip.tsx` | Tooltips |
| Popover | `ui/popover.tsx` | Popovers |
| DropdownMenu | `ui/dropdown-menu.tsx` | Action menus |

### Generic Atoms

| Component | Path | Usage |
|-----------|------|-------|
| LoadingSpinner | `Atoms/LoadingSpinner.tsx` | Loading states |
| EmptyState | `Atoms/EmptyState.tsx` | No data |
| StatusBadge | `Atoms/StatusBadge.tsx` | Generic status |
| UserAvatar | `Atoms/UserAvatar.tsx` | User images |

### Generic Molecules

| Component | Path | Usage |
|-----------|------|-------|
| FormField | `Molecules/FormField.tsx` | Form field wrapper |
| ConfirmationDialog | `Molecules/ConfirmationDialog.tsx` | Confirm actions |
| SearchBox | `Molecules/SearchBox.tsx` | Search input |

### Layouts

| Component | Path | Usage |
|-----------|------|-------|
| AdminLayout | `layouts/AdminLayout.tsx` | Auth pages |
| GuestLayout | `layouts/GuestLayout.tsx` | Public pages |

### Providers

| Component | Path | Usage |
|-----------|------|-------|
| QueryProvider | `providers/QueryProvider.tsx` | React Query |
| ThemeProvider | `providers/ThemeProvider.tsx` | Dark mode |

---

## Component Inventory Template

Create this for EVERY feature: `/docs/features/{feature}/COMPONENT_INVENTORY.md`

```markdown
# Component Inventory: {Feature Name}

## 1. Existing Components Check

**Date checked:** YYYY-MM-DD  
**Components directory listing completed:** [ ] Yes

## 2. Components to REUSE

### From ui/
- [ ] Button - `@/components/ui/button`
- [ ] Input - `@/components/ui/input`
- [ ] Label - `@/components/ui/label`
- [ ] Card - `@/components/ui/card`
- [ ] [Add others as needed]

### From Atoms/
- [ ] LoadingSpinner - `@/components/Atoms/LoadingSpinner`
- [ ] EmptyState - `@/components/Atoms/EmptyState`
- [ ] [Add others as needed]

### From Molecules/
- [ ] FormField - `@/components/Molecules/FormField`
- [ ] [Add others as needed]

## 3. Components to CREATE (New)

### Atoms (Feature-specific)
| Component | Purpose | Why can't reuse existing? |
|-----------|---------|---------------------------|
| ServerStatusBadge | Server online/offline | UPanel-specific statuses |

### Molecules (Feature-specific)
| Component | Purpose | Composition |
|-----------|---------|-------------|
| ServerCard | Server summary | Uses: Card, ServerStatusBadge |

### Organisms (Feature-specific)
| Component | Purpose | Composition |
|-----------|---------|-------------|
| ServerTable | Server list | Uses: Table, ServerCard |

## 4. Import Map

```typescript
// ========================================
// REUSE - Import from existing components
// ========================================
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/Atoms/LoadingSpinner'
import { FormField } from '@/components/Molecules/FormField'

// ========================================
// CREATE - New feature-specific components
// ========================================
import { ServerStatusBadge } from '@/components/servers/atoms/ServerStatusBadge'
import { ServerCard } from '@/components/servers/molecules/ServerCard'
import { ServerTable } from '@/components/servers/organisms/ServerTable'
```
```

---

## UPanel-Specific Components (To Create)

These are genuinely new and don't exist in InteTeam CRM:

### Atoms
- `ServerStatusBadge` - online/offline/pending/error
- `AppStatusBadge` - running/stopped/failed/deploying  
- `DeploymentStatusBadge` - queued/running/success/failed
- `ContainerStatusBadge` - running/stopped/restarting
- `ResourceMeter` - CPU/RAM/Disk progress bar
- `SSLBadge` - SSL certificate status

### Molecules
- `ServerCard` - Server summary card
- `AppCard` - App summary card
- `ContainerRow` - Container in list
- `DeploymentRow` - Deployment in history
- `EnvVariableRow` - Key-value pair
- `BackupDestinationCard` - Backup target
- `InstallCommandBlock` - Copy-able install command

### Organisms
- `ServerTable` - Server list with actions
- `AppTable` - App list with actions
- `ContainerManager` - Container list + actions
- `DeploymentLog` - Live log viewer
- `EnvEditor` - Key-value environment editor
- `BackupScheduler` - Backup schedule form
- `SecurityAuditPanel` - Security check results

---

## DRY Violation Examples

### ❌ WRONG: Planning duplicates

```markdown
## Components Needed
- Button.tsx (NEW)           ← EXISTS in ui/
- Input.tsx (NEW)            ← EXISTS in ui/
- Label.tsx (NEW)            ← EXISTS in ui/
- FormField.tsx (NEW)        ← EXISTS in Molecules/
- LoadingSpinner.tsx (NEW)   ← EXISTS in Atoms/
```

### ✅ CORRECT: Reuse + create only new

```markdown
## Components to REUSE
- Button from @/components/ui/button
- Input from @/components/ui/input
- Label from @/components/ui/label
- FormField from @/components/Molecules/FormField
- LoadingSpinner from @/components/Atoms/LoadingSpinner

## Components to CREATE (genuinely new)
- ServerStatusBadge (UPanel-specific status values)
- ResourceMeter (UPanel-specific metrics display)
```

---

## Verification Checklist

Before finalizing component plan:

- [ ] Ran `list_directory` on all component folders
- [ ] Checked every planned component against existing inventory
- [ ] Documented import paths for ALL reused components
- [ ] Only planning components that genuinely don't exist
- [ ] Each new component has justification for why it can't reuse existing
- [ ] Component tree shows composition (what uses what)

**If ANY checkbox is unchecked → Review and fix before proceeding**
