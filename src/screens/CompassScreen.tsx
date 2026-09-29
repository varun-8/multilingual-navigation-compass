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
import { useCompass } from '../hooks/useCompass';
import { useLocation } from '../hooks/useLocation';
import { useTheme } from '../hooks/useTheme';
import { t } from '../i18n';
import { CompassDial } from '../components/CompassDial';
import { CompassNeedle } from '../components/CompassNeedle';
import { HeadingDisplay } from '../components/HeadingDisplay';
import { SensorStatus } from '../components/SensorStatus';
import { LocationCard } from '../components/LocationCard';
import { HeadingLockBar } from '../components/HeadingLockBar';
import { LanguageBottomSheet } from '../components/LanguageBottomSheet';
import { Globe, Settings, Sliders, Info, RefreshCw } from 'lucide-react-native';
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
            onPress={() => setLangSheetVisible(true)}
            accessibilityLabel={t('select_language')}
            activeOpacity={0.7}
          >
            <Globe size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel={t('settings')}
            activeOpacity={0.7}
          >
            <Settings size={20} color={colors.textPrimary} />
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
          onCalibratePress={() => navigation.navigate('Calibration')}
        />

        {/* Compass Physical Interaction Area */}
        <View style={styles.compassSection}>
          {/* Floating Calibrate Button (Top Right matching image) */}
          <View style={styles.calibrateButtonWrapper}>
            <TouchableOpacity
              style={styles.floatingCalibrateBtn}
              onPress={() => navigation.navigate('Calibration')}
              activeOpacity={0.8}
            >
              <RefreshCw size={13} color="#2563EB" style={styles.calibrateIcon} />
              <Text style={styles.floatingCalibrateText}>{t('calibrate')}</Text>
            </TouchableOpacity>
          </View>

          {/* Rotating Vector Compass Dial matching reference design */}
          <View style={styles.dialContainer}>
            <CompassDial
              heading={compassData.heading}
              pitch={compassData.pitch}
              roll={compassData.roll}
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

        {/* Debug Panel (Enabled via Developer Settings) */}
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
    marginVertical: 12,
    width: '100%',
    position: 'relative',
  },
  calibrateButtonWrapper: {
    width: '100%',
    alignItems: 'flex-end',
    paddingRight: 8,
    marginBottom: -8,
    zIndex: 30,
  },
  floatingCalibrateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  calibrateIcon: {
    marginRight: 6,
  },
  floatingCalibrateText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  dialContainer: {
    marginVertical: 4,
  },
  debugCard: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 10,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'Courier',
    marginTop: 2,
  },
});
