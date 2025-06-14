import React, { useCallback, useEffect, useReducer, useMemo, memo } from 'react';
import ChemicalInput from '../ui/Input';
import { ResultCard, InfoCard } from '../ui/Card';
import { CalculateButton, ClearButton, CopyButton, ButtonGroup } from '../ui/Button';
import { CalculationSpinner, EmptyState } from '../common/LoadingSpinner';

import { calculateMolarMass, performConversion } from '../../utils/chemistry/molarMassCalculator';
import { formatMolarMassResult, formatForClipboard } from '../../utils/formatters';
import { getFormulaContext } from '../../utils/chemistry/formulaSuggestions';

import type { 
  MolarMassResult, 
  ConversionResult, 
  ConversionType,
  ConversionState, 
  ProcessedCompound,
  FormulaSuggestion
} from '../../types/chemistry';

interface CalculationState {
  formula: string;
  
  isValidFormula: boolean;
  validationErrors: readonly string[];
  knownCompound: ProcessedCompound | null;
  
  isCalculating: boolean;
  molarMassResult: MolarMassResult | null;
  error: string | null;
  lastCalculatedFormula: string;
  
  showSteps: boolean;
  copySuccess: string;
}

type CalculationAction =
  | { type: 'SET_FORMULA'; payload: string }
  | { type: 'SET_VALIDATION'; payload: { isValid: boolean; errors: readonly string[] } }
  | { type: 'SET_KNOWN_COMPOUND'; payload: ProcessedCompound | null }
  | { type: 'SET_CALCULATING'; payload: boolean }
  | { type: 'SET_RESULT'; payload: { result: MolarMassResult; formula: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'TOGGLE_STEPS' }
  | { type: 'SET_COPY_SUCCESS'; payload: string }
  | { type: 'CLEAR_ALL' };

type ConversionAction =
  | { type: 'SET_INPUT'; payload: { type: 'grams' | 'moles' | 'molecules'; value: string } }
  | { type: 'SET_CALCULATING'; payload: { type: 'grams' | 'moles' | 'molecules'; value: boolean } }
  | { type: 'ADD_RESULT'; payload: ConversionResult }
  | { type: 'REMOVE_RESULT'; payload: ConversionType }
  | { type: 'CLEAR_ALL' };

function calculationReducer(state: CalculationState, action: CalculationAction): CalculationState {
  switch (action.type) {
    case 'SET_FORMULA':
      return { 
        ...state, 
        formula: action.payload,
        molarMassResult: state.lastCalculatedFormula !== action.payload ? null : state.molarMassResult,
        error: state.lastCalculatedFormula !== action.payload ? null : state.error
      };
    case 'SET_VALIDATION':
      return { 
        ...state, 
        isValidFormula: action.payload.isValid, 
        validationErrors: action.payload.errors 
      };
    case 'SET_KNOWN_COMPOUND':
      return { ...state, knownCompound: action.payload };
    case 'SET_CALCULATING':
      return { ...state, isCalculating: action.payload, error: action.payload ? null : state.error };
    case 'SET_RESULT':
      return { 
        ...state, 
        isCalculating: false, 
        molarMassResult: action.payload.result, 
        lastCalculatedFormula: action.payload.formula,
        error: null 
      };
    case 'SET_ERROR':
      return { ...state, isCalculating: false, error: action.payload, molarMassResult: null };
    case 'TOGGLE_STEPS':
      return { ...state, showSteps: !state.showSteps };
    case 'SET_COPY_SUCCESS':
      return { ...state, copySuccess: action.payload };
    case 'CLEAR_ALL':
      return initialCalculationState;
    default:
      return state;
  }
}

function conversionReducer(state: ConversionState, action: ConversionAction): ConversionState {
  switch (action.type) {
    case 'SET_INPUT':
      return { 
        ...state, 
        inputs: { ...state.inputs, [action.payload.type]: action.payload.value } 
      };
    case 'SET_CALCULATING':
      return { 
        ...state, 
        isCalculating: { ...state.isCalculating, [action.payload.type]: action.payload.value } 
      };
    case 'ADD_RESULT':
      return { 
        ...state, 
        results: [
          ...state.results.filter(r => r.type !== action.payload.type),
          action.payload
        ] 
      };
    case 'REMOVE_RESULT':
      return { 
        ...state, 
        results: state.results.filter(r => r.type !== action.payload) 
      };
    case 'CLEAR_ALL':
      return initialConversionState;
    default:
      return state;
  }
}

const initialCalculationState: CalculationState = {
  formula: '',
  isValidFormula: true,
  validationErrors: [],
  knownCompound: null,
  isCalculating: false,
  molarMassResult: null,
  error: null,
  lastCalculatedFormula: '',
  showSteps: true,
  copySuccess: ''
};

const initialConversionState: ConversionState = {
  inputs: {
    grams: '',
    moles: '',
    molecules: ''
  },
  isCalculating: {
    grams: false,
    moles: false,
    molecules: false
  },
  results: []
};

function useCalculationValidation(state: CalculationState) {
  return useMemo(() => {
    const canCalculate = state.formula.trim() && state.isValidFormula;
    return { canCalculate };
  }, [state.formula, state.isValidFormula]);
}

function useConversionResult(results: readonly ConversionResult[], type: ConversionType) {
  return useMemo(() => {
    return results.find(r => r.type === type);
  }, [results, type]);
}

function useConversionDebounce(
  value: string,
  type: 'grams' | 'moles' | 'molecules',
  onConvert: (type: 'grams' | 'moles' | 'molecules', value: string) => void
) {
  useEffect(() => {
    if (!value.trim()) return;

    const timeoutId = setTimeout(() => {
      onConvert(type, value);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [value, type, onConvert]);
}

const FormulaInput = memo(function FormulaInput({
  state,
  dispatch,
  onValidationChange,
  onSuggestionSelect
}: {
  state: CalculationState;
  dispatch: React.Dispatch<CalculationAction>;
  onValidationChange: (isValid: boolean, errors: readonly string[]) => void;
  onSuggestionSelect: (suggestion: FormulaSuggestion) => void;
}) {
  const handleFormulaChange = useCallback((newFormula: string) => {
    dispatch({ type: 'SET_FORMULA', payload: newFormula });
  }, [dispatch]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Fórmula Química
      </label>
      <ChemicalInput
        value={state.formula}
        onChange={handleFormulaChange}
        onValidationChange={onValidationChange}
        onSuggestionSelect={onSuggestionSelect}
        placeholder="Ej: H2SO4, Ca(OH)2, NaCl"
        showSuggestions={true}
        validateOnChange={true}
        autoComplete={true}
      />
    </div>
  );
});

const ConversionInput = memo(function ConversionInput({
  type,
  label,
  unit,
  placeholder,
  value,
  isCalculating,
  result,
  onChange
}: {
  type: 'grams' | 'moles' | 'molecules';
  label: string;
  unit: string;
  placeholder: string;
  value: string;
  isCalculating: boolean;
  result: ConversionResult | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex space-x-2">
        <input
          type={type === 'molecules' ? 'text' : 'number'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          min="0"
          step="any"
        />
        <span className="px-2 py-2 bg-gray-100 border border-gray-300 rounded-md text-xs text-gray-600 flex items-center">
          {unit}
        </span>
      </div>
      
      {isCalculating && (
        <div className="flex items-center text-sm text-blue-600">
          <div className="animate-spin h-3 w-3 border border-blue-500 border-t-transparent rounded-full mr-2"></div>
          Convirtiendo...
        </div>
      )}
      
      {result && (
        <div className="text-sm bg-blue-50 p-2 rounded-md">
          <strong>
            {type === 'grams' ? `${result.outputValue.toFixed(6)} moles` :
             type === 'moles' ? `${result.outputValue.toFixed(4)} gramos` :
             `${result.outputValue.toExponential(4)} moles`}
          </strong>
        </div>
      )}
    </div>
  );
});

const ConversionsSection = memo(function ConversionsSection({
  conversionState,
  conversionDispatch,
  molarMassResult,
  onConvert
}: {
  conversionState: ConversionState;
  conversionDispatch: React.Dispatch<ConversionAction>;
  molarMassResult: MolarMassResult | null;
  lastCalculatedFormula: string;
  onConvert: (type: 'grams' | 'moles' | 'molecules', value: string) => void;
}) {
  const gramsResult = useConversionResult(conversionState.results, 'grams-to-moles');
  const molesResult = useConversionResult(conversionState.results, 'moles-to-grams');
  const moleculesResult = useConversionResult(conversionState.results, 'molecules-to-moles');

  const handleInputChange = useCallback((type: 'grams' | 'moles' | 'molecules', value: string) => {
    conversionDispatch({ type: 'SET_INPUT', payload: { type, value } });
  }, [conversionDispatch]);

  useConversionDebounce(conversionState.inputs.grams, 'grams', onConvert);
  useConversionDebounce(conversionState.inputs.moles, 'moles', onConvert);
  useConversionDebounce(conversionState.inputs.molecules, 'molecules', onConvert);

  if (!molarMassResult) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Conversiones de Unidades
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConversionInput
          type="grams"
          label="Gramos → Moles"
          unit="g"
          placeholder="Gramos"
          value={conversionState.inputs.grams}
          isCalculating={conversionState.isCalculating.grams}
          result={gramsResult}
          onChange={(value) => handleInputChange('grams', value)}
        />

        <ConversionInput
          type="moles"
          label="Moles → Gramos"
          unit="mol"
          placeholder="Moles"
          value={conversionState.inputs.moles}
          isCalculating={conversionState.isCalculating.moles}
          result={molesResult}
          onChange={(value) => handleInputChange('moles', value)}
        />

        <ConversionInput
          type="molecules"
          label="Moléculas → Moles"
          unit="mol."
          placeholder="6.022e23"
          value={conversionState.inputs.molecules}
          isCalculating={conversionState.isCalculating.molecules}
          result={moleculesResult}
          onChange={(value) => handleInputChange('molecules', value)}
        />
      </div>
    </div>
  );
});

const MolarMassResult = memo(function MolarMassResult({
  result,
  showSteps,
  onCopySuccess
}: {
  result: MolarMassResult;
  showSteps: boolean;
  onCopySuccess: () => void;
}) {
  const formatted = useMemo(() => {
    return formatMolarMassResult(result);
  }, [result]);

  return (
    <ResultCard
      title={formatted.title}
      value={formatted.molarMass}
      steps={showSteps ? formatted.steps : undefined}
      success={true}
      loading={false}
      additionalInfo={
        <div className="space-y-3">
          <div>
            <h5 className="font-semibold text-green-800 mb-2 text-sm">
              Composición Elemental:
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {formatted.elements.map((element, index) => (
                <div key={index} className="bg-white/50 rounded-lg p-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{element.element}</span>
                    <span className="text-green-700 font-semibold">{element.percentage}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {element.count} × {element.atomicMass} = {element.contribution}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <CopyButton
              textToCopy={formatForClipboard(formatted.title, formatted.molarMass, formatted.steps)}
              onCopySuccess={onCopySuccess}
              size="sm"
            >
              Copiar Resultado
            </CopyButton>
          </div>
        </div>
      }
    />
  );
});

export const MolarMassCalculator = memo(function MolarMassCalculator() {

  const [calculationState, calculationDispatch] = useReducer(calculationReducer, initialCalculationState);
  const [conversionState, conversionDispatch] = useReducer(conversionReducer, initialConversionState);

  const { canCalculate } = useCalculationValidation(calculationState);

  useEffect(() => {
    if (calculationState.copySuccess) {
      const timer = setTimeout(() => calculationDispatch({ type: 'SET_COPY_SUCCESS', payload: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [calculationState.copySuccess]);

  const handleValidationChange = useCallback((isValid: boolean, errors: readonly string[]) => {
    calculationDispatch({ type: 'SET_VALIDATION', payload: { isValid, errors } });
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: FormulaSuggestion) => {
    calculationDispatch({ type: 'SET_FORMULA', payload: suggestion.formula });
    
    const context = getFormulaContext(suggestion.formula);
    calculationDispatch({ type: 'SET_KNOWN_COMPOUND', payload: context.compound || null });
  }, []);

  const handleCalculateMolarMass = useCallback(async () => {
    if (!canCalculate) return;

    calculationDispatch({ type: 'SET_CALCULATING', payload: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = calculateMolarMass({ formula: calculationState.formula });
      
      if (result.isValid) {
        calculationDispatch({ 
          type: 'SET_RESULT', 
          payload: { result, formula: calculationState.formula } 
        });

        const context = getFormulaContext(calculationState.formula);
        calculationDispatch({ type: 'SET_KNOWN_COMPOUND', payload: context.compound || null });
      } else {
        calculationDispatch({ type: 'SET_ERROR', payload: result.error || 'Error desconocido en el cálculo' });
      }
    } catch (error) {
      calculationDispatch({ type: 'SET_ERROR', payload: 'Error interno del calculador' });
    }
  }, [canCalculate, calculationState.formula]);

  const handleConversion = useCallback(async (
    type: 'grams' | 'moles' | 'molecules',
    inputValue: string
  ) => {
    if (!calculationState.molarMassResult || !inputValue.trim()) return;

    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue <= 0) return;

    conversionDispatch({ type: 'SET_CALCULATING', payload: { type, value: true } });

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const conversionTypes: Record<string, ConversionType> = {
        grams: 'grams-to-moles',
        moles: 'moles-to-grams',
        molecules: 'molecules-to-moles'
      };

      const conversionResult = performConversion({
        value: numValue,
        conversionType: conversionTypes[type],
        formula: calculationState.lastCalculatedFormula
      });

      if (conversionResult.isValid) {
        conversionDispatch({ type: 'ADD_RESULT', payload: conversionResult });
      }
    } catch (error) {
      console.error('Error en conversión:', error);
    } finally {
      conversionDispatch({ type: 'SET_CALCULATING', payload: { type, value: false } });
    }
  }, [calculationState.molarMassResult, calculationState.lastCalculatedFormula]);

  const handleClear = useCallback(() => {
    calculationDispatch({ type: 'CLEAR_ALL' });
    conversionDispatch({ type: 'CLEAR_ALL' });
  }, []);

  const handleCopySuccess = useCallback(() => {
    calculationDispatch({ type: 'SET_COPY_SUCCESS', payload: 'Resultado copiado' });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Calculadora de Masa Molar
        </h1>
        <p className="text-gray-600 text-sm max-w-3xl mx-auto">
          Calcula la masa molar de cualquier compuesto químico con conversiones automáticas entre gramos, moles y moléculas.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        <div className="xl:col-span-2 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Cálculo de Masa Molar
          </h2>

          <div className="space-y-3">
            <FormulaInput
              state={calculationState}
              dispatch={calculationDispatch}
              onValidationChange={handleValidationChange}
              onSuggestionSelect={handleSuggestionSelect}
            />

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <ButtonGroup>
                <CalculateButton
                  onClick={handleCalculateMolarMass}
                  calculating={calculationState.isCalculating}
                  disabled={!canCalculate}
                  size="sm"
                >
                  Calcular Masa Molar
                </CalculateButton>
                <ClearButton
                  onClick={handleClear}
                  disabled={calculationState.isCalculating}
                  size="sm"
                >
                  Limpiar
                </ClearButton>
              </ButtonGroup>

              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={calculationState.showSteps}
                  onChange={() => calculationDispatch({ type: 'TOGGLE_STEPS' })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                Mostrar pasos
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {calculationState.knownCompound && (
            <InfoCard
              title="Compuesto Conocido"
              variant="blue"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              content={
                <div className="text-sm space-y-1">
                  <p><strong>Nombre:</strong> {calculationState.knownCompound.name}</p>
                  {calculationState.knownCompound.commonName && (
                    <p><strong>Común:</strong> {calculationState.knownCompound.commonName}</p>
                  )}
                  <p><strong>Tipo:</strong> {calculationState.knownCompound.type}</p>
                  <p><strong>Estado:</strong> {calculationState.knownCompound.state}</p>
                  <p><strong>Categoría:</strong> {calculationState.knownCompound.categoryName}</p>
                </div>
              }
            />
          )}
        </div>
      </div>

      {calculationState.isCalculating && (
        <CalculationSpinner message="Calculando masa molar..." />
      )}

      {calculationState.molarMassResult && !calculationState.isCalculating && (
        <MolarMassResult
          result={calculationState.molarMassResult}
          showSteps={calculationState.showSteps}
          onCopySuccess={handleCopySuccess}
        />
      )}

      <ConversionsSection
        conversionState={conversionState}
        conversionDispatch={conversionDispatch}
        molarMassResult={calculationState.molarMassResult}
        lastCalculatedFormula={calculationState.lastCalculatedFormula}
        onConvert={handleConversion}
      />

      {calculationState.error && (
        <ResultCard
          title="Error en el Cálculo"
          value=""
          error={calculationState.error}
          success={false}
        />
      )}

      {!calculationState.formula.trim() && !calculationState.molarMassResult && !calculationState.isCalculating && (
        <EmptyState
          message="Introduce una fórmula química"
          description="Escribe la fórmula de un compuesto químico para calcular su masa molar y realizar conversiones."
          icon={
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
        />
      )}

      {calculationState.copySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {calculationState.copySuccess}
        </div>
      )}
    </div>
  );
});

export default MolarMassCalculator;