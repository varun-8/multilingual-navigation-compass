import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { HeadingLockState } from '../types/compass';
import { useTheme } from '../hooks/useTheme';
import { t } from '../i18n';
import { Lock, Unlock } from 'lucide-react-native';

interface HeadingLockBarProps {
  heading: number;
  lockState: HeadingLockState;
  difference: number;
  onToggleLock: () => void;
}

export const HeadingLockBar: React.FC<HeadingLockBarProps> = ({
  heading,
  lockState,
  difference,
  onToggleLock,
}) => {
  const { colors } = useTheme();

  const handleToggle = () => {
    try {
      Haptics.impactAsync(
        lockState.isLocked
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium
      );
    } catch (e) {}
    onToggleLock();
  };

  const formattedDiff =
    difference > 0 ? `+${Math.round(difference)}°` : `${Math.round(difference)}°`;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.lockButton,
          {
            backgroundColor: lockState.isLocked ? colors.accentLight : colors.card,
            borderColor: lockState.isLocked ? colors.accent : colors.cardBorder,
          },
        ]}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        {lockState.isLocked ? (
          <Lock size={15} color={colors.accent} style={styles.icon} />
        ) : (
          <Unlock size={15} color={colors.textSecondary} style={styles.icon} />
        )}
        <Text
          style={[
            styles.lockButtonText,
            { color: lockState.isLocked ? colors.accent : colors.textPrimary },
          ]}
        >
          {lockState.isLocked ? t('unlock_heading') : t('lock_heading')}
        </Text>
      </TouchableOpacity>

      {lockState.isLocked && lockState.lockedHeading !== null && (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.accent },
          ]}
        >
          <View style={styles.infoCol}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('locked')}</Text>
            <Text style={[styles.infoVal, { color: colors.accent }]}>
              {Math.round(lockState.lockedHeading)}°
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          <View style={styles.infoCol}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('heading')}</Text>
            <Text style={[styles.infoVal, { color: colors.textPrimary }]}>
              {Math.round(heading)}°
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

          <View style={styles.infoCol}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('difference')}</Text>
            <Text
              style={[
                styles.infoVal,
                { color: Math.abs(difference) < 5 ? colors.success : colors.northAccent },
              ]}
            >
              {formattedDiff}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 6,
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  lockButtonText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    backgroundColor: 'transparent',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  infoCol: {
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 28,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    backgroundColor: 'transparent',
  },
  infoVal: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
    backgroundColor: 'transparent',
  },
});
