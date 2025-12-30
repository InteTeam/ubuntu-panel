/**
 * Cryptographically secure password generator using Web Crypto API
 */

export interface PasswordOptions {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
}

export interface PasswordPreset {
    name: string;
    description: string;
    options: PasswordOptions;
}

const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

export const PASSWORD_PRESETS: PasswordPreset[] = [
    {
        name: 'Strong',
        description: 'All character types (32 chars)',
        options: { length: 32, uppercase: true, lowercase: true, numbers: true, symbols: true },
    },
    {
        name: 'Database',
        description: 'Alphanumeric only (24 chars)',
        options: { length: 24, uppercase: true, lowercase: true, numbers: true, symbols: false },
    },
    {
        name: 'API Key',
        description: 'Long alphanumeric (48 chars)',
        options: { length: 48, uppercase: true, lowercase: true, numbers: true, symbols: false },
    },
    {
        name: 'Simple',
        description: 'Letters and numbers (16 chars)',
        options: { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: false },
    },
];

export const DEFAULT_OPTIONS: PasswordOptions = {
    length: 32,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
};

/**
 * Generate a cryptographically secure random password
 */
export function generatePassword(options: PasswordOptions = DEFAULT_OPTIONS): string {
    let charset = '';

    if (options.uppercase) charset += CHAR_SETS.uppercase;
    if (options.lowercase) charset += CHAR_SETS.lowercase;
    if (options.numbers) charset += CHAR_SETS.numbers;
    if (options.symbols) charset += CHAR_SETS.symbols;

    // Fallback if no options selected
    if (charset.length === 0) {
        charset = CHAR_SETS.lowercase + CHAR_SETS.numbers;
    }

    const length = Math.max(8, Math.min(64, options.length));

    // Use Web Crypto API for secure randomness
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset[randomValues[i] % charset.length];
    }

    return password;
}

/**
 * Generate a Laravel APP_KEY in the correct format
 * Laravel expects: base64:{32 random bytes encoded as base64}
 */
export function generateLaravelKey(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);

    // Convert to base64
    const base64 = btoa(String.fromCharCode(...bytes));

    return `base64:${base64}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            return true;
        } catch {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}
