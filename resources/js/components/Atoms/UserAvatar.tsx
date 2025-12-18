interface UserAvatarProps {
    name?: string;
    email?: string;
    avatar?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ name, email, avatar, size = 'md' }: UserAvatarProps) {
    const sizeClasses = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
    };

    const getInitials = () => {
        if (name) {
            return name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        if (email) {
            return email[0].toUpperCase();
        }
        return '?';
    };

    return (
        <div className={`relative inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 ${sizeClasses[size]}`}>
            {avatar ? (
                <img 
                    src={avatar} 
                    alt={name || email || 'User'}
                    className="h-full w-full rounded-full object-cover"
                />
            ) : (
                <span className="font-medium text-gray-600 dark:text-gray-300">
                    {getInitials()}
                </span>
            )}
        </div>
    );
}
