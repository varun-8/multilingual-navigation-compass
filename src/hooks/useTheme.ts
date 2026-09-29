import { useState, useEffect, createContext, useContext, ReactNode, ReactElement } from 'react';
import React from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode } from '../types/compass';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';
import { loadUserPreferences, saveUserPreferences } from '../services/storageService';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  setThemeMode: async () => {},
  colors: darkColors,
  isDark: true,
});

export const ThemeProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeState] = useState<ThemeMode>('system');

  useEffect(() => {
    loadUserPreferences().then((prefs) => {
      if (prefs.themeMode) {
        setThemeState(prefs.themeMode);
      }
    });
  }, []);

  const changeThemeMode = async (newMode: ThemeMode) => {
    setThemeState(newMode);
    await saveUserPreferences({ themeMode: newMode });
  };

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  return React.createElement(
    ThemeContext.Provider,
    { value: { themeMode, setThemeMode: changeThemeMode, colors, isDark } },
    children
  );
};

export const useTheme = () => useContext(ThemeContext);
