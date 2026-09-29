import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useCompass } from '../hooks/useCompass';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useLocation } from '../hooks/useLocation';
import { getSupportedLanguagesList, t } from '../i18n';
import { NorthReference, ThemeMode, SupportedLanguage } from '../types/compass';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Moon,
  Globe,
  Activity,
  MapPin,
  Info,
  Bug,
  Check,
  X,
} from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const { themeMode, setThemeMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { location, hasPermission } = useLocation();
  const { northReference, setNorthReference, debugMode, setDebugMode } = useCompass(
    location?.declination || 0
  );

  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const languages = getSupportedLanguagesList();
  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  const handleSelectLanguage = async (code: SupportedLanguage) => {
    try {
      await Haptics.selectionAsync();
    } catch (e) {}
    await setLanguage(code);
    setLanguageModalVisible(false);
  };

  const handleReferenceChange = (ref: NorthReference) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setNorthReference(ref);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setThemeMode(mode);
  };

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Language Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('language')}
          </Text>

          <TouchableOpacity
            style={[
              styles.card,
              styles.actionRow,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            onPress={() => setLanguageModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.accentLight }]}>
                <Globe size={18} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                  {t('language')}
                </Text>
                <Text style={[styles.rowSubtitle, { color: colors.accent }]}>
                  {currentLangObj.nativeLabel} ({currentLangObj.label})
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

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
                    onPress={() => handleReferenceChange(ref)}
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
                    onPress={() => handleThemeChange(mode)}
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

        {/* Section: Sensor & Calibration */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('sensor_status')}
          </Text>

          <TouchableOpacity
            style={[
              styles.card,
              styles.actionRow,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            onPress={() => navigation.navigate('Calibration')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.accentLight }]}>
                <Activity size={18} color={colors.accent} />
              </View>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('calibrate_compass')}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Section: Developer / Debug Mode */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('debug_mode')}
          </Text>

          <View style={[styles.card, styles.switchRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: `${colors.warning}1A` }]}>
                <Bug size={18} color={colors.warning} />
              </View>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('debug_mode')}
              </Text>
            </View>
            <Switch
              value={debugMode}
              onValueChange={(val) => {
                try {
                  Haptics.selectionAsync();
                } catch (e) {}
                setDebugMode(val);
              }}
              trackColor={{ false: colors.cardBorder, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section: About Screen Navigation */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.card,
              styles.actionRow,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            onPress={() => navigation.navigate('About')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.accentLight }]}>
                <Info size={18} color={colors.accent} />
              </View>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                {t('about_compass')}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Full Language Picker Modal with all 10 Indian languages */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Globe size={20} color={colors.accent} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {t('select_language')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setLanguageModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.langList} showsVerticalScrollIndicator={false}>
              {languages.map((lang, index) => {
                const isSelected = language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langModalRow,
                      {
                        backgroundColor: isSelected ? colors.accentLight : 'transparent',
                        borderColor: isSelected ? colors.accent : colors.cardBorder,
                      },
                      index < languages.length - 1 && { marginBottom: 8 },
                    ]}
                    onPress={() => handleSelectLanguage(lang.code)}
                    activeOpacity={0.7}
                  >
                    <View>
                      <Text
                        style={[
                          styles.langNativeText,
                          { color: isSelected ? colors.accent : colors.textPrimary },
                        ]}
                      >
                        {lang.nativeLabel}
                      </Text>
                      <Text style={[styles.langEngText, { color: colors.textSecondary }]}>
                        {lang.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                        <Check size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
  },
  warningText: {
    fontSize: 12,
    marginTop: 10,
    lineHeight: 16,
    backgroundColor: 'transparent',
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
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: 'transparent',
  },
  rowSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
  modalCloseBtn: {
    padding: 4,
  },
  langList: {
    marginTop: 4,
  },
  langModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  langNativeText: {
    fontSize: 17,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
  langEngText: {
    fontSize: 12,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
