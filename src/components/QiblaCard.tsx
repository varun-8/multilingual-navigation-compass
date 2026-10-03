import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QiblaData } from '../utils/qiblaUtils';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { t } from '../i18n';
import { Compass, CheckCircle2 } from 'lucide-react-native';
import { shortestAngleDifference } from '../utils/angleUtils';

interface QiblaCardProps {
  qiblaData: QiblaData | null;
  currentHeading: number;
}

const QiblaCardComponent: React.FC<QiblaCardProps> = ({ qiblaData, currentHeading }) => {
  const { colors } = useTheme();

  if (!qiblaData) return null;

  const angularDelta = Math.round(shortestAngleDifference(currentHeading, qiblaData.qiblaAzimuth));
  const isAligned = Math.abs(angularDelta) <= 3;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: isAligned ? colors.success : colors.cardBorder }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Compass size={18} color={colors.success} style={styles.icon} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('qibla_direction')}</Text>
        </View>

        {isAligned && (
          <View style={[styles.alignedBadge, { backgroundColor: `${colors.success}20`, borderColor: colors.success }]}>
            <CheckCircle2 size={12} color={colors.success} style={{ marginRight: 4 }} />
            <Text style={[styles.alignedText, { color: colors.success }]}>{t('aligned')}</Text>
          </View>
        )}
      </View>

      <View style={styles.contentRow}>
        {/* Qibla Azimuth */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('qibla_bearing')}</Text>
          <Text style={[styles.val, { color: colors.success }]}>{qiblaData.qiblaAzimuth}°</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

        {/* Turn Delta */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('turn_delta')}</Text>
          <Text style={[styles.val, { color: isAligned ? colors.success : colors.warning }]}>
            {angularDelta > 0 ? `+${angularDelta}°` : `${angularDelta}°`}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

        {/* Distance */}
        <View style={styles.col}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('distance_kaaba')}</Text>
          <Text style={[styles.val, { color: colors.textPrimary }]}>{qiblaData.distanceKm} km</Text>
        </View>
      </View>
    </View>
  );
};

export const QiblaCard = React.memo(QiblaCardComponent);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: typography.fontFamily.headingBold,
    backgroundColor: 'transparent',
  },
  alignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  alignedText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    backgroundColor: 'transparent',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  col: {
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
  },
  label: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
    backgroundColor: 'transparent',
  },
  val: {
    fontSize: 16,
    fontFamily: typography.fontFamily.headingBold,
    fontVariant: ['tabular-nums'],
    backgroundColor: 'transparent',
  },
});
