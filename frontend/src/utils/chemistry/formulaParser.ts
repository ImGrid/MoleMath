import type { ParsedFormula, ParsedElement } from '../../types/chemistry';
import { VALIDATION_PATTERNS, ERROR_MESSAGES, VALIDATION_LIMITS } from '../../constants/chemical';
import { isValidElement } from '../../data/periodicTable';

import type {
  Token,
  ParseResult
} from '../../types/chemistry';

const tokenize = (formula: string): readonly Token[] => {
  
  const tokens: Token[] = [];
  let position = 0;
  
  while (position < formula.length) {
    const char = formula[position];
    
    if (/[A-Z]/.test(char)) {
      let element = char;
      if (position + 1 < formula.length && /[a-z]/.test(formula[position + 1])) {
        element += formula[position + 1];
        position++;
      }
      tokens.push({ type: 'element', value: element, position });
    }
    else if (/\d/.test(char)) {
      let number = char;
      while (position + 1 < formula.length && /\d/.test(formula[position + 1])) {
        position++;
        number += formula[position];
      }
      tokens.push({ type: 'number', value: number, position });
    }
    else if (char === '(') {
      tokens.push({ type: 'open-paren', value: char, position });
    }
    else if (char === ')') {
      tokens.push({ type: 'close-paren', value: char, position });
    }
    else if (/\s/.test(char)) {
    }
    else {
      return [];
    }
    
    position++;
  }
  
  return tokens;
};

class FormulaParser {
  private tokens: readonly Token[];
  private position: number;
  
  constructor(tokens: readonly Token[]) {
    this.tokens = tokens;
    this.position = 0;
  }
  
  parse(): ParseResult {
    try {
      const elements = this.parseGroup();
      
      if (this.position < this.tokens.length) {
        return {
          elements: {},
          isValid: false,
          error: ERROR_MESSAGES.PARSING.INVALID_SYNTAX
        };
      }
      
      return {
        elements,
        isValid: true
      };
    } catch (error) {
      return {
        elements: {},
        isValid: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.PARSING.INVALID_SYNTAX
      };
    }
  }
  
  private parseGroup(): Record<string, number> {
    const elements: Record<string, number> = {};
    
    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position];
      
      if (token.type === 'element') {
        this.parseElement(elements);
      } else if (token.type === 'open-paren') {
        this.parseParentheses(elements);
      } else if (token.type === 'close-paren') {
        break;
      } else {
        throw new Error(ERROR_MESSAGES.PARSING.INVALID_SYNTAX);
      }
    }
    
    return elements;
  }
  
  private parseElement(elements: Record<string, number>): void {
    const elementToken = this.tokens[this.position];
    this.position++;
    
    if (!isValidElement(elementToken.value)) {
      throw new Error(`${ERROR_MESSAGES.PARSING.INVALID_ELEMENT}: ${elementToken.value}`);
    }
    
    let count = 1;
    if (this.position < this.tokens.length && this.tokens[this.position].type === 'number') {
      count = parseInt(this.tokens[this.position].value, 10);
      this.position++;
      
      if (count <= 0 || count > VALIDATION_LIMITS.MAX_ATOMS_PER_MOLECULE) {
        throw new Error(ERROR_MESSAGES.VALIDATION.VALUE_TOO_LARGE);
      }
    }
    
    elements[elementToken.value] = (elements[elementToken.value] || 0) + count;
  }
  
  private parseParentheses(elements: Record<string, number>): void {
    this.position++;
    
    const groupElements = this.parseGroup();
    
    if (this.position >= this.tokens.length || this.tokens[this.position].type !== 'close-paren') {
      throw new Error(ERROR_MESSAGES.PARSING.INVALID_SYNTAX);
    }
    this.position++;
    
    let multiplier = 1;
    if (this.position < this.tokens.length && this.tokens[this.position].type === 'number') {
      multiplier = parseInt(this.tokens[this.position].value, 10);
      this.position++;
      
      if (multiplier <= 0 || multiplier > VALIDATION_LIMITS.MAX_ATOMS_PER_MOLECULE) {
        throw new Error(ERROR_MESSAGES.VALIDATION.VALUE_TOO_LARGE);
      }
    }
    
    for (const [element, count] of Object.entries(groupElements)) {
      elements[element] = (elements[element] || 0) + (count * multiplier);
    }
  }
}

export const parseChemicalFormula = (formula: string): ParsedFormula => {
  if (!formula || formula.trim().length === 0) {
    return {
      elements: [],
      formula: '',
      isValid: false,
      error: ERROR_MESSAGES.PARSING.EMPTY_FORMULA
    };
  }
  
  const cleanFormula = formula.trim();
  
  if (cleanFormula.length > VALIDATION_LIMITS.MAX_FORMULA_LENGTH) {
    return {
      elements: [],
      formula: cleanFormula,
      isValid: false,
      error: ERROR_MESSAGES.PARSING.FORMULA_TOO_LONG
    };
  }
  
  const tokens = tokenize(cleanFormula);
  if (tokens.length === 0) {
    return {
      elements: [],
      formula: cleanFormula,
      isValid: false,
      error: ERROR_MESSAGES.PARSING.INVALID_SYNTAX
    };
  }
  
  const parser = new FormulaParser(tokens);
  const parseResult = parser.parse();
  
  if (!parseResult.isValid) {
    return {
      elements: [],
      formula: cleanFormula,
      isValid: false,
      error: parseResult.error
    };
  }
  
  const elements: ParsedElement[] = Object.entries(parseResult.elements).map(([symbol, count]) => ({
    symbol,
    count
  }));
  
  const totalAtoms = elements.reduce((sum, element) => sum + element.count, 0);
  if (totalAtoms > VALIDATION_LIMITS.MAX_ATOMS_PER_MOLECULE) {
    return {
      elements: [],
      formula: cleanFormula,
      isValid: false,
      error: ERROR_MESSAGES.VALIDATION.VALUE_TOO_LARGE
    };
  }
  
  return {
    elements,
    formula: cleanFormula,
    isValid: true
  };
};

export const validateFormulaSyntax = (formula: string): boolean => {
  
  if (!formula || formula.trim().length === 0) {
    return false;
  }
  
  const cleanFormula = formula.trim();
  
  if (!VALIDATION_PATTERNS.BASIC_FORMULA.test(cleanFormula)) {
    return false;
  }
  
  
  let parenCount = 0;
  for (const char of cleanFormula) {
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (parenCount < 0) {
      return false;
    }
  }
  
  const result = parenCount === 0;  
  return result;
};

export const normalizeFormula = (formula: string): string => {
  if (!formula) return '';
  
  let normalized = formula.trim().replace(/\s+/g, '');
  
  if (!/^[A-Za-z0-9()]+$/.test(normalized)) {
    return '';
  }
  
  return normalized;
};

export const extractElements = (formula: string): readonly string[] => {
  const parsed = parseChemicalFormula(formula);
  if (!parsed.isValid) return [];
  
  return parsed.elements.map(element => element.symbol);
};

export const getTotalAtomCount = (formula: string): number => {
  const parsed = parseChemicalFormula(formula);
  if (!parsed.isValid) return 0;
  
  return parsed.elements.reduce((total, element) => total + element.count, 0);
};

export const containsElement = (formula: string, elementSymbol: string): boolean => {
  const elements = extractElements(formula);
  return elements.includes(elementSymbol);
};

export const getElementCount = (formula: string, elementSymbol: string): number => {
  const parsed = parseChemicalFormula(formula);
  if (!parsed.isValid) return 0;
  
  const element = parsed.elements.find(el => el.symbol === elementSymbol);
  return element ? element.count : 0;
};

export const formulasHaveSameElements = (formula1: string, formula2: string): boolean => {
  const elements1 = new Set(extractElements(formula1));
  const elements2 = new Set(extractElements(formula2));
  
  if (elements1.size !== elements2.size) return false;
  
  for (const element of elements1) {
    if (!elements2.has(element)) return false;
  }
  
  return true;
};

export const multiplyFormula = (formula: string, coefficient: number): ParsedElement[] => {
  const parsed = parseChemicalFormula(formula);
  if (!parsed.isValid || coefficient <= 0) return [];
  
  return parsed.elements.map(element => ({
    symbol: element.symbol,
    count: element.count * coefficient
  }));
};

export const combineFormulas = (formulas: readonly { formula: string; coefficient: number }[]): ParsedElement[] => {
  const combinedElements: Record<string, number> = {};
  
  for (const { formula, coefficient } of formulas) {
    const elements = multiplyFormula(formula, coefficient);
    
    for (const element of elements) {
      combinedElements[element.symbol] = (combinedElements[element.symbol] || 0) + element.count;
    }
  }
  
  return Object.entries(combinedElements).map(([symbol, count]) => ({
    symbol,
    count
  }));
};

export const getParsingDebugInfo = (formula: string) => {
  const tokens = tokenize(formula);
  const parseResult = parseChemicalFormula(formula);
  
  return {
    originalFormula: formula,
    normalizedFormula: normalizeFormula(formula),
    tokens: tokens.map(token => ({ ...token })),
    parseResult,
    isValidSyntax: validateFormulaSyntax(formula),
    totalAtoms: getTotalAtomCount(formula),
    uniqueElements: extractElements(formula),
  };
};

export default {
  parseChemicalFormula,
  validateFormulaSyntax,
  normalizeFormula,
  extractElements,
  getTotalAtomCount,
  containsElement,
  getElementCount,
  formulasHaveSameElements,
  multiplyFormula,
  combineFormulas,
} as const;