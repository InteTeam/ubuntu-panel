<?php

declare(strict_types=1);

namespace App\Support;

final class CommandSanitizer
{
    /**
     * Dangerous shell characters and sequences.
     */
    private const DANGEROUS_PATTERNS = [
        '/[;&|`$]/',           // Command chaining
        '/\$\(/',              // Command substitution
        '/>\s*\//',            // Redirect to absolute path
        '/\.\.\//',            // Directory traversal
        '/\n|\r/',             // Newlines
    ];

    /**
     * Sanitize a value for use in shell commands.
     */
    public static function sanitize(string $value): string
    {
        foreach (self::DANGEROUS_PATTERNS as $pattern) {
            if (preg_match($pattern, $value)) {
                throw new \InvalidArgumentException('Value contains dangerous characters');
            }
        }

        return escapeshellarg($value);
    }

    /**
     * Sanitize a path for use in shell commands.
     */
    public static function sanitizePath(string $path): string
    {
        $path = str_replace('\\', '/', $path);

        if (str_contains($path, '..')) {
            throw new \InvalidArgumentException('Path contains directory traversal');
        }

        if (!str_starts_with($path, '/') && !str_starts_with($path, '~')) {
            throw new \InvalidArgumentException('Path must be absolute');
        }

        return escapeshellarg($path);
    }

    /**
     * Validate a hostname/IP address.
     */
    public static function validateHost(string $host): bool
    {
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return true;
        }

        if (filter_var($host, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME)) {
            return true;
        }

        return false;
    }

    /**
     * Validate a port number.
     */
    public static function validatePort(int $port): bool
    {
        return $port >= 1 && $port <= 65535;
    }

    /**
     * Sanitize environment variables for shell.
     */
    public static function sanitizeEnvVars(array $vars): array
    {
        $sanitized = [];
        foreach ($vars as $key => $value) {
            if (!preg_match('/^[A-Z_][A-Z0-9_]*$/i', $key)) {
                continue;
            }
            $sanitized[$key] = escapeshellarg((string) $value);
        }

        return $sanitized;
    }
}
