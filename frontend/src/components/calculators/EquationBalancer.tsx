import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import { ResultCard } from '../ui/Card';
import { CalculateButton, ClearButton, CopyButton, ButtonGroup } from '../ui/Button';
import { CalculationSpinner, EmptyState } from '../common/LoadingSpinner';

import { 
  balanceChemicalEquation, 
  validateBalancedEquation,
} from '../../utils/chemistry/equationBalancer';
import { formatBalanceResult } from '../../utils/formatters';
import { validateChemicalEquation } from '../../utils/chemistry/validator';
import type { 
  BalanceResult, 
  BalanceMethod,
} from '../../types/chemistry';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
interface BalanceState {
  equation: string;
  balanceMethod: BalanceMethod;
  isCalculating: boolean;
  result: BalanceResult | null;
  error: string | null;
  showElementCount: boolean;
  copySuccess: string;
}

const initialState: BalanceState = {
  equation: '',
  balanceMethod: 'trial-and-error',
  isCalculating: false,
  result: null,
  error: null,
  showElementCount: true,
  copySuccess: ''
};

function useEquationValidation(equation: string) {
  return useMemo(() => {
    if (!equation.trim()) {
      return { isValid: true, errors: [], warnings: [] };
    }
    
    const validation = validateChemicalEquation(equation);
    return {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings || []
    };
  }, [equation]);
}

const EXAMPLE_EQUATIONS = [
  'H2 + O2 = H2O',
  'Fe + O2 = Fe2O3',
  'C2H6 + O2 = CO2 + H2O',
  'Al + CuSO4 = Al2(SO4)3 + Cu',
  'NH3 + O2 = NO + H2O'
] as const;

const EquationInput = memo(function EquationInput({
  value,
  onChange,
  onKeyDown,
  isValid,
  disabled,
  isValidating
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isValid: boolean;
  disabled: boolean;
  isValidating: boolean;
}) {
  const className = useMemo(() => {
    let styles = "w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-mono text-base resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20";
    
    if (disabled) {
      styles += " bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed";
    } else if (isValidating) {
      styles += " bg-yellow-50 border-yellow-300 text-gray-900";
    } else if (!isValid && value.trim()) {
      styles += " bg-red-50 border-red-400 text-red-900 focus:border-red-500";
    } else if (isValid && value.trim()) {
      styles += " bg-green-50 border-green-400 text-green-900 focus:border-green-500";
    } else {
      styles += " bg-white border-gray-300 text-gray-900 focus:border-blue-500";
    }
    
    return styles;
  }, [disabled, isValidating, isValid, value.length > 0]); 

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Ej: H2 + O2 → H2O&#10;  C2H6 + O2 -> CO2 + H2O&#10;"
        className={className}
        rows={3}
        spellCheck="false"
        disabled={disabled}
      />
      
      {value.trim() && (
        <div className="absolute right-3 top-3">
          {isValidating ? (
            <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
          ) : isValid ? (
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
});

const ExamplesPanel = memo(function ExamplesPanel({
  onSelectExample,
  disabled
}: {
  onSelectExample: (equation: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">Ejemplos:</h3>
      <div className="space-y-1">
        {EXAMPLE_EQUATIONS.map((example, index) => (
          <button
            key={index}
            onClick={() => onSelectExample(example)}
            className="w-full text-left px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-150 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
});

const ValidationErrors = memo(function ValidationErrors({ 
  errors 
}: { 
  errors: readonly string[] 
}) {
  if (errors.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <svg className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 mb-1">
            Errores en la ecuación:
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
});

const ElementBalance = memo(function ElementBalance({ 
  result 
}: { 
  result: BalanceResult 
}) {
  const validation = useMemo(() => {
    if (!result.isValid) return { elementBalance: [] };
    return validateBalancedEquation(result.balancedReactants, result.balancedProducts);
  }, [result]);

  if (!result.isValid || validation.elementBalance.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-2 text-sm">Conteo de Elementos:</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {validation.elementBalance.map((balance, index) => (
          <div 
            key={index}
            className={`flex justify-between items-center p-2 rounded text-sm ${
              balance.isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <span className="font-medium">{balance.element}</span>
            <span className="text-xs">
              {balance.reactantCount} → {balance.productCount}
              {balance.isBalanced ? ' ✓' : ' ✗'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

const BalanceResultDisplay = memo(function BalanceResultDisplay({
  result,
  showElementCount,
  onCopyResult
}: {
  result: BalanceResult;
  showElementCount: boolean;
  onCopyResult: () => void;
}) {
  const formatted = useMemo(() => {
    return formatBalanceResult(result);
  }, [result]);

  return (
    <ResultCard
      title={formatted.title}
      value=""
      steps={undefined}
      success={true}
      loading={false}
      additionalInfo={
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-1 text-sm">Ecuación Original:</h4>
              <p className="font-mono text-sm text-gray-700">{formatted.originalEquation}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-1 text-sm">Ecuación Balanceada:</h4>
              <p className="font-mono text-sm text-green-700 font-bold">{formatted.balancedEquation}</p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-blue-800">Método:</span>
                <span className="text-sm text-blue-700 ml-2">{formatted.method}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">Coeficientes:</span>
                <span className="text-sm text-blue-700 ml-2">{formatted.coefficients.join(', ')}</span>
              </div>
            </div>
          </div>

          {showElementCount && <ElementBalance result={result} />}

          <div className="flex justify-center">
            <CopyButton
              textToCopy={formatted.balancedEquation}
              onCopySuccess={onCopyResult}
              size="sm"
            >
              Copiar Ecuación Balanceada
            </CopyButton>
          </div>
        </div>
      }
    />
  );
});

export const EquationBalancer = memo(function EquationBalancer() {

  const [state, setState] = useState<BalanceState>(initialState);
  const debouncedEquation = useDebounce(state.equation, 500);
  const validation = useEquationValidation(debouncedEquation);
  const isValidating = state.equation !== debouncedEquation && state.equation.trim() !== '';
  const canBalance = useMemo(() => {
    return state.equation.trim() && validation.isValid;
  }, [state.equation, validation.isValid]);
  useEffect(() => {
    if (state.copySuccess) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, copySuccess: '' }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.copySuccess]);

  const handleEquationChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, equation: event.target.value }));
  }, []);

  const handleSelectExample = useCallback((equation: string) => {
    setState(prev => ({ ...prev, equation }));
  }, []);

  const handleBalanceEquation = useCallback(async () => {
    if (!canBalance) return;

    setState(prev => ({ ...prev, isCalculating: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = balanceChemicalEquation({
        equation: state.equation.trim(),
        method: state.balanceMethod
      });

      if (result.isValid) {
        setState(prev => ({ 
          ...prev, 
          isCalculating: false, 
          result, 
          error: null 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          isCalculating: false, 
          error: result.error || 'Error desconocido en el balance',
          result: null 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isCalculating: false, 
        error: 'Error interno del balanceador',
        result: null 
      }));
    }
  }, [canBalance, state.equation, state.balanceMethod]);

  const handleClear = useCallback(() => {
    setState(initialState);
  }, []);

  const handleCopyResult = useCallback(() => {
    setState(prev => ({ ...prev, copySuccess: 'Ecuación copiada' }));
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      handleBalanceEquation();
    }
  }, [handleBalanceEquation]);

  const handleMethodChange = useCallback((method: BalanceMethod) => {
    setState(prev => ({ ...prev, balanceMethod: method }));
  }, []);

  const toggleElementCount = useCallback(() => {
    setState(prev => ({ ...prev, showElementCount: !prev.showElementCount }));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Balanceador de Ecuaciones Químicas
        </h1>
        <p className="text-gray-600 text-sm max-w-3xl mx-auto">
          Balancea ecuaciones químicas automáticamente con verificación de elementos y pasos detallados.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          <div className="lg:col-span-3 space-y-3">
            <div>
              <label htmlFor="chemical-equation" className="block text-sm font-medium text-gray-700 mb-1">
                Ecuación Química
              </label>
              <EquationInput
                value={state.equation}
                onChange={handleEquationChange}
                onKeyDown={handleKeyDown}
                isValid={validation.isValid}
                disabled={state.isCalculating}
                isValidating={isValidating}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Balance
                </label>
                <select
                  value={state.balanceMethod}
                  onChange={(e) => handleMethodChange(e.target.value as BalanceMethod)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={state.isCalculating}
                >
                  <option value="trial-and-error">Tanteo (Trial and Error)</option>
                  <option value="algebraic">Algebraico (Matriz)</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={state.showElementCount}
                    onChange={toggleElementCount}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    disabled={state.isCalculating}
                  />
                  Conteo de elementos
                </label>
              </div>

              <ButtonGroup>
                <CalculateButton
                  onClick={handleBalanceEquation}
                  calculating={state.isCalculating}
                  disabled={!canBalance}
                  size="sm"
                >
                  Balancear
                </CalculateButton>
                <ClearButton
                  onClick={handleClear}
                  disabled={state.isCalculating}
                  size="sm"
                >
                  Limpiar
                </ClearButton>
              </ButtonGroup>
            </div>
          </div>

          <ExamplesPanel
            onSelectExample={handleSelectExample}
            disabled={state.isCalculating}
          />
        </div>

        <ValidationErrors errors={validation.errors} />
      </div>

      {state.isCalculating && (
        <CalculationSpinner message="Balanceando ecuación química..." />
      )}

      {state.result && !state.isCalculating && (
        <BalanceResultDisplay
          result={state.result}
          showElementCount={state.showElementCount}
          onCopyResult={handleCopyResult}
        />
      )}

      {state.error && (
        <ResultCard
          title="Error en el Balance"
          value=""
          error={state.error}
          success={false}
        />
      )}

      {!state.equation.trim() && !state.result && !state.isCalculating && (
        <EmptyState
          message="Introduce una ecuación química"
          description="Escribe una ecuación química sin balancear para encontrar automáticamente los coeficientes correctos."
          icon={
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
            </svg>
          }
        />
      )}


      {state.copySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {state.copySuccess}
        </div>
      )}
    </div>
  );
});

export default EquationBalancer;