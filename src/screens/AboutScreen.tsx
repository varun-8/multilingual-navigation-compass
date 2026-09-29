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
import { useTheme } from '../hooks/useTheme';
import { t } from '../i18n';
import { ChevronLeft, Compass, ShieldCheck, Cpu } from 'lucide-react-native';

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('about_compass')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Hero Badge */}
        <View style={styles.heroSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
            <Compass size={48} color={colors.accent} />
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
              <Cpu size={20} color={colors.accent} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Real Physical Sensors
              </Text>
            </View>
            <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
              This application reads physical device hardware data from the magnetometer, accelerometer, and orientation sensors. Tilt-compensated vector algebra and World Magnetic Model declination ensure accurate magnetic and true north headings.
            </Text>
          </View>
        </View>

        {/* Section: Privacy First */}
        <View style={styles.cardSection}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <ShieldCheck size={20} color={colors.success} style={styles.cardIcon} />
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
  },
  versionText: {
    fontSize: 13,
    marginTop: 4,
  },
  cardSection: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
