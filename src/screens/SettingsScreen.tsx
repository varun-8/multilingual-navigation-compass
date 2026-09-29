import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCompass } from '../hooks/useCompass';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useLocation } from '../hooks/useLocation';
import { getSupportedLanguagesList, t } from '../i18n';
import { NorthReference, ThemeMode, SupportedLanguage } from '../types/compass';
import {
  ChevronLeft,
  Compass,
  Moon,
  Globe,
  Activity,
  MapPin,
  Info,
  Bug,
  Check,
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const { themeMode, setThemeMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { location, hasPermission, askPermission } = useLocation();
  const { northReference, setNorthReference, debugMode, setDebugMode } = useCompass(
    location?.declination || 0
  );

  const languages = getSupportedLanguagesList();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Settings Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('settings')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section: Compass Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('compass')}
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>
              {t('north_reference')}
            </Text>

            <View style={styles.optionGroup}>
              {(['magnetic', 'true'] as NorthReference[]).map((ref) => {
                const isSelected = northReference === ref;
                return (
                  <TouchableOpacity
                    key={ref}
                    style={[
                      styles.segmentBtn,
                      {
                        backgroundColor: isSelected ? colors.accent : 'transparent',
                        borderColor: isSelected ? colors.accent : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setNorthReference(ref)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {ref === 'true' ? t('true_north') : t('magnetic_north')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {northReference === 'true' && !hasPermission && (
              <Text style={[styles.warningText, { color: colors.warning }]}>
                ⚠️ {t('location_permission_explanation')}
              </Text>
            )}
          </View>
        </View>

        {/* Section: Appearance (Theme) */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('appearance')}
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>{t('theme')}</Text>

            <View style={styles.optionGroup}>
              {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => {
                const isSelected = themeMode === mode;
                const labelKey = `theme_${mode}`;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.segmentBtn,
                      {
                        backgroundColor: isSelected ? colors.accent : 'transparent',
                        borderColor: isSelected ? colors.accent : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setThemeMode(mode)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {t(labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Section: Language */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('language')}
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {languages.map((lang, index) => {
              const isSelected = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langRow,
                    index < languages.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.cardBorder,
                    },
                  ]}
                  onPress={() => setLanguage(lang.code)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langText, { color: colors.textPrimary }]}>
                    {lang.nativeLabel} ({lang.label})
                  </Text>
                  {isSelected && <Check size={18} color={colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Sensor & Calibration */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('sensor_status')}
          </Text>

          <TouchableOpacity
            style={[styles.card, styles.actionRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('Calibration')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Activity size={20} color={colors.accent} style={styles.rowIcon} />
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('calibrate_compass')}
              </Text>
            </View>
            <Text style={[styles.rowLink, { color: colors.accent }]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Developer / Debug Mode */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('debug_mode')}
          </Text>

          <View style={[styles.card, styles.switchRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.rowLeft}>
              <Bug size={20} color={colors.warning} style={styles.rowIcon} />
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('debug_mode')}
              </Text>
            </View>
            <Switch
              value={debugMode}
              onValueChange={setDebugMode}
              trackColor={{ false: colors.cardBorder, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section: About Screen Navigation */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.card, styles.actionRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('About')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Info size={20} color={colors.accent} style={styles.rowIcon} />
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('about_compass')}
              </Text>
            </View>
            <Text style={[styles.rowLink, { color: colors.accent }]}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  optionGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    marginTop: 10,
    lineHeight: 16,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  langText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 10,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowLink: {
    fontSize: 18,
    fontWeight: '700',
  },
});
