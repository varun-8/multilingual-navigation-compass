import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useCompass } from '../hooks/useCompass';
import { useLocation } from '../hooks/useLocation';
import { useTheme } from '../hooks/useTheme';
import { t } from '../i18n';
import { CompassDial } from '../components/CompassDial';
import { HeadingDisplay } from '../components/HeadingDisplay';
import { SensorStatus } from '../components/SensorStatus';
import { LocationCard } from '../components/LocationCard';
import { HeadingLockBar } from '../components/HeadingLockBar';
import { LanguageBottomSheet } from '../components/LanguageBottomSheet';
import { Globe, Settings, RefreshCw } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Compass'>;

export const CompassScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const { location, hasPermission, askPermission } = useLocation();
  const {
    compassData,
    northReference,
    lockState,
    toggleHeadingLock,
    headingDifference,
    debugMode,
  } = useCompass(location?.declination || 0);

  const [langSheetVisible, setLangSheetVisible] = useState(false);

  const handleOpenLanguage = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setLangSheetVisible(true);
  };

  const handleOpenSettings = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    navigation.navigate('Settings');
  };

  const handleOpenCalibration = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    navigation.navigate('Calibration');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} />

      {/* Main Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.appTitle, { color: colors.textPrimary }]}>
            {t('compass')}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Language Globe Button */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={handleOpenLanguage}
            accessibilityLabel={t('select_language')}
            activeOpacity={0.7}
          >
            <Globe size={19} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={handleOpenSettings}
            accessibilityLabel={t('settings')}
            activeOpacity={0.7}
          >
            <Settings size={19} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sensor Status / Calibration Warning */}
        <SensorStatus
          status={compassData.sensorStatus}
          accuracy={compassData.accuracy}
          onCalibratePress={handleOpenCalibration}
        />

        {/* Compass Physical Interaction Area */}
        <View style={styles.compassSection}>
          {/* Floating Calibrate Button (Top Right matching modern model) */}
          <View style={styles.calibrateButtonWrapper}>
            <TouchableOpacity
              style={[
                styles.floatingCalibrateBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={handleOpenCalibration}
              activeOpacity={0.8}
            >
              <RefreshCw size={12} color={colors.accent} style={styles.calibrateIcon} />
              <Text style={[styles.floatingCalibrateText, { color: colors.textPrimary }]}>
                {t('calibrate')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rotating Vector Compass Dial matching modern high-tech model */}
          <View style={styles.dialContainer}>
            <CompassDial
              heading={compassData.heading}
              pitch={compassData.pitch}
              roll={compassData.roll}
            />
          </View>

          {/* Primary Heading Readout with clean typography (no text bg) */}
          <HeadingDisplay
            heading={compassData.heading}
            northReference={northReference}
            pitch={compassData.pitch}
            roll={compassData.roll}
          />
        </View>

        {/* Heading Lock Control */}
        <HeadingLockBar
          heading={compassData.heading}
          lockState={lockState}
          difference={headingDifference}
          onToggleLock={toggleHeadingLock}
        />

        {/* Debug Diagnostics Panel (Enabled via Developer Settings) */}
        {debugMode && (
          <View style={[styles.debugCard, { backgroundColor: colors.card, borderColor: colors.warning }]}>
            <Text style={[styles.debugTitle, { color: colors.warning }]}>
              ⚡ {t('debug_info')}
            </Text>
            <Text style={[styles.debugText, { color: colors.textSecondary }]}>
              {t('raw_heading')}: {compassData.magneticHeading}° | {t('true_north')}: {compassData.trueHeading}°
            </Text>
            <Text style={[styles.debugText, { color: colors.textSecondary }]}>
              {t('pitch')}: {compassData.pitch}° | {t('roll')}: {compassData.roll}° | {t('declination')}: {location?.declination ?? 0}°
            </Text>
          </View>
        )}

        {/* GPS Location Information Card */}
        <LocationCard
          location={location}
          hasPermission={hasPermission}
          onRequestPermission={askPermission}
        />
      </ScrollView>

      {/* Language Switcher Bottom Sheet Modal */}
      <LanguageBottomSheet
        visible={langSheetVisible}
        onClose={() => setLangSheetVisible(false)}
      />
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
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  compassSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%',
    position: 'relative',
  },
  calibrateButtonWrapper: {
    width: '100%',
    alignItems: 'flex-end',
    paddingRight: 6,
    marginBottom: -6,
    zIndex: 35,
  },
  floatingCalibrateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calibrateIcon: {
    marginRight: 6,
  },
  floatingCalibrateText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    backgroundColor: 'transparent',
  },
  dialContainer: {
    marginVertical: 2,
  },
  debugCard: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 10,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: 'transparent',
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'System',
    marginTop: 2,
    backgroundColor: 'transparent',
  },
});
