import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
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

const HeadingDisplayComponent: React.FC<HeadingDisplayProps> = ({
  heading,
  northReference,
  pitch = 0,
  roll = 0,
}) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const dirInfo = getDirectionFromHeading(heading);
  const localizedCode = getLocalizedCardinalCode(dirInfo.code);
  const localizedName = getLocalizedDirectionName(dirInfo.nameKey);

  const totalTilt = Math.sqrt(pitch * pitch + roll * roll);
  const isLevel = totalTilt <= 4;

  const isNorth = dirInfo.code === 'N';

  const isCompact = width < 360;

  return (
    <View style={styles.container}>
      {/* Primary Numerical Degree Display */}
      <View style={styles.degreeRow}>
        <Text
          style={[
            styles.degreeText,
            { color: colors.textPrimary, fontSize: isCompact ? 56 : 70 },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {Math.round(heading)}
        </Text>
        <Text
          style={[
            styles.degreeSymbol,
            { color: isNorth ? colors.northAccent : colors.accent, fontSize: isCompact ? 28 : 34 },
          ]}
        >
          °
        </Text>
      </View>

      {/* Direction Name & Code - Clean, Premium Typography adapting to all languages */}
      <View style={styles.directionRow}>
        <Text
          style={[
            styles.cardinalCodeText,
            { color: isNorth ? colors.northAccent : colors.accent, fontSize: isCompact ? 18 : 22 },
          ]}
          numberOfLines={1}
        >
          {localizedCode}
        </Text>
        <Text style={[styles.directionDot, { color: colors.textMuted }]}>•</Text>
        <Text
          style={[
            styles.nameText,
            { color: colors.textPrimary, fontSize: isCompact ? 18 : 22 },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
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
          <Text style={[styles.pillText, { color: colors.accent }]} numberOfLines={1}>
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
            numberOfLines={1}
          >
            {isLevel ? '0° LEVEL' : `${Math.round(totalTilt)}° TILT`}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const HeadingDisplay = React.memo(HeadingDisplayComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
    paddingHorizontal: 16,
  },
  degreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  degreeText: {
    fontFamily: typography.fontFamily.headingBlack,
    letterSpacing: -3,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    backgroundColor: 'transparent',
  },
  degreeSymbol: {
    fontFamily: typography.fontFamily.headingBold,
    marginTop: 6,
    marginLeft: 2,
    backgroundColor: 'transparent',
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
    maxWidth: '90%',
  },
  cardinalCodeText: {
    fontFamily: typography.fontFamily.headingBold,
    letterSpacing: 0.5,
    backgroundColor: 'transparent',
  },
  directionDot: {
    fontSize: 16,
    marginHorizontal: 8,
    backgroundColor: 'transparent',
  },
  nameText: {
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -0.3,
    backgroundColor: 'transparent',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.6,
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
