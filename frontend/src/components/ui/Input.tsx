import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer, memo } from 'react';
import { getSmartSuggestions, validateWithSuggestions } from '../../utils/chemistry/formulaSuggestions';
import type { InputState, FormulaSuggestion } from '../../types/chemistry';
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function useValidation(formula: string, shouldValidate: boolean) {
  return useMemo(() => {
    if (!formula.trim() || !shouldValidate) {
      return { isValid: true, errors: [], suggestions: [] };
    }
    return validateWithSuggestions(formula);
  }, [formula, shouldValidate]);
}

function useSuggestions(
  formula: string, 
  showSuggestions: boolean, 
  maxSuggestions: number,
  autoComplete: boolean
) {
  return useMemo(() => {
    if (!formula.trim() || !showSuggestions || !autoComplete) {
      return [];
    }
    return getSmartSuggestions(formula, {
      maxSuggestions,
      includePopular: formula.length < 2,
      minConfidence: 0.5
    });
  }, [formula, showSuggestions, maxSuggestions, autoComplete]);
}

type InputAction = 
  | { type: 'SHOW_SUGGESTIONS'; payload: boolean }
  | { type: 'SET_ACTIVE_INDEX'; payload: number }
  | { type: 'SET_VALIDATING'; payload: boolean }
  | { type: 'RESET_SUGGESTIONS' }
  | { type: 'CLOSE_SUGGESTIONS' };

function inputReducer(state: InputState, action: InputAction): InputState {
  switch (action.type) {
    case 'SHOW_SUGGESTIONS':
      return { ...state, showSuggestionsList: action.payload };
    case 'SET_ACTIVE_INDEX':
      return { ...state, activeSuggestionIndex: action.payload };
    case 'SET_VALIDATING':
      return { ...state, isValidating: action.payload };
    case 'RESET_SUGGESTIONS':
      return { ...state, showSuggestionsList: false, activeSuggestionIndex: -1 };
    case 'CLOSE_SUGGESTIONS':
      return { ...state, showSuggestionsList: false, activeSuggestionIndex: -1 };
    default:
      return state;
  }
}

const initialInputState: InputState = {
  showSuggestionsList: false,
  activeSuggestionIndex: -1,
  isValidating: false
};

export interface ChemicalInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showSuggestions?: boolean;
  maxSuggestions?: number;
  onSuggestionSelect?: (suggestion: FormulaSuggestion) => void;
  validateOnChange?: boolean;
  onValidationChange?: (isValid: boolean, errors: readonly string[]) => void;
  className?: string;
  id?: string;
  autoComplete?: boolean;
}

const ValidationIcon = memo(function ValidationIcon({ 
  isValid, 
  isValidating 
}: { 
  isValid: boolean; 
  isValidating: boolean; 
}) {
  if (isValidating) {
    return (
      <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full" />
    );
  }

  return isValid ? (
    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
});

const SuggestionItem = memo(function SuggestionItem({
  suggestion,
  isActive,
  onSelect,
  onMouseEnter,
}: {
  suggestion: FormulaSuggestion;
  isActive: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}) {
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      exact: 'Exacto',
      prefix: 'Autocompletado',
      similar: 'Similar',
      popular: 'Popular'
    };
    return labels[type] || 'Popular';
  };

  const getBadgeClass = (type: string) => {
    const baseClass = 'text-xs px-2 py-1 rounded-full';
    const variants: Record<string, string> = {
      exact: 'bg-green-100 text-green-800',
      prefix: 'bg-blue-100 text-blue-800',
      similar: 'bg-yellow-100 text-yellow-800',
      popular: 'bg-gray-100 text-gray-800'
    };
    const variantClass = variants[type] || variants.popular;
    return `${baseClass} ${variantClass}`;
  };

  return (
    <div
      className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
        isActive ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-50 text-gray-700'
      }`}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono font-semibold text-lg">
            {suggestion.formula}
          </div>
          <div className="text-sm text-gray-600">
            {suggestion.name}
            {suggestion.commonName && suggestion.commonName !== suggestion.name && (
              <span className="text-gray-500"> ({suggestion.commonName})</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={getBadgeClass(suggestion.type)}>
            {getTypeLabel(suggestion.type)}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {suggestion.category}
          </span>
        </div>
      </div>
    </div>
  );
});

const SuggestionsList = memo(function SuggestionsList({
  suggestions,
  activeIndex,
  onSelect,
  onActiveIndexChange,
}: {
  suggestions: readonly FormulaSuggestion[];
  activeIndex: number;
  onSelect: (suggestion: FormulaSuggestion) => void;
  onActiveIndexChange: (index: number) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <SuggestionItem
          key={`${suggestion.formula}-${index}`}
          suggestion={suggestion}
          isActive={index === activeIndex}
          onSelect={() => onSelect(suggestion)}
          onMouseEnter={() => onActiveIndexChange(index)}
        />
      ))}
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
    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 mb-1">
            Errores en la fórmula:
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

export const ChemicalInput = memo(function ChemicalInput({
  value,
  onChange,
  placeholder = "Ej: H2SO4, Ca(OH)2, NaCl",
  disabled = false,
  showSuggestions = true,
  maxSuggestions = 5,
  onSuggestionSelect,
  validateOnChange = true,
  onValidationChange,
  className = "",
  id,
  autoComplete = true
}: ChemicalInputProps) {

  const [state, dispatch] = useReducer(inputReducer, initialInputState);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value, 300);
  const validation = useValidation(debouncedValue, validateOnChange);
  const suggestions = useSuggestions(debouncedValue, showSuggestions, maxSuggestions, autoComplete);
  const inputStyles = useMemo(() => {
    const baseStyles = `
      w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
      font-mono text-lg placeholder-gray-400
      focus:outline-none focus:ring-4 focus:ring-blue-500/20
    `;

    if (disabled) {
      return `${baseStyles} bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed`;
    }

    if (state.isValidating) {
      return `${baseStyles} bg-yellow-50 border-yellow-300 text-gray-900`;
    }

    if (!validation.isValid && value.trim()) {
      return `${baseStyles} bg-red-50 border-red-400 text-red-900 focus:border-red-500`;
    }

    if (validation.isValid && value.trim()) {
      return `${baseStyles} bg-green-50 border-green-400 text-green-900 focus:border-green-500`;
    }

    return `${baseStyles} bg-white border-gray-300 text-gray-900 focus:border-blue-500`;
  }, [disabled, state.isValidating, validation.isValid, value]);

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validation.isValid, validation.errors);
    }
  }, [validation.isValid, validation.errors, onValidationChange]);

  useEffect(() => {
    if (suggestions.length > 0 && !disabled) {
      dispatch({ type: 'SHOW_SUGGESTIONS', payload: true });
    } else {
      dispatch({ type: 'CLOSE_SUGGESTIONS' });
    }
  }, [suggestions.length, disabled]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        dispatch({ type: 'CLOSE_SUGGESTIONS' });
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(newValue);
    dispatch({ type: 'SET_ACTIVE_INDEX', payload: -1 });
  }, [onChange]);

  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0 && showSuggestions) {
      dispatch({ type: 'SHOW_SUGGESTIONS', payload: true });
    }
  }, [suggestions.length, showSuggestions]);

  const selectSuggestion = useCallback((suggestion: FormulaSuggestion) => {
    onChange(suggestion.formula);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    dispatch({ type: 'CLOSE_SUGGESTIONS' });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange, onSuggestionSelect]);

  const handleActiveIndexChange = useCallback((index: number) => {
    dispatch({ type: 'SET_ACTIVE_INDEX', payload: index });
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!state.showSuggestionsList || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        dispatch({ 
          type: 'SET_ACTIVE_INDEX', 
          payload: state.activeSuggestionIndex < suggestions.length - 1 
            ? state.activeSuggestionIndex + 1 
            : 0 
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        dispatch({ 
          type: 'SET_ACTIVE_INDEX', 
          payload: state.activeSuggestionIndex > 0 
            ? state.activeSuggestionIndex - 1 
            : suggestions.length - 1 
        });
        break;

      case 'Enter':
        event.preventDefault();
        if (state.activeSuggestionIndex >= 0 && state.activeSuggestionIndex < suggestions.length) {
          selectSuggestion(suggestions[state.activeSuggestionIndex]);
        }
        break;

      case 'Escape':
        dispatch({ type: 'CLOSE_SUGGESTIONS' });
        if (inputRef.current) {
          inputRef.current.blur();
        }
        break;
    }
  }, [state.showSuggestionsList, state.activeSuggestionIndex, suggestions, selectSuggestion]);
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={inputStyles}
          autoComplete="off"
          spellCheck="false"
        />

        {value.trim() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ValidationIcon 
              isValid={validation.isValid} 
              isValidating={state.isValidating} 
            />
          </div>
        )}
      </div>

      {state.showSuggestionsList && (
        <div ref={suggestionsRef}>
          <SuggestionsList
            suggestions={suggestions}
            activeIndex={state.activeSuggestionIndex}
            onSelect={selectSuggestion}
            onActiveIndexChange={handleActiveIndexChange}
          />
        </div>
      )}

      <ValidationErrors errors={validation.errors} />
    </div>
  );
});

export default ChemicalInput;