import { 
  getCompoundByFormula,
  searchCompounds,
  autocompleteFormulas,
  getSimilarFormulas,
  getCompoundsByCategory,
  getBasicCompounds,
  getAllCategories,
} from '../../data/commonFormulas';
import { validateChemicalFormula } from './validator';

import type {
  ProcessedCompound,
  FormulaCategory,
  FormulaSuggestion,
  ValidationWithSuggestions,
  SuggestionOptions
} from '../../types/chemistry';

export const getSmartSuggestions = (
  input: string,
  options: SuggestionOptions = {}
): readonly FormulaSuggestion[] => {
  const {
    maxSuggestions = 10,
    includePopular = true,
    categoryFilter,
    minConfidence = 0.3
  } = options;
  
  if (!input || input.trim().length === 0) {
    return includePopular ? getPopularFormulaSuggestions(maxSuggestions) : [];
  }
  
  const cleanInput = input.trim();
  const suggestions: FormulaSuggestion[] = [];
  
  const exactMatch = getCompoundByFormula(cleanInput);
  if (exactMatch) {
    suggestions.push({
      formula: exactMatch.formula,
      name: exactMatch.name,
      commonName: exactMatch.commonName,
      category: exactMatch.categoryName,
      type: 'exact',
      confidence: 1.0
    });
  }
  
  const prefixMatches = autocompleteFormulas(cleanInput, maxSuggestions);
  for (const formula of prefixMatches) {
    if (suggestions.some(s => s.formula === formula)) continue;
    
    const compound = getCompoundByFormula(formula);
    if (compound && (!categoryFilter || compound.categoryId === categoryFilter)) {
      suggestions.push({
        formula: compound.formula,
        name: compound.name,
        commonName: compound.commonName,
        category: compound.categoryName,
        type: 'prefix',
        confidence: 0.8
      });
    }
  }
  
  if (suggestions.length < maxSuggestions) {
    const similarCompounds = getSimilarFormulas(cleanInput, maxSuggestions - suggestions.length);
    for (const compound of similarCompounds) {
      if (suggestions.some(s => s.formula === compound.formula)) continue;
      if (categoryFilter && compound.categoryId !== categoryFilter) continue;
      
      suggestions.push({
        formula: compound.formula,
        name: compound.name,
        commonName: compound.commonName,
        category: compound.categoryName,
        type: 'similar',
        confidence: 0.6
      });
    }
  }
  
  if (suggestions.length < maxSuggestions) {
    const searchResults = searchCompounds(cleanInput, {
      categoryId: categoryFilter,
      limit: maxSuggestions - suggestions.length
    });
    
    for (const compound of searchResults.compounds) {
      if (suggestions.some(s => s.formula === compound.formula)) continue;
      
      suggestions.push({
        formula: compound.formula,
        name: compound.name,
        commonName: compound.commonName,
        category: compound.categoryName,
        type: 'similar',
        confidence: 0.5
      });
    }
  }
  
  return suggestions
    .filter(s => s.confidence >= minConfidence)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxSuggestions);
};

export const getPopularFormulaSuggestions = (limit: number = 10): readonly FormulaSuggestion[] => {
  const basicCompounds = getBasicCompounds();
  
  return basicCompounds
    .slice(0, limit)
    .map(compound => ({
      formula: compound.formula,
      name: compound.name,
      commonName: compound.commonName,
      category: compound.categoryName,
      type: 'popular' as const,
      confidence: 0.9
    }));
};

export const getSuggestionsByCategory = (
  categoryId: string,
  limit: number = 15
): readonly FormulaSuggestion[] => {
  const compounds = getCompoundsByCategory(categoryId);
  
  return compounds
    .slice(0, limit)
    .map(compound => ({
      formula: compound.formula,
      name: compound.name,
      commonName: compound.commonName,
      category: compound.categoryName,
      type: 'popular' as const,
      confidence: 0.8
    }));
};

export const validateWithSuggestions = (formula: string): ValidationWithSuggestions => {
  const validation = validateChemicalFormula(formula);
  const knownCompound = getCompoundByFormula(formula);
  
  const warnings: string[] = [...(validation.warnings || [])];
  
  if (validation.isValid && !knownCompound) {
    warnings.push('Esta fórmula no se encuentra en nuestra base de datos de compuestos comunes');
  }
  
  let suggestions: FormulaSuggestion[] = [];
  
  if (!validation.isValid) {
    suggestions = getSmartSuggestions(formula, {
      maxSuggestions: 5,
      includePopular: false,
      minConfidence: 0.4
    }) as FormulaSuggestion[];
  }
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    warnings,
    suggestions,
    knownCompound
  };
};

export const suggestCorrections = (formula: string): readonly FormulaSuggestion[] => {
  if (!formula || formula.trim().length === 0) return [];
  
  const cleanFormula = formula.trim();
  const suggestions: FormulaSuggestion[] = [];
  
  const commonCorrections: Record<string, string> = {
    'h2o': 'H2O',
    'co2': 'CO2',
    'nacl': 'NaCl',
    'caso4': 'CaSO4',
    'h2so4': 'H2SO4',
    'hcl': 'HCl',
    'nh3': 'NH3',
    'ch4': 'CH4',
    
    'H20': 'H2O',
    'SO4': 'SO42-',
    'CO3': 'CO32-',
    'PO4': 'PO43-',
    
    'H2O2': 'H2O2',
    'Ca(OH)2': 'Ca(OH)2',
  };
  
  const directCorrection = commonCorrections[cleanFormula.toLowerCase()];
  if (directCorrection) {
    const compound = getCompoundByFormula(directCorrection);
    if (compound) {
      suggestions.push({
        formula: compound.formula,
        name: compound.name,
        commonName: compound.commonName,
        category: compound.categoryName,
        type: 'similar',
        confidence: 0.9
      });
    }
  }
  
  if (suggestions.length === 0) {
    const similar = getSimilarFormulas(cleanFormula, 3);
    suggestions.push(...similar.map(compound => ({
      formula: compound.formula,
      name: compound.name,
      commonName: compound.commonName,
      category: compound.categoryName,
      type: 'similar' as const,
      confidence: 0.7
    })));
  }
  
  return suggestions;
};

export const filterSuggestionsByType = (
  suggestions: readonly FormulaSuggestion[],
  type: string
): readonly FormulaSuggestion[] => {
  return suggestions.filter(suggestion => {
    const compound = getCompoundByFormula(suggestion.formula);
    return compound?.type === type;
  });
};

export const groupSuggestionsByCategory = (
  suggestions: readonly FormulaSuggestion[]
): Record<string, readonly FormulaSuggestion[]> => {
  const grouped: Record<string, FormulaSuggestion[]> = {};
  
  for (const suggestion of suggestions) {
    const compound = getCompoundByFormula(suggestion.formula);
    if (compound) {
      const categoryId = compound.categoryId;
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(suggestion);
    }
  }
  
  const result: Record<string, readonly FormulaSuggestion[]> = {};
  for (const [key, value] of Object.entries(grouped)) {
    result[key] = value;
  }
  
  return result;
};

export const getFormulaExamples = (): {
  basic: readonly FormulaSuggestion[];
  organic: readonly FormulaSuggestion[];
  acids: readonly FormulaSuggestion[];
  salts: readonly FormulaSuggestion[];
} => {
  const basicCompounds = getSuggestionsByCategory('basic_compounds', 5);
  const organicCompounds = getSuggestionsByCategory('organic_compounds', 5);
  const acidsCompounds = getSuggestionsByCategory('acids_bases', 5);
  const saltsCompounds = getSuggestionsByCategory('inorganic_salts', 5);
  
  return {
    basic: basicCompounds,
    organic: organicCompounds,
    acids: acidsCompounds,
    salts: saltsCompounds
  };
};

export const searchByCommonName = (commonName: string): readonly FormulaSuggestion[] => {
  if (!commonName || commonName.trim().length === 0) return [];
  
  const searchResults = searchCompounds(commonName, { limit: 10 });
  
  return searchResults.compounds.map(compound => ({
    formula: compound.formula,
    name: compound.name,
    commonName: compound.commonName,
    category: compound.categoryName,
    type: 'similar' as const,
    confidence: 0.8
  }));
};

export const getFormulaContext = (formula: string): {
  compound?: ProcessedCompound;
  relatedFormulas: readonly FormulaSuggestion[];
  categoryInfo?: FormulaCategory;
} => {
  const compound = getCompoundByFormula(formula);
  const categories = getAllCategories();
  
  let relatedFormulas: FormulaSuggestion[] = [];
  let categoryInfo: FormulaCategory | undefined;
  
  if (compound) {
    const categoryCompounds = getCompoundsByCategory(compound.categoryId);
    relatedFormulas = categoryCompounds
      .filter(c => c.formula !== formula)
      .slice(0, 5)
      .map(c => ({
        formula: c.formula,
        name: c.name,
        commonName: c.commonName,
        category: c.categoryName,
        type: 'similar' as const,
        confidence: 0.7
      }));
    
    categoryInfo = categories.find(cat => cat.id === compound.categoryId);
  }
  
  return {
    compound,
    relatedFormulas,
    categoryInfo
  };
};

export const getPersonalizedSuggestions = (
  recentFormulas: readonly string[] = [],
  limit: number = 8
): readonly FormulaSuggestion[] => {
  const suggestions: FormulaSuggestion[] = [];
  
  for (const formula of recentFormulas.slice(0, 3)) {
    const compound = getCompoundByFormula(formula);
    if (compound) {
      suggestions.push({
        formula: compound.formula,
        name: compound.name,
        commonName: compound.commonName,
        category: compound.categoryName,
        type: 'popular',
        confidence: 0.95
      });
    }
  }
  
  if (suggestions.length < limit) {
    const popularSuggestions = getPopularFormulaSuggestions(limit - suggestions.length);
    for (const suggestion of popularSuggestions) {
      if (!suggestions.some(s => s.formula === suggestion.formula)) {
        suggestions.push(suggestion);
      }
    }
  }
  
  return suggestions.slice(0, limit);
};

export default {
  getSmartSuggestions,
  getPopularFormulaSuggestions,
  getSuggestionsByCategory,
  
  validateWithSuggestions,
  suggestCorrections,
  
  searchByCommonName,
  filterSuggestionsByType,
  groupSuggestionsByCategory,
  
  getFormulaContext,
  getFormulaExamples,
  getPersonalizedSuggestions,
} as const;