import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { t } from '../i18n';
import { ChevronLeft, Compass, ShieldCheck, Cpu } from 'lucide-react-native';

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('about_compass')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* App Hero Badge */}
        <View style={styles.heroSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
            <Compass size={44} color={colors.accent} />
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>
            {t('app_name')}
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            {t('version')} 1.0.0 (Production Build)
          </Text>
        </View>

        {/* Section: Physical Sensor Technology */}
        <View style={styles.cardSection}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: colors.accentLight }]}>
                <Cpu size={18} color={colors.accent} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Real Physical Sensors
              </Text>
            </View>
            <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
              This application reads physical device hardware data from the magnetometer, accelerometer, and orientation sensors. 3D tilt-compensated vector algebra and World Magnetic Model declination ensure accurate magnetic and true north headings.
            </Text>
          </View>
        </View>

        {/* Section: Privacy First */}
        <View style={styles.cardSection}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: `${colors.success}1A` }]}>
                <ShieldCheck size={18} color={colors.success} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                {t('privacy')}
              </Text>
            </View>
            <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
              {t('privacy_desc')}
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    backgroundColor: 'transparent',
  },
  versionText: {
    fontSize: 13,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  cardSection: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 21,
    backgroundColor: 'transparent',
  },
});
