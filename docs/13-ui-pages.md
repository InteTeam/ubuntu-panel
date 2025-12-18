# UI Pages

Page structure and component mapping for the React frontend.

---

## Page Overview

| Route | Page | Description |
|-------|------|-------------|
| `/setup` | Setup | First-time admin creation |
| `/login` | Login | Email + password |
| `/2fa` | TwoFactor | TOTP entry |
| `/2fa/setup` | TwoFactorSetup | QR code + confirm |
| `/forgot-password` | ForgotPassword | Request reset |
| `/reset-password` | ResetPassword | New password form |
| `/` | Dashboard | Overview stats |
| `/servers` | ServerList | All servers |
| `/servers/new` | ServerCreate | Add server form |
| `/servers/:id` | ServerDetail | Server tabs |
| `/apps` | AppList | All apps |
| `/apps/new` | AppCreate | Add app form |
| `/apps/:id` | AppDetail | App tabs |
| `/apps/:id/deploy` | DeployModal | Deployment form |
| `/deployments/:id` | DeploymentDetail | Live logs |
| `/backups` | BackupList | All backups |
| `/backup-destinations` | BackupDestinations | Manage destinations |
| `/settings` | Settings | Panel settings |
| `/settings/profile` | Profile | User profile + 2FA |

---

## Layouts

### GuestLayout

For unauthenticated pages (login, setup, reset password):

```tsx
// layouts/GuestLayout.tsx
<div className="min-h-screen flex items-center justify-center bg-gray-100">
  <div className="w-full max-w-md">
    <Card>
      {children}
    </Card>
  </div>
</div>
```

### AuthLayout

For authenticated pages:

```tsx
// layouts/AuthLayout.tsx
<div className="min-h-screen bg-gray-50">
  <Sidebar />
  <div className="lg:pl-64">
    <Header />
    <main className="p-6">
      {children}
    </main>
  </div>
</div>
```

---

## Component Mapping

### Dashboard (`/`)

```
Dashboard
├── StatsGrid
│   ├── StatCard (Servers: 5 online)
│   ├── StatCard (Apps: 12 running)
│   ├── StatCard (Deployments today: 3)
│   └── StatCard (Backups: 8 last 24h)
├── RecentActivity
│   └── ActivityItem (map)
├── ServerStatusList
│   └── ServerStatusRow (map)
└── RecentDeployments
    └── DeploymentRow (map)
```

### Server List (`/servers`)

```
ServerList
├── PageHeader
│   ├── Title "Servers"
│   └── Button "Add Server" → /servers/new
├── SearchBox
└── DataTable
    └── ServerRow (map)
        ├── Name (link)
        ├── Host
        ├── StatusBadge
        ├── AppCount
        ├── ResourceMeters (CPU/RAM)
        ├── LastSeen
        └── DropdownMenu (Test, Reboot, Delete)
```

### Server Create (`/servers/new`)

```
ServerCreate
├── PageHeader "Add Server"
├── Form
│   ├── FormField (Name)
│   ├── FormField (Host)
│   ├── FormField (Port, default 22)
│   └── FormField (Username, default "upanel")
├── Button "Generate Install Command"
└── InstallCommandDisplay (shown after submit)
    ├── CodeBlock (curl command)
    ├── CopyButton
    └── ExpiryTimer
```

### Server Detail (`/servers/:id`)

```
ServerDetail
├── PageHeader
│   ├── ServerName
│   ├── StatusBadge
│   └── Actions (Test, Reboot, Audit)
├── Tabs
│   ├── Overview
│   │   ├── SpecsCard (OS, CPU, RAM, Disk)
│   │   ├── SecurityScoreCard
│   │   └── QuickActions
│   ├── Apps
│   │   └── AppTable (filtered to this server)
│   ├── Metrics
│   │   ├── CPUChart (7 days)
│   │   ├── RAMChart (7 days)
│   │   └── DiskChart (7 days)
│   ├── Security
│   │   ├── AuditChecklist
│   │   └── Button "Run Audit"
│   ├── Activity
│   │   └── ActivityLog
│   └── Settings
│       ├── EditServerForm
│       └── DangerZone (Delete)
```

### App List (`/apps`)

```
AppList
├── PageHeader
│   ├── Title "Apps"
│   └── Button "Add App" → /apps/new
├── FilterBar
│   ├── ServerFilter
│   └── StatusFilter
└── DataTable
    └── AppRow (map)
        ├── Name (link)
        ├── Server
        ├── ProductionStatus
        │   ├── StatusBadge (running/stopped/failed)
        │   └── Domain (link, truncated)
        ├── StagingStatus
        │   ├── StatusBadge (running/stopped/failed/not deployed)
        │   └── Domain (link, truncated)
        ├── LastDeployment (either env, most recent)
        └── DropdownMenu (Deploy Staging, Deploy Production, Settings)
```

### App Create (`/apps/new`)

```
AppCreate
├── PageHeader "Add App"
└── Form
    ├── FormField (Server, select)
    ├── FormField (Name)
    ├── Separator
    ├── FormField (Git Repository)
    ├── FormField (Git Branch)
    ├── FormField (Git Credentials, optional select)
    ├── Separator
    ├── FormField (Deploy Path)
    ├── FormField (Docker Compose File)
    ├── Separator
    ├── FormField (Primary Domain, optional)
    └── FormField (Staging Domain, optional)
```

### App Detail (`/apps/:id`)

```
AppDetail
├── PageHeader
│   ├── AppName
│   ├── StatusBadge
│   └── Actions (Deploy, Stop, Restart)
├── EnvironmentTabs [PRODUCTION] [STAGING]  ← Toggle between environments
│   └── EnvironmentPanel (content changes based on selected env)
│       ├── StatusCard
│       │   ├── Status (running/stopped/failed)
│       │   ├── Current Commit
│       │   ├── Last Deployed
│       │   └── Domain (link)
│       ├── QuickActions
│       │   ├── DeployButton → DeployModal
│       │   ├── RestartButton
│       │   └── PromoteToProductionButton (staging only)
│       └── ContainersPreview (mini list)
├── Tabs (below environment panel)
│   ├── Deployments
│   │   ├── EnvironmentFilter [All] [Production] [Staging]
│   │   └── DeploymentTable
│   │       └── DeploymentRow (map)
│   │           ├── Commit
│   │           ├── Branch
│   │           ├── EnvironmentBadge (prod/staging)
│   │           ├── StatusBadge
│   │           ├── Duration
│   │           ├── Timestamp
│   │           └── Actions (View, Rollback)
│   ├── Containers
│   │   ├── EnvironmentFilter [Production] [Staging]
│   │   └── ContainerTable
│   │       └── ContainerRow (map)
│   │           ├── Name
│   │           ├── Image
│   │           ├── StatusBadge
│   │           ├── CPU/Memory
│   │           └── Actions (Restart, Logs)
│   ├── Environment Variables
│   │   ├── EnvironmentTabs [Base] [Production] [Staging]
│   │   ├── EnvEditor (key-value)
│   │   └── SaveButton
│   │   └── Note: "Base vars apply to both. Overrides in Production/Staging tabs."
│   ├── Domains
│   │   ├── ProductionDomains
│   │   │   └── DomainTable + AddDomainForm
│   │   └── StagingDomains
│   │       └── DomainTable + AddDomainForm
│   ├── Backups
│   │   ├── EnvironmentFilter [Production] [Staging]
│   │   ├── BackupTable
│   │   └── SchedulesList
│   └── Settings
│       ├── EditAppForm
│       └── DangerZone (Delete)
```

### Deploy Modal

```
DeployModal
├── Title "Deploy {appName}"
├── Form
│   ├── EnvironmentSelect [Production] [Staging]  ← Clear choice
│   ├── BranchSelect (filtered by environment defaults)
│   │   └── Production default: main
│   │   └── Staging default: develop (or feature branches)
│   ├── CommitDisplay (latest from selected branch)
│   └── DiffLink "View changes since last deploy"
├── Warning (if production)
│   └── "This will deploy to live production environment"
├── Actions
│   ├── CancelButton
│   └── DeployButton
```

### Promote to Production Modal

```
PromoteModal
├── Title "Promote to Production"
├── CurrentState
│   ├── StagingCommit: abc123 "Fix login bug"
│   ├── ProductionCommit: def456 "Previous release"
│   └── DiffLink "View changes between staging and production"
├── Warning
│   └── "This will deploy the current staging version to production"
├── Options
│   └── Checkbox "Create backup before promoting" (default: checked)
├── Actions
│   ├── CancelButton
│   └── PromoteButton
```

### Deployment Detail (`/deployments/:id`)

```
DeploymentDetail
├── PageHeader
│   ├── "Deployment {id}"
│   ├── StatusBadge
│   └── CancelButton (if running)
├── MetaInfo
│   ├── App
│   ├── Branch
│   ├── Commit
│   ├── Environment
│   ├── Started
│   ├── Duration
│   └── Triggered by
└── LogViewer
    ├── LogOutput (monospace, auto-scroll)
    └── ErrorMessage (if failed)
```

### Backup List (`/backups`)

```
BackupList
├── PageHeader
│   ├── Title "Backups"
│   └── Button "Backup Destinations"
├── FilterBar
│   ├── AppFilter
│   ├── TypeFilter
│   └── DateRange
└── DataTable
    └── BackupRow (map)
        ├── App
        ├── Type
        ├── Destination
        ├── Size
        ├── StatusBadge
        ├── Timestamp
        └── Actions (Download, Restore, Delete)
```

### Settings (`/settings`)

```
Settings
├── Tabs
│   ├── Profile
│   │   ├── EmailForm
│   │   ├── PasswordForm
│   │   └── TwoFactorSection
│   │       ├── StatusBadge
│   │       ├── RecoveryCodesCount
│   │       └── Actions (Regenerate codes, Disable)
│   ├── Git Credentials
│   │   ├── CredentialsList
│   │   └── AddCredentialForm
│   └── Notifications
│       ├── EmailToggle
│       └── NotificationPreferences
```

---

## Shared Components

### From InteTeam CRM (import)

```
ui/*                    # All shadcn components
LoadingSpinner          # Spinner
EmptyState              # No data display
StatusBadge             # Generic status
FormField               # Form wrapper
ConfirmationDialog      # Destructive actions
SearchBox               # Search input
```

### UPanel-Specific (create)

```
ServerStatusBadge       # online/offline/pending/error
AppStatusBadge          # running/stopped/failed/deploying
DeploymentStatusBadge   # queued/running/success/failed
ContainerStatusBadge    # running/stopped/restarting

ResourceMeter           # CPU/RAM/Disk bar
SecurityScoreCircle     # 0-100 score visualization

LogViewer               # Deployment/container logs
EnvEditor               # Key-value environment editor
CodeBlock               # Monospace code display
CopyButton              # Copy to clipboard

StatsCard               # Dashboard stat
ActivityItem            # Activity log entry
```

---

## State Management

### Server State (React Query)

```tsx
// hooks/useServers.ts
export function useServers() {
    return useQuery({
        queryKey: ['servers'],
        queryFn: () => api.get('/servers'),
    });
}

export function useServer(id: string) {
    return useQuery({
        queryKey: ['servers', id],
        queryFn: () => api.get(`/servers/${id}`),
    });
}

export function useCreateServer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.post('/servers', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['servers']);
        },
    });
}
```

### Real-Time Updates

Deployment logs polling:

```tsx
// hooks/useDeployment.ts
export function useDeployment(id: string) {
    return useQuery({
        queryKey: ['deployments', id],
        queryFn: () => api.get(`/deployments/${id}`),
        refetchInterval: (data) => 
            data?.status === 'running' ? 2000 : false,
    });
}
```

---

## Routing

```tsx
// routes.tsx
const routes = [
    // Guest
    { path: '/setup', element: <Setup />, layout: 'guest' },
    { path: '/login', element: <Login />, layout: 'guest' },
    { path: '/2fa', element: <TwoFactor />, layout: 'guest' },
    { path: '/2fa/setup', element: <TwoFactorSetup />, layout: 'auth' },
    { path: '/forgot-password', element: <ForgotPassword />, layout: 'guest' },
    { path: '/reset-password', element: <ResetPassword />, layout: 'guest' },
    
    // Auth
    { path: '/', element: <Dashboard />, layout: 'auth' },
    { path: '/servers', element: <ServerList />, layout: 'auth' },
    { path: '/servers/new', element: <ServerCreate />, layout: 'auth' },
    { path: '/servers/:id', element: <ServerDetail />, layout: 'auth' },
    { path: '/apps', element: <AppList />, layout: 'auth' },
    { path: '/apps/new', element: <AppCreate />, layout: 'auth' },
    { path: '/apps/:id', element: <AppDetail />, layout: 'auth' },
    { path: '/deployments/:id', element: <DeploymentDetail />, layout: 'auth' },
    { path: '/backups', element: <BackupList />, layout: 'auth' },
    { path: '/backup-destinations', element: <BackupDestinations />, layout: 'auth' },
    { path: '/settings', element: <Settings />, layout: 'auth' },
];
```

---

## Responsive Design

| Breakpoint | Sidebar | Layout |
|------------|---------|--------|
| Mobile (<768px) | Hidden, hamburger menu | Single column |
| Tablet (768-1024px) | Collapsed icons | Responsive grid |
| Desktop (>1024px) | Full sidebar | Multi-column |

Server/App tables switch to cards on mobile.
