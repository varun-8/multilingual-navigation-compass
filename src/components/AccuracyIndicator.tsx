import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SensorAccuracy } from '../types/compass';
import { useTheme } from '../hooks/useTheme';
import { t } from '../i18n';

interface AccuracyIndicatorProps {
  accuracy: SensorAccuracy;
}

export const AccuracyIndicator: React.FC<AccuracyIndicatorProps> = ({ accuracy }) => {
  const { colors } = useTheme();

  const getAccuracyColor = () => {
    switch (accuracy) {
      case 'high':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'low':
      case 'unreliable':
      default:
        return colors.error;
    }
  };

  const getLabel = () => {
    switch (accuracy) {
      case 'high':
        return t('accuracy_high');
      case 'medium':
        return t('accuracy_medium');
      case 'low':
      case 'unreliable':
      default:
        return t('accuracy_low');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{t('accuracy')}</Text>
      <View style={[styles.badge, { backgroundColor: getAccuracyColor() + '20' }]}>
        <View style={[styles.dot, { backgroundColor: getAccuracyColor() }]} />
        <Text style={[styles.text, { color: getAccuracyColor() }]}>{getLabel()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
