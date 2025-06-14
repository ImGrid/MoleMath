import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  message?: string;
  centered?: boolean;
  className?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  message,
  centered = false,
  className = '',
  overlay = false
}) => {

  const getSizeStyles = () => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12'
    };
    return sizes[size];
  };

  const getColorStyles = () => {
    const colors = {
      blue: 'border-blue-500',
      green: 'border-green-500',
      red: 'border-red-500',
      yellow: 'border-yellow-500',
      purple: 'border-purple-500',
      gray: 'border-gray-500'
    };
    return colors[color];
  };

  const getMessageSizeStyles = () => {
    const messageSizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };
    return messageSizes[size];
  };

  const getMessageColorStyles = () => {
    const messageColors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      gray: 'text-gray-600'
    };
    return messageColors[color];
  };

  const SpinnerIcon = () => (
    <div
      className={`
        animate-spin rounded-full border-2 border-t-transparent
        ${getSizeStyles()} ${getColorStyles()}
      `}
      role="status"
      aria-label="Loading"
    />
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center space-y-4">
          <SpinnerIcon />
          {message && (
            <p className={`font-medium ${getMessageSizeStyles()} ${getMessageColorStyles()}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  const containerStyles = centered
    ? 'flex flex-col items-center justify-center space-y-2'
    : 'flex items-center space-x-2';

  return (
    <div className={`${containerStyles} ${className}`}>
      <SpinnerIcon />
      {message && (
        <p className={`font-medium ${getMessageSizeStyles()} ${getMessageColorStyles()}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export const CalculationSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Calculando...' 
}) => (
  <LoadingSpinner
    size="md"
    color="blue"
    message={message}
    centered
    className="py-8"
  />
);

export const ValidationSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Validando fórmula...' 
}) => (
  <LoadingSpinner
    size="sm"
    color="yellow"
    message={message}
  />
);

export const SearchSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Buscando...' 
}) => (
  <LoadingSpinner
    size="sm"
    color="green"
    message={message}
  />
);

export interface SkeletonProps {
  width?: string;
  height?: string;
  circular?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = 'w-full',
  height = 'h-4',
  circular = false,
  className = ''
}) => (
  <div
    className={`
      animate-pulse bg-gray-200
      ${circular ? 'rounded-full' : 'rounded'}
      ${width} ${height} ${className}
    `}
  />
);

export const CalculationSkeleton: React.FC = () => (
  <div className="space-y-4 p-6">
    <Skeleton width="w-48" height="h-6" />
    
    <div className="text-center py-4">
      <Skeleton width="w-32" height="h-8" className="mx-auto mb-2" />
      <Skeleton width="w-24" height="h-4" className="mx-auto" />
    </div>
    
    <div className="space-y-3">
      <Skeleton width="w-32" height="h-5" />
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-start space-x-3">
          <Skeleton width="w-6" height="h-6" circular />
          <Skeleton width="w-full" height="h-4" />
        </div>
      ))}
    </div>
  </div>
);

export const TableLoadingState: React.FC<{ 
  rows?: number;
  columns?: number;
}> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} height="h-4" />
        ))}
      </div>
    ))}
  </div>
);

export const ListLoadingState: React.FC<{ 
  items?: number;
}> = ({ 
  items = 5 
}) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton width="w-10" height="h-10" circular />
        <div className="flex-1 space-y-2">
          <Skeleton width="w-3/4" height="h-4" />
          <Skeleton width="w-1/2" height="h-3" />
        </div>
      </div>
    ))}
  </div>
);

export interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  description,
  icon,
  action,
  className = ''
}) => {
  const defaultIcon = (
    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {message}
      </h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
};

export const ErrorState: React.FC<{
  message: string;
  description?: string;
  onRetry?: () => void;
}> = ({ 
  message, 
  description,
  onRetry 
}) => {
  const errorIcon = (
    <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const retryButton = onRetry && (
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Reintentar
    </button>
  );

  return (
    <EmptyState
      message={message}
      description={description}
      icon={errorIcon}
      action={retryButton}
    />
  );
};

export default LoadingSpinner;