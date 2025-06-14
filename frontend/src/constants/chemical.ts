export const PHYSICAL_CONSTANTS = {
  AVOGADRO_NUMBER: 6.02214076e23,
  
  GAS_CONSTANT: 8.314462618,
  
  GAS_CONSTANT_ATM: 0.08206,
  
  STANDARD_TEMPERATURE: 273.15,
  
  STANDARD_PRESSURE: 1.0,
  
  MOLAR_VOLUME_STP: 22.414,
  
  MOLAR_VOLUME_SATP: 24.465,
  
  ABSOLUTE_ZERO_CELSIUS: -273.15,
} as const;

export const VALIDATION_LIMITS = {
  MAX_MOLAR_MASS: 10000,
  
  MIN_MOLAR_MASS: 0.1,
  
  MAX_ATOMS_PER_MOLECULE: 1000,
  
  MAX_COEFFICIENT: 100,
  
  MAX_FORMULA_LENGTH: 50,
  
  MAX_MOLARITY: 50,
  
  MAX_MOLALITY: 50,
  
  MAX_VOLUME_ML: 1000000,
  
  MAX_MASS_GRAMS: 100000,
} as const;

export const CONVERSION_FACTORS = {
  MASS: {
    G_TO_KG: 0.001,
    KG_TO_G: 1000,
    MG_TO_G: 0.001,
    G_TO_MG: 1000,
  },
  
  VOLUME: {
    ML_TO_L: 0.001,
    L_TO_ML: 1000,
    CM3_TO_L: 0.001,
    L_TO_CM3: 1000,
  },
  
  TEMPERATURE: {
    CELSIUS_TO_KELVIN: 273.15,
    FAHRENHEIT_TO_CELSIUS: (f: number) => (f - 32) * 5/9,
    CELSIUS_TO_FAHRENHEIT: (c: number) => (c * 9/5) + 32,
  },
} as const;

export const PRECISION_CONFIG = {
  MOLAR_MASS_DECIMALS: 2,
  
  CONCENTRATION_DECIMALS: 3,
  
  CONVERSION_DECIMALS: 4,
  
  SCIENTIFIC_NOTATION_THRESHOLD: 1000000,
  
  SCIENTIFIC_NOTATION_MIN: 0.001,
  
  DEFAULT_SIGNIFICANT_FIGURES: 4,
} as const;

export const VALIDATION_PATTERNS = {
  CHEMICAL_SYMBOL: /^[A-Z][a-z]?$/,
  BASIC_FORMULA: /^[A-Z][a-z]?\d*(\([A-Z][a-z]?\d*\)\d*|\([A-Z][a-z]?\d*([A-Z][a-z]?\d*)*\)\d*|[A-Z][a-z]?\d*)*$/,  
  POSITIVE_INTEGER: /^[1-9]\d*$/,
  POSITIVE_DECIMAL: /^\d*\.?\d+$/,
  CHEMICAL_EQUATION: /^[A-Za-z0-9\(\)\+\s\→\-\>]+$/,
  EQUATION_COEFFICIENT: /^\d*$/,
} as const;

export const ERROR_MESSAGES = {
  PARSING: {
    INVALID_FORMULA: 'Fórmula química no válida',
    INVALID_ELEMENT: 'Elemento químico no encontrado',
    INVALID_SYNTAX: 'Sintaxis incorrecta en la fórmula',
    EMPTY_FORMULA: 'La fórmula no puede estar vacía',
    FORMULA_TOO_LONG: 'La fórmula es demasiado larga',
  },
  
  VALIDATION: {
    NEGATIVE_VALUE: 'El valor no puede ser negativo',
    ZERO_VALUE: 'El valor no puede ser cero',
    VALUE_TOO_LARGE: 'El valor es demasiado grande',
    VALUE_TOO_SMALL: 'El valor es demasiado pequeño',
    INVALID_NUMBER: 'Número no válido',
  },
  
  CALCULATION: {
    DIVISION_BY_ZERO: 'División por cero',
    OVERFLOW: 'Resultado demasiado grande',
    UNDERFLOW: 'Resultado demasiado pequeño',
    INVALID_OPERATION: 'Operación no válida',
  },
  
  BALANCE: {
    CANNOT_BALANCE: 'No se puede balancear la ecuación',
    INVALID_EQUATION: 'Ecuación química no válida',
    MISSING_PRODUCTS: 'Faltan productos en la ecuación',
    MISSING_REACTANTS: 'Faltan reactivos en la ecuación',
  },
  
  CONCENTRATION: {
    INVALID_VOLUME: 'Volumen no válido',
    INVALID_MASS: 'Masa no válida',
    MISSING_SOLVENT: 'Falta información del solvente',
    MISSING_SOLUTION: 'Falta información de la solución',
  },
} as const;

export const STANDARD_UNITS = {
  MASS: {
    GRAMS: 'g',
    KILOGRAMS: 'kg',
    MILLIGRAMS: 'mg',
    ATOMIC_MASS_UNITS: 'u',
  },
  
  VOLUME: {
    LITERS: 'L',
    MILLILITERS: 'mL',
    CUBIC_CENTIMETERS: 'cm³',
    CUBIC_METERS: 'm³',
  },
  
  CONCENTRATION: {
    MOLARITY: 'M',
    MOLALITY: 'm',
    PERCENT_MASS: '% m/m',
    PERCENT_VOLUME: '% v/v',
    PPM: 'ppm',
  },
  
  AMOUNT: {
    MOLES: 'mol',
    MOLECULES: 'moléculas',
    ATOMS: 'átomos',
    FORMULA_UNITS: 'unidades fórmula',
  },
  
  TEMPERATURE: {
    CELSIUS: '°C',
    KELVIN: 'K',
    FAHRENHEIT: '°F',
  },
} as const;

export const FORMAT_CONFIG = {
  DECIMAL_SEPARATOR: '.',
  
  THOUSANDS_SEPARATOR: ',',
  
  SCIENTIFIC_FORMAT: {
    DECIMAL_PLACES: 3,
    EXPONENT_SEPARATOR: 'x10',
    SUPERSCRIPT: true,
  },
  
  EQUATION_FORMAT: {
    ARROW: ' → ',
    PLUS: ' + ',
    COEFFICIENT_SPACE: '',
  },
} as const;

export const DEFAULT_VALUES = {
  DECIMAL_PLACES: 2,
  
  AUTO_SCIENTIFIC_NOTATION: true,
  
  SHOW_DETAILED_STEPS: true,
  
  DEFAULT_BALANCE_METHOD: 'trial-and-error' as const,
  
  DEFAULT_CONCENTRATION_TYPE: 'molarity' as const,
  
  DEFAULT_DILUTION_VOLUME: 100,
} as const;

export const getMassConversionFactor = (from: string, to: string): number => {
  const factors = CONVERSION_FACTORS.MASS;
  
  if (from === 'g' && to === 'kg') return factors.G_TO_KG;
  if (from === 'kg' && to === 'g') return factors.KG_TO_G;
  if (from === 'mg' && to === 'g') return factors.MG_TO_G;
  if (from === 'g' && to === 'mg') return factors.G_TO_MG;
  
  return 1;
};

export const getVolumeConversionFactor = (from: string, to: string): number => {
  const factors = CONVERSION_FACTORS.VOLUME;
  
  if (from === 'mL' && to === 'L') return factors.ML_TO_L;
  if (from === 'L' && to === 'mL') return factors.L_TO_ML;
  if (from === 'cm³' && to === 'L') return factors.CM3_TO_L;
  if (from === 'L' && to === 'cm³') return factors.L_TO_CM3;
  
  return 1;
};

export const isWithinLimits = (value: number, type: keyof typeof VALIDATION_LIMITS): boolean => {
  switch (type) {
    case 'MAX_MOLAR_MASS':
      return value <= VALIDATION_LIMITS.MAX_MOLAR_MASS && value >= VALIDATION_LIMITS.MIN_MOLAR_MASS;
    case 'MAX_MOLARITY':
      return value <= VALIDATION_LIMITS.MAX_MOLARITY && value > 0;
    case 'MAX_MOLALITY':
      return value <= VALIDATION_LIMITS.MAX_MOLALITY && value > 0;
    default:
      return true;
  }
};

export const shouldUseScientificNotation = (value: number): boolean => {
  const abs = Math.abs(value);
  return abs >= PRECISION_CONFIG.SCIENTIFIC_NOTATION_THRESHOLD || 
         (abs > 0 && abs < PRECISION_CONFIG.SCIENTIFIC_NOTATION_MIN);
};