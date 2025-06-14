// ============================================================================
// BALANCEADOR DE ECUACIONES QUÍMICAS - VERSIÓN COMPLETA Y ROBUSTA
// ============================================================================

import type {
  ChemicalEquation,
  EquationCompound,
  BalanceInput,
  BalanceResult,
  BalanceStep,
} from '../../types/chemistry';
import { parseChemicalFormula } from './formulaParser';
import { validateChemicalEquation } from './validator';
import { ERROR_MESSAGES, VALIDATION_LIMITS } from '../../constants/chemical';
import { gcd, lcm } from '../helpers';

import type {
  ElementBalance,
  EquationParseResult
} from '../../types/chemistry';

class RobustFraction {
  num: number;
  den: number;

  constructor(numerator: number, denominator: number = 1) {
    if (denominator === 0) {
      throw new Error('División por cero en fracción');
    }
    
    if (denominator < 0) {
      numerator = -numerator;
      denominator = -denominator;
    }
    
    const g = this.gcd(Math.abs(numerator), Math.abs(denominator));
    this.num = numerator / g;
    this.den = denominator / g;
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  add(other: RobustFraction): RobustFraction {
    return new RobustFraction(
      this.num * other.den + other.num * this.den,
      this.den * other.den
    );
  }

  subtract(other: RobustFraction): RobustFraction {
    return new RobustFraction(
      this.num * other.den - other.num * this.den,
      this.den * other.den
    );
  }

  multiply(other: RobustFraction): RobustFraction {
    return new RobustFraction(
      this.num * other.num,
      this.den * other.den
    );
  }

  divide(other: RobustFraction): RobustFraction {
    if (other.num === 0) {
      throw new Error('División por cero');
    }
    return new RobustFraction(
      this.num * other.den,
      this.den * other.num
    );
  }

  isZero(): boolean {
    return this.num === 0;
  }

  isOne(): boolean {
    return this.num === this.den;
  }

  toDecimal(): number {
    return this.num / this.den;
  }

  toString(): string {
    if (this.den === 1) return this.num.toString();
    return `${this.num}/${this.den}`;
  }

  abs(): RobustFraction {
    return new RobustFraction(Math.abs(this.num), this.den);
  }

  negate(): RobustFraction {
    return new RobustFraction(-this.num, this.den);
  }
}

export const parseChemicalEquation = (equation: string): EquationParseResult => {
  const validation = validateChemicalEquation(equation);
  if (!validation.isValid) {
    return {
      reactants: [],
      products: [],
      allElements: [],
      isValid: false,
      error: validation.errors.join('; ')
    };
  }

  const arrowPatterns = ['→', '->', '='];
  let arrowSymbol = '';
  let arrowIndex = -1;

  for (const arrow of arrowPatterns) {
    const index = equation.indexOf(arrow);
    if (index !== -1) {
      arrowSymbol = arrow;
      arrowIndex = index;
      break;
    }
  }

  if (arrowIndex === -1) {
    return {
      reactants: [],
      products: [],
      allElements: [],
      isValid: false,
      error: 'No se encontró símbolo de reacción válido'
    };
  }

  const reactantsStr = equation.substring(0, arrowIndex).trim();
  const productsStr = equation.substring(arrowIndex + arrowSymbol.length).trim();

  const reactants = parseCompoundsList(reactantsStr, 'reactants');
  if (!reactants.isValid) {
    return {
      reactants: [],
      products: [],
      allElements: [],
      isValid: false,
      error: reactants.error
    };
  }

  const products = parseCompoundsList(productsStr, 'products');
  if (!products.isValid) {
    return {
      reactants: [],
      products: [],
      allElements: [],
      isValid: false,
      error: products.error
    };
  }

  const allElements = getAllElements([...reactants.compounds, ...products.compounds]);

  return {
    reactants: reactants.compounds,
    products: products.compounds,
    allElements,
    isValid: true
  };
};

const parseCompoundsList = (
  compoundsStr: string,
  type: 'reactants' | 'products'
): { compounds: EquationCompound[]; isValid: boolean; error?: string } => {
  const compoundParts = compoundsStr.split('+').map(part => part.trim());
  const compounds: EquationCompound[] = [];

  for (const part of compoundParts) {
    if (!part) continue;

    const match = part.match(/^(\d*)\s*(.+)$/);
    if (!match) {
      return {
        compounds: [],
        isValid: false,
        error: `Formato inválido en ${type}: ${part}`
      };
    }

    const coefficientStr = match[1];
    const formula = match[2].trim();
    const coefficient = coefficientStr ? parseInt(coefficientStr, 10) : 1;

    if (coefficient <= 0 || coefficient > VALIDATION_LIMITS.MAX_COEFFICIENT) {
      return {
        compounds: [],
        isValid: false,
        error: `Coeficiente inválido: ${coefficient}`
      };
    }

    const parsedFormula = parseChemicalFormula(formula);
    if (!parsedFormula.isValid) {
      return {
        compounds: [],
        isValid: false,
        error: `Fórmula inválida en ${type}: ${formula}`
      };
    }

    compounds.push({
      formula,
      coefficient
    });
  }

  return { compounds, isValid: true };
};

const getAllElements = (compounds: readonly EquationCompound[]): readonly string[] => {
  const elementSet = new Set<string>();

  for (const compound of compounds) {
    const parsed = parseChemicalFormula(compound.formula);
    if (parsed.isValid) {
      parsed.elements.forEach(element => elementSet.add(element.symbol));
    }
  }

  return Array.from(elementSet).sort();
};

const countElementInSide = (
  compounds: readonly EquationCompound[],
  element: string
): number => {
  let totalCount = 0;

  for (const compound of compounds) {
    const parsed = parseChemicalFormula(compound.formula);
    if (parsed.isValid) {
      const elementData = parsed.elements.find(el => el.symbol === element);
      if (elementData) {
        totalCount += elementData.count * compound.coefficient;
      }
    }
  }

  return totalCount;
};

const getElementBalance = (
  reactants: readonly EquationCompound[],
  products: readonly EquationCompound[],
  allElements: readonly string[]
): readonly ElementBalance[] => {
  return allElements.map(element => {
    const reactantCount = countElementInSide(reactants, element);
    const productCount = countElementInSide(products, element);

    return {
      element,
      reactantCount,
      productCount,
      isBalanced: reactantCount === productCount
    };
  });
};

const isEquationBalanced = (balance: readonly ElementBalance[]): boolean => {
  return balance.every(item => item.isBalanced);
};

const getNextCombination = (
  coefficients: number[],
  maxCoeff: number
): boolean => {
  for (let i = coefficients.length - 1; i >= 0; i--) {
    if (coefficients[i] < maxCoeff) {
      coefficients[i]++;
      return true;
    } else {
      coefficients[i] = 1;
    }
  }
  return false;
};

const checkBalance = (
  reactants: readonly EquationCompound[],
  products: readonly EquationCompound[],
  reactantCoeffs: readonly number[],
  productCoeffs: readonly number[],
  allElements: readonly string[]
): boolean => {
  const tempReactants = reactants.map((compound, i) => ({
    ...compound,
    coefficient: reactantCoeffs[i]
  }));
  
  const tempProducts = products.map((compound, i) => ({
    ...compound,
    coefficient: productCoeffs[i]
  }));

  for (const element of allElements) {
    const reactantCount = countElementInSide(tempReactants, element);
    const productCount = countElementInSide(tempProducts, element);
    
    if (reactantCount !== productCount) {
      return false;
    }
  }
  
  return true;
};

const simplifyCoefficients = (coefficients: number[]): number[] => {
  const gcdValue = gcd(coefficients);
  return gcdValue > 1 
    ? coefficients.map(coeff => coeff / gcdValue)
    : coefficients;
};

export const balanceByTrialAndError = (
  equation: ChemicalEquation,
  maxIterations: number = 10000
): BalanceResult => {
  const steps: BalanceStep[] = [];
  let stepCounter = 1;

  steps.push({
    stepNumber: stepCounter++,
    description: 'Ecuación inicial sin balancear',
    equation: formatEquation(equation.reactants, equation.products)
  });

  const allElements = getAllElements([...equation.reactants, ...equation.products]);
  
  steps.push({
    stepNumber: stepCounter++,
    description: `Elementos presentes: ${allElements.join(', ')}`,
    equation: ''
  });

  const initialReactantCoeffs = new Array(equation.reactants.length).fill(1);
  const initialProductCoeffs = new Array(equation.products.length).fill(1);
  
  if (checkBalance(equation.reactants, equation.products, initialReactantCoeffs, initialProductCoeffs, allElements)) {
    steps.push({
      stepNumber: stepCounter++,
      description: 'La ecuación ya está balanceada con coeficientes 1',
      equation: formatEquation(equation.reactants, equation.products)
    });

    return {
      originalEquation: equation,
      balancedReactants: equation.reactants,
      balancedProducts: equation.products,
      balancedEquation: formatEquation(equation.reactants, equation.products),
      method: 'trial-and-error',
      steps,
      isValid: true
    };
  }

  const numReactants = equation.reactants.length;
  const numProducts = equation.products.length;
  const maxCoefficient = 15;
  
  const reactantCoeffs = new Array(numReactants).fill(1);
  const productCoeffs = new Array(numProducts).fill(1);
  
  let iteration = 0;
  let found = false;
  
  steps.push({
    stepNumber: stepCounter++,
    description: `Iniciando tanteo sistemático (máximo ${maxIterations} combinaciones)`,
    equation: ''
  });

  while (iteration < maxIterations && !found) {
    if (checkBalance(equation.reactants, equation.products, reactantCoeffs, productCoeffs, allElements)) {
      found = true;
      
      const allCoeffs = [...reactantCoeffs, ...productCoeffs];
      const simplified = simplifyCoefficients(allCoeffs);
      
      const finalReactantCoeffs = simplified.slice(0, numReactants);
      const finalProductCoeffs = simplified.slice(numReactants);
      
      const balancedReactants = equation.reactants.map((compound, i) => ({
        ...compound,
        coefficient: finalReactantCoeffs[i]
      }));
      
      const balancedProducts = equation.products.map((compound, i) => ({
        ...compound,
        coefficient: finalProductCoeffs[i]
      }));

      const finalBalance = getElementBalance(balancedReactants, balancedProducts, allElements);
      
      steps.push({
        stepNumber: stepCounter++,
        description: `¡Combinación encontrada en iteración ${iteration + 1}!`,
        equation: formatEquation(balancedReactants, balancedProducts),
        elementCount: createElementCountObject(finalBalance)
      });
      
      if (simplified !== allCoeffs) {
        steps.push({
          stepNumber: stepCounter++,
          description: `Coeficientes simplificados por MCD = ${gcd(allCoeffs)}`,
          equation: formatEquation(balancedReactants, balancedProducts)
        });
      }

      return {
        originalEquation: equation,
        balancedReactants,
        balancedProducts,
        balancedEquation: formatEquation(balancedReactants, balancedProducts),
        method: 'trial-and-error',
        steps,
        isValid: true
      };
    }
    
    if (!getNextCombination(productCoeffs, maxCoefficient)) {
      productCoeffs.fill(1);
      if (!getNextCombination(reactantCoeffs, maxCoefficient)) {
        break;
      }
    }
    
    iteration++;
    
    if (iteration % 1000 === 0) {
      steps.push({
        stepNumber: stepCounter++,
        description: `Progreso: ${iteration} combinaciones probadas...`,
        equation: ''
      });
    }
  }

  steps.push({
    stepNumber: stepCounter++,
    description: `No se encontró balance después de ${iteration} intentos`,
    equation: ''
  });

  return {
    originalEquation: equation,
    balancedReactants: equation.reactants,
    balancedProducts: equation.products,
    balancedEquation: '',
    method: 'trial-and-error',
    steps,
    isValid: false,
    error: `${ERROR_MESSAGES.BALANCE.CANNOT_BALANCE} (${iteration} combinaciones probadas)`
  };
};

function buildElementMatrix(
  equation: { reactants: readonly any[]; products: readonly any[] }
): { matrix: RobustFraction[][]; elements: string[]; compounds: string[]; steps: string[] } {
  const steps: string[] = [];
  const allCompounds = [...equation.reactants, ...equation.products];
  const compoundFormulas = allCompounds.map(c => c.formula);
  
  const elementSet = new Set<string>();
  const compoundElements: Array<Record<string, number>> = [];

  for (const compound of allCompounds) {
    const parsed = parseChemicalFormula(compound.formula);
    if (!parsed.isValid) {
      throw new Error(`No se pudo parsear: ${compound.formula}`);
    }
    
    const elementsDict: Record<string, number> = {};
    for (const element of parsed.elements) {
      elementsDict[element.symbol] = element.count;
      elementSet.add(element.symbol);
    }
    compoundElements.push(elementsDict);
  }

  const elements = Array.from(elementSet).sort();

  const matrix: RobustFraction[][] = [];
  
  for (const element of elements) {
    const row: RobustFraction[] = [];
    
    for (let i = 0; i < equation.reactants.length; i++) {
      const count = compoundElements[i][element] || 0;
      row.push(new RobustFraction(count));
    }
    
    for (let i = equation.reactants.length; i < allCompounds.length; i++) {
      const count = compoundElements[i][element] || 0;
      row.push(new RobustFraction(-count));
    }
    
    matrix.push(row);
    
    const rowStr = row.map(f => f.toString()).join('  ');
    steps.push(`${element}: [${rowStr}] = 0`);
  }

  return { matrix, elements, compounds: compoundFormulas, steps };
}

function gaussianEliminationRobust(
  matrix: RobustFraction[][],
  steps: string[]
): { reducedMatrix: RobustFraction[][]; rank: number; pivotCols: number[] } {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const workMatrix = matrix.map(row => row.map(f => new RobustFraction(f.num, f.den)));
  const pivotCols: number[] = [];
  
  
  let currentRow = 0;
  
  for (let col = 0; col < cols && currentRow < rows; col++) {
    let bestPivotRow = -1;
    let bestPivotValue = new RobustFraction(0);
    
    for (let row = currentRow; row < rows; row++) {
      if (workMatrix[row][col].abs().toDecimal() > bestPivotValue.abs().toDecimal()) {
        bestPivotRow = row;
        bestPivotValue = workMatrix[row][col];
      }
    }
    
    if (bestPivotRow === -1 || bestPivotValue.isZero()) {
      continue;
    }
    
    if (bestPivotRow !== currentRow) {
      [workMatrix[currentRow], workMatrix[bestPivotRow]] = 
      [workMatrix[bestPivotRow], workMatrix[currentRow]];
    }
    
    pivotCols.push(col);
    const pivotValue = workMatrix[currentRow][col];
    
    if (!pivotValue.isOne()) {
      for (let c = 0; c < cols; c++) {
        workMatrix[currentRow][c] = workMatrix[currentRow][c].divide(pivotValue);
      }
      steps.push(`F${currentRow + 1} = F${currentRow + 1} ÷ (${pivotValue.toString()})`);
    }
    
    for (let row = 0; row < rows; row++) {
      if (row !== currentRow && !workMatrix[row][col].isZero()) {
        const factor = workMatrix[row][col];
        for (let c = 0; c < cols; c++) {
          const subtraction = workMatrix[currentRow][c].multiply(factor);
          workMatrix[row][c] = workMatrix[row][c].subtract(subtraction);
        }
        steps.push(`F${row + 1} = F${row + 1} - (${factor.toString()}) × F${currentRow + 1}`);
      }
    }
    
    currentRow++;
  }
  
  const rank = pivotCols.length;
  
  return { reducedMatrix: workMatrix, rank, pivotCols };
}

function findNullSpace(
  reducedMatrix: RobustFraction[][],
  rank: number,
  pivotCols: number[],
  numVars: number,
  steps: string[]
): RobustFraction[] {
  
  const freeVars: number[] = [];
  const pivotVars: number[] = [...pivotCols];
  
  for (let i = 0; i < numVars; i++) {
    if (!pivotVars.includes(i)) {
      freeVars.push(i);
    }
  }
  
  let freeVarIndex = freeVars.length > 0 ? freeVars[0] : numVars - 1;
  
  const solution = new Array(numVars).fill(null).map(() => new RobustFraction(0));
  solution[freeVarIndex] = new RobustFraction(1);
    
  for (let i = rank - 1; i >= 0; i--) {
    const pivotCol = pivotCols[i];
    
    if (pivotCol === freeVarIndex) continue;
    
    let sum = new RobustFraction(0);
    for (let j = pivotCol + 1; j < numVars; j++) {
      sum = sum.add(reducedMatrix[i][j].multiply(solution[j]));
    }
    
    solution[pivotCol] = sum.negate();
    
    steps.push(`x${pivotCol + 1} = ${solution[pivotCol].toString()}`);
  }
  
  return solution;
}

function normalizeToPositiveIntegers(
  fractionSolution: RobustFraction[],
  steps: string[]
): number[] {  
  const allNegative = fractionSolution.every(f => f.num <= 0);
  if (allNegative) {
    fractionSolution = fractionSolution.map(f => f.negate());
  }
  
  const denominators = fractionSolution.map(f => f.den);
  const lcmValue = denominators.reduce((a, b) => lcm([a, b]), 1);
    
  const integers = fractionSolution.map(f => (f.num * lcmValue) / f.den);
  
  const positiveIntegers = integers.map(Math.abs).filter(x => x > 0);
  const gcdValue = positiveIntegers.length > 0 ? gcd(positiveIntegers) : 1;
  
  if (gcdValue > 1) {
    steps.push(`Simplificando por GCD = ${gcdValue}`);
  }
  
  const result = integers.map(x => Math.round(Math.abs(x) / gcdValue));
  
  return result;
}

function validateSolutionExhaustive(
  equation: { reactants: readonly any[]; products: readonly any[] },
  coefficients: number[],
  elements: string[],
  steps: string[]
): boolean {
    
  for (const element of elements) {
    let reactantCount = 0;
    let productCount = 0;
    
    for (let i = 0; i < equation.reactants.length; i++) {
      const parsed = parseChemicalFormula(equation.reactants[i].formula);
      if (parsed.isValid) {
        const elementData = parsed.elements.find(el => el.symbol === element);
        if (elementData) {
          reactantCount += elementData.count * coefficients[i];
        }
      }
    }
    
    for (let i = 0; i < equation.products.length; i++) {
      const parsed = parseChemicalFormula(equation.products[i].formula);
      if (parsed.isValid) {
        const elementData = parsed.elements.find(el => el.symbol === element);
        if (elementData) {
          productCount += elementData.count * coefficients[equation.reactants.length + i];
        }
      }
    }
    
    if (reactantCount !== productCount) {
      return false;
    } else {
      steps.push(`✅ ${element}: ${reactantCount} = ${productCount}`);
    }
  }
  
  return true;
}

export const balanceByAlgebraicMethodRobust = (
  equation: { reactants: readonly any[]; products: readonly any[] }
): BalanceResult => {
  const steps: BalanceStep[] = [];
  const allSteps: string[] = [];

  try {
    const { matrix, elements, compounds } = buildElementMatrix(equation);

    const { reducedMatrix, rank, pivotCols } = gaussianEliminationRobust(matrix, allSteps);

    const numVars = compounds.length;
    if (rank === numVars) {
      return createErrorResult(equation, 'algebraic', allSteps, 'Sistema sobredeterminado');
    }

    const fractionSolution = findNullSpace(reducedMatrix, rank, pivotCols, numVars, allSteps);

    const integerCoeffs = normalizeToPositiveIntegers(fractionSolution, allSteps);

    const isValid = validateSolutionExhaustive(equation, integerCoeffs, elements, allSteps);

    if (!isValid) {
      return createErrorResult(equation, 'algebraic', allSteps, 'La solución no balancea correctamente');
    }

    const reactantCoeffs = integerCoeffs.slice(0, equation.reactants.length);
    const productCoeffs = integerCoeffs.slice(equation.reactants.length);

    const balancedReactants = equation.reactants.map((compound, i) => ({
      ...compound,
      coefficient: reactantCoeffs[i]
    }));

    const balancedProducts = equation.products.map((compound, i) => ({
      ...compound,
      coefficient: productCoeffs[i]
    }));

    allSteps.forEach((step, index) => {
      steps.push({
        stepNumber: index + 1,
        description: step,
        equation: index === allSteps.length - 1 ? formatEquation(balancedReactants, balancedProducts) : ''
      });
    });

    return {
      originalEquation: equation,
      balancedReactants,
      balancedProducts,
      balancedEquation: formatEquation(balancedReactants, balancedProducts),
      method: 'algebraic',
      steps,
      isValid: true
    };

  } catch (error) {
    return createErrorResult(equation, 'algebraic', allSteps, `Error en método algebraico: ${error}`);
  }
};

function createErrorResult(
  equation: any,
  method: string,
  steps: string[],
  error: string
): BalanceResult {
  return {
    originalEquation: equation,
    balancedReactants: equation.reactants,
    balancedProducts: equation.products,
    balancedEquation: '',
    method: method as any,
    steps: steps.map((step, index) => ({
      stepNumber: index + 1,
      description: step,
      equation: ''
    })),
    isValid: false,
    error
  };
}

const formatEquation = (
  reactants: readonly EquationCompound[],
  products: readonly EquationCompound[]
): string => {
  const formatSide = (compounds: readonly EquationCompound[]) => {
    return compounds.map(compound => {
      const coeff = compound.coefficient === 1 ? '' : compound.coefficient.toString();
      return `${coeff}${compound.formula}`;
    }).join(' + ');
  };

  const reactantsStr = formatSide(reactants);
  const productsStr = formatSide(products);
  
  return `${reactantsStr} → ${productsStr}`;
};

const createElementCountObject = (
  balance: readonly ElementBalance[]
): Record<string, { left: number; right: number }> => {
  const result: Record<string, { left: number; right: number }> = {};
  
  balance.forEach(item => {
    result[item.element] = {
      left: item.reactantCount,
      right: item.productCount
    };
  });
  
  return result;
};

export const balanceChemicalEquation = (input: BalanceInput): BalanceResult => {
  const { equation, method = 'trial-and-error' } = input;

  const parseResult = parseChemicalEquation(equation);
  if (!parseResult.isValid) {
    return {
      originalEquation: { reactants: [], products: [] },
      balancedReactants: [],
      balancedProducts: [],
      balancedEquation: '',
      method,
      steps: [],
      isValid: false,
      error: parseResult.error
    };
  }

  const chemicalEquation: ChemicalEquation = {
    reactants: parseResult.reactants,
    products: parseResult.products
  };

  switch (method) {
    case 'trial-and-error':
      return balanceByTrialAndError(chemicalEquation);
    
    case 'algebraic':
      return balanceByAlgebraicMethodRobust(chemicalEquation);
    
    default:
      return {
        originalEquation: chemicalEquation,
        balancedReactants: [],
        balancedProducts: [],
        balancedEquation: '',
        method,
        steps: [],
        isValid: false,
        error: `Método de balance no soportado: ${method}`
      };
  }
};

export const validateBalancedEquation = (
  reactants: readonly EquationCompound[],
  products: readonly EquationCompound[]
): {
  isBalanced: boolean;
  elementBalance: readonly ElementBalance[];
  errors: readonly string[];
} => {
  const allElements = getAllElements([...reactants, ...products]);
  const balance = getElementBalance(reactants, products, allElements);
  const errors: string[] = [];

  const unbalancedElements = balance.filter(item => !item.isBalanced);
  
  if (unbalancedElements.length > 0) {
    unbalancedElements.forEach(item => {
      errors.push(
        `${item.element}: ${item.reactantCount} (reactivos) ≠ ${item.productCount} (productos)`
      );
    });
  }

  return {
    isBalanced: isEquationBalanced(balance),
    elementBalance: balance,
    errors
  };
};

export default {
  balanceChemicalEquation,
  
  parseChemicalEquation,
  
  balanceByTrialAndError,
  balanceByAlgebraicMethodRobust,
  
  validateBalancedEquation,
  
  formatEquation: (reactants: readonly EquationCompound[], products: readonly EquationCompound[]) => 
    formatEquation(reactants, products),
} as const;