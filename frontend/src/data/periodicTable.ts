import type { Element, ElementMap } from '../types/chemistry';
import periodicTableData from '../../../shared/periodic-table.json';

type PeriodicTableData = typeof periodicTableData;
type RawElement = PeriodicTableData['elements'][0];

const transformElement = (rawElement: RawElement): Element => ({
  symbol: rawElement.symbol,
  name: rawElement.name,
  number: rawElement.number,
  atomic_mass: rawElement.atomic_mass,
  group: rawElement.group,
  period: rawElement.period,
});

const createElementMap = (data: PeriodicTableData): ElementMap => {
  const elementMap: Record<string, Element> = {};
  
  for (const rawElement of data.elements) {
    const element = transformElement(rawElement);
    elementMap[element.symbol] = element;
  }
  
  return elementMap;
};

let loadedElementMap: ElementMap | null = null;

export const loadPeriodicTable = (): ElementMap => {
  if (loadedElementMap) {
    return loadedElementMap;
  }
  
  loadedElementMap = createElementMap(periodicTableData);
  return loadedElementMap;
};

export const getElementMap = (): ElementMap => {
  if (!loadedElementMap) {
    loadedElementMap = loadPeriodicTable();
  }
  return loadedElementMap;
};

export const getElement = (symbol: string): Element | undefined => {
  const elementMap = getElementMap();
  return elementMap[symbol];
};

export const isValidElement = (symbol: string): boolean => {
  return getElement(symbol) !== undefined;
};

export const getAllElementSymbols = (): readonly string[] => {
  const elementMap = getElementMap();
  return Object.keys(elementMap).sort();
};

export const getAllElements = (): readonly Element[] => {
  const elementMap = getElementMap();
  return Object.values(elementMap).sort((a, b) => a.number - b.number);
};

export const searchElementsByName = (query: string): readonly Element[] => {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const allElements = getAllElements();
  const normalizedQuery = query.toLowerCase().trim();
  
  return allElements.filter(element =>
    element.name.toLowerCase().includes(normalizedQuery) ||
    element.symbol.toLowerCase().includes(normalizedQuery)
  );
};

export const getElementsByPeriod = (period: number): readonly Element[] => {
  const allElements = getAllElements();
  return allElements.filter(element => element.period === period);
};

export const getElementsByGroup = (group: number): readonly Element[] => {
  const allElements = getAllElements();
  return allElements.filter(element => element.group === group);
};

export const getAtomicMass = (symbol: string): number | undefined => {
  const element = getElement(symbol);
  return element?.atomic_mass;
};

export const getElementsInfo = (symbols: readonly string[]): Record<string, Element | undefined> => {
  const result: Record<string, Element | undefined> = {};
  
  for (const symbol of symbols) {
    result[symbol] = getElement(symbol);
  }
  
  return result;
};

export const getPeriodicTableStats = () => {
  const elementMap = getElementMap();
  const elements = Object.values(elementMap);
  
  return {
    totalElements: elements.length,
    maxAtomicNumber: Math.max(...elements.map(e => e.number)),
    periodsRepresented: [...new Set(elements.map(e => e.period))].sort(),
    groupsRepresented: [...new Set(elements.map(e => e.group).filter(g => g !== undefined))].sort(),
    loadedFromJSON: true,
    dataSource: 'shared/periodic-table.json'
  };
};

export const validatePeriodicTableData = (): readonly string[] => {
  const errors: string[] = [];
  const elementMap = getElementMap();
  const elements = Object.values(elementMap);
  
  for (const element of elements) {
    if (!element.symbol || element.symbol.length === 0) {
      errors.push(`Elemento sin símbolo: ${element.name}`);
    }
    
    if (!element.name || element.name.length === 0) {
      errors.push(`Elemento sin nombre: ${element.symbol}`);
    }
    
    if (!element.number || element.number <= 0) {
      errors.push(`Número atómico inválido para ${element.symbol}: ${element.number}`);
    }
    
    if (!element.atomic_mass || element.atomic_mass <= 0) {
      errors.push(`Masa atómica inválida para ${element.symbol}: ${element.atomic_mass}`);
    }
  }
  
  return errors;
};

export const resetElementMap = (): void => {
  loadedElementMap = null;
};

export default {
  getElement,
  isValidElement,
  getAtomicMass,
  getAllElementSymbols,
  getAllElements,
  getElementMap,
  searchElementsByName,
} as const;