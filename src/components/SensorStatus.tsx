import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SensorStatus as StatusType, SensorAccuracy } from '../types/compass';
import { useTheme } from '../hooks/useTheme';
import { t } from '../i18n';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react-native';

interface SensorStatusProps {
  status: StatusType;
  accuracy: SensorAccuracy;
  onCalibratePress?: () => void;
}

export const SensorStatus: React.FC<SensorStatusProps> = ({
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

  const getAccuracyText = () => {
    switch (accuracy) {
      case 'high':
        return t('accuracy_high');
      case 'medium':
        return t('accuracy_medium');
      case 'low':
        return t('accuracy_low');
      default:
        return t('accuracy_low');
    }
  };

  return (
    <View style={styles.container}>
      {/* Sensor Health Badge */}
      <View style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.statusText, { color: colors.textPrimary }]}>
          {t('sensor_status')}: <Text style={{ fontWeight: '700' }}>{getStatusText()}</Text>
        </Text>
      </View>

      {/* Low Accuracy Warning Banner */}
      {status === 'needs_calibration' && (
        <TouchableOpacity
          style={[styles.warningBanner, { backgroundColor: colors.accentLight }]}
          onPress={onCalibratePress}
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    alignItems: 'center',
    width: '100%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  icon: {
    marginRight: 10,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningSub: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});
