import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import {
  getDirectionFromHeading,
  getLocalizedCardinalCode,
  getLocalizedDirectionName,
} from '../utils/directionUtils';
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
  const isLevel = totalTilt <= 4;

  const isNorth = dirInfo.code === 'N';

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
        <Text
          style={[
            styles.degreeSymbol,
            { color: isNorth ? colors.northAccent : colors.accent },
          ]}
        >
          °
        </Text>
      </View>

      {/* Direction Name & Code - Clean, Premium Typography without boxy backgrounds */}
      <View style={styles.directionRow}>
        <Text
          style={[
            styles.cardinalCodeText,
            { color: isNorth ? colors.northAccent : colors.accent },
          ]}
        >
          {localizedCode}
        </Text>
        <Text style={[styles.directionDot, { color: colors.textMuted }]}>•</Text>
        <Text style={[styles.nameText, { color: colors.textPrimary }]}>
          {localizedName}
        </Text>
      </View>

      {/* Telemetry Pills - Clean Outline & Translucent Aesthetics */}
      <View style={styles.metaRow}>
        {/* Reference Mode Pill */}
        <View
          style={[
            styles.pill,
            {
              backgroundColor: 'transparent',
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.pillText, { color: colors.accent }]}>
            {northReference === 'true' ? t('true_north') : t('magnetic_north')}
          </Text>
        </View>

        {/* Level / Pitch Indicator Pill */}
        <View
          style={[
            styles.pill,
            {
              backgroundColor: 'transparent',
              borderColor: isLevel ? `${colors.success}60` : `${colors.warning}60`,
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
    marginVertical: 10,
  },
  degreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  degreeText: {
    fontSize: 72,
    fontWeight: '800',
    letterSpacing: -3,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    backgroundColor: 'transparent',
  },
  degreeSymbol: {
    fontSize: 34,
    fontWeight: '700',
    marginTop: 6,
    marginLeft: 2,
    backgroundColor: 'transparent',
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },
  cardinalCodeText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    backgroundColor: 'transparent',
  },
  directionDot: {
    fontSize: 16,
    marginHorizontal: 8,
    backgroundColor: 'transparent',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    backgroundColor: 'transparent',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 5,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    backgroundColor: 'transparent',
  },
  tiltDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
});
