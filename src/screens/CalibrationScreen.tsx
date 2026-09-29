import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCompass } from '../hooks/useCompass';
import { useTheme } from '../hooks/useTheme';
import { t } from '../i18n';
import { CalibrationVisualizer } from '../components/CalibrationVisualizer';
import { AccuracyIndicator } from '../components/AccuracyIndicator';
import { ChevronLeft, CheckCircle2 } from 'lucide-react-native';

export const CalibrationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { compassData } = useCompass();

  const isCalibrated = compassData.accuracy === 'high' || compassData.accuracy === 'medium';

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
          {t('calibrate_compass')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        {/* Step Instructions */}
        <Text style={[styles.instructionText, { color: colors.textPrimary }]}>
          {t('calibration_instructions')}
        </Text>

        {/* Animated Figure-8 Visual Guide */}
        <CalibrationVisualizer />

        {/* Live Sensor Accuracy Gauge */}
        <View style={styles.accuracyBox}>
          <AccuracyIndicator accuracy={compassData.accuracy} />
        </View>

        {/* Dynamic Status Feedback */}
        {isCalibrated ? (
          <View style={[styles.statusCard, { backgroundColor: colors.accentLight }]}>
            <CheckCircle2 size={24} color={colors.success} style={styles.statusIcon} />
            <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
              {t('sensor_ready')}!
            </Text>
            <Text style={[styles.statusDesc, { color: colors.textSecondary }]}>
              {t('accuracy')}: {compassData.accuracy.toUpperCase()}
            </Text>
          </View>
        ) : (
          <Text style={[styles.pendingText, { color: colors.textSecondary }]}>
            Rotate phone in all 3 axes until accuracy reads High/Medium.
          </Text>
        )}

        {/* Done Button */}
        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: colors.accent }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.doneBtnText}>{t('close')}</Text>
        </TouchableOpacity>
      </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
  accuracyBox: {
    marginVertical: 10,
  },
  statusCard: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
  },
  statusIcon: {
    marginBottom: 6,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  pendingText: {
    fontSize: 13,
    textAlign: 'center',
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
