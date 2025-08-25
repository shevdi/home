import { useState, useEffect, useCallback, useDebugValue } from 'react';

interface UseLocalStorageOptions {
  sync?: boolean; // Whether to sync across tabs
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const { sync = true } = options;

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Add value to React DevTools
  useDebugValue(storedValue);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sync across tabs
  useEffect(() => {
    if (!sync) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        if (e.newValue === null) {
          setStoredValue(initialValue);
        } else {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            console.warn(`Error parsing storage value for key "${key}":`, error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, sync]);

  // Handle initial value changes
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}

// function UserPreferences() {
//   const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
//   const [userSettings, setUserSettings] = useLocalStorage('user-settings', {
//     notifications: true,
//     language: 'en',
//   });

//   return (
//     <div>
//       <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
//         Toggle Theme
//       </button>
//       <div>Current theme: {theme}</div>
//     </div>
//   );
// }

// // With remove functionality
// function AuthComponent() {
//   const [token, setToken, removeToken] = useLocalStorage<string | null>('auth-token', null);

//   const login = () => setToken('your-jwt-token');
//   const logout = () => removeToken();

//   return (
//     <div>
//       {token ? (
//         <button onClick={logout}>Logout</button>
//       ) : (
//         <button onClick={login}>Login</button>
//       )}
//     </div>
//   );
// }