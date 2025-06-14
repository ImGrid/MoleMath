import React from 'react';
import Header from './Header';
import type { NavItem, LayoutProps } from '../../types/chemistry';

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  onNavigate,
  showFooter = true,
  className = ''
}) => {

  const navigationItems: NavItem[] = [
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

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      <Header
        navItems={navigationItems}
        activeItem={currentPage}
        onNavItemClick={onNavigate}
      />

      <main className="flex-1">
        {children}
      </main>

      {showFooter && <MoleMathFooter />}
    </div>
  );
};

const MoleMathFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-1.5 mr-3">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">MoleMath</span>
              <span className="text-sm text-gray-500 ml-2">© {currentYear}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <a 
              href="https://imgrid.github.io/Harold-portafolio/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Portafolio
            </a>
            <a 
              href="https://www.linkedin.com/in/harold-ponce-234897285/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              LinkedIn
            </a>
            <a 
              href="mailto:poncehar0331@gmail.com" 
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Contacto
            </a>
          </div>

          <div className="text-xs text-gray-500">
            <span className="inline-flex items-center">
              Desarrollado por 
              <a 
                href="https://imgrid.github.io/Harold-portafolio/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 mx-1 font-medium transition-colors duration-200"
              >
                Harold Ponce
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Layout;