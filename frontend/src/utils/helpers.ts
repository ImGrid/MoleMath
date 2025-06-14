import { 
  PRECISION_CONFIG, 
  VALIDATION_PATTERNS, 
  PHYSICAL_CONSTANTS,
  shouldUseScientificNotation 
} from '../constants/chemical';

export const roundToDecimals = (value: number, decimals: number = PRECISION_CONFIG.DEFAULT_SIGNIFICANT_FIGURES): number => {
  if (!isFinite(value)) return value;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const toScientificNotation = (value: number, decimals: number = 3): string => {
  if (!isFinite(value) || value === 0) return value.toString();
  
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
  const roundedMantissa = roundToDecimals(mantissa, decimals);
  
  if (exponent === 0) {
    return roundedMantissa.toString();
  }
  
  return `${roundedMantissa} × 10^${exponent}`;
};

export const formatNumber = (
  value: number, 
  options: {
    decimals?: number;
    forceScientific?: boolean;
    unit?: string;
  } = {}
): string => {
  const { 
    decimals = PRECISION_CONFIG.DEFAULT_SIGNIFICANT_FIGURES, 
    forceScientific = false,
    unit = ''
  } = options;
  
  if (!isFinite(value)) {
    return 'N/A';
  }
  
  let formattedValue: string;
  
  if (forceScientific || shouldUseScientificNotation(value)) {
    formattedValue = toScientificNotation(value, decimals);
  } else {
    formattedValue = roundToDecimals(value, decimals).toString();
  }
  
  return unit ? `${formattedValue} ${unit}` : formattedValue;
};

export const gcd = (numbers: readonly number[]): number => {
  if (numbers.length === 0) return 1;
  if (numbers.length === 1) return Math.abs(numbers[0]);
  
  const gcdTwo = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };
  
  return numbers.reduce((acc, curr) => gcdTwo(acc, Math.abs(curr)));
};

export const lcm = (numbers: readonly number[]): number => {
  if (numbers.length === 0) return 1;
  if (numbers.length === 1) return Math.abs(numbers[0]);
  
  const lcmTwo = (a: number, b: number): number => {
    return Math.abs(a * b) / gcd([a, b]);
  };
  
  return numbers.reduce((acc, curr) => lcmTwo(acc, Math.abs(curr)));
};

export const fractionsToIntegers = (fractions: readonly number[]): readonly number[] => {
  const denominators = fractions.map(f => {
    const str = f.toString();
    const decimalIndex = str.indexOf('.');
    return decimalIndex === -1 ? 1 : Math.pow(10, str.length - decimalIndex - 1);
  });
  
  const lcmValue = lcm(denominators);
  return fractions.map(f => Math.round(f * lcmValue));
};

export const isValidNumber = (value: string): boolean => {
  if (!value || value.trim() === '') return false;
  const num = parseFloat(value.trim());
  return !isNaN(num) && isFinite(num);
};

export const isPositiveNumber = (value: number): boolean => {
  return isFinite(value) && value > 0;
};

export const matchesPattern = (value: string, patternKey: keyof typeof VALIDATION_PATTERNS): boolean => {
  const pattern = VALIDATION_PATTERNS[patternKey];
  return pattern.test(value);
};

export const cleanString = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  return isFinite(value) && value >= min && value <= max;
};

export const gramsToMoles = (grams: number, molarMass: number): number => {
  if (!isPositiveNumber(grams) || !isPositiveNumber(molarMass)) {
    throw new Error('Los valores deben ser números positivos');
  }
  return grams / molarMass;
};

export const molesToGrams = (moles: number, molarMass: number): number => {
  if (!isPositiveNumber(moles) || !isPositiveNumber(molarMass)) {
    throw new Error('Los valores deben ser números positivos');
  }
  return moles * molarMass;
};

export const molesToMolecules = (moles: number): number => {
  if (!isPositiveNumber(moles)) {
    throw new Error('Los moles deben ser un número positivo');
  }
  return moles * PHYSICAL_CONSTANTS.AVOGADRO_NUMBER;
};

export const moleculesToMoles = (molecules: number): number => {
  if (!isPositiveNumber(molecules)) {
    throw new Error('Las moléculas deben ser un número positivo');
  }
  return molecules / PHYSICAL_CONSTANTS.AVOGADRO_NUMBER;
};

export const mlToL = (ml: number): number => {
  if (!isFinite(ml)) {
    throw new Error('El volumen debe ser un número válido');
  }
  return ml / 1000;
};

export const lToMl = (l: number): number => {
  if (!isFinite(l)) {
    throw new Error('El volumen debe ser un número válido');
  }
  return l * 1000;
};

export const gramsToKg = (grams: number): number => {
  if (!isFinite(grams)) {
    throw new Error('La masa debe ser un número válido');
  }
  return grams / 1000;
};

export const kgToGrams = (kg: number): number => {
  if (!isFinite(kg)) {
    throw new Error('La masa debe ser un número válido');
  }
  return kg * 1000;
};

export const removeDuplicates = <T>(array: readonly T[]): readonly T[] => {
  return [...new Set(array)];
};

export const groupBy = <T, K extends string | number | symbol>(
  array: readonly T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

export const findIndex = <T>(
  array: readonly T[],
  predicate: (item: T, index: number) => boolean
): number => {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      return i;
    }
  }
  return -1;
};

export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

export const sanitizeString = (str: string): string => {
  return str.replace(/[^a-zA-Z0-9\s]/g, '').trim();
};

export const formatSubscripts = (formula: string): string => {
  return formula.replace(/(\d+)/g, '<sub>$1</sub>');
};

export const removeSubscripts = (formula: string): string => {
  return formula.replace(/<\/?sub>/g, '');
};

export const generateTimestamp = (): string => {
  return new Date().toISOString();
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const debugLog = (message: string, data?: unknown): void => {
  console.log(`[${new Date().toISOString()}] ${message}`, data || '');
};

export const measureExecutionTime = <T>(
  fn: () => T,
  label?: string
): { result: T; executionTime: number } => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const executionTime = end - start;
  
  if (label) {
    debugLog(`${label} ejecutado en ${executionTime.toFixed(2)}ms`);
  }
  
  return { result, executionTime };
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

export const isEmpty = (obj: unknown): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

export const mergeObjects = <T extends Record<string, unknown>>(...objects: T[]): T => {
  return Object.assign({}, ...objects);
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export default {
  roundToDecimals,
  formatNumber,
  toScientificNotation,
  
  isValidNumber,
  isPositiveNumber,
  isInRange,
  
  gramsToMoles,
  molesToGrams,
  molesToMolecules,
  moleculesToMoles,
  mlToL,
  lToMl,
  
  cleanString,
  capitalize,
  formatSubscripts,
  
  generateId,
  generateTimestamp,
  debugLog,
  deepClone,
  isEmpty,
} as const;