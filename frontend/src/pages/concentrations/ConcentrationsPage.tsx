import React from 'react';
import ConcentrationCalculator from '../../components/calculators/ConcentrationCalculator';

export interface ConcentrationsPageProps {
  onNavigate?: (pageId: string) => void;
}

const ConcentrationsPage: React.FC<ConcentrationsPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="py-8">
        <ConcentrationCalculator />
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ¿Necesitas otros cálculos?
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate?.('molar-mass')}
              className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Masa Molar
            </button>
            <button
              onClick={() => onNavigate?.('balance')}
              className="inline-flex items-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
              </svg>
              Balance de Ecuaciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcentrationsPage;