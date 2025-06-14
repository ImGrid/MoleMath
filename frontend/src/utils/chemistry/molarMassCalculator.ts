import type {
  MolarMassResult,
  ElementContribution,
  ConversionResult,
  CalculationStep,
  MolarMassInput,
  ConversionInput
} from '../../types/chemistry';
import { PHYSICAL_CONSTANTS, STANDARD_UNITS } from '../../constants/chemical';
import { parseChemicalFormula } from './formulaParser';
import { 
  validateMolarMassInput, 
  validateConversionInput 
} from './validator';
import { getElement } from '../../data/periodicTable';
import { 
  roundToDecimals, 
  formatNumber,
  gramsToMoles,
  molesToGrams,
  molesToMolecules,
  moleculesToMoles
} from '../helpers';

export const calculateMolarMass = (input: MolarMassInput): MolarMassResult => {
  const { formula } = input;
  
  const validation = validateMolarMassInput(formula);
  if (!validation.isValid) {
    return {
      formula,
      elements: [],
      molarMass: 0,
      steps: [],
      isValid: false,
      error: validation.errors.join('; ')
    };
  }
  
  const parsed = parseChemicalFormula(formula);
  if (!parsed.isValid) {
    return {
      formula,
      elements: [],
      molarMass: 0,
      steps: [],
      isValid: false,
      error: parsed.error || 'Error al parsear la fórmula'
    };
  }
  
  const elements: ElementContribution[] = [];
  const calculationSteps: CalculationStep[] = [];
  let totalMolarMass = 0;
  let stepCounter = 1;
  
  calculationSteps.push({
    step: stepCounter++,
    description: `Fórmula a analizar: ${formula}`,
    operation: 'Identificar elementos y sus cantidades'
  });
  
  for (const parsedElement of parsed.elements) {
    const element = getElement(parsedElement.symbol);
    
    if (!element) {
      return {
        formula,
        elements: [],
        molarMass: 0,
        steps: calculationSteps,
        isValid: false,
        error: `Elemento no encontrado: ${parsedElement.symbol}`
      };
    }
    
    const contribution = parsedElement.count * element.atomic_mass;
    totalMolarMass += contribution;
    
    const elementContribution: ElementContribution = {
      symbol: element.symbol,
      name: element.name,
      count: parsedElement.count,
      atomicMass: element.atomic_mass,
      contribution: roundToDecimals(contribution, 4),
      massPercent: 0 
    };

    
    elements.push(elementContribution);
    
    if (parsedElement.count === 1) {
      calculationSteps.push({
        step: stepCounter++,
        description: `${element.symbol} (${element.name})`,
        operation: `1 × ${element.atomic_mass} u`,
        result: contribution,
        unit: 'u'
      });
    } else {
      calculationSteps.push({
        step: stepCounter++,
        description: `${element.symbol} (${element.name})`,
        operation: `${parsedElement.count} × ${element.atomic_mass} u`,
        result: contribution,
        unit: 'u'
      });
    }
  }
  
  const contributionList = elements.map(el => 
    `${el.contribution} u`
  ).join(' + ');
  
  calculationSteps.push({
    step: stepCounter++,
    description: 'Suma total',
    operation: `${contributionList}`,
    result: totalMolarMass,
    unit: 'g/mol'
  });
  
  const elementsWithPercent = elements.map(element => ({
    ...element,
    massPercent: roundToDecimals((element.contribution / totalMolarMass) * 100, 2)
  }));
  
  return {
    formula,
    elements: elementsWithPercent,
    molarMass: roundToDecimals(totalMolarMass, 4),
    steps: calculationSteps,
    isValid: true
  };
};

export const convertGramsToMoles = (
  grams: number,
  formula: string
): ConversionResult => {
  const validation = validateConversionInput(grams, 'grams-to-moles', formula);
  if (!validation.isValid) {
    return {
      type: 'grams-to-moles',
      inputValue: grams,
      inputUnit: STANDARD_UNITS.MASS.GRAMS,
      outputValue: 0,
      outputUnit: STANDARD_UNITS.AMOUNT.MOLES,
      compound: formula,
      steps: [],
      isValid: false,
      error: validation.errors.join('; ')
    };
  }
  
  const molarMassResult = calculateMolarMass({ formula });
  if (!molarMassResult.isValid) {
    return {
      type: 'grams-to-moles',
      inputValue: grams,
      inputUnit: STANDARD_UNITS.MASS.GRAMS,
      outputValue: 0,
      outputUnit: STANDARD_UNITS.AMOUNT.MOLES,
      compound: formula,
      steps: [],
      isValid: false,
      error: molarMassResult.error || 'Error al calcular masa molar'
    };
  }
  
  const moles = gramsToMoles(grams, molarMassResult.molarMass);
  
  const steps: CalculationStep[] = [
    {
      step: 1,
      description: 'Masa molar del compuesto',
      operation: `MM(${formula}) = ${molarMassResult.molarMass} g/mol`,
      result: molarMassResult.molarMass,
      unit: 'g/mol'
    },
    {
      step: 2,
      description: 'Aplicar fórmula de conversión',
      operation: 'moles = masa (g) / masa molar (g/mol)',
    },
    {
      step: 3,
      description: 'Sustituir valores',
      operation: `moles = ${grams} g / ${molarMassResult.molarMass} g/mol`,
      result: moles,
      unit: 'mol'
    }
  ];
  
  return {
    type: 'grams-to-moles',
    inputValue: grams,
    inputUnit: STANDARD_UNITS.MASS.GRAMS,
    outputValue: roundToDecimals(moles, 6),
    outputUnit: STANDARD_UNITS.AMOUNT.MOLES,
    compound: formula,
    steps,
    isValid: true
  };
};

export const convertMolesToGrams = (
  moles: number,
  formula: string
): ConversionResult => {
  const validation = validateConversionInput(moles, 'moles-to-grams', formula);
  if (!validation.isValid) {
    return {
      type: 'moles-to-grams',
      inputValue: moles,
      inputUnit: STANDARD_UNITS.AMOUNT.MOLES,
      outputValue: 0,
      outputUnit: STANDARD_UNITS.MASS.GRAMS,
      compound: formula,
      steps: [],
      isValid: false,
      error: validation.errors.join('; ')
    };
  }
  
  const molarMassResult = calculateMolarMass({ formula });
  if (!molarMassResult.isValid) {
    return {
      type: 'moles-to-grams',
      inputValue: moles,
      inputUnit: STANDARD_UNITS.AMOUNT.MOLES,
      outputValue: 0,
      outputUnit: STANDARD_UNITS.MASS.GRAMS,
      compound: formula,
      steps: [],
      isValid: false,
      error: molarMassResult.error || 'Error al calcular masa molar'
    };
  }
  
  const grams = molesToGrams(moles, molarMassResult.molarMass);
  
  const steps: CalculationStep[] = [
    {
      step: 1,
      description: 'Masa molar del compuesto',
      operation: `MM(${formula}) = ${molarMassResult.molarMass} g/mol`,
      result: molarMassResult.molarMass,
      unit: 'g/mol'
    },
    {
      step: 2,
      description: 'Aplicar fórmula de conversión',
      operation: 'masa (g) = moles × masa molar (g/mol)',
    },
    {
      step: 3,
      description: 'Sustituir valores',
      operation: `masa = ${moles} mol × ${molarMassResult.molarMass} g/mol`,
      result: grams,
      unit: 'g'
    }
  ];
  
  return {
    type: 'moles-to-grams',
    inputValue: moles,
    inputUnit: STANDARD_UNITS.AMOUNT.MOLES,
    outputValue: roundToDecimals(grams, 4),
    outputUnit: STANDARD_UNITS.MASS.GRAMS,
    compound: formula,
    steps,
    isValid: true
  };
};

export const convertMolesToMolecules = (
  moles: number,
  formula: string
): ConversionResult => {
  const validation = validateConversionInput(moles, 'moles-to-molecules', formula);
  if (!validation.isValid) {
    return {
      type: 'moles-to-molecules',
      inputValue: moles,
      inputUnit: STANDARD_UNITS.AMOUNT.MOLES,
      outputValue: 0,
      outputUnit: STANDARD_UNITS.AMOUNT.MOLECULES,
      compound: formula,
      steps: [],
      isValid: false,
      error: validation.errors.join('; ')
    };
  }
  
  const molecules = molesToMolecules(moles);
  
  const steps: CalculationStep[] = [
    {
      step: 1,
      description: 'Número de Avogadro',
      operation: `NA = ${formatNumber(PHYSICAL_CONSTANTS.AVOGADRO_NUMBER, { forceScientific: true })} moléculas/mol`,
      result: PHYSICAL_CONSTANTS.AVOGADRO_NUMBER,
      unit: 'moléculas/mol'
    },
    {
      step: 2,
      description: 'Aplicar fórmula de conversión',
      operation: 'moléculas = moles × NA',
    },
    {
      step: 3,
      description: 'Sustituir valores',
      operation: `moléculas = ${moles} mol × ${formatNumber(PHYSICAL_CONSTANTS.AVOGADRO_NUMBER, { forceScientific: true })}`,
      result: molecules,
      unit: 'moléculas'
    }
  ];
  
  return {
    type: 'moles-to-molecules',
    inputValue: moles,
    inputUnit: STANDARD_UNITS.AMOUNT.MOLES,
    outputValue: molecules,
    outputUnit: STANDARD_UNITS.AMOUNT.MOLECULES,
    compound: formula,
    steps,
    isValid: true
  };
};

export const convertMoleculesToMoles = (
  molecules: number,
  formula: string
): ConversionResult => {
  const validation = validateConversionInput(molecules, 'molecules-to-moles', formula);
  if (!validation.isValid) {
    return {
      type: 'molecules-to-moles',
      inputValue: molecules,
      inputUnit: STANDARD_UNITS.AMOUNT.MOLECULES,
      outputValue: 0,
      outputUnit: STANDARD_UNITS.AMOUNT.MOLES,
      compound: formula,
      steps: [],
      isValid: false,
      error: validation.errors.join('; ')
    };
  }
  
  const moles = moleculesToMoles(molecules);
  
  const steps: CalculationStep[] = [
    {
      step: 1,
      description: 'Número de Avogadro',
      operation: `NA = ${formatNumber(PHYSICAL_CONSTANTS.AVOGADRO_NUMBER, { forceScientific: true })} moléculas/mol`,
      result: PHYSICAL_CONSTANTS.AVOGADRO_NUMBER,
      unit: 'moléculas/mol'
    },
    {
      step: 2,
      description: 'Aplicar fórmula de conversión',
      operation: 'moles = moléculas / NA',
    },
    {
      step: 3,
      description: 'Sustituir valores',
      operation: `moles = ${formatNumber(molecules, { forceScientific: true })} / ${formatNumber(PHYSICAL_CONSTANTS.AVOGADRO_NUMBER, { forceScientific: true })}`,
      result: moles,
      unit: 'mol'
    }
  ];
  
  return {
    type: 'molecules-to-moles',
    inputValue: molecules,
    inputUnit: STANDARD_UNITS.AMOUNT.MOLECULES,
    outputValue: roundToDecimals(moles, 8),
    outputUnit: STANDARD_UNITS.AMOUNT.MOLES,
    compound: formula,
    steps,
    isValid: true
  };
};

export const performConversion = (input: ConversionInput): ConversionResult => {
  const { value, conversionType, formula } = input;
  
  switch (conversionType) {
    case 'grams-to-moles':
      return convertGramsToMoles(value, formula);
    
    case 'moles-to-grams':
      return convertMolesToGrams(value, formula);
    
    case 'moles-to-molecules':
      return convertMolesToMolecules(value, formula);
    
    case 'molecules-to-moles':
      return convertMoleculesToMoles(value, formula);
    
    default:
      return {
        type: conversionType,
        inputValue: value,
        inputUnit: '',
        outputValue: 0,
        outputUnit: '',
        compound: formula,
        steps: [],
        isValid: false,
        error: `Tipo de conversión no soportado: ${conversionType}`
      };
  }
};

export const calculatePercentageComposition = (formula: string): {
  composition: readonly ElementContribution[];
  isValid: boolean;
  error?: string;
} => {
  const molarMassResult = calculateMolarMass({ formula });
  
  if (!molarMassResult.isValid) {
    return {
      composition: [],
      isValid: false,
      error: molarMassResult.error
    };
  }
  
  return {
    composition: molarMassResult.elements,
    isValid: true
  };
};

export const calculateEmpiricalFormula = (
  elementPercentages: { symbol: string; percentage: number }[]
): {
  empiricalFormula: string;
  steps: CalculationStep[];
  isValid: boolean;
  error?: string;
} => {
  if (elementPercentages.length === 0) {
    return {
      empiricalFormula: '',
      steps: [],
      isValid: false,
      error: 'No se proporcionaron porcentajes de elementos'
    };
  }
  
  const steps: CalculationStep[] = [];
  let stepCounter = 1;
  
  steps.push({
    step: stepCounter++,
    description: 'Asumir 100 g de muestra para convertir % a gramos'
  });
  
  const elementData: Array<{
    symbol: string;
    grams: number;
    atomicMass: number;
    moles: number;
    ratio: number;
    simplestRatio: number;
  }> = [];
  
  for (const { symbol, percentage } of elementPercentages) {
    const element = getElement(symbol);
    if (!element) {
      return {
        empiricalFormula: '',
        steps,
        isValid: false,
        error: `Elemento no encontrado: ${symbol}`
      };
    }
    
    const grams = percentage;
    const moles = grams / element.atomic_mass;
    
    elementData.push({
      symbol,
      grams,
      atomicMass: element.atomic_mass,
      moles,
      ratio: 0,
      simplestRatio: 0 
    });
    
    steps.push({
      step: stepCounter++,
      description: `Moles de ${symbol}`,
      operation: `${grams} g / ${element.atomic_mass} g/mol`,
      result: moles,
      unit: 'mol'
    });
  }
  
  const minMoles = Math.min(...elementData.map(el => el.moles));
  
  steps.push({
    step: stepCounter++,
    description: `Dividir por el menor número de moles: ${roundToDecimals(minMoles, 6)} mol`
  });
  
  for (const element of elementData) {
    element.ratio = element.moles / minMoles;
    
    steps.push({
      step: stepCounter++,
      description: `Ratio para ${element.symbol}`,
      operation: `${roundToDecimals(element.moles, 6)} / ${roundToDecimals(minMoles, 6)}`,
      result: element.ratio
    });
  }
  
  const ratios = elementData.map(el => el.ratio);
  const multiplier = findSimplestMultiplier(ratios);
  
  for (const element of elementData) {
    element.simplestRatio = Math.round(element.ratio * multiplier);
  }
  
  if (multiplier > 1) {
    steps.push({
      step: stepCounter++,
      description: `Multiplicar por ${multiplier} para obtener enteros simples`
    });
  }
  
  let empiricalFormula = '';
  for (const element of elementData) {
    empiricalFormula += element.symbol;
    if (element.simplestRatio > 1) {
      empiricalFormula += element.simplestRatio.toString();
    }
  }
  
  steps.push({
    step: stepCounter++,
    description: `Fórmula empírica: ${empiricalFormula}`
  });
  
  return {
    empiricalFormula,
    steps,
    isValid: true
  };
};

const findSimplestMultiplier = (ratios: number[]): number => {
  for (let multiplier = 1; multiplier <= 10; multiplier++) {
    const multipliedRatios = ratios.map(ratio => ratio * multiplier);
    const allClose = multipliedRatios.every(value => 
      Math.abs(value - Math.round(value)) < 0.1
    );
    
    if (allClose) {
      return multiplier;
    }
  }
  
  return 1;
};

export const getCompoundInfo = (formula: string) => {
  const molarMassResult = calculateMolarMass({ formula });
  
  if (!molarMassResult.isValid) {
    return {
      isValid: false,
      error: molarMassResult.error
    };
  }
  
  const totalAtoms = molarMassResult.elements.reduce((sum, el) => sum + el.count, 0);
  const uniqueElements = molarMassResult.elements.length;
  const heaviestElement = molarMassResult.elements.reduce((heaviest, current) => 
    current.atomicMass > heaviest.atomicMass ? current : heaviest
  );
  const lightestElement = molarMassResult.elements.reduce((lightest, current) => 
    current.atomicMass < lightest.atomicMass ? current : lightest
  );
  
  return {
    formula,
    molarMass: molarMassResult.molarMass,
    elements: molarMassResult.elements,
    totalAtoms,
    uniqueElements,
    heaviestElement,
    lightestElement,
    isValid: true
  };
};

export default {
  calculateMolarMass,
  
  convertGramsToMoles,
  convertMolesToGrams,
  convertMolesToMolecules,
  convertMoleculesToMoles,
  performConversion,
  
  calculatePercentageComposition,
  calculateEmpiricalFormula,
  
  getCompoundInfo,
} as const;