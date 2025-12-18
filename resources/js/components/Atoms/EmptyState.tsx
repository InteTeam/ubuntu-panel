import React from 'react';

interface EmptyStateProps {
  message: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ message, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">📭</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      {description && (
        <p className="text-gray-600 text-sm">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}