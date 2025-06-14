import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export interface UseLocalStorageOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  defaultValue?: T;
  syncAcrossTabs?: boolean;
  validator?: (value: unknown) => value is T;
  debug?: boolean;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  isLoading: boolean;
  error: string | null;
  isSynced: boolean;
}

const createSerializer = <T>() => ({
  serialize: (value: T): string => {
    try {
      return JSON.stringify(value);
    } catch (error) {
      throw new Error(`Error al serializar valor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },
  
  deserialize: (value: string): T => {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`Error al deserializar valor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
});

const isLocalStorageAvailable = (() => {
  let cached: boolean | null = null;
  
  return (): boolean => {
    if (cached !== null) return cached;
    
    try {
      if (typeof window === 'undefined') {
        cached = false;
        return false;
      }
      
      const testKey = '__localStorage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      cached = true;
      return true;
    } catch {
      cached = false;
      return false;
    }
  };
})();

const createLogger = (key: string, debug: boolean) => ({
  log: (message: string, data?: unknown) => {
    if (debug && typeof console !== 'undefined') {
      console.log(`[useLocalStorage:${key}] ${message}`, data);
    }
  },
  
  warn: (message: string, data?: unknown) => {
    if (debug && typeof console !== 'undefined') {
      console.warn(`[useLocalStorage:${key}] ${message}`, data);
    }
  },
  
  error: (message: string, error?: unknown) => {
    if (debug && typeof console !== 'undefined') {
      console.error(`[useLocalStorage:${key}] ${message}`, error);
    }
  }
});

export const useLocalStorage = <T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> => {
  const {
    defaultValue,
    syncAcrossTabs = false,
    validator,
    debug = false
  } = options;

  const serializers = useMemo(() => {
    const defaultSerializers = createSerializer<T>();
    return {
      serialize: options.serialize || defaultSerializers.serialize,
      deserialize: options.deserialize || defaultSerializers.deserialize
    };
  }, [options.serialize, options.deserialize]);

  const logger = useMemo(() => createLogger(key, debug), [key, debug]);
  
  const isFirstLoad = useRef(true);
  const lastSyncedValue = useRef<T | undefined>(undefined);
  const storageEventHandlerRef = useRef<((e: StorageEvent) => void) | null>(null);

  const [value, setValueState] = useState<T>(() => {
    return defaultValue as T;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  const readFromStorage = useCallback((): T | null => {
    if (!isLocalStorageAvailable()) {
      logger.warn('localStorage no está disponible');
      return null;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        logger.log('No se encontró valor en localStorage');
        return null;
      }

      const deserializedValue = serializers.deserialize(item);
      
      if (validator && !validator(deserializedValue)) {
        logger.warn('Valor deserializado no pasa validación', deserializedValue);
        return null;
      }

      logger.log('Valor leído exitosamente', deserializedValue);
      return deserializedValue;
    } catch (error) {
      const errorMessage = `Error leyendo localStorage: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      logger.error(errorMessage, error);
      setError(errorMessage);
      return null;
    }
  }, [key, serializers, validator, logger]);

  const writeToStorage = useCallback((newValue: T): boolean => {
    if (!isLocalStorageAvailable()) {
      logger.warn('localStorage no está disponible para escritura');
      return false;
    }

    try {
      const serializedValue = serializers.serialize(newValue);
      window.localStorage.setItem(key, serializedValue);
      
      lastSyncedValue.current = newValue;
      setError(null);
      setIsSynced(true);
      
      logger.log('Valor escrito exitosamente', newValue);
      return true;
    } catch (error) {
      const errorMessage = `Error escribiendo localStorage: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      logger.error(errorMessage, error);
      setError(errorMessage);
      setIsSynced(false);
      return false;
    }
  }, [key, serializers, logger]);

  const removeFromStorage = useCallback((): boolean => {
    if (!isLocalStorageAvailable()) {
      logger.warn('localStorage no está disponible para eliminación');
      return false;
    }

    try {
      window.localStorage.removeItem(key);
      lastSyncedValue.current = undefined;
      setError(null);
      setIsSynced(true);
      
      logger.log('Valor removido exitosamente');
      return true;
    } catch (error) {
      const errorMessage = `Error removiendo localStorage: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      logger.error(errorMessage, error);
      setError(errorMessage);
      return false;
    }
  }, [key, logger]);

  const setValue = useCallback((newValue: T | ((prev: T) => T)): void => {
    try {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue;

      if (lastSyncedValue.current !== undefined && 
          JSON.stringify(valueToStore) === JSON.stringify(lastSyncedValue.current)) {
        logger.log('Valor no cambió, omitiendo actualización');
        return;
      }

      setValueState(valueToStore);
      
      const writeSuccess = writeToStorage(valueToStore);
      if (!writeSuccess) {
        logger.warn('Falló la escritura a localStorage, manteniendo valor en memoria');
      }
    } catch (error) {
      const errorMessage = `Error actualizando valor: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      logger.error(errorMessage, error);
      setError(errorMessage);
    }
  }, [value, writeToStorage, logger]);

  const removeValue = useCallback((): void => {
    const removeSuccess = removeFromStorage();
    
    if (removeSuccess || !isLocalStorageAvailable()) {
      setValueState(defaultValue as T);
      lastSyncedValue.current = undefined;
    }
  }, [removeFromStorage, defaultValue]);

  useEffect(() => {
    if (!isFirstLoad.current) return;
    
    const loadFromStorage = async () => {
      setIsLoading(true);
      logger.log('Iniciando carga desde localStorage');
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const storedValue = readFromStorage();
      
      if (storedValue !== null) {
        setValueState(storedValue);
        lastSyncedValue.current = storedValue;
        setIsSynced(true);
        logger.log('Valor cargado desde localStorage', storedValue);
      } else if (defaultValue !== undefined) {
        setValueState(defaultValue);
        lastSyncedValue.current = defaultValue;
        writeToStorage(defaultValue);
        logger.log('Usando valor por defecto', defaultValue);
      }
      
      setIsLoading(false);
      isFirstLoad.current = false;
    };

    loadFromStorage();
  }, [readFromStorage, writeToStorage, defaultValue, logger]);

  useEffect(() => {
    if (!syncAcrossTabs || !isLocalStorageAvailable()) {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;
      
      logger.log('Detectado cambio de storage en otra pestaña', {
        oldValue: e.oldValue,
        newValue: e.newValue
      });

      try {
        if (e.newValue !== null) {
          const newValue = serializers.deserialize(e.newValue);
          
          if (validator && !validator(newValue)) {
            logger.warn('Valor sincronizado no pasa validación', newValue);
            return;
          }
          
          setValueState(newValue);
          lastSyncedValue.current = newValue;
          setError(null);
          setIsSynced(true);
          logger.log('Valor sincronizado desde otra pestaña', newValue);
        } else {
          setValueState(defaultValue as T);
          lastSyncedValue.current = undefined;
          setIsSynced(true);
          logger.log('Valor removido desde otra pestaña');
        }
      } catch (error) {
        const errorMessage = `Error sincronizando storage: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        logger.error(errorMessage, error);
        setError(errorMessage);
        setIsSynced(false);
      }
    };

    storageEventHandlerRef.current = handleStorageChange;
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      if (storageEventHandlerRef.current) {
        window.removeEventListener('storage', storageEventHandlerRef.current);
        storageEventHandlerRef.current = null;
      }
    };
  }, [key, serializers, defaultValue, syncAcrossTabs, validator, logger]);

 
  return {
    value,
    setValue,
    removeValue,
    isLoading,
    error,
    isSynced
  };
};


export const useLocalStorageArray = <T>(
  key: string,
  defaultValue: readonly T[] = []
) => {
  const { value, setValue, removeValue, isLoading, error, isSynced } = useLocalStorage<readonly T[]>(key, {
    defaultValue,
    syncAcrossTabs: true,
    validator: (value): value is readonly T[] => Array.isArray(value)
  });

  const addItem = useCallback((item: T) => {
    setValue(prev => [...prev, item]);
  }, [setValue]);

  const removeItem = useCallback((index: number) => {
    setValue(prev => prev.filter((_, i) => i !== index));
  }, [setValue]);

  const removeItemByValue = useCallback((item: T) => {
    setValue(prev => prev.filter(i => JSON.stringify(i) !== JSON.stringify(item)));
  }, [setValue]);

  const updateItem = useCallback((index: number, newItem: T) => {
    setValue(prev => prev.map((item, i) => i === index ? newItem : item));
  }, [setValue]);

  const insertItem = useCallback((index: number, item: T) => {
    setValue(prev => [
      ...prev.slice(0, index),
      item,
      ...prev.slice(index)
    ]);
  }, [setValue]);

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setValue(prev => {
      const newArray = [...prev];
      const [removed] = newArray.splice(fromIndex, 1);
      newArray.splice(toIndex, 0, removed);
      return newArray;
    });
  }, [setValue]);

  const clear = useCallback(() => {
    setValue([]);
  }, [setValue]);

  const findItem = useCallback((predicate: (item: T) => boolean): T | undefined => {
    return value.find(predicate);
  }, [value]);

  const findIndex = useCallback((predicate: (item: T) => boolean): number => {
    return value.findIndex(predicate);
  }, [value]);

  return {
    items: value,
    setItems: setValue,
    addItem,
    removeItem,
    removeItemByValue,
    updateItem,
    insertItem,
    moveItem,
    clear,
    removeAllItems: removeValue,
    findItem,
    findIndex,
    isLoading,
    error,
    isSynced,
    length: value.length,
    isEmpty: value.length === 0
  };
};

export const useLocalStorageObject = <T extends Record<string, any>>(
  key: string,
  defaultValue: T = {} as T
) => {
  const { value, setValue, removeValue, isLoading, error, isSynced } = useLocalStorage<T>(key, {
    defaultValue,
    syncAcrossTabs: true,
    validator: (value): value is T => typeof value === 'object' && value !== null && !Array.isArray(value)
  });

  const updateProperty = useCallback(<K extends keyof T>(
    property: K,
    newValue: T[K]
  ) => {
    setValue(prev => ({
      ...prev,
      [property]: newValue
    }));
  }, [setValue]);

  const removeProperty = useCallback(<K extends keyof T>(property: K) => {
    setValue(prev => {
      const newObj = { ...prev };
      delete newObj[property];
      return newObj;
    });
  }, [setValue]);

  const mergeObject = useCallback((newObject: Partial<T>) => {
    setValue(prev => ({
      ...prev,
      ...newObject
    }));
  }, [setValue]);

  const hasProperty = useCallback(<K extends keyof T>(property: K): boolean => {
    return property in value;
  }, [value]);

  const getProperty = useCallback(<K extends keyof T>(property: K): T[K] => {
    return value[property];
  }, [value]);

  return {
    object: value,
    setObject: setValue,
    updateProperty,
    removeProperty,
    mergeObject,
    hasProperty,
    getProperty,
    clear: removeValue,
    isLoading,
    error,
    isSynced,
    keys: Object.keys(value) as (keyof T)[],
    values: Object.values(value),
    entries: Object.entries(value) as [keyof T, T[keyof T]][]
  };
};

export interface UserPreferences extends Record<string, any> {
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  showSteps: boolean;
  decimalPlaces: number;
  autoSave: boolean;
  recentFormulas: readonly string[];
  favoriteCalculators: readonly string[];
}

export const useUserPreferences = () => {
  const defaultPreferences: UserPreferences = {
    theme: 'light',
    language: 'es',
    showSteps: true,
    decimalPlaces: 4,
    autoSave: true,
    recentFormulas: [],
    favoriteCalculators: []
  };

  const result = useLocalStorageObject('user-preferences', defaultPreferences);

  const updateRecentFormulas = useCallback((formula: string, maxItems: number = 10) => {
    result.updateProperty('recentFormulas', 
      [formula, ...result.object.recentFormulas.filter(f => f !== formula)].slice(0, maxItems)
    );
  }, [result]);

  const toggleFavoriteCalculator = useCallback((calculatorId: string) => {
    const current = result.object.favoriteCalculators;
    const newFavorites = current.includes(calculatorId)
      ? current.filter(id => id !== calculatorId)
      : [...current, calculatorId];
    
    result.updateProperty('favoriteCalculators', newFavorites);
  }, [result]);

  return {
    ...result,
    updateRecentFormulas,
    toggleFavoriteCalculator
  };
};

export interface AppConfig {
  apiEndpoint: string;
  timeout: number;
  retryAttempts: number;
  enableAnalytics: boolean;
  debugMode: boolean;
}

export const useAppConfig = () => {
  const defaultConfig: AppConfig = {
    apiEndpoint: '/api',
    timeout: 5000,
    retryAttempts: 3,
    enableAnalytics: false,
    debugMode: false
  };

  return useLocalStorageObject('app-config', defaultConfig);
};

export default useLocalStorage;