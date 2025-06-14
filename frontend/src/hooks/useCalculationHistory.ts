import { useCallback, useMemo, useRef } from 'react';
import { useLocalStorageArray } from './useLocalStorage';
import type { 
  MolarMassResult, 
  ConversionResult, 
  CalculationEntry,
  CalculationFilters,
  CalculationStats
} from '../types/chemistry';

function generateCalculationId(): string {
  return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function isValidCalculationEntry(calc: unknown): calc is CalculationEntry {
  return (
    calc !== null &&
    typeof calc === 'object' &&
    'id' in calc &&
    'type' in calc &&
    'formula' in calc &&
    'result' in calc &&
    'timestamp' in calc &&
    'isFavorite' in calc &&
    'tags' in calc
  );
}

function getDateRanges() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return { today, weekAgo };
}

export const useCalculationHistory = () => {
  const {
    items: history,
    addItem,
    removeItem,
    updateItem,
    clear,
    isLoading,
    error
  } = useLocalStorageArray<CalculationEntry>('calculation-history');

  const lastStatsHistoryRef = useRef<readonly CalculationEntry[]>([]);
  const cachedStatsRef = useRef<CalculationStats | null>(null);


  const addCalculation = useCallback((
    type: CalculationEntry['type'],
    formula: string,
    result: CalculationEntry['result'],
    options: {
      readonly notes?: string;
      readonly tags?: readonly string[];
      readonly metadata?: CalculationEntry['metadata'];
    } = {}
  ): string => {
    const { notes, tags = [], metadata } = options;
    
    const entry: CalculationEntry = {
      id: generateCalculationId(),
      type,
      formula,
      result,
      timestamp: Date.now(),
      isFavorite: false,
      notes,
      tags,
      metadata
    };

    addItem(entry);
    return entry.id;
  }, [addItem]);

  const updateCalculation = useCallback((
    id: string,
    updates: Partial<Pick<CalculationEntry, 'notes' | 'tags' | 'isFavorite'>>
  ): boolean => {
    const index = history.findIndex(item => item.id === id);
    if (index === -1) return false;

    const updatedEntry: CalculationEntry = {
      ...history[index],
      ...updates
    };
    
    updateItem(index, updatedEntry);
    return true;
  }, [history, updateItem]);

  const toggleFavorite = useCallback((id: string): boolean => {
    const index = history.findIndex(item => item.id === id);
    if (index === -1) return false;

    const updatedEntry: CalculationEntry = {
      ...history[index],
      isFavorite: !history[index].isFavorite
    };
    
    updateItem(index, updatedEntry);
    return true;
  }, [history, updateItem]);

  const addTag = useCallback((id: string, tag: string): boolean => {
    const index = history.findIndex(item => item.id === id);
    if (index === -1) return false;

    const currentTags = history[index].tags;
    if (currentTags.includes(tag)) return false;

    const updatedEntry: CalculationEntry = {
      ...history[index],
      tags: [...currentTags, tag]
    };
    
    updateItem(index, updatedEntry);
    return true;
  }, [history, updateItem]);

  const removeTag = useCallback((id: string, tag: string): boolean => {
    const index = history.findIndex(item => item.id === id);
    if (index === -1) return false;

    const currentTags = history[index].tags;
    const newTags = currentTags.filter(t => t !== tag);
    
    if (newTags.length === currentTags.length) return false;

    const updatedEntry: CalculationEntry = {
      ...history[index],
      tags: newTags
    };
    
    updateItem(index, updatedEntry);
    return true;
  }, [history, updateItem]);

  const removeCalculation = useCallback((id: string): boolean => {
    const index = history.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    removeItem(index);
    return true;
  }, [history, removeItem]);

  const getFilteredHistory = useCallback((filters: CalculationFilters = {}): readonly CalculationEntry[] => {
    return history.filter(item => {
      if (filters.type && item.type !== filters.type) return false;
      
      if (filters.favoritesOnly && !item.isFavorite) return false;
      
      if (filters.dateRange) {
        const itemDate = new Date(item.timestamp);
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false;
        }
      }
      
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesFormula = item.formula.toLowerCase().includes(searchLower);
        const matchesNotes = item.notes?.toLowerCase().includes(searchLower) ?? false;
        if (!matchesFormula && !matchesNotes) return false;
      }
      
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => item.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [history]);

  const getRecentCalculations = useMemo(() => 
    (limit: number = 10): readonly CalculationEntry[] => {
      return history
        .slice() 
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    }
  , [history]);

  const getFavoriteCalculations = useMemo(() => 
    (): readonly CalculationEntry[] => {
      return history
        .filter(item => item.isFavorite)
        .sort((a, b) => b.timestamp - a.timestamp);
    }
  , [history]);

  const getCalculationsByType = useMemo(() => 
    (type: CalculationEntry['type']): readonly CalculationEntry[] => {
      return history
        .filter(item => item.type === type)
        .sort((a, b) => b.timestamp - a.timestamp);
    }
  , [history]);

  const searchByFormula = useMemo(() => 
    (formula: string): readonly CalculationEntry[] => {
      if (!formula.trim()) return [];
      
      const searchLower = formula.toLowerCase();
      return history.filter(item =>
        item.formula.toLowerCase().includes(searchLower)
      );
    }
  , [history]);

  const getStatistics = useMemo((): CalculationStats => {
    if (
      lastStatsHistoryRef.current === history && 
      cachedStatsRef.current !== null
    ) {
      return cachedStatsRef.current;
    }

    const { today, weekAgo } = getDateRanges();

    const byType: Record<CalculationEntry['type'], number> = {
      'molar-mass': 0,
      'conversion': 0,
      'concentration': 0,
      'balance': 0
    };

    let favorites = 0;
    let todayCount = 0;
    let thisWeekCount = 0;

    const formulaCount = new Map<string, number>();
    const tagCount = new Map<string, number>();

    for (const item of history) {
      byType[item.type]++;
      
      if (item.isFavorite) favorites++;
      
      const itemDate = new Date(item.timestamp);
      if (itemDate >= today) todayCount++;
      if (itemDate >= weekAgo) thisWeekCount++;
      
      formulaCount.set(item.formula, (formulaCount.get(item.formula) || 0) + 1);
      
      for (const tag of item.tags) {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      }
    }

    const topFormulas = Array.from(formulaCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([formula, count]) => ({ formula, count }));

    const topTags = Array.from(tagCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    const stats: CalculationStats = {
      total: history.length,
      byType,
      favorites,
      today: todayCount,
      thisWeek: thisWeekCount,
      topFormulas,
      topTags
    };

    lastStatsHistoryRef.current = history;
    cachedStatsRef.current = stats;

    return stats;
  }, [history]);

  const getAllTags = useMemo((): ReadonlyArray<string> => {
    const tagSet = new Set<string>();
    
    for (const item of history) {
      for (const tag of item.tags) {
        tagSet.add(tag);
      }
    }
    
    return Array.from(tagSet).sort();
  }, [history]);

  const exportHistory = useCallback((): string => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      calculations: history,
      metadata: {
        total: history.length,
        types: getStatistics.byType
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [history, getStatistics]);

  const importHistory = useCallback((jsonData: string): { 
    readonly success: boolean; 
    readonly imported?: number; 
    readonly error?: string;
    readonly skipped?: number;
  } => {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.calculations || !Array.isArray(data.calculations)) {
        return { success: false, error: 'Formato de datos inválido' };
      }

      const validCalculations: CalculationEntry[] = [];
      let skipped = 0;

      for (const calc of data.calculations) {
        if (isValidCalculationEntry(calc)) {
          const exists = history.some(existing => existing.id === calc.id);
          if (!exists) {
            validCalculations.push(calc);
          } else {
            skipped++;
          }
        } else {
          skipped++;
        }
      }

      for (const calc of validCalculations) {
        addItem(calc);
      }

      return { 
        success: true, 
        imported: validCalculations.length,
        skipped: skipped > 0 ? skipped : undefined
      };
    } catch (error) {
      return { 
        success: false, 
        error: `Error al importar: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }, [history, addItem]);

  const clearHistory = useCallback((confirmation: boolean = false): void => {
    if (!confirmation) {
      throw new Error('Se requiere confirmación para limpiar el historial');
    }
    
    lastStatsHistoryRef.current = [];
    cachedStatsRef.current = null;
    
    clear();
  }, [clear]);

  return {
    history,
    isLoading,
    error,

    addCalculation,
    updateCalculation,
    removeCalculation,
    toggleFavorite,
    addTag,
    removeTag,

    getFilteredHistory,
    getRecentCalculations,
    getFavoriteCalculations,
    getCalculationsByType,
    searchByFormula,

    getStatistics,
    getAllTags,

    exportHistory,
    importHistory,
    clearHistory
  };
};

export const useChemicalCalculations = () => {
  const calculationHistory = useCalculationHistory();

  const addMolarMassCalculation = useCallback((
    formula: string,
    result: MolarMassResult,
    notes?: string
  ): string => {
    return calculationHistory.addCalculation(
      'molar-mass',
      formula,
      result,
      { 
        notes,
        tags: ['masa-molar'],
        metadata: {
          executionTime: performance.now(),
          version: '1.0'
        }
      }
    );
  }, [calculationHistory]);

  const addConversionCalculation = useCallback((
    formula: string,
    result: ConversionResult,
    notes?: string
  ): string => {
    return calculationHistory.addCalculation(
      'conversion',
      formula,
      result,
      { 
        notes,
        tags: ['conversión', result.type],
        metadata: {
          conversionType: result.type,
          version: '1.0'
        }
      }
    );
  }, [calculationHistory]);

  const getFrequentFormulas = useCallback((limit: number = 5): ReadonlyArray<{ 
    readonly formula: string; 
    readonly count: number 
  }> => {
    return calculationHistory.getStatistics.topFormulas.slice(0, limit);
  }, [calculationHistory.getStatistics]);

  const getRecentMolarMassCalculations = useCallback((limit: number = 5): readonly CalculationEntry[] => {
    return calculationHistory.getCalculationsByType('molar-mass').slice(0, limit);
  }, [calculationHistory]);

  const getChemistryStats = useMemo(() => {
    const stats = calculationHistory.getStatistics;
    
    return {
      totalMolarMass: stats.byType['molar-mass'] || 0,
      totalConversions: stats.byType['conversion'] || 0,
      totalConcentrations: stats.byType['concentration'] || 0,
      totalBalance: stats.byType['balance'] || 0,
      mostUsedFormula: stats.topFormulas[0]?.formula || null,
      favoritePercentage: stats.total > 0 ? Math.round((stats.favorites / stats.total) * 100) : 0
    };
  }, [calculationHistory.getStatistics]);

  return {
    ...calculationHistory,
    
    addMolarMassCalculation,
    addConversionCalculation,
    getFrequentFormulas,
    getRecentMolarMassCalculations,
    
    getChemistryStats
  };
};

export default useCalculationHistory;