import type {  CompoundType, PhysicalState, FormulaCategory, ProcessedCompound, FormulaSearchResult } from '../types/chemistry';
import formulasData from '../../../shared/chemical-formulas.json';

type FormulasData = typeof formulasData;
type CompoundGroup = FormulasData['compounds'][0];
type RawCompound = CompoundGroup['compounds'][0];


const transformCompound = (rawCompound: RawCompound, categoryId: string, categoryName: string): ProcessedCompound => ({
  name: rawCompound.name,
  formula: rawCompound.formula,
  type: rawCompound.type as CompoundType,
  state: rawCompound.state as PhysicalState,
  commonName: rawCompound.common_name,
  category: categoryId,
  categoryId,
  categoryName
});

const CATEGORY_NAMES: Record<string, string> = {
  basic_compounds: 'Compuestos Básicos',
  acids_bases: 'Ácidos y Bases',
  organic_compounds: 'Compuestos Orgánicos',
  inorganic_salts: 'Sales Inorgánicas',
  biological_compounds: 'Compuestos Biológicos',
  pharmaceutical_compounds: 'Compuestos Farmacéuticos',
  laboratory_reagents: 'Reactivos de Laboratorio',
  gases: 'Gases',
  polymers: 'Polímeros',
  minerals: 'Minerales',
  environmental: 'Compuestos Ambientales'
};

const processCategories = (): readonly FormulaCategory[] => {
  const categories: FormulaCategory[] = [];
  
  for (const [id, info] of Object.entries(formulasData.categories)) {
    categories.push({
      id,
      name: CATEGORY_NAMES[id] || id,
      description: info.description,
      count: info.count
    });
  }
  
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
};

const processCompounds = (): readonly ProcessedCompound[] => {
  const allCompounds: ProcessedCompound[] = [];
  
  for (const group of formulasData.compounds) {
    const categoryId = group.category;
    const categoryName = CATEGORY_NAMES[categoryId] || categoryId;
    
    for (const compound of group.compounds) {
      allCompounds.push(transformCompound(compound, categoryId, categoryName));
    }
  }
  
  return allCompounds.sort((a, b) => a.name.localeCompare(b.name));
};

let processedCategories: readonly FormulaCategory[] | null = null;
let processedCompounds: readonly ProcessedCompound[] | null = null;
let compoundsByFormula: Map<string, ProcessedCompound> | null = null;
let compoundsByCategory: Map<string, readonly ProcessedCompound[]> | null = null;

const initializeCache = (): void => {
  if (processedCategories && processedCompounds) return;
  
  processedCategories = processCategories();
  processedCompounds = processCompounds();
  
  compoundsByFormula = new Map();
  compoundsByCategory = new Map();
  
  for (const compound of processedCompounds) {
    compoundsByFormula.set(compound.formula.toLowerCase(), compound);
    
    const categoryCompounds = compoundsByCategory.get(compound.categoryId) || [];
    compoundsByCategory.set(compound.categoryId, [...categoryCompounds, compound]);
  }
};

export const getAllCategories = (): readonly FormulaCategory[] => {
  initializeCache();
  return processedCategories!;
};

export const getAllCompounds = (): readonly ProcessedCompound[] => {
  initializeCache();
  return processedCompounds!;
};

export const getCompoundByFormula = (formula: string): ProcessedCompound | undefined => {
  initializeCache();
  return compoundsByFormula!.get(formula.toLowerCase());
};

export const isKnownFormula = (formula: string): boolean => {
  return getCompoundByFormula(formula) !== undefined;
};

export const getCompoundsByCategory = (categoryId: string): readonly ProcessedCompound[] => {
  initializeCache();
  return compoundsByCategory!.get(categoryId) || [];
};

export const getCategoryInfo = (categoryId: string): FormulaCategory | undefined => {
  const categories = getAllCategories();
  return categories.find(cat => cat.id === categoryId);
};

export const getBasicCompounds = (): readonly ProcessedCompound[] => {
  return getCompoundsByCategory('basic_compounds');
};

export const getCompoundsByType = (type: string): readonly ProcessedCompound[] => {
  const allCompounds = getAllCompounds();
  return allCompounds.filter(compound => compound.type === type);
};

export const getCompoundsByState = (state: string): readonly ProcessedCompound[] => {
  const allCompounds = getAllCompounds();
  return allCompounds.filter(compound => compound.state === state);
};

export const searchCompounds = (
  query: string,
  options: {
    categoryId?: string;
    type?: string;
    state?: string;
    limit?: number;
  } = {}
): FormulaSearchResult => {
  const { categoryId, type, state, limit = 50 } = options;
  
  if (!query || query.trim().length === 0) {
    return {
      compounds: [],
      totalResults: 0,
      categories: [],
      searchTerm: query
    };
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  let compounds = getAllCompounds();
  
  if (categoryId) {
    compounds = getCompoundsByCategory(categoryId);
  }
  
  let results = compounds.filter(compound => {
    const matchesName = compound.name.toLowerCase().includes(normalizedQuery);
    const matchesFormula = compound.formula.toLowerCase().includes(normalizedQuery);
    const matchesCommon = compound.commonName?.toLowerCase().includes(normalizedQuery);
    
    return matchesName || matchesFormula || matchesCommon;
  });
  
  if (type) {
    results = results.filter(compound => compound.type === type);
  }
  
  if (state) {
    results = results.filter(compound => compound.state === state);
  }
  
  results.sort((a, b) => {
    const aExact = a.formula.toLowerCase() === normalizedQuery || a.name.toLowerCase() === normalizedQuery;
    const bExact = b.formula.toLowerCase() === normalizedQuery || b.name.toLowerCase() === normalizedQuery;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    return a.name.localeCompare(b.name);
  });
  
  const limitedResults = results.slice(0, limit);
  const categories = [...new Set(limitedResults.map(c => c.categoryId))];
  
  return {
    compounds: limitedResults,
    totalResults: results.length,
    categories,
    searchTerm: query
  };
};

export const autocompleteFormulas = (prefix: string, limit: number = 10): readonly string[] => {
  if (!prefix || prefix.trim().length === 0) return [];
  
  const normalizedPrefix = prefix.toLowerCase().trim();
  const allCompounds = getAllCompounds();
  
  const matchingFormulas = allCompounds
    .filter(compound => compound.formula.toLowerCase().startsWith(normalizedPrefix))
    .map(compound => compound.formula)
    .slice(0, limit);
  
  return [...new Set(matchingFormulas)];
};

export const getSimilarFormulas = (formula: string, limit: number = 5): readonly ProcessedCompound[] => {
  if (!formula || formula.trim().length === 0) return [];
  
  const normalizedFormula = formula.toLowerCase().trim();
  const allCompounds = getAllCompounds();
  
  const similar = allCompounds.filter(compound => {
    const compoundFormula = compound.formula.toLowerCase();
    
    if (Math.abs(compoundFormula.length - normalizedFormula.length) > 2) return false;
    
    let differences = 0;
    const maxLength = Math.max(compoundFormula.length, normalizedFormula.length);
    
    for (let i = 0; i < maxLength; i++) {
      const char1 = compoundFormula[i] || '';
      const char2 = normalizedFormula[i] || '';
      if (char1 !== char2) differences++;
      if (differences > 2) return false;
    }
    
    return differences > 0 && differences <= 2;
  });
  
  return similar.slice(0, limit);
};

export const getFormulasStats = () => {
  const categories = getAllCategories();
  const compounds = getAllCompounds();
  
  const typeStats = compounds.reduce((stats, compound) => {
    stats[compound.type] = (stats[compound.type] || 0) + 1;
    return stats;
  }, {} as Record<string, number>);
  
  const stateStats = compounds.reduce((stats, compound) => {
    stats[compound.state] = (stats[compound.state] || 0) + 1;
    return stats;
  }, {} as Record<string, number>);
  
  return {
    totalCompounds: compounds.length,
    totalCategories: categories.length,
    version: formulasData.metadata.version,
    description: formulasData.metadata.description,
    typeDistribution: typeStats,
    stateDistribution: stateStats,
    largestCategory: categories.reduce((largest, current) => 
      current.count > largest.count ? current : largest
    ),
    dataSource: 'shared/chemical-formulas.json'
  };
};

export const validateFormulasData = (): readonly string[] => {
  const errors: string[] = [];
  const categories = getAllCategories();
  const compounds = getAllCompounds();
  
  for (const category of categories) {
    const categoryCompounds = getCompoundsByCategory(category.id);
    if (categoryCompounds.length === 0) {
      errors.push(`Categoría ${category.name} no tiene compuestos`);
    }
    
    if (categoryCompounds.length !== category.count) {
      errors.push(`Categoría ${category.name}: conteo esperado ${category.count}, actual ${categoryCompounds.length}`);
    }
  }
  
  const formulas = new Set<string>();
  for (const compound of compounds) {
    if (formulas.has(compound.formula)) {
      errors.push(`Fórmula duplicada encontrada: ${compound.formula}`);
    }
    formulas.add(compound.formula);
  }
  
  return errors;
};

export default {
  getAllCategories,
  getAllCompounds,
  getCompoundByFormula,
  isKnownFormula,
  getCompoundsByCategory,
  
  searchCompounds,
  autocompleteFormulas,
  getSimilarFormulas,
  
  getCompoundsByType,
  getCompoundsByState,
  getBasicCompounds,
  
  getFormulasStats,
  getCategoryInfo,
} as const;