import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SensorStatus as StatusType, SensorAccuracy } from '../types/compass';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { t } from '../i18n';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface SensorStatusProps {
  status: StatusType;
  accuracy: SensorAccuracy;
  onCalibratePress?: () => void;
}

const SensorStatusComponent: React.FC<SensorStatusProps> = ({
  status,
  accuracy,
  onCalibratePress,
}) => {
  const { colors } = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return colors.success;
      case 'needs_calibration':
        return colors.warning;
      case 'unavailable':
        return colors.error;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return t('sensor_ready');
      case 'needs_calibration':
        return t('sensor_needs_calibration');
      case 'unavailable':
        return t('sensor_unavailable');
    }
  };

  const handleCalibrate = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    if (onCalibratePress) onCalibratePress();
  };

  return (
    <View style={styles.container}>
      {/* Sensor Health Badge */}
      <View style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.statusText, { color: colors.textPrimary }]}>
          {t('sensor_status')}: <Text style={{ fontFamily: typography.fontFamily.bold, color: getStatusColor() }}>{getStatusText()}</Text>
        </Text>
      </View>

      {/* Low Accuracy Warning Banner */}
      {status === 'needs_calibration' && (
        <TouchableOpacity
          style={[styles.warningBanner, { backgroundColor: colors.card, borderColor: colors.warning }]}
          onPress={handleCalibrate}
          activeOpacity={0.8}
        >
          <AlertTriangle size={18} color={colors.warning} style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.warningTitle, { color: colors.textPrimary }]}>
              {t('accuracy_warning')}
            </Text>
            <Text style={[styles.warningSub, { color: colors.accent }]}>
              {t('calibrate_compass')} →
            </Text>
          </View>
          <RefreshCw size={16} color={colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const SensorStatus = React.memo(SensorStatusComponent);

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    alignItems: 'center',
    width: '100%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    backgroundColor: 'transparent',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  icon: {
    marginRight: 10,
  },
  warningTitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.semibold,
    backgroundColor: 'transparent',
  },
  warningSub: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
});
