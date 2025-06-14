import type { 
  MolarMassResult, 
  ConversionResult, 
  CalculationStep,
  ConcentrationResult,
  BalanceResult
} from '../types/chemistry';
import { 
  PRECISION_CONFIG, 
  FORMAT_CONFIG, 
  STANDARD_UNITS,
  shouldUseScientificNotation 
} from '../constants/chemical';
import { 
  formatNumber, 
} from './helpers';

export const formatChemicalNumber = (
  value: number,
  options: {
    decimals?: number;
    forceScientific?: boolean;
    unit?: string;
    type?: 'mass' | 'volume' | 'concentration' | 'general';
  } = {}
): string => {
  const { 
    decimals, 
    forceScientific = false, 
    unit = '',
    type = 'general' 
  } = options;
  
  if (!isFinite(value)) {
    return 'N/A';
  }
  
  let finalDecimals = decimals;
  if (finalDecimals === undefined) {
    switch (type) {
      case 'mass':
        finalDecimals = PRECISION_CONFIG.MOLAR_MASS_DECIMALS;
        break;
      case 'concentration':
        finalDecimals = PRECISION_CONFIG.CONCENTRATION_DECIMALS;
        break;
      case 'volume':
        finalDecimals = 3;
        break;
      default:
        finalDecimals = PRECISION_CONFIG.DEFAULT_SIGNIFICANT_FIGURES;
    }
  }
  
  return formatNumber(value, {
    decimals: finalDecimals,
    forceScientific,
    unit
  });
};

export const formatMass = (grams: number): string => {
  if (grams >= 1000) {
    return formatChemicalNumber(grams / 1000, { 
      decimals: 3, 
      unit: STANDARD_UNITS.MASS.KILOGRAMS,
      type: 'mass'
    });
  } else if (grams >= 1) {
    return formatChemicalNumber(grams, { 
      decimals: 3, 
      unit: STANDARD_UNITS.MASS.GRAMS,
      type: 'mass'
    });
  } else {
    return formatChemicalNumber(grams * 1000, { 
      decimals: 3, 
      unit: STANDARD_UNITS.MASS.MILLIGRAMS,
      type: 'mass'
    });
  }
};

export const formatVolume = (liters: number): string => {
  if (liters >= 1) {
    return formatChemicalNumber(liters, { 
      decimals: 3, 
      unit: STANDARD_UNITS.VOLUME.LITERS,
      type: 'volume'
    });
  } else {
    return formatChemicalNumber(liters * 1000, { 
      decimals: 2, 
      unit: STANDARD_UNITS.VOLUME.MILLILITERS,
      type: 'volume'
    });
  }
};

export const formatMoles = (moles: number): string => {
  return formatChemicalNumber(moles, {
    decimals: 6,
    unit: STANDARD_UNITS.AMOUNT.MOLES,
    forceScientific: shouldUseScientificNotation(moles)
  });
};

export const formatMolecules = (molecules: number): string => {
  return formatChemicalNumber(molecules, {
    decimals: 3,
    unit: STANDARD_UNITS.AMOUNT.MOLECULES,
    forceScientific: true
  });
};

export const formatConcentration = (concentration: number, unit: string): string => {
  return formatChemicalNumber(concentration, {
    decimals: PRECISION_CONFIG.CONCENTRATION_DECIMALS,
    unit,
    type: 'concentration'
  });
};

export const formatChemicalFormula = (formula: string): string => {
  if (!formula) return '';
  
  const subscriptMap: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };
  
  let result = formula.replace(/<sub>([^<]+)<\/sub>/g, (_, content: string) => {
    return content.split('').map((char: string) => subscriptMap[char] || char).join('');
  });
  
  result = result.replace(/(\d+)/g, (match: string) => {
    return match.split('').map((char: string) => subscriptMap[char] || char).join('');
  });
  
  return result;
};

export const convertHtmlToUnicode = (formula: string): string => {
  if (!formula) return '';
  
  const subscriptMap: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };
  
  return formula.replace(/<sub>([^<]+)<\/sub>/g, (_, content: string) => {
    return content.split('').map((char: string) => subscriptMap[char] || char).join('');
  });
};

export const formatFormulaPlainText = (formula: string): string => {
  if (!formula) return '';
  
  return formula;
};

export const formatChemicalEquation = (
  reactants: readonly { formula: string; coefficient: number }[],
  products: readonly { formula: string; coefficient: number }[],
  useHtml: boolean = false
): string => {
  const formatSide = (compounds: readonly { formula: string; coefficient: number }[]) => {
    return compounds.map(compound => {
      const coeff = compound.coefficient === 1 ? '' : compound.coefficient.toString();
      const formula = useHtml ? formatChemicalFormula(compound.formula) : compound.formula;
      return `${coeff}${formula}`;
    }).join(FORMAT_CONFIG.EQUATION_FORMAT.PLUS);
  };
  
  const reactantsStr = formatSide(reactants);
  const productsStr = formatSide(products);
  
  return `${reactantsStr}${FORMAT_CONFIG.EQUATION_FORMAT.ARROW}${productsStr}`;
};

export const formatMolarMassResult = (result: MolarMassResult): {
  title: string;
  molarMass: string;
  elements: Array<{
    element: string;
    count: string;
    atomicMass: string;
    contribution: string;
    percentage: string;
  }>;
  steps: string[];
  summary: string;
} => {
  if (!result.isValid) {
    return {
      title: `Error en ${result.formula}`,
      molarMass: 'N/A',
      elements: [],
      steps: [`Error: ${result.error}`],
      summary: 'No se pudo calcular la masa molar debido a errores en la entrada.'
    };
  }
  
  const title = `Masa Molar de ${formatChemicalFormula(result.formula)}`;
  const molarMass = formatChemicalNumber(result.molarMass, {
    decimals: PRECISION_CONFIG.MOLAR_MASS_DECIMALS,
    unit: 'g/mol',
    type: 'mass'
  });
  
  const elements = result.elements.map(el => ({
    element: `${el.symbol} (${el.name})`,
    count: el.count.toString(),
    atomicMass: formatChemicalNumber(el.atomicMass, { decimals: 3, unit: 'u' }),
    contribution: formatChemicalNumber(el.contribution, { decimals: 3, unit: 'u' }),
    percentage: formatChemicalNumber(el.massPercent, { decimals: 2, unit: '%' })
  }));
  
  const steps = result.steps.map(step => {
    if (step.operation && step.result !== undefined) {
      const resultStr = step.unit 
        ? formatChemicalNumber(step.result, { unit: step.unit })
        : step.result.toString();
      return `${step.step}. ${step.description}: ${step.operation} = ${resultStr}`;
    } else if (step.operation) {
      return `${step.step}. ${step.description}: ${step.operation}`;
    } else {
      return `${step.step}. ${step.description}`;
    }
  });
  
  const elementCount = result.elements.length;
  const totalAtoms = result.elements.reduce((sum, el) => sum + el.count, 0);
  const summary = `La fórmula ${result.formula} contiene ${elementCount} elemento${elementCount > 1 ? 's' : ''} diferentes con un total de ${totalAtoms} átomo${totalAtoms > 1 ? 's' : ''} por molécula.`;
  
  return {
    title,
    molarMass,
    elements,
    steps,
    summary
  };
};

export const formatConversionResult = (result: ConversionResult): {
  title: string;
  conversion: string;
  input: string;
  output: string;
  steps: string[];
  formula: string;
} => {
  if (!result.isValid) {
    return {
      title: 'Error en Conversión',
      conversion: 'N/A',
      input: 'N/A',
      output: 'N/A',
      steps: [`Error: ${result.error}`],
      formula: result.compound
    };
  }
  
  const conversionTitles: Record<string, string> = {
    'grams-to-moles': 'Conversión de Gramos a Moles',
    'moles-to-grams': 'Conversión de Moles a Gramos',
    'moles-to-molecules': 'Conversión de Moles a Moléculas',
    'molecules-to-moles': 'Conversión de Moléculas a Moles'
  };
  
  const title = conversionTitles[result.type] || 'Conversión de Unidades';
  
  const input = formatChemicalNumber(result.inputValue, { unit: result.inputUnit });
  
  let output: string;
  if (result.outputUnit === STANDARD_UNITS.AMOUNT.MOLECULES) {
    output = formatMolecules(result.outputValue);
  } else if (result.outputUnit === STANDARD_UNITS.AMOUNT.MOLES) {
    output = formatMoles(result.outputValue);
  } else if (result.outputUnit === STANDARD_UNITS.MASS.GRAMS) {
    output = formatMass(result.outputValue);
  } else {
    output = formatChemicalNumber(result.outputValue, { unit: result.outputUnit });
  }
  
  const conversion = `${input} = ${output}`;
  
  const steps = result.steps.map(step => {
    if (step.operation && step.result !== undefined) {
      const resultStr = step.unit 
        ? formatChemicalNumber(step.result, { unit: step.unit })
        : step.result.toString();
      return `${step.step}. ${step.description}: ${step.operation} = ${resultStr}`;
    } else if (step.operation) {
      return `${step.step}. ${step.description}: ${step.operation}`;
    } else {
      return `${step.step}. ${step.description}`;
    }
  });
  
  const formula = formatChemicalFormula(result.compound);
  
  return {
    title,
    conversion,
    input,
    output,
    steps,
    formula
  };
};

export const formatConcentrationResult = (result: ConcentrationResult): {
  title: string;
  concentration: string;
  type: string;
  compound: string;
  steps: string[];
} => {
  if (!result.isValid) {
    return {
      title: 'Error en Cálculo de Concentración',
      concentration: 'N/A',
      type: 'N/A',
      compound: result.solute,
      steps: [`Error: ${result.error}`]
    };
  }
  
  const typeNames: Record<string, string> = {
    'molarity': 'Molaridad',
    'molality': 'Molalidad'
  };
  
  const title = `Cálculo de ${typeNames[result.type] || result.type}`;
  const concentration = formatConcentration(result.concentration, result.unit);
  const compound = formatChemicalFormula(result.solute);
  
  const steps = result.steps.map(step => {
    if (step.operation && step.result !== undefined) {
      const resultStr = step.unit 
        ? formatChemicalNumber(step.result, { unit: step.unit })
        : step.result.toString();
      return `${step.step}. ${step.description}: ${step.operation} = ${resultStr}`;
    } else if (step.operation) {
      return `${step.step}. ${step.description}: ${step.operation}`;
    } else {
      return `${step.step}. ${step.description}`;
    }
  });
  
  return {
    title,
    concentration,
    type: typeNames[result.type] || result.type,
    compound,
    steps
  };
};

export const formatBalanceResult = (result: BalanceResult): {
  title: string;
  originalEquation: string;
  balancedEquation: string;
  method: string;
  steps: string[];
  coefficients: string[];
} => {
  if (!result.isValid) {
    return {
      title: 'Error en Balance de Ecuación',
      originalEquation: 'N/A',
      balancedEquation: 'N/A',
      method: 'N/A',
      steps: [`Error: ${result.error}`],
      coefficients: []
    };
  }
  
  const methodNames: Record<string, string> = {
    'trial-and-error': 'Tanteo',
    'algebraic': 'Método Algebraico'
  };
  
  const title = 'Balance de Ecuación Química';
  
  const originalEquation = formatChemicalEquation(
    result.originalEquation.reactants,
    result.originalEquation.products,
    true
  );
  
  const balancedEquation = formatChemicalEquation(
    result.balancedReactants,
    result.balancedProducts,
    true
  );
  
  const method = methodNames[result.method] || result.method;
  
  const steps = result.steps.map(step => {
    let stepText = `${step.stepNumber}. ${step.description}`;
    if (step.equation) {
      stepText += `: ${step.equation}`;
    }
    if (step.elementCount) {
      const counts = Object.entries(step.elementCount)
        .map(([element, count]) => `${element}: ${count.left} → ${count.right}`)
        .join(', ');
      stepText += ` (${counts})`;
    }
    return stepText;
  });
  
  const coefficients = [
    ...result.balancedReactants.map(r => r.coefficient.toString()),
    ...result.balancedProducts.map(p => p.coefficient.toString())
  ];
  
  return {
    title,
    originalEquation,
    balancedEquation,
    method,
    steps,
    coefficients
  };
};

export const formatCalculationSteps = (steps: readonly CalculationStep[]): string[] => {
  return steps.map(step => {
    let stepText = `${step.step}. ${step.description}`;
    
    if (step.operation) {
      stepText += `: ${step.operation}`;
    }
    
    if (step.result !== undefined) {
      const resultStr = step.unit 
        ? formatChemicalNumber(step.result, { unit: step.unit })
        : formatChemicalNumber(step.result);
      
      if (step.operation) {
        stepText += ` = ${resultStr}`;
      } else {
        stepText += `: ${resultStr}`;
      }
    }
    
    return stepText;
  });
};

export const formatForClipboard = (
  title: string,
  result: string,
  steps: string[]
): string => {
  const lines: string[] = [];
  
  lines.push(title);
  lines.push('='.repeat(title.length));
  lines.push('');
  lines.push(`Resultado: ${result}`);
  lines.push('');
  
  if (steps.length > 0) {
    lines.push('Pasos de cálculo:');
    lines.push('');
    steps.forEach(step => {
      lines.push(step);
    });
  }
  
  lines.push('');
  lines.push(`Calculado el ${new Date().toLocaleString('es-ES')}`);
  lines.push('Generado por Calculadora de Química');
  
  return lines.join('\n');
};

export const formatReport = (
  calculations: Array<{
    title: string;
    result: string;
    steps: string[];
  }>
): string => {
  const lines: string[] = [];
  
  lines.push('REPORTE DE CÁLCULOS QUÍMICOS');
  lines.push('============================');
  lines.push('');
  lines.push(`Generado el: ${new Date().toLocaleString('es-ES')}`);
  lines.push(`Total de cálculos: ${calculations.length}`);
  lines.push('');
  
  calculations.forEach((calc, index) => {
    lines.push(`${index + 1}. ${calc.title}`);
    lines.push('-'.repeat(calc.title.length + 3));
    lines.push(`Resultado: ${calc.result}`);
    
    if (calc.steps.length > 0) {
      lines.push('Pasos:');
      calc.steps.forEach(step => {
        lines.push(`  ${step}`);
      });
    }
    
    lines.push('');
  });
  
  return lines.join('\n');
};

export default {
  formatChemicalNumber,
  formatMass,
  formatVolume,
  formatMoles,
  formatMolecules,
  formatConcentration,
  
  formatChemicalFormula,
  formatFormulaPlainText,
  formatChemicalEquation,
  
  formatMolarMassResult,
  formatConversionResult,
  formatConcentrationResult,
  formatBalanceResult,
  
  formatCalculationSteps,
  formatForClipboard,
  formatReport,
} as const;