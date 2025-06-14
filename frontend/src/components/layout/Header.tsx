import React, { useState } from 'react';
import type { 
  NavItem, 
  HeaderProps, 
} from '../../types/chemistry';

export const Header: React.FC<HeaderProps> = ({
  navItems = [],
  activeItem,
  onNavItemClick,
  showMobileMenu = true,
  customLogo
}) => {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const defaultNavItems: NavItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      href: '/',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'molar-mass',
      label: 'Masa Molar',
      href: '/masa-molar',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'concentrations',
      label: 'Concentraciones',
      href: '/concentraciones',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      id: 'balance',
      label: 'Balance de Ecuaciones',
      href: '/balance',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
        </svg>
      )
    }
  ];

  const navigationItems = navItems.length > 0 ? navItems : defaultNavItems;
  
  const handleNavItemClick = (item: NavItem) => {
    if (!item.disabled) {
      onNavItemClick?.(item.id);
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const DefaultLogo = () => (
    <div className="flex items-center">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2 mr-3">
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900">MoleMath</h1>
        <p className="text-xs text-gray-500">Matemática Molecular</p>
      </div>
    </div>
  );

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-shrink-0">
            {customLogo || <DefaultLogo />}
          </div>

          <nav className="hidden md:block">
            <div className="flex space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavItemClick(item)}
                  disabled={item.disabled}
                  className={`
                    flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${item.id === activeItem
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : item.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  {item.icon && (
                    <span className="mr-2">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                  {item.disabled && (
                    <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                      Próximamente
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {showMobileMenu && (
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Abrir menú"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50">
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item)}
                disabled={item.disabled}
                className={`
                  w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                  ${item.id === activeItem
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }
                `}
              >
                {item.icon && (
                  <span className="mr-3">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1 text-left">{item.label}</span>
                {item.disabled && (
                  <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    Próximamente
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;