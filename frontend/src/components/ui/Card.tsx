import React from 'react';
import type { 
  CardProps, 
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  ResultCardProps,
  InfoCardProps
} from '../../types/chemistry';

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  shadow = true,
  clickable = false,
  onClick,
  className = '',
  border = true,
  padding = 'md',
  loading = false
}) => {
  const getCardStyles = () => {
    const baseStyles = `
      rounded-lg transition-all duration-200 overflow-hidden
      ${clickable ? 'cursor-pointer hover:scale-[1.02]' : ''}
      ${shadow ? 'shadow-lg hover:shadow-xl' : ''}
      ${border ? 'border' : ''}
    `;

    const paddingStyles = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };

    const variantStyles = {
      default: `
        bg-white border-gray-200 text-gray-900
        ${clickable ? 'hover:bg-gray-50' : ''}
      `,
      success: `
        bg-green-50 border-green-200 text-green-900
        ${clickable ? 'hover:bg-green-100' : ''}
      `,
      error: `
        bg-red-50 border-red-200 text-red-900
        ${clickable ? 'hover:bg-red-100' : ''}
      `,
      warning: `
        bg-yellow-50 border-yellow-200 text-yellow-900
        ${clickable ? 'hover:bg-yellow-100' : ''}
      `,
      info: `
        bg-blue-50 border-blue-200 text-blue-900
        ${clickable ? 'hover:bg-blue-100' : ''}
      `
    };

    return `${baseStyles} ${paddingStyles[padding]} ${variantStyles[variant]} ${className}`;
  };

  const getTitleStyles = () => {
    const variantTitleStyles = {
      default: 'text-gray-900',
      success: 'text-green-800',
      error: 'text-red-800',
      warning: 'text-yellow-800',
      info: 'text-blue-800'
    };

    return `text-xl font-semibold mb-2 ${variantTitleStyles[variant]}`;
  };

  const getSubtitleStyles = () => {
    const variantSubtitleStyles = {
      default: 'text-gray-600',
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600'
    };

    return `text-sm mb-4 ${variantSubtitleStyles[variant]}`;
  };

  const handleClick = () => {
    if (clickable && onClick && !loading) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={getCardStyles()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-gray-600">Calculando...</span>
          </div>
        </div>
      )}

      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className={getTitleStyles()}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={getSubtitleStyles()}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardBody: React.FC<CardBodyProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`flex-1 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
    {children}
  </div>
);

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  value,
  unit,
  steps = [],
  success = true,
  error,
  loading = false,
  additionalInfo
}) => {
  const variant = error ? 'error' : success ? 'success' : 'default';

  return (
    <Card 
      variant={variant} 
      loading={loading}
      title={title}
      className="relative"
    >
      {error ? (
        <div className="text-center py-4">
          <div className="text-red-600 mb-2">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-800 font-medium">Error en el cálculo</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-green-800 mb-2">
              {value}
              {unit && <span className="text-2xl text-green-600 ml-2">{unit}</span>}
            </div>
            {success && (
              <div className="flex items-center justify-center text-green-600">
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Cálculo completado</span>
              </div>
            )}
          </div>

          {steps.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                Pasos del cálculo:
              </h4>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    className="flex items-start bg-white/50 rounded-lg p-3 text-sm"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {additionalInfo && (
            <div className="border-t border-green-200 pt-4 mt-4">
              {additionalInfo}
            </div>
          )}
        </>
      )}
    </Card>
  );
};


export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  content,
  variant = 'blue'
}) => {
  const variantStyles = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    purple: 'border-purple-200 bg-purple-50'
  };

  const iconStyles = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };

  const titleStyles = {
    blue: 'text-blue-800',
    green: 'text-green-800',
    yellow: 'text-yellow-800',
    purple: 'text-purple-800'
  };

  return (
    <div className={`border rounded-lg p-4 ${variantStyles[variant]}`}>
      <div className="flex items-start space-x-3">
        {icon && (
          <div className={`flex-shrink-0 ${iconStyles[variant]}`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h4 className={`font-semibold mb-2 ${titleStyles[variant]}`}>
            {title}
          </h4>
          <div className="text-gray-700">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;