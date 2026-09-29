import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getDirectionFromHeading, getLocalizedCardinalCode, getLocalizedDirectionName } from '../utils/directionUtils';
import { NorthReference } from '../types/compass';
import { t } from '../i18n';

interface HeadingDisplayProps {
  heading: number;
  northReference: NorthReference;
  pitch?: number;
  roll?: number;
}

export const HeadingDisplay: React.FC<HeadingDisplayProps> = ({
  heading,
  northReference,
  pitch = 0,
  roll = 0,
}) => {
  const { colors } = useTheme();
  const dirInfo = getDirectionFromHeading(heading);
  const localizedCode = getLocalizedCardinalCode(dirInfo.code);
  const localizedName = getLocalizedDirectionName(dirInfo.nameKey);

  const totalTilt = Math.sqrt(pitch * pitch + roll * roll);
  const isLevel = totalTilt <= 5;

  return (
    <View style={styles.container}>
      {/* Primary Numerical Degree Display */}
      <View style={styles.degreeRow}>
        <Text
          style={[styles.degreeText, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {Math.round(heading)}
        </Text>
        <Text style={[styles.degreeSymbol, { color: colors.accent }]}>°</Text>
      </View>

      {/* Direction Badge & Name */}
      <View style={styles.directionRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: dirInfo.code === 'N' ? colors.northAccent : colors.accent },
          ]}
        >
          <Text style={styles.badgeText}>{localizedCode}</Text>
        </View>
        <Text style={[styles.nameText, { color: colors.textPrimary }]}>
          {localizedName}
        </Text>
      </View>

      {/* Telemetry Pills */}
      <View style={styles.metaRow}>
        <View style={[styles.pill, { backgroundColor: colors.accentLight, borderColor: colors.cardBorder }]}>
          <Text style={[styles.pillText, { color: colors.accent }]}>
            {northReference === 'true' ? t('true_north') : t('magnetic_north')}
          </Text>
        </View>

        <View
          style={[
            styles.pill,
            {
              backgroundColor: isLevel ? `${colors.success}1A` : `${colors.warning}1A`,
              borderColor: isLevel ? `${colors.success}40` : `${colors.warning}40`,
            },
          ]}
        >
          <View
            style={[
              styles.tiltDot,
              { backgroundColor: isLevel ? colors.success : colors.warning },
            ]}
          />
          <Text
            style={[
              styles.pillText,
              { color: isLevel ? colors.success : colors.warning },
            ]}
          >
            {isLevel ? '0° LEVEL' : `${Math.round(totalTilt)}° TILT`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  degreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  degreeText: {
    fontSize: 66,
    fontWeight: '900',
    letterSpacing: -2.5,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  degreeSymbol: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
    marginLeft: 2,
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tiltDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
});
