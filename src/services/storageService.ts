import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, SupportedLanguage, NorthReference, ThemeMode } from '../types/compass';

const STORAGE_KEY = '@multilingual_compass_preferences_v1';

const defaultPreferences: UserPreferences = {
  language: 'en',
  northReference: 'magnetic',
  themeMode: 'system',
  headingLock: false,
  debugMode: false,
};

export const loadUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultPreferences, ...parsed };
    }
  } catch (error) {
    console.warn('[StorageService] Error loading preferences:', error);
  }
  return defaultPreferences;
};

export const saveUserPreferences = async (prefs: Partial<UserPreferences>): Promise<void> => {
  try {
    const current = await loadUserPreferences();
    const updated = { ...current, ...prefs };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('[StorageService] Error saving preferences:', error);
  }
};
