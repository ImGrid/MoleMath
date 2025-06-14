import type {
  ConcentrationInput,
  ConcentrationResult,
  ConcentrationType,
  DilutionInput,
  DilutionResult,
  CalculationStep
} from '../../types/chemistry';
import { STANDARD_UNITS } from '../../constants/chemical';
import { calculateMolarMass } from './molarMassCalculator';
import { 
  validateConcentrationInput,  
} from './validator';
import { 
  roundToDecimals, 
  mlToL,
} from '../helpers';

export const calculateMolarity = (input: ConcentrationInput): ConcentrationResult => {
  const { soluteMass, soluteFormula, solutionVolume } = input;

  const validation = validateConcentrationInput(
    soluteMass, 
    soluteFormula, 
    'molarity', 
    solutionVolume
  );
  
  if (!validation.isValid) {
    return {
      type: 'molarity',
      concentration: 0,
      unit: STANDARD_UNITS.CONCENTRATION.MOLARITY,
      solute: soluteFormula,
      steps: [],
      isValid: false,
      error: validation.errors.join('; ')
    };
  }

  const molarMassResult = calculateMolarMass({ formula: soluteFormula });
  if (!molarMassResult.isValid) {
    return {
      type: 'molarity',
      concentration: 0,
      unit: STANDARD_UNITS.CONCENTRATION.MOLARITY,
      solute: soluteFormula,
      steps: [],
      isValid: false,
      error: molarMassResult.error || 'Error al calcular masa molar'
    };
  }

  const volumeInL = mlToL(solutionVolume!);
  const molesOfSolute = soluteMass / molarMassResult.molarMass;
  const molarity = molesOfSolute / volumeInL;

  const steps: CalculationStep[] = [
    {
      step: 1,
      description: 'Calcular masa molar del soluto',
      operation: `MM(${soluteFormula}) = ${molarMassResult.molarMass} g/mol`,
      result: molarMassResult.molarMass,
      unit: 'g/mol'
    },
    {
      step: 2,
      description: 'Calcular moles de soluto',
      operation: `moles = masa / MM = ${soluteMass} g / ${molarMassResult.molarMass} g/mol`,
      result: molesOfSolute,
      unit: 'mol'
    },
    {
      step: 3,
      description: 'Convertir volumen a litros',
      operation: `V = ${solutionVolume} mL x (1 L / 1000 mL)`,
      result: volumeInL,
      unit: 'L'
    },
    {
      step: 4,
      description: 'Aplicar fórmula de molaridad',
      operation: `M = moles soluto / litros solución = ${roundToDecimals(molesOfSolute, 6)} mol / ${volumeInL} L`,
      result: molarity,
      unit: 'M'
    }
  ];

  return {
    type: 'molarity',
    concentration: roundToDecimals(molarity, 4),
    unit: STANDARD_UNITS.CONCENTRATION.MOLARITY,
    solute: soluteFormula,
    steps,
    isValid: true
  };
};

export const calculateMolality = (input: ConcentrationInput): ConcentrationResult => {
  const { soluteMass, soluteFormula, solventMass } = input;

  const validation = validateConcentrationInput(
    soluteMass, 
    soluteFormula, 
    'molality', 
    undefined,
    solventMass
  );
  
  if (!validation.isValid) {
    return {
      type: 'molality',
      concentration: 0,
      unit: STANDARD_UNITS.CONCENTRATION.MOLALITY,
      solute: soluteFormula,
      steps: [],
      isValid: false,
      error: validation.errors.join('; ')
    };
  }

  const molarMassResult = calculateMolarMass({ formula: soluteFormula });
  if (!molarMassResult.isValid) {
    return {
      type: 'molality',
      concentration: 0,
      unit: STANDARD_UNITS.CONCENTRATION.MOLALITY,
      solute: soluteFormula,
      steps: [],
      isValid: false,
      error: molarMassResult.error || 'Error al calcular masa molar'
    };
  }

  const molesOfSolute = soluteMass / molarMassResult.molarMass;
  const molality = molesOfSolute / solventMass!;

  const steps: CalculationStep[] = [
    {
      step: 1,
      description: 'Calcular masa molar del soluto',
      operation: `MM(${soluteFormula}) = ${molarMassResult.molarMass} g/mol`,
      result: molarMassResult.molarMass,
      unit: 'g/mol'
    },
    {
      step: 2,
      description: 'Calcular moles de soluto',
      operation: `moles = masa / MM = ${soluteMass} g / ${molarMassResult.molarMass} g/mol`,
      result: molesOfSolute,
      unit: 'mol'
    },
    {
      step: 3,
      description: 'Masa del solvente en kg',
      operation: `masa solvente = ${solventMass} kg`,
      result: solventMass!,
      unit: 'kg'
    },
    {
      step: 4,
      description: 'Aplicar fórmula de molalidad',
      operation: `m = moles soluto / kg solvente = ${roundToDecimals(molesOfSolute, 6)} mol / ${solventMass} kg`,
      result: molality,
      unit: 'm'
    }
  ];

  return {
    type: 'molality',
    concentration: roundToDecimals(molality, 4),
    unit: STANDARD_UNITS.CONCENTRATION.MOLALITY,
    solute: soluteFormula,
    steps,
    isValid: true
  };
};

export const calculateDilution = (input: DilutionInput): DilutionResult => {
  const { initialConcentration, initialVolume, finalConcentration, finalVolume } = input;

  const providedValues = [initialConcentration, initialVolume, finalConcentration, finalVolume]
    .filter(value => value !== undefined && value > 0);

  if (providedValues.length < 3) {
    return {
      volumeNeeded: 0,
      solventToAdd: 0,
      steps: [],
      isValid: false,
      error: 'Se necesitan al menos 3 valores para calcular el cuarto'
    };
  }

  const steps: CalculationStep[] = [];

  if (initialConcentration && finalConcentration && finalVolume && !initialVolume) {
    const volumeNeeded = (finalConcentration * finalVolume) / initialConcentration;
    const solventToAdd = finalVolume - volumeNeeded;

    steps.push(
      {
        step: 1,
        description: 'Aplicar fórmula de dilución M₁V₁ = M₂V₂',
        operation: 'Despejando V₁: V₁ = (M₂ x V₂) / M₁'
      },
      {
        step: 2,
        description: 'Sustituir valores',
        operation: `V₁ = (${finalConcentration} M x ${finalVolume} mL) / ${initialConcentration} M`,
        result: volumeNeeded,
        unit: 'mL'
      },
      {
        step: 3,
        description: 'Calcular volumen de solvente a agregar',
        operation: `Solvente = V₂ - V₁ = ${finalVolume} mL - ${roundToDecimals(volumeNeeded, 2)} mL`,
        result: solventToAdd,
        unit: 'mL'
      }
    );

    return {
      volumeNeeded: roundToDecimals(volumeNeeded, 2),
      solventToAdd: roundToDecimals(solventToAdd, 2),
      steps,
      isValid: true
    };
  }

  if (initialConcentration && initialVolume && finalConcentration && !finalVolume) {
    const finalVol = (initialConcentration * initialVolume) / finalConcentration;
    const solventToAdd = finalVol - initialVolume;

    steps.push(
      {
        step: 1,
        description: 'Aplicar fórmula de dilución M₁V₁ = M₂V₂',
        operation: 'Despejando V₂: V₂ = (M₁ x V₁) / M₂'
      },
      {
        step: 2,
        description: 'Sustituir valores',
        operation: `V₂ = (${initialConcentration} M x ${initialVolume} mL) / ${finalConcentration} M`,
        result: finalVol,
        unit: 'mL'
      },
      {
        step: 3,
        description: 'Calcular volumen de solvente a agregar',
        operation: `Solvente = V₂ - V₁ = ${roundToDecimals(finalVol, 2)} mL - ${initialVolume} mL`,
        result: solventToAdd,
        unit: 'mL'
      }
    );

    return {
      volumeNeeded: initialVolume,
      solventToAdd: roundToDecimals(solventToAdd, 2),
      steps,
      isValid: true
    };
  }

  if (initialConcentration && initialVolume && finalVolume && !finalConcentration) {
    const finalConc = (initialConcentration * initialVolume) / finalVolume;
    const solventToAdd = finalVolume - initialVolume;

    steps.push(
      {
        step: 1,
        description: 'Aplicar fórmula de dilución M₁V₁ = M₂V₂',
        operation: 'Despejando M₂: M₂ = (M₁ x V₁) / V₂'
      },
      {
        step: 2,
        description: 'Sustituir valores',
        operation: `M₂ = (${initialConcentration} M x ${initialVolume} mL) / ${finalVolume} mL`,
        result: finalConc,
        unit: 'M'
      },
      {
        step: 3,
        description: 'Calcular volumen de solvente a agregar',
        operation: `Solvente = V₂ - V₁ = ${finalVolume} mL - ${initialVolume} mL`,
        result: solventToAdd,
        unit: 'mL'
      }
    );

    return {
      volumeNeeded: initialVolume,
      solventToAdd: roundToDecimals(solventToAdd, 2),
      steps,
      isValid: true
    };
  }

  if (initialVolume && finalConcentration && finalVolume && !initialConcentration) {
    const initialConc = (finalConcentration * finalVolume) / initialVolume;
    const solventToAdd = finalVolume - initialVolume;

    steps.push(
      {
        step: 1,
        description: 'Aplicar fórmula de dilución M₁V₁ = M₂V₂',
        operation: 'Despejando M₁: M₁ = (M₂ x V₂) / V₁'
      },
      {
        step: 2,
        description: 'Sustituir valores',
        operation: `M₁ = (${finalConcentration} M x ${finalVolume} mL) / ${initialVolume} mL`,
        result: initialConc,
        unit: 'M'
      },
      {
        step: 3,
        description: 'Calcular volumen de solvente a agregar',
        operation: `Solvente = V₂ - V₁ = ${finalVolume} mL - ${initialVolume} mL`,
        result: solventToAdd,
        unit: 'mL'
      }
    );

    return {
      volumeNeeded: initialVolume,
      solventToAdd: roundToDecimals(solventToAdd, 2),
      steps,
      isValid: true
    };
  }

  return {
    volumeNeeded: 0,
    solventToAdd: 0,
    steps: [],
    isValid: false,
    error: 'Combinación de parámetros no soportada para dilución'
  };
};

export const calculateSolutionPreparation = (
  soluteFormula: string,
  desiredMolarity: number,
  desiredVolume: number
): {
  soluteMassNeeded: number;
  steps: CalculationStep[];
  isValid: boolean;
  error?: string;
} => {
  const molarMassResult = calculateMolarMass({ formula: soluteFormula });
  if (!molarMassResult.isValid) {
    return {
      soluteMassNeeded: 0,
      steps: [],
      isValid: false,
      error: molarMassResult.error
    };
  }

  const volumeInL = mlToL(desiredVolume);
  const molesNeeded = desiredMolarity * volumeInL;
  const massNeeded = molesNeeded * molarMassResult.molarMass;

  const steps: CalculationStep[] = [
    {
      step: 1,
      description: 'Calcular masa molar del soluto',
      operation: `MM(${soluteFormula}) = ${molarMassResult.molarMass} g/mol`,
      result: molarMassResult.molarMass,
      unit: 'g/mol'
    },
    {
      step: 2,
      description: 'Convertir volumen a litros',
      operation: `V = ${desiredVolume} mL x (1 L / 1000 mL)`,
      result: volumeInL,
      unit: 'L'
    },
    {
      step: 3,
      description: 'Calcular moles necesarios',
      operation: `moles = M x V = ${desiredMolarity} M x ${volumeInL} L`,
      result: molesNeeded,
      unit: 'mol'
    },
    {
      step: 4,
      description: 'Calcular masa de soluto necesaria',
      operation: `masa = moles × MM = ${roundToDecimals(molesNeeded, 6)} mol × ${molarMassResult.molarMass} g/mol`,
      result: massNeeded,
      unit: 'g'
    }
  ];

  return {
    soluteMassNeeded: roundToDecimals(massNeeded, 4),
    steps,
    isValid: true
  };
};

export const convertMolarityToMolality = (
  molarity: number,
  density: number,
  molarMass: number
): number => {
  const molality = molarity / (density - (molarity * molarMass) / 1000);
  return roundToDecimals(molality, 4);
};

export const convertMolalityToMolarity = (
  molality: number,
  density: number,
  molarMass: number
): number => {
  const molarity = (molality * density) / (1 + (molality * molarMass) / 1000);
  return roundToDecimals(molarity, 4);
};

export const performConcentrationCalculation = (
  input: ConcentrationInput,
  calculationType: ConcentrationType
): ConcentrationResult => {
  switch (calculationType) {
    case 'molarity':
      return calculateMolarity(input);
    case 'molality':
      return calculateMolality(input);
    default:
      return {
        type: calculationType,
        concentration: 0,
        unit: '',
        solute: input.soluteFormula,
        steps: [],
        isValid: false,
        error: `Tipo de concentración no soportado: ${calculationType}`
      };
  }
};

export default {
  calculateMolarity,
  calculateMolality,
  performConcentrationCalculation,
  
  calculateDilution,
  
  calculateSolutionPreparation,
  
  convertMolarityToMolality,
  convertMolalityToMolarity,
} as const;