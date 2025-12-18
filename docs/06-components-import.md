# Components Import Reference

Components to copy from InteTeam CRM when starting development.

**Source:** `C:\Users\Piotr\Desktop\WebApps\Claude2\inteteam_crm\resources\js\components\`

---

## Priority 1: UI Foundation (Copy First)

Entire `ui/` folder - shadcn/ui components, battle-tested:

```
ui/
├── alert-dialog.tsx    # Dangerous action confirmations
├── alert.tsx           # Inline alerts
├── avatar.tsx          # User avatars
├── badge.tsx           # Status badges
├── button.tsx          # Primary component
├── card.tsx            # Content containers
├── checkbox.tsx        # Form checkboxes
├── dialog.tsx          # Modals
├── dropdown-menu.tsx   # Context menus
├── input.tsx           # Form inputs
├── label.tsx           # Form labels
├── popover.tsx         # Tooltips/popovers
├── select.tsx          # Dropdowns
├── separator.tsx       # Dividers
├── sheet.tsx           # Slide-out panels
├── skeleton.tsx        # Loading states
├── switch.tsx          # Toggle switches
├── table.tsx           # Data tables
├── tabs.tsx            # Tab navigation
├── textarea.tsx        # Multi-line input
├── toast.tsx           # Notifications
├── toaster.tsx         # Toast container
└── index.ts            # Exports
```

---

## Priority 2: Generic Atoms

```
Atoms/
├── LoadingSpinner.tsx      # Spinner component
├── EmptyState.tsx          # "No data" states
├── StatusBadge.tsx         # Adapt for: online/offline, running/stopped
├── UserAvatar.tsx          # Panel user avatars
├── ThemeDropdown.tsx       # Dark/light mode
└── index.ts
```

---

## Priority 3: Generic Molecules

```
Molecules/
├── FormField.tsx           # Label + Input + Error wrapper
├── ConfirmationDialog.tsx  # "Are you sure?" dialogs
├── SearchBox.tsx           # Search input with icon
├── FileUploadInput.tsx     # SSH key file uploads
├── DateRangeFilter.tsx     # Log date filtering
└── index.ts
```

---

## Priority 4: Layouts & Providers

```
layouts/
├── AdminLayout.tsx         # Sidebar + header + content
└── GlobalLayout.tsx        # Auth check wrapper

providers/
├── QueryProvider.tsx       # React Query setup
└── ThemeProvider.tsx       # Dark mode context
```

---

## UPanel-Specific Components to Create

These don't exist in InteTeam CRM:

### Atoms
```
Atoms/
├── ServerStatusIndicator.tsx   # Green/red dot for online/offline
├── ContainerStatusBadge.tsx    # running/stopped/restarting
├── ResourceMeter.tsx           # CPU/RAM/Disk usage bar
├── SSLBadge.tsx                # Valid/expiring/expired SSL status
└── BackupStatusIcon.tsx        # Last backup success/fail
```

### Molecules
```
Molecules/
├── ServerCard.tsx              # Server summary in dashboard
├── ContainerRow.tsx            # Container in list
├── DeploymentLogLine.tsx       # Single log entry
├── BackupDestinationCard.tsx   # Google Drive/B2/SFTP config
└── EnvVariableRow.tsx          # Key-value .env editor row
```

### Organisms
```
Organisms/
├── ServerList.tsx              # All servers grid/list
├── ContainerManager.tsx        # Start/stop/restart containers
├── DeploymentLog.tsx           # Live deployment output
├── BackupScheduler.tsx         # Backup configuration form
├── SecurityAuditPanel.tsx      # Pass/fail checklist
└── CaddyDomainManager.tsx      # Add/remove domains
```

---

## Import Command (When Ready)

```bash
# From UPanel project root
SOURCE="../inteteam_crm/resources/js/components"

# Copy UI foundation
cp -r $SOURCE/ui ./resources/js/components/

# Copy selected atoms
mkdir -p ./resources/js/components/Atoms
cp $SOURCE/Atoms/LoadingSpinner.tsx ./resources/js/components/Atoms/
cp $SOURCE/Atoms/EmptyState.tsx ./resources/js/components/Atoms/
cp $SOURCE/Atoms/StatusBadge.tsx ./resources/js/components/Atoms/
cp $SOURCE/Atoms/UserAvatar.tsx ./resources/js/components/Atoms/
cp $SOURCE/Atoms/ThemeDropdown.tsx ./resources/js/components/Atoms/

# Copy selected molecules
mkdir -p ./resources/js/components/Molecules
cp $SOURCE/Molecules/FormField.tsx ./resources/js/components/Molecules/
cp $SOURCE/Molecules/ConfirmationDialog.tsx ./resources/js/components/Molecules/
cp $SOURCE/Molecules/SearchBox.tsx ./resources/js/components/Molecules/

# Copy layouts
cp -r $SOURCE/layouts ./resources/js/components/

# Copy providers
cp -r $SOURCE/providers ./resources/js/components/
```

---

## Dependency Notes

These components require:
- `tailwindcss` - Already planned
- `@radix-ui/*` - shadcn/ui base
- `class-variance-authority` - Component variants
- `clsx` + `tailwind-merge` - Class merging
- `lucide-react` - Icons
- `@tanstack/react-query` - Data fetching (QueryProvider)

Check InteTeam CRM's `package.json` for exact versions.
