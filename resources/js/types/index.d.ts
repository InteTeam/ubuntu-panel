// UPanel TypeScript Definitions

export interface User {
    id: string;
    name: string;
    email: string;
    email_verified_at?: string;
    two_factor_confirmed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Server {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    status: 'pending' | 'online' | 'offline' | 'error';
    agent_version?: string;
    last_seen_at?: string;
    security_score?: number;
    created_at: string;
    updated_at: string;
    apps?: App[];
    latest_metrics?: ServerMetric;
}

export interface ServerMetric {
    id: string;
    server_id: string;
    cpu_percent: number;
    ram_used_mb: number;
    ram_total_mb: number;
    disk_used_gb: number;
    disk_total_gb: number;
    network_in_bytes?: number;
    network_out_bytes?: number;
    recorded_at: string;
}

export interface App {
    id: string;
    server_id: string;
    name: string;
    git_repository: string;
    git_branch: string;
    deploy_path: string;
    docker_compose_file: string;
    primary_domain?: string;
    staging_domain?: string;
    status: 'pending' | 'deploying' | 'running' | 'stopped' | 'failed';
    current_commit?: string;
    created_at: string;
    updated_at: string;
    server?: Server;
    deployments?: Deployment[];
    domains?: Domain[];
}

export interface Deployment {
    id: string;
    app_id: string;
    user_id?: string;
    commit_hash: string;
    commit_message?: string;
    branch: string;
    environment: 'production' | 'staging';
    status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
    started_at?: string;
    finished_at?: string;
    duration_seconds?: number;
    log?: string;
    error_message?: string;
    is_rollback: boolean;
    created_at: string;
    app?: App;
    user?: User;
}

export interface Domain {
    id: string;
    app_id: string;
    server_id: string;
    domain: string;
    environment: 'production' | 'staging';
    ssl_enabled: boolean;
    ssl_expires_at?: string;
    upstream_port: number;
    status: 'pending' | 'active' | 'error';
    created_at: string;
    updated_at: string;
}

export interface GitCredential {
    id: string;
    name: string;
    type: 'ssh_key' | 'token' | 'basic';
    created_at: string;
    updated_at: string;
}

export interface BackupDestination {
    id: string;
    name: string;
    type: 'google_drive' | 'backblaze_b2' | 'sftp' | 'local';
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface Backup {
    id: string;
    app_id: string;
    backup_destination_id: string;
    type: 'database' | 'files' | 'full';
    status: 'pending' | 'running' | 'success' | 'failed';
    started_at?: string;
    finished_at?: string;
    size_bytes?: number;
    file_path?: string;
    error_message?: string;
    expires_at?: string;
    created_at: string;
    app?: App;
    destination?: BackupDestination;
}

export interface BackupSchedule {
    id: string;
    app_id: string;
    backup_destination_id: string;
    type: 'database' | 'files' | 'full';
    cron_expression: string;
    timezone: string;
    retention_count: number;
    is_active: boolean;
    last_run_at?: string;
    next_run_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    read_at?: string;
    created_at: string;
}

export interface SecurityEvent {
    id: string;
    user_id?: string;
    server_id?: string;
    event_type: string;
    severity: 'info' | 'warning' | 'critical';
    ip_address?: string;
    details?: Record<string, unknown>;
    created_at: string;
}

export interface ActivityLog {
    id: string;
    user_id?: string;
    action: string;
    subject_type: string;
    subject_id: string;
    description?: string;
    changes?: Record<string, { old: unknown; new: unknown }>;
    ip_address?: string;
    created_at: string;
    user?: User;
}

// Inertia Page Props
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash?: {
        alert?: string;
        type?: 'success' | 'error' | 'warning' | 'info';
    };
};

// Form helpers
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    links: {
        first: string;
        last: string;
        prev?: string;
        next?: string;
    };
}
