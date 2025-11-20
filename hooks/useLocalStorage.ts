import { useState, useEffect, useCallback, useRef } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Всегда начинаем с initialValue для избежания ошибок гидратации
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const isInitialized = useRef(false);

  // Загружаем данные из localStorage после монтирования (только один раз)
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          console.log(`[useLocalStorage] Loaded "${key}":`, parsed);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setStoredValue(parsed);
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
      isInitialized.current = true;
    }
  }, [key]);

  // Синхронизируем с localStorage при изменении storedValue
  useEffect(() => {
    if (isInitialized.current) {
      try {
        console.log(`[useLocalStorage] Saving "${key}":`, storedValue);
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      console.log(`[useLocalStorage] setValue called for "${key}"`);
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        console.log(`[useLocalStorage] New value for "${key}":`, valueToStore);
        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
