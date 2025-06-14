// ============================================================================
// HOMEPAGE SIMPLIFICADA - SIN CONTENIDO INNECESARIO
// ============================================================================

import React from 'react';

// ============================================================================
// INTERFACES
// ============================================================================

export interface HomePageProps {
  /** Callback para navegación */
  onNavigate?: (pageId: string) => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  // ============================================================================
  // DATOS DE LAS CALCULADORAS
  // ============================================================================

  const calculators = [
    {
      id: 'molar-mass',
      title: 'Calculadora de Masa Molar',
      description: 'Calcula la masa molar de cualquier compuesto químico con conversiones automáticas.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      available: true,
      color: 'blue'
    },
    {
      id: 'concentrations',
      title: 'Calculadora de Concentraciones',
      description: 'Calcula molaridad, molalidad, diluciones y preparación de soluciones.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      available: true,
      color: 'green'
    },
    {
      id: 'balance',
      title: 'Balanceador de Ecuaciones',
      description: 'Balancea ecuaciones químicas automáticamente con verificación de elementos.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
        </svg>
      ),
      available: true,
      color: 'purple'
    }
  ];

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCalculatorClick = (calculatorId: string) => {
    onNavigate?.(calculatorId);
  };

  // ============================================================================
  // ESTILOS DINÁMICOS
  // ============================================================================

  const getCardStyles = (color: string, available: boolean) => {
    const baseStyles = `
      group relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300
      ${available ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'cursor-not-allowed opacity-75'}
    `;

    const colorStyles = {
      blue: available 
        ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200' 
        : 'border-gray-200 bg-gray-50',
      green: available 
        ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200' 
        : 'border-gray-200 bg-gray-50',
      purple: available 
        ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200' 
        : 'border-gray-200 bg-gray-50'
    };

    return `${baseStyles} ${colorStyles[color as keyof typeof colorStyles]}`;
  };

  const getIconStyles = (color: string, available: boolean) => {
    if (!available) return 'text-gray-400';

    const iconStyles = {
      blue: 'text-blue-600 group-hover:text-blue-700',
      green: 'text-green-600 group-hover:text-green-700',
      purple: 'text-purple-600 group-hover:text-purple-700'
    };

    return iconStyles[color as keyof typeof iconStyles];
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section Simplificada */}
      <div className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
          <div className="text-center">
            {/* Logo y Título */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MoleMath
                </span>
              </h1>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Tu calculadora química. 
                Resuelve problemas de química con explicaciones paso a paso.
              </p>
            </div>

            {/* Botón Principal */}
            <div className="mb-12">
              <button
                onClick={() => handleCalculatorClick('molar-mass')}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Comenzar Ahora
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calculadoras Disponibles */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Calculadoras Disponibles
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Herramientas especializadas para resolver los problemas más comunes en química
          </p>
        </div>

        {/* Grid de Calculadoras */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {calculators.map((calculator) => (
            <div
              key={calculator.id}
              className={getCardStyles(calculator.color, calculator.available)}
              onClick={() => calculator.available && handleCalculatorClick(calculator.id)}
            >
              {/* Icono */}
              <div className={`mb-4 ${getIconStyles(calculator.color, calculator.available)}`}>
                {calculator.icon}
              </div>

              {/* Contenido */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {calculator.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {calculator.description}
                </p>

                {/* Estado */}
                {calculator.available ? (
                  <div className="flex items-center text-sm font-medium text-green-600">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Disponible
                  </div>
                ) : (
                  <div className="flex items-center text-sm font-medium text-gray-500">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Próximamente
                  </div>
                )}
              </div>

              {calculator.available && (
                <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            ¿Nuevo en MoleMath? Comienza con la calculadora de masa molar
          </p>
          <button
            onClick={() => handleCalculatorClick('molar-mass')}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-6 py-3 text-base font-semibold text-blue-600 transition-all duration-200 hover:bg-blue-600 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Probar Calculadora
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;