import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useCompass } from '../hooks/useCompass';
import { useLocation } from '../hooks/useLocation';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { t } from '../i18n';
import { CompassDial } from '../components/CompassDial';
import { HeadingDisplay } from '../components/HeadingDisplay';
import { SensorStatus } from '../components/SensorStatus';
import { LocationCard } from '../components/LocationCard';
import { SolarCard } from '../components/SolarCard';
import { HeadingLockBar } from '../components/HeadingLockBar';
import { LanguageBottomSheet } from '../components/LanguageBottomSheet';
import { Globe, Settings, RefreshCw, Eye, EyeOff, Sun } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Compass'>;

export const CompassScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const { location, hasPermission, askPermission } = useLocation();
  const {
    compassData,
    northReference,
    nightVision,
    toggleNightVision,
    lockState,
    toggleHeadingLock,
    headingDifference,
    debugMode,
    solarData,
  } = useCompass(location?.latitude || 0, location?.longitude || 0, location?.declination || 0);

  const [langSheetVisible, setLangSheetVisible] = useState(false);
  const [showSunTracker, setShowSunTracker] = useState(true);

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

  const handleToggleSunTracker = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setShowSunTracker((prev) => !prev);
  };

  const activeBg = nightVision ? '#090000' : colors.background;
  const activeCardBg = nightVision ? '#140000' : colors.card;
  const activeText = nightVision ? '#FF4444' : colors.textPrimary;
  const activeBorder = nightVision ? '#330000' : colors.cardBorder;

  const isCompact = width < 360;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: activeBg }]}>
      <StatusBar barStyle={nightVision ? 'light-content' : colors.statusBar} />

      {/* Main Header */}
      <View style={[styles.header, { paddingHorizontal: isCompact ? 14 : 20 }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.appTitle, { color: activeText, fontSize: isCompact ? 20 : 24 }]}>
            {t('compass')}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Night Vision Mode Toggle */}
          <TouchableOpacity
            style={[
              styles.iconButton,
              {
                backgroundColor: nightVision ? '#2A0000' : colors.card,
                borderColor: nightVision ? '#FF0000' : colors.cardBorder,
              },
            ]}
            onPress={toggleNightVision}
            accessibilityLabel="Night Vision Mode"
            activeOpacity={0.7}
          >
            {nightVision ? (
              <EyeOff size={18} color="#FF3333" />
            ) : (
              <Eye size={18} color={colors.textPrimary} />
            )}
          </TouchableOpacity>

          {/* Language Globe Button */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: activeCardBg, borderColor: activeBorder }]}
            onPress={handleOpenLanguage}
            accessibilityLabel={t('select_language')}
            activeOpacity={0.7}
          >
            <Globe size={18} color={activeText} />
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: activeCardBg, borderColor: activeBorder }]}
            onPress={handleOpenSettings}
            accessibilityLabel={t('settings')}
            activeOpacity={0.7}
          >
            <Settings size={18} color={activeText} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: isCompact ? 12 : 18 }]}
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
          {/* Floating Action Controls (Sun Position Toggle + Calibrate Button) */}
          <View style={styles.controlsRow}>
            {/* Sun Position On/Off Interactive Toggle */}
            <TouchableOpacity
              style={[
                styles.floatingToggleBtn,
                {
                  backgroundColor: showSunTracker
                    ? (nightVision ? '#330000' : isDark ? '#78350F25' : '#FEF3C7')
                    : activeCardBg,
                  borderColor: showSunTracker
                    ? (nightVision ? '#FF3333' : '#F59E0B')
                    : activeBorder,
                },
              ]}
              onPress={handleToggleSunTracker}
              activeOpacity={0.8}
            >
              <Sun
                size={13}
                color={showSunTracker ? '#F59E0B' : colors.textMuted}
                style={styles.toggleIcon}
              />
              <Text
                style={[
                  styles.floatingToggleText,
                  {
                    color: showSunTracker
                      ? (nightVision ? '#FF4444' : isDark ? '#FBBF24' : '#B45309')
                      : colors.textSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                {showSunTracker ? t('solar_tracker_on') : t('solar_tracker_off')}
              </Text>
            </TouchableOpacity>

            {/* Calibrate Button */}
            <TouchableOpacity
              style={[
                styles.floatingCalibrateBtn,
                {
                  backgroundColor: activeCardBg,
                  borderColor: activeBorder,
                },
              ]}
              onPress={handleOpenCalibration}
              activeOpacity={0.8}
            >
              <RefreshCw
                size={12}
                color={nightVision ? '#FF3333' : colors.accent}
                style={styles.calibrateIcon}
              />
              <Text style={[styles.floatingCalibrateText, { color: activeText }]} numberOfLines={1}>
                {t('calibrate')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rotating Vector Compass Dial with Enhanced Sun Position Graphic */}
          <View style={styles.dialContainer}>
            <CompassDial
              heading={compassData.heading}
              pitch={compassData.pitch}
              roll={compassData.roll}
              solarData={solarData}
              showSunTracker={showSunTracker}
              nightVision={nightVision}
            />
          </View>

          {/* Primary Heading Readout */}
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

        {/* Real-time Astronomical Sunrise & Sunset Solar Cycle Card */}
        <SolarCard solarData={solarData} />

        {/* Debug Diagnostics Panel (Enabled via Developer Settings) */}
        {debugMode && (
          <View style={[styles.debugCard, { backgroundColor: activeCardBg, borderColor: colors.warning }]}>
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
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    fontFamily: typography.fontFamily.headingExtraBold,
    letterSpacing: -0.5,
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  compassSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    width: '100%',
    position: 'relative',
  },
  controlsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: -4,
    zIndex: 35,
    gap: 8,
  },
  floatingToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    flexShrink: 1,
  },
  toggleIcon: {
    marginRight: 5,
  },
  floatingToggleText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.2,
    backgroundColor: 'transparent',
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
    marginRight: 5,
  },
  floatingCalibrateText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.2,
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
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: 'transparent',
  },
  debugText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.monospace,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
});
