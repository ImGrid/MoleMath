import React, { useCallback, useEffect, useReducer, useMemo, memo } from 'react';
import ChemicalInput from '../ui/Input';
import { ResultCard, InfoCard } from '../ui/Card';
import { CalculateButton, ClearButton, CopyButton, ButtonGroup } from '../ui/Button';
import { CalculationSpinner, EmptyState } from '../common/LoadingSpinner';

import {  
  calculateDilution,
  calculateSolutionPreparation,
  performConcentrationCalculation 
} from '../../utils/chemistry/concentrationCalculators';
import { formatConcentrationResult, formatForClipboard } from '../../utils/formatters';
import { getFormulaContext } from '../../utils/chemistry/formulaSuggestions';

import type { 
  ConcentrationResult, 
  ConcentrationType,
  DilutionResult,
  DilutionState,
  SolutionPrepState,
  ProcessedCompound,
  FormulaSuggestion
} from '../../types/chemistry';

interface ConcentrationState {
  formula: string;
  soluteMass: string;
  solutionVolume: string;
  solventMass: string;
  concentrationType: ConcentrationType;
  isValidFormula: boolean;
  validationErrors: readonly string[];
  knownCompound: ProcessedCompound | null;
  isCalculating: boolean;
  result: ConcentrationResult | null;
  error: string | null;
  lastCalculatedFormula: string;
  showSteps: boolean;
  copySuccess: string;
}

type ConcentrationAction =
  | { type: 'SET_FORMULA'; payload: string }
  | { type: 'SET_SOLUTE_MASS'; payload: string }
  | { type: 'SET_SOLUTION_VOLUME'; payload: string }
  | { type: 'SET_SOLVENT_MASS'; payload: string }
  | { type: 'SET_CONCENTRATION_TYPE'; payload: ConcentrationType }
  | { type: 'SET_VALIDATION'; payload: { isValid: boolean; errors: readonly string[] } }
  | { type: 'SET_KNOWN_COMPOUND'; payload: ProcessedCompound | null }
  | { type: 'SET_CALCULATING'; payload: boolean }
  | { type: 'SET_RESULT'; payload: { result: ConcentrationResult; formula: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'TOGGLE_STEPS' }
  | { type: 'SET_COPY_SUCCESS'; payload: string }
  | { type: 'CLEAR_ALL' };

type DilutionAction =
  | { type: 'SET_INITIAL_CONCENTRATION'; payload: string }
  | { type: 'SET_INITIAL_VOLUME'; payload: string }
  | { type: 'SET_FINAL_CONCENTRATION'; payload: string }
  | { type: 'SET_FINAL_VOLUME'; payload: string }
  | { type: 'SET_CALCULATING'; payload: boolean }
  | { type: 'SET_RESULT'; payload: DilutionResult }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR' };

type SolutionPrepAction =
  | { type: 'SET_DESIRED_MOLARITY'; payload: string }
  | { type: 'SET_DESIRED_VOLUME'; payload: string }
  | { type: 'SET_CALCULATING'; payload: boolean }
  | { type: 'SET_RESULT'; payload: { massNeeded: number; steps: string[] } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR' };

function concentrationReducer(state: ConcentrationState, action: ConcentrationAction): ConcentrationState {
  switch (action.type) {
    case 'SET_FORMULA':
      return { 
        ...state, 
        formula: action.payload,
        result: state.lastCalculatedFormula !== action.payload ? null : state.result,
        error: state.lastCalculatedFormula !== action.payload ? null : state.error
      };
    case 'SET_SOLUTE_MASS':
      return { ...state, soluteMass: action.payload };
    case 'SET_SOLUTION_VOLUME':
      return { ...state, solutionVolume: action.payload };
    case 'SET_SOLVENT_MASS':
      return { ...state, solventMass: action.payload };
    case 'SET_CONCENTRATION_TYPE':
      return { ...state, concentrationType: action.payload };
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
        result: action.payload.result, 
        lastCalculatedFormula: action.payload.formula,
        error: null 
      };
    case 'SET_ERROR':
      return { ...state, isCalculating: false, error: action.payload, result: null };
    case 'TOGGLE_STEPS':
      return { ...state, showSteps: !state.showSteps };
    case 'SET_COPY_SUCCESS':
      return { ...state, copySuccess: action.payload };
    case 'CLEAR_ALL':
      return initialConcentrationState;
    default:
      return state;
  }
}

function dilutionReducer(state: DilutionState, action: DilutionAction): DilutionState {
  switch (action.type) {
    case 'SET_INITIAL_CONCENTRATION':
      return { ...state, initialConcentration: action.payload };
    case 'SET_INITIAL_VOLUME':
      return { ...state, initialVolume: action.payload };
    case 'SET_FINAL_CONCENTRATION':
      return { ...state, finalConcentration: action.payload };
    case 'SET_FINAL_VOLUME':
      return { ...state, finalVolume: action.payload };
    case 'SET_CALCULATING':
      return { ...state, isCalculating: action.payload, error: action.payload ? null : state.error };
    case 'SET_RESULT':
      return { ...state, isCalculating: false, result: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, isCalculating: false, error: action.payload, result: null };
    case 'CLEAR':
      return initialDilutionState;
    default:
      return state;
  }
}

function solutionPrepReducer(state: SolutionPrepState, action: SolutionPrepAction): SolutionPrepState {
  switch (action.type) {
    case 'SET_DESIRED_MOLARITY':
      return { ...state, desiredMolarity: action.payload };
    case 'SET_DESIRED_VOLUME':
      return { ...state, desiredVolume: action.payload };
    case 'SET_CALCULATING':
      return { ...state, isCalculating: action.payload, error: action.payload ? null : state.error };
    case 'SET_RESULT':
      return { 
        ...state, 
        isCalculating: false, 
        massNeeded: action.payload.massNeeded, 
        steps: action.payload.steps,
        error: null 
      };
    case 'SET_ERROR':
      return { ...state, isCalculating: false, error: action.payload, massNeeded: null, steps: [] };
    case 'CLEAR':
      return initialSolutionPrepState;
    default:
      return state;
  }
}

const initialConcentrationState: ConcentrationState = {
  formula: '',
  soluteMass: '',
  solutionVolume: '',
  solventMass: '',
  concentrationType: 'molarity',
  isValidFormula: true,
  validationErrors: [],
  knownCompound: null,
  isCalculating: false,
  result: null,
  error: null,
  lastCalculatedFormula: '',
  showSteps: true,
  copySuccess: ''
};

const initialDilutionState: DilutionState = {
  initialConcentration: '',
  initialVolume: '',
  finalConcentration: '',
  finalVolume: '',
  isCalculating: false,
  result: null,
  error: null
};

const initialSolutionPrepState: SolutionPrepState = {
  desiredMolarity: '',
  desiredVolume: '',
  isCalculating: false,
  massNeeded: null,
  steps: [],
  error: null
};

function useCalculationValidation(state: ConcentrationState) {
  return useMemo(() => {
    const canCalculate = state.formula.trim() && 
      state.isValidFormula && 
      state.soluteMass.trim() &&
      ((state.concentrationType === 'molarity' && state.solutionVolume.trim()) ||
       (state.concentrationType === 'molality' && state.solventMass.trim()));
    
    return { canCalculate };
  }, [state.formula, state.isValidFormula, state.soluteMass, state.concentrationType, state.solutionVolume, state.solventMass]);
}

function useDilutionValidation(state: DilutionState) {
  return useMemo(() => {
    const values = [state.initialConcentration, state.initialVolume, state.finalConcentration, state.finalVolume];
    const validInputs = values.filter(v => v.trim() && !isNaN(parseFloat(v)) && parseFloat(v) > 0);
    return { canCalculate: validInputs.length >= 3 };
  }, [state.initialConcentration, state.initialVolume, state.finalConcentration, state.finalVolume]);
}

function useSolutionPrepValidation(state: SolutionPrepState, formula: string) {
  return useMemo(() => {
    const canCalculate = formula.trim() && state.desiredMolarity.trim() && state.desiredVolume.trim();
    return { canCalculate };
  }, [formula, state.desiredMolarity, state.desiredVolume]);
}

const ConcentrationInputs = memo(function ConcentrationInputs({
  state,
  dispatch,
  onValidationChange,
  onSuggestionSelect
}: {
  state: ConcentrationState;
  dispatch: React.Dispatch<ConcentrationAction>;
  onValidationChange: (isValid: boolean, errors: readonly string[]) => void;
  onSuggestionSelect: (suggestion: FormulaSuggestion) => void;
}) {
  const handleFormulaChange = useCallback((newFormula: string) => {
    dispatch({ type: 'SET_FORMULA', payload: newFormula });
  }, [dispatch]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fórmula del Soluto
        </label>
        <ChemicalInput
          value={state.formula}
          onChange={handleFormulaChange}
          onValidationChange={onValidationChange}
          onSuggestionSelect={onSuggestionSelect}
          placeholder="Ej: NaCl, H2SO4, Ca(OH)2"
          showSuggestions={true}
          validateOnChange={true}
          autoComplete={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Masa del Soluto (g)
          </label>
          <input
            type="number"
            value={state.soluteMass}
            onChange={(e) => dispatch({ type: 'SET_SOLUTE_MASS', payload: e.target.value })}
            placeholder="58.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="0"
            step="any"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Concentración
          </label>
          <select
            value={state.concentrationType}
            onChange={(e) => dispatch({ type: 'SET_CONCENTRATION_TYPE', payload: e.target.value as ConcentrationType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="molarity">Molaridad (M)</option>
            <option value="molality">Molalidad (m)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {state.concentrationType === 'molarity' 
              ? 'Volumen de Solución (mL)' 
              : 'Masa del Solvente (kg)'}
          </label>
          <input
            type="number"
            value={state.concentrationType === 'molarity' ? state.solutionVolume : state.solventMass}
            onChange={(e) => {
              if (state.concentrationType === 'molarity') {
                dispatch({ type: 'SET_SOLUTION_VOLUME', payload: e.target.value });
              } else {
                dispatch({ type: 'SET_SOLVENT_MASS', payload: e.target.value });
              }
            }}
            placeholder={state.concentrationType === 'molarity' ? '1000' : '1.0'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="0"
            step="any"
          />
        </div>
      </div>
    </div>
  );
});

const DilutionSection = memo(function DilutionSection({
  state,
  dispatch,
  onCalculate
}: {
  state: DilutionState;
  dispatch: React.Dispatch<DilutionAction>;
  onCalculate: () => void;
}) {
  const { canCalculate } = useDilutionValidation(state);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Cálculos de Dilución (M₁V₁ = M₂V₂)
          </h2>
          <p className="text-xs text-gray-600">
            Completa al menos 3 valores para calcular el cuarto
          </p>
        </div>
        <CalculateButton
          onClick={onCalculate}
          calculating={state.isCalculating}
          disabled={!canCalculate}
          size="sm"
        >
          Calcular Dilución
        </CalculateButton>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            M₁ (Conc. inicial)
          </label>
          <input
            type="number"
            value={state.initialConcentration}
            onChange={(e) => dispatch({ type: 'SET_INITIAL_CONCENTRATION', payload: e.target.value })}
            placeholder="M"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="0"
            step="any"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            V₁ (Vol. inicial, mL)
          </label>
          <input
            type="number"
            value={state.initialVolume}
            onChange={(e) => dispatch({ type: 'SET_INITIAL_VOLUME', payload: e.target.value })}
            placeholder="mL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="0"
            step="any"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            M₂ (Conc. final)
          </label>
          <input
            type="number"
            value={state.finalConcentration}
            onChange={(e) => dispatch({ type: 'SET_FINAL_CONCENTRATION', payload: e.target.value })}
            placeholder="M"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="0"
            step="any"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            V₂ (Vol. final, mL)
          </label>
          <input
            type="number"
            value={state.finalVolume}
            onChange={(e) => dispatch({ type: 'SET_FINAL_VOLUME', payload: e.target.value })}
            placeholder="mL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="0"
            step="any"
          />
        </div>
      </div>

      {state.result && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 text-sm">Resultado de Dilución:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <p><strong>Volumen necesario:</strong> {state.result.volumeNeeded} mL</p>
            <p><strong>Solvente a agregar:</strong> {state.result.solventToAdd} mL</p>
          </div>
        </div>
      )}
    </div>
  );
});

const SolutionPrepSection = memo(function SolutionPrepSection({
  state,
  dispatch,
  formula,
  onCalculate,
  showSteps
}: {
  state: SolutionPrepState;
  dispatch: React.Dispatch<SolutionPrepAction>;
  formula: string;
  onCalculate: () => void;
  showSteps: boolean;
}) {
  const { canCalculate } = useSolutionPrepValidation(state, formula);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Preparación de Soluciones
          </h2>
          <p className="text-xs text-gray-600">
            Calcula la masa de soluto necesaria para preparar una solución
          </p>
        </div>
        <CalculateButton
          onClick={onCalculate}
          calculating={state.isCalculating}
          disabled={!canCalculate}
          size="sm"
        >
          Calcular Masa
        </CalculateButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Molaridad Deseada (M)
          </label>
          <input
            type="number"
            value={state.desiredMolarity}
            onChange={(e) => dispatch({ type: 'SET_DESIRED_MOLARITY', payload: e.target.value })}
            placeholder="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="0"
            step="any"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Volumen Deseado (mL)
          </label>
          <input
            type="number"
            value={state.desiredVolume}
            onChange={(e) => dispatch({ type: 'SET_DESIRED_VOLUME', payload: e.target.value })}
            placeholder="500"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            min="0"
            step="any"
          />
        </div>
      </div>

      {state.massNeeded !== null && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2 text-sm">Masa de Soluto Necesaria:</h4>
          <p className="text-lg font-bold text-green-700 mb-2">{state.massNeeded} gramos</p>
          
          {showSteps && state.steps.length > 0 && (
            <div>
              <h5 className="font-medium text-green-700 mb-1 text-sm">Pasos:</h5>
              <ol className="text-xs space-y-1">
                {state.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
});


export const ConcentrationCalculator = memo(function ConcentrationCalculator() {

  const [concentrationState, concentrationDispatch] = useReducer(concentrationReducer, initialConcentrationState);
  const [dilutionState, dilutionDispatch] = useReducer(dilutionReducer, initialDilutionState);
  const [solutionPrepState, solutionPrepDispatch] = useReducer(solutionPrepReducer, initialSolutionPrepState);
  const { canCalculate } = useCalculationValidation(concentrationState);
  useEffect(() => {
    if (concentrationState.copySuccess) {
      const timer = setTimeout(() => concentrationDispatch({ type: 'SET_COPY_SUCCESS', payload: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [concentrationState.copySuccess]);

  const handleValidationChange = useCallback((isValid: boolean, errors: readonly string[]) => {
    concentrationDispatch({ type: 'SET_VALIDATION', payload: { isValid, errors } });
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: FormulaSuggestion) => {
    concentrationDispatch({ type: 'SET_FORMULA', payload: suggestion.formula });
    
    const context = getFormulaContext(suggestion.formula);
    concentrationDispatch({ type: 'SET_KNOWN_COMPOUND', payload: context.compound || null });
  }, []);

  const handleCalculateConcentration = useCallback(async () => {
    if (!canCalculate) return;

    concentrationDispatch({ type: 'SET_CALCULATING', payload: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const massValue = parseFloat(concentrationState.soluteMass);
      const volumeValue = concentrationState.concentrationType === 'molarity' ? parseFloat(concentrationState.solutionVolume) : undefined;
      const solventMassValue = concentrationState.concentrationType === 'molality' ? parseFloat(concentrationState.solventMass) : undefined;

      const result = performConcentrationCalculation(
        {
          soluteMass: massValue,
          soluteFormula: concentrationState.formula,
          solutionVolume: volumeValue,
          solventMass: solventMassValue
        },
        concentrationState.concentrationType
      );

      if (result.isValid) {
        concentrationDispatch({ 
          type: 'SET_RESULT', 
          payload: { result, formula: concentrationState.formula } 
        });

        const context = getFormulaContext(concentrationState.formula);
        concentrationDispatch({ type: 'SET_KNOWN_COMPOUND', payload: context.compound || null });
      } else {
        concentrationDispatch({ type: 'SET_ERROR', payload: result.error || 'Error desconocido en el cálculo' });
      }
    } catch (error) {
      concentrationDispatch({ type: 'SET_ERROR', payload: 'Error interno del calculador' });
    }
  }, [canCalculate, concentrationState.soluteMass, concentrationState.formula, concentrationState.concentrationType, concentrationState.solutionVolume, concentrationState.solventMass]);

  const handleCalculateDilution = useCallback(async () => {
    const initialConc = parseFloat(dilutionState.initialConcentration);
    const initialVol = parseFloat(dilutionState.initialVolume);
    const finalConc = parseFloat(dilutionState.finalConcentration);
    const finalVol = parseFloat(dilutionState.finalVolume);

    const values = [
      { value: initialConc, hasValue: dilutionState.initialConcentration.trim() !== '' },
      { value: initialVol, hasValue: dilutionState.initialVolume.trim() !== '' },
      { value: finalConc, hasValue: dilutionState.finalConcentration.trim() !== '' },
      { value: finalVol, hasValue: dilutionState.finalVolume.trim() !== '' }
    ];
    
    const validInputs = values.filter(v => v.hasValue && !isNaN(v.value) && v.value > 0);
    if (validInputs.length < 3) return;

    dilutionDispatch({ type: 'SET_CALCULATING', payload: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = calculateDilution({
        initialConcentration: dilutionState.initialConcentration.trim() !== '' && !isNaN(initialConc) ? initialConc : undefined,
        initialVolume: dilutionState.initialVolume.trim() !== '' && !isNaN(initialVol) ? initialVol : undefined,
        finalConcentration: dilutionState.finalConcentration.trim() !== '' && !isNaN(finalConc) ? finalConc : undefined,
        finalVolume: dilutionState.finalVolume.trim() !== '' && !isNaN(finalVol) ? finalVol : undefined
      });

      if (result.isValid) {
        dilutionDispatch({ type: 'SET_RESULT', payload: result });
      } else {
        dilutionDispatch({ type: 'SET_ERROR', payload: result.error || 'Error en cálculo de dilución' });
      }
    } catch (error) {
      dilutionDispatch({ type: 'SET_ERROR', payload: 'Error interno en dilución' });
    }
  }, [dilutionState]);

  const handleCalculateSolutionPrep = useCallback(async () => {
    if (!concentrationState.formula.trim() || !solutionPrepState.desiredMolarity.trim() || !solutionPrepState.desiredVolume.trim()) return;

    const molarityValue = parseFloat(solutionPrepState.desiredMolarity);
    const volumeValue = parseFloat(solutionPrepState.desiredVolume);

    if (isNaN(molarityValue) || isNaN(volumeValue) || molarityValue <= 0 || volumeValue <= 0) return;

    solutionPrepDispatch({ type: 'SET_CALCULATING', payload: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = calculateSolutionPreparation(concentrationState.formula, molarityValue, volumeValue);

      if (result.isValid) {
        const steps = result.steps.map(step => 
          step.operation && step.result !== undefined 
            ? `${step.step}. ${step.description}: ${step.operation} = ${step.result} ${step.unit || ''}`
            : `${step.step}. ${step.description}`
        );

        solutionPrepDispatch({ 
          type: 'SET_RESULT', 
          payload: { massNeeded: result.soluteMassNeeded, steps } 
        });
      } else {
        solutionPrepDispatch({ type: 'SET_ERROR', payload: result.error || 'Error en preparación de solución' });
      }
    } catch (error) {
      solutionPrepDispatch({ type: 'SET_ERROR', payload: 'Error interno' });
    }
  }, [concentrationState.formula, solutionPrepState.desiredMolarity, solutionPrepState.desiredVolume]);

  const handleClear = useCallback(() => {
    concentrationDispatch({ type: 'CLEAR_ALL' });
    dilutionDispatch({ type: 'CLEAR' });
    solutionPrepDispatch({ type: 'CLEAR' });
  }, []);

  const formattedResult = useMemo(() => {
    if (!concentrationState.result) return null;
    return formatConcentrationResult(concentrationState.result);
  }, [concentrationState.result]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Calculadora de Concentraciones
        </h1>
        <p className="text-gray-600 text-sm max-w-3xl mx-auto">
          Calcula molaridad, molalidad, diluciones y preparación de soluciones con pasos detallados.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        <div className="xl:col-span-2 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Cálculo de Concentración
          </h2>

          <ConcentrationInputs
            state={concentrationState}
            dispatch={concentrationDispatch}
            onValidationChange={handleValidationChange}
            onSuggestionSelect={handleSuggestionSelect}
          />

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-3">
            <ButtonGroup>
              <CalculateButton
                onClick={handleCalculateConcentration}
                calculating={concentrationState.isCalculating}
                disabled={!canCalculate}
                size="sm"
              >
                Calcular
              </CalculateButton>
              <ClearButton
                onClick={handleClear}
                disabled={concentrationState.isCalculating}
                size="sm"
              >
                Limpiar
              </ClearButton>
            </ButtonGroup>

            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={concentrationState.showSteps}
                onChange={() => concentrationDispatch({ type: 'TOGGLE_STEPS' })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              Mostrar pasos
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {concentrationState.knownCompound && (
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
                  <p><strong>Nombre:</strong> {concentrationState.knownCompound.name}</p>
                  {concentrationState.knownCompound.commonName && (
                    <p><strong>Común:</strong> {concentrationState.knownCompound.commonName}</p>
                  )}
                  <p><strong>Tipo:</strong> {concentrationState.knownCompound.type}</p>
                  <p><strong>Estado:</strong> {concentrationState.knownCompound.state}</p>
                </div>
              }
            />
          )}
        </div>
      </div>

      {concentrationState.isCalculating && (
        <CalculationSpinner message="Calculando concentración..." />
      )}

      {formattedResult && !concentrationState.isCalculating && (
        <ResultCard
          title={formattedResult.title}
          value={formattedResult.concentration}
          steps={concentrationState.showSteps ? formattedResult.steps : undefined}
          success={true}
          loading={false}
          additionalInfo={
            <div className="flex justify-center">
              <CopyButton
                textToCopy={formatForClipboard(formattedResult.title, formattedResult.concentration, formattedResult.steps)}
                onCopySuccess={() => concentrationDispatch({ type: 'SET_COPY_SUCCESS', payload: 'Resultado copiado' })}
                size="sm"
              >
                Copiar Resultado
              </CopyButton>
            </div>
          }
        />
      )}

      <DilutionSection
        state={dilutionState}
        dispatch={dilutionDispatch}
        onCalculate={handleCalculateDilution}
      />

      <SolutionPrepSection
        state={solutionPrepState}
        dispatch={solutionPrepDispatch}
        formula={concentrationState.formula}
        onCalculate={handleCalculateSolutionPrep}
        showSteps={concentrationState.showSteps}
      />

      {concentrationState.error && (
        <ResultCard
          title="Error en el Cálculo"
          value=""
          error={concentrationState.error}
          success={false}
        />
      )}

      {!concentrationState.formula.trim() && !concentrationState.result && !concentrationState.isCalculating && (
        <EmptyState
          message="Introduce los datos para calcular concentración"
          description="Completa la fórmula del soluto, su masa y el volumen/masa del solvente para comenzar."
          icon={
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
            </svg>
          }
        />
      )}

      {concentrationState.copySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {concentrationState.copySuccess}
        </div>
      )}
    </div>
  );
});

export default ConcentrationCalculator;