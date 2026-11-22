import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, Theme } from './themes';

export type ThemeMode = 'system' | 'light' | 'dark';
const KEY = 'eduhub.themeMode';

interface Ctx { theme: Theme; mode: ThemeMode; setMode: (m: ThemeMode) => void }
const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => { if (v === 'light' || v === 'dark' || v === 'system') setModeState(v); }).catch(() => {});
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  }, []);

  const value = useMemo<Ctx>(() => {
    const resolved = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
    return { theme: resolved === 'dark' ? darkTheme : lightTheme, mode, setMode };
  }, [mode, system, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): Ctx {
  const c = useContext(ThemeContext);
  if (!c) throw new Error('useTheme must be used inside <ThemeProvider>');
  return c;
}
export const useTheme = (): Theme => useThemeContext().theme;
