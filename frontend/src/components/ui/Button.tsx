import React from 'react';
import type { ButtonProps } from '../../types/chemistry';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  fullWidth = false,
  leftIcon,
  rightIcon,
  id,
  ariaLabel
}) => {

  const getButtonStyles = () => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-lg transition-all duration-200
      focus:outline-none focus:ring-4 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
    `;

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    };

    const variantStyles = {
      primary: `
        bg-blue-600 text-white border border-blue-600
        hover:bg-blue-700 hover:border-blue-700
        focus:ring-blue-500/50
        disabled:hover:bg-blue-600
      `,
      secondary: `
        bg-gray-100 text-gray-900 border border-gray-300
        hover:bg-gray-200 hover:border-gray-400
        focus:ring-gray-500/50
        disabled:hover:bg-gray-100
      `,
      success: `
        bg-green-600 text-white border border-green-600
        hover:bg-green-700 hover:border-green-700
        focus:ring-green-500/50
        disabled:hover:bg-green-600
      `,
      danger: `
        bg-red-600 text-white border border-red-600
        hover:bg-red-700 hover:border-red-700
        focus:ring-red-500/50
        disabled:hover:bg-red-600
      `,
      warning: `
        bg-yellow-500 text-white border border-yellow-500
        hover:bg-yellow-600 hover:border-yellow-600
        focus:ring-yellow-500/50
        disabled:hover:bg-yellow-500
      `,
      info: `
        bg-cyan-600 text-white border border-cyan-600
        hover:bg-cyan-700 hover:border-cyan-700
        focus:ring-cyan-500/50
        disabled:hover:bg-cyan-600
      `,
      ghost: `
        bg-transparent text-gray-700 border border-transparent
        hover:bg-gray-100 hover:text-gray-900
        focus:ring-gray-500/50
        disabled:hover:bg-transparent disabled:hover:text-gray-700
      `
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };

  const getIconSize = () => {
    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-7 w-7'
    };
    return iconSizes[size];
  };

  const getSpinnerSize = () => {
    const spinnerSizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6'
    };
    return spinnerSizes[size];
  };

 
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(event);
    }
  };
  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={getButtonStyles()}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
    >
      {leftIcon && !loading && (
        <span className={`${getIconSize()} mr-2 flex-shrink-0`}>
          {leftIcon}
        </span>
      )}

      {loading && (
        <span className={`${getSpinnerSize()} mr-2 flex-shrink-0`}>
          <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}

      <span className={loading ? 'opacity-75' : ''}>
        {children}
      </span>

      {rightIcon && !loading && (
        <span className={`${getIconSize()} ml-2 flex-shrink-0`}>
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export interface CalculateButtonProps extends Omit<ButtonProps, 'variant' | 'leftIcon'> {
  calculating?: boolean;
}

export const CalculateButton: React.FC<CalculateButtonProps> = ({
  calculating = false,
  children = 'Calcular',
  ...props
}) => {
  const calculatorIcon = (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );

  return (
    <Button
      variant="primary"
      leftIcon={calculatorIcon}
      loading={calculating}
      {...props}
    >
      {calculating ? 'Calculando...' : children}
    </Button>
  );
};

export interface ClearButtonProps extends Omit<ButtonProps, 'variant' | 'leftIcon'> {}

export const ClearButton: React.FC<ClearButtonProps> = ({
  children = 'Limpiar',
  ...props
}) => {
  const clearIcon = (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  return (
    <Button
      variant="secondary"
      leftIcon={clearIcon}
      {...props}
    >
      {children}
    </Button>
  );
};

export interface CopyButtonProps extends Omit<ButtonProps, 'variant' | 'leftIcon' | 'onClick'> {
  textToCopy: string;
  onCopySuccess?: () => void;
  onCopyError?: (error: Error) => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  onCopySuccess,
  onCopyError,
  children = 'Copiar',
  ...props
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyIcon = (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );

  const checkIcon = (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopySuccess?.();
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      onCopyError?.(error as Error);
    }
  };

  return (
    <Button
      variant={copied ? "success" : "ghost"}
      leftIcon={copied ? checkIcon : copyIcon}
      onClick={handleCopy}
      {...props}
    >
      {copied ? 'Copiado!' : children}
    </Button>
  );
};

export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  fullWidth?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  className = '',
  fullWidth = false
}) => {
  const groupStyles = orientation === 'horizontal' 
    ? `flex space-x-2 ${fullWidth ? 'w-full' : ''}` 
    : `flex flex-col space-y-2 ${fullWidth ? 'w-full' : ''}`;

  return (
    <div className={`${groupStyles} ${className}`}>
      {children}
    </div>
  );
};

export default Button;