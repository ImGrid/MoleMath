import type { 
  ValidationResult, 
  ChemistryError, 
  ConcentrationType,
  ConversionType,
  BalanceMethod 
} from '../../types/chemistry';
import { 
  VALIDATION_LIMITS, 
  ERROR_MESSAGES 
} from '../../constants/chemical';
import { parseChemicalFormula, validateFormulaSyntax } from './formulaParser';
import { isValidElement, getElement } from '../../data/periodicTable';
import { isValidNumber} from '../helpers';

export const validateChemicalFormula = (formula: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!formula || formula.trim().length === 0) {
    errors.push(ERROR_MESSAGES.PARSING.EMPTY_FORMULA);
    return { isValid: false, errors, warnings };
  }
  
  const cleanFormula = formula.trim();
  
  if (cleanFormula.length > VALIDATION_LIMITS.MAX_FORMULA_LENGTH) {
    errors.push(ERROR_MESSAGES.PARSING.FORMULA_TOO_LONG);
    return { isValid: false, errors, warnings };
  }
  
  if (!validateFormulaSyntax(cleanFormula)) {
    errors.push(ERROR_MESSAGES.PARSING.INVALID_SYNTAX);
    return { isValid: false, errors, warnings };
  }
  
  const parsed = parseChemicalFormula(cleanFormula);
  if (!parsed.isValid) {
    errors.push(parsed.error || ERROR_MESSAGES.PARSING.INVALID_FORMULA);
    return { isValid: false, errors, warnings };
  }
  
  for (const element of parsed.elements) {
    if (!isValidElement(element.symbol)) {
      errors.push(`${ERROR_MESSAGES.PARSING.INVALID_ELEMENT}: ${element.symbol}`);
    }
    
    if (element.count <= 0) {
      errors.push(`Cantidad inválida para ${element.symbol}: ${element.count}`);
    }
    
    if (element.count > VALIDATION_LIMITS.MAX_ATOMS_PER_MOLECULE) {
      errors.push(`Demasiados átomos de ${element.symbol}: ${element.count}`);
    }
  }
  
  const totalAtoms = parsed.elements.reduce((sum, el) => sum + el.count, 0);
  if (totalAtoms > 50) {
    warnings.push('La molécula es muy grande, verifique la fórmula');
  }
  
  if (parsed.elements.length === 1 && parsed.elements[0].count === 1) {
    warnings.push('Esta parece ser una fórmula de un átomo individual');
  }
  
  for (const element of parsed.elements) {
    const elementData = getElement(element.symbol);
    if (elementData && elementData.number > 92) {
      warnings.push(`${element.symbol} es un elemento transuránico (artificial)`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateMultipleFormulas = (formulas: readonly string[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (formulas.length === 0) {
    errors.push('No se proporcionaron fórmulas para validar');
    return { isValid: false, errors, warnings };
  }
  
  for (let i = 0; i < formulas.length; i++) {
    const result = validateChemicalFormula(formulas[i]);
    if (!result.isValid) {
      errors.push(`Fórmula ${i + 1} (${formulas[i]}): ${result.errors.join(', ')}`);
    }
    warnings.push(...result.warnings || []);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateNumericValue = (
  value: unknown,
  options: {
    min?: number;
    max?: number;
    allowZero?: boolean;
    fieldName?: string;
  } = {}
): ValidationResult => {
  const { min, max, allowZero = false, fieldName = 'valor' } = options;
  const errors: string[] = [];
  
  if (typeof value !== 'number' && !isValidNumber(String(value))) {
    errors.push(`${fieldName} debe ser un número válido`);
    return { isValid: false, errors };
  }
  
  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  
  if (!isFinite(numValue)) {
    errors.push(`${fieldName} debe ser un número finito`);
    return { isValid: false, errors };
  }
  
  if (!allowZero && numValue <= 0) {
    errors.push(`${fieldName} debe ser mayor que cero`);
  } else if (allowZero && numValue < 0) {
    errors.push(`${fieldName} no puede ser negativo`);
  }
  
  if (min !== undefined && numValue < min) {
    errors.push(`${fieldName} debe ser mayor o igual a ${min}`);
  }
  
  if (max !== undefined && numValue > max) {
    errors.push(`${fieldName} debe ser menor o igual a ${max}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMass = (mass: unknown): ValidationResult => {
  return validateNumericValue(mass, {
    min: 0.001,
    max: VALIDATION_LIMITS.MAX_MASS_GRAMS,
    fieldName: 'masa'
  });
};

export const validateVolume = (volume: unknown, unit: 'mL' | 'L' = 'mL'): ValidationResult => {
  const maxVolume = unit === 'mL' ? VALIDATION_LIMITS.MAX_VOLUME_ML : VALIDATION_LIMITS.MAX_VOLUME_ML / 1000;
  
  return validateNumericValue(volume, {
    min: 0.001,
    max: maxVolume,
    fieldName: `volumen (${unit})`
  });
};

export const validateMolarity = (molarity: unknown): ValidationResult => {
  return validateNumericValue(molarity, {
    min: 0.001,
    max: VALIDATION_LIMITS.MAX_MOLARITY,
    fieldName: 'molaridad'
  });
};

export const validateMolality = (molality: unknown): ValidationResult => {
  return validateNumericValue(molality, {
    min: 0.001,
    max: VALIDATION_LIMITS.MAX_MOLALITY,
    fieldName: 'molalidad'
  });
};

export const validateMolarMassInput = (formula: string): ValidationResult => {
  return validateChemicalFormula(formula);
};

export const validateConversionInput = (
  value: unknown,
  conversionType: ConversionType,
  formula: string
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const formulaValidation = validateChemicalFormula(formula);
  if (!formulaValidation.isValid) {
    errors.push(...formulaValidation.errors);
    return { isValid: false, errors };
  }
  
  let numValidation: ValidationResult;
  
  switch (conversionType) {
    case 'grams-to-moles':
    case 'grams-to-molecules':
      numValidation = validateMass(value);
      break;
    
    case 'moles-to-grams':
    case 'moles-to-molecules':
      numValidation = validateNumericValue(value, {
        min: 1e-10,
        max: 1000,
        fieldName: 'moles'
      });
      break;
    
    case 'molecules-to-moles':
    case 'molecules-to-grams':
      numValidation = validateNumericValue(value, {
        min: 1,
        max: 1e30,
        fieldName: 'moléculas'
      });
      break;
    
    default:
      errors.push(`Tipo de conversión no válido: ${conversionType}`);
      return { isValid: false, errors };
  }
  
  if (!numValidation.isValid) {
    errors.push(...numValidation.errors);
  }
  
  warnings.push(...(formulaValidation.warnings || []));
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateConcentrationInput = (
  soluteMass: unknown,
  soluteFormula: string,
  concentrationType: ConcentrationType,
  solutionVolume?: unknown,
  solventMass?: unknown
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const formulaValidation = validateChemicalFormula(soluteFormula);
  if (!formulaValidation.isValid) {
    errors.push(...formulaValidation.errors);
    return { isValid: false, errors };
  }
  
  const massValidation = validateMass(soluteMass);
  if (!massValidation.isValid) {
    errors.push(...massValidation.errors);
  }
  
  if (concentrationType === 'molarity') {
    if (solutionVolume === undefined) {
      errors.push('Se requiere el volumen de la solución para calcular molaridad');
    } else {
      const volumeValidation = validateVolume(solutionVolume, 'L');
      if (!volumeValidation.isValid) {
        errors.push(...volumeValidation.errors);
      }
    }
  }
  
  if (concentrationType === 'molality') {
    if (solventMass === undefined) {
      errors.push('Se requiere la masa del solvente para calcular molalidad');
    } else {
      const solventValidation = validateNumericValue(solventMass, {
        min: 0.001,
        max: 100,
        fieldName: 'masa del solvente (kg)'
      });
      if (!solventValidation.isValid) {
        errors.push(...solventValidation.errors);
      }
    }
  }
  
  warnings.push(...(formulaValidation.warnings || []));
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateDilutionInput = (
  initialConcentration: unknown,
  initialVolume: unknown,
  finalConcentration: unknown,
  finalVolume: unknown
): ValidationResult => {
  const errors: string[] = [];
  
  const initialConcValidation = validateMolarity(initialConcentration);
  if (!initialConcValidation.isValid) {
    errors.push(`Concentración inicial: ${initialConcValidation.errors.join(', ')}`);
  }
  
  const finalConcValidation = validateMolarity(finalConcentration);
  if (!finalConcValidation.isValid) {
    errors.push(`Concentración final: ${finalConcValidation.errors.join(', ')}`);
  }
  
  const initialVolValidation = validateVolume(initialVolume);
  if (!initialVolValidation.isValid) {
    errors.push(`Volumen inicial: ${initialVolValidation.errors.join(', ')}`);
  }
  
  const finalVolValidation = validateVolume(finalVolume);
  if (!finalVolValidation.isValid) {
    errors.push(`Volumen final: ${finalVolValidation.errors.join(', ')}`);
  }
  
  if (errors.length === 0) {
    const initConc = Number(initialConcentration);
    const finalConc = Number(finalConcentration);
    const initVol = Number(initialVolume);
    const finalVol = Number(finalVolume);
    
    if (finalConc >= initConc) {
      errors.push('La concentración final debe ser menor que la inicial en una dilución');
    }
    
    if (finalVol <= initVol) {
      errors.push('El volumen final debe ser mayor que el inicial en una dilución');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateChemicalEquation = (equation: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!equation || equation.trim().length === 0) {
    errors.push('La ecuación no puede estar vacía');
    return { isValid: false, errors };
  }
  
  const arrowPatterns = ['→', '->', '=', '→'];
  let arrowFound = false;
  let arrowSymbol = '';
  
  for (const arrow of arrowPatterns) {
    if (equation.includes(arrow)) {
      arrowFound = true;
      arrowSymbol = arrow;
      break;
    }
  }
  
  if (!arrowFound) {
    errors.push('La ecuación debe contener un símbolo de reacción (→, ->, =)');
    return { isValid: false, errors };
  }
  
  const parts = equation.split(arrowSymbol);
  if (parts.length !== 2) {
    errors.push('La ecuación debe tener exactamente un símbolo de reacción');
    return { isValid: false, errors };
  }
  
  const [reactantsStr, productsStr] = parts;
  
  if (!reactantsStr.trim()) {
    errors.push('La ecuación debe tener reactivos');
  }
  
  if (!productsStr.trim()) {
    errors.push('La ecuación debe tener productos');
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  const reactantFormulas = reactantsStr.split('+').map(f => f.trim().replace(/^\d+/, ''));
  const productFormulas = productsStr.split('+').map(f => f.trim().replace(/^\d+/, ''));
  
  for (let i = 0; i < reactantFormulas.length; i++) {
    const formula = reactantFormulas[i];
    if (formula) {
      const validation = validateChemicalFormula(formula);
      if (!validation.isValid) {
        errors.push(`Reactivo ${i + 1} (${formula}): ${validation.errors.join(', ')}`);
      }
    }
  }
  
  for (let i = 0; i < productFormulas.length; i++) {
    const formula = productFormulas[i];
    if (formula) {
      const validation = validateChemicalFormula(formula);
      if (!validation.isValid) {
        errors.push(`Producto ${i + 1} (${formula}): ${validation.errors.join(', ')}`);
      }
    }
  }
  
  if (reactantFormulas.length > 5) {
    warnings.push('Ecuación con muchos reactivos, puede ser difícil de balancear');
  }
  
  if (productFormulas.length > 5) {
    warnings.push('Ecuación con muchos productos, puede ser difícil de balancear');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateBalanceMethod = (method: string): ValidationResult => {
  const validMethods: BalanceMethod[] = ['trial-and-error', 'algebraic'];
  
  if (!validMethods.includes(method as BalanceMethod)) {
    return {
      isValid: false,
      errors: [`Método de balance no válido: ${method}. Métodos disponibles: ${validMethods.join(', ')}`]
    };
  }
  
  return { isValid: true, errors: [] };
};

export const createChemistryError = (
  code: string,
  message: string,
  field?: string
): ChemistryError => ({
  code,
  message,
  field,
  timestamp: new Date(),
  severity: 'medium'
});

export const validateUserInput = (
  input: unknown,
  validationRules: {
    required?: boolean;
    type?: 'string' | 'number' | 'formula';
    min?: number;
    max?: number;
    pattern?: RegExp;
  }
): ValidationResult => {
  const { required = true, type = 'string', min, max, pattern } = validationRules;
  const errors: string[] = [];
  
  if (required && (input === undefined || input === null || input === '')) {
    errors.push('Este campo es requerido');
    return { isValid: false, errors };
  }
  
  if (!required && (input === undefined || input === null || input === '')) {
    return { isValid: true, errors: [] };
  }
  
  switch (type) {
    case 'string':
      if (typeof input !== 'string') {
        errors.push('Debe ser texto');
      } else {
        if (min !== undefined && input.length < min) {
          errors.push(`Debe tener al menos ${min} caracteres`);
        }
        if (max !== undefined && input.length > max) {
          errors.push(`Debe tener máximo ${max} caracteres`);
        }
        if (pattern && !pattern.test(input)) {
          errors.push('Formato no válido');
        }
      }
      break;
    
    case 'number':
      const numValidation = validateNumericValue(input, { min, max });
      if (!numValidation.isValid) {
        errors.push(...numValidation.errors);
      }
      break;
    
    case 'formula':
      if (typeof input === 'string') {
        const formulaValidation = validateChemicalFormula(input);
        if (!formulaValidation.isValid) {
          errors.push(...formulaValidation.errors);
        }
      } else {
        errors.push('La fórmula debe ser texto');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateChemicalFormula,
  validateMultipleFormulas,
  
  validateNumericValue,
  validateMass,
  validateVolume,
  validateMolarity,
  validateMolality,
  
  validateMolarMassInput,
  validateConversionInput,
  
  validateConcentrationInput,
  validateDilutionInput,
  
  validateChemicalEquation,
  validateBalanceMethod,
  
  createChemistryError,
  validateUserInput,
} as const;