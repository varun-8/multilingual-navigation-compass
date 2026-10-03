import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Line,
  Circle,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Text as SvgText,
  Rect,
  G,
} from 'react-native-svg';
import { SolarData, formatSolarTime } from '../utils/sunUtils';
import { useTheme } from '../hooks/useTheme';
import { typography } from '../theme/typography';
import { t } from '../i18n';
import { Sun, Sunset, Sunrise, Compass } from 'lucide-react-native';

interface SolarCardProps {
  solarData: SolarData | null;
}

const SolarCardComponent: React.FC<SolarCardProps> = ({ solarData }) => {
  const { colors, isDark } = useTheme();

  if (!solarData) return null;

  const getPhaseBadge = () => {
    switch (solarData.phase) {
      case 'dawn':
        return { text: t('phase_dawn'), color: '#38BDF8' };
      case 'sunrise':
        return { text: t('sunrise'), color: '#F59E0B' };
      case 'day':
        return { text: t('phase_day'), color: '#FBBF24' };
      case 'golden_hour':
        return { text: t('phase_golden_hour'), color: '#F97316' };
      case 'sunset':
        return { text: t('sunset'), color: '#EC4899' };
      case 'dusk':
        return { text: t('phase_dusk'), color: '#8B5CF6' };
      default:
        return { text: t('phase_night'), color: '#64748B' };
    }
  };

  const phaseInfo = getPhaseBadge();

  // Sky Arc Coordinate Calculations (viewBox: 0 0 320 84)
  const skyArcMetrics = useMemo(() => {
    const horizonY = 56;
    const startX = 36;
    const endX = 284;
    const apexY = 16;
    const rx = (endX - startX) / 2; // 124
    const ry = horizonY - apexY;    // 40
    const centerX = 160;

    const sunriseMs = solarData.sunrise.getTime();
    const sunsetMs = solarData.sunset.getTime();
    const nowMs = Date.now();
    const totalDayMs = Math.max(1, sunsetMs - sunriseMs);

    let progress = (nowMs - sunriseMs) / totalDayMs;
    const isDay = solarData.isDaytime && progress >= 0 && progress <= 1;

    let sunX = centerX;
    let sunY = apexY;

    if (isDay) {
      // Angle alpha from PI (sunrise) to 0 (sunset)
      const alpha = Math.PI * (1 - Math.max(0, Math.min(1, progress)));
      sunX = centerX - rx * Math.cos(alpha);
      sunY = horizonY - ry * Math.sin(alpha);
    } else {
      // Sun below horizon
      const nightProgress = progress < 0 ? (progress + 1) : (progress - 1);
      const alpha = Math.PI * Math.max(-1, Math.min(1, nightProgress));
      sunX = centerX + rx * Math.cos(alpha);
      sunY = horizonY + 16 * Math.sin(Math.abs(alpha));
    }

    return {
      horizonY,
      startX,
      endX,
      apexY,
      centerX,
      rx,
      ry,
      sunX,
      sunY,
      isDay,
      dayProgress: Math.max(0, Math.min(1, progress)),
    };
  }, [solarData]);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Sun size={18} color="#FBBF24" style={styles.icon} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('solar_cycle')}</Text>
        </View>

        {/* Phase Badge */}
        <View style={[styles.phaseBadge, { backgroundColor: `${phaseInfo.color}20`, borderColor: phaseInfo.color }]}>
          <View style={[styles.phaseDot, { backgroundColor: phaseInfo.color }]} />
          <Text style={[styles.phaseText, { color: phaseInfo.color }]} numberOfLines={1}>{phaseInfo.text}</Text>
        </View>
      </View>

      {/* 2. Visual Celestial Sky Dome Arc Tracker */}
      <View style={styles.skyArcContainer}>
        <Svg width="100%" height={84} viewBox="0 0 320 84">
          <Defs>
            <RadialGradient id="arcSunGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFBEB" stopOpacity={0.9} />
              <Stop offset="35%" stopColor="#FDE047" stopOpacity={0.6} />
              <Stop offset="70%" stopColor="#F59E0B" stopOpacity={0.2} />
              <Stop offset="100%" stopColor="#D97706" stopOpacity={0} />
            </RadialGradient>

            <LinearGradient id="daylightArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8} />
              <Stop offset="50%" stopColor="#FEF08A" stopOpacity={1} />
              <Stop offset="100%" stopColor="#EC4899" stopOpacity={0.8} />
            </LinearGradient>

            <LinearGradient id="horizonLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
              <Stop offset="50%" stopColor={colors.cardBorder} stopOpacity={0.8} />
              <Stop offset="100%" stopColor="#EC4899" stopOpacity={0.3} />
            </LinearGradient>
          </Defs>

          {/* Daytime Celestial Arch: M startX horizonY A rx ry 0 0 1 endX horizonY */}
          <Path
            d={`M ${skyArcMetrics.startX} ${skyArcMetrics.horizonY} A ${skyArcMetrics.rx} ${skyArcMetrics.ry} 0 0 1 ${skyArcMetrics.endX} ${skyArcMetrics.horizonY}`}
            fill="none"
            stroke="url(#daylightArcGradient)"
            strokeWidth={2}
            strokeDasharray="4 3"
            opacity={0.65}
          />

          {/* Nighttime Under-Horizon Arc */}
          <Path
            d={`M ${skyArcMetrics.startX} ${skyArcMetrics.horizonY} A ${skyArcMetrics.rx} 16 0 0 0 ${skyArcMetrics.endX} ${skyArcMetrics.horizonY}`}
            fill="none"
            stroke="#6366F1"
            strokeWidth={1.2}
            strokeDasharray="3 3"
            opacity={0.35}
          />

          {/* Horizon Base Line */}
          <Line
            x1={20}
            y1={skyArcMetrics.horizonY}
            x2={300}
            y2={skyArcMetrics.horizonY}
            stroke="url(#horizonLineGrad)"
            strokeWidth={1.2}
          />

          {/* Solar Noon Apex Indicator */}
          <Line
            x1={skyArcMetrics.centerX}
            y1={skyArcMetrics.apexY - 3}
            x2={skyArcMetrics.centerX}
            y2={skyArcMetrics.apexY + 4}
            stroke={colors.cardBorder}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <SvgText
            x={skyArcMetrics.centerX}
            y={skyArcMetrics.apexY - 6}
            fill={colors.textMuted}
            fontSize={8}
            fontFamily="System"
            fontWeight="700"
            textAnchor="middle"
          >
            NOON {formatSolarTime(solarData.solarNoon)}
          </SvgText>

          {/* Sunrise Left Anchor Node */}
          <Circle
            cx={skyArcMetrics.startX}
            cy={skyArcMetrics.horizonY}
            r={4.5}
            fill="#F59E0B"
            stroke="#FFFBEB"
            strokeWidth={1.2}
          />
          <SvgText
            x={skyArcMetrics.startX}
            y={skyArcMetrics.horizonY + 14}
            fill="#F59E0B"
            fontSize={9}
            fontFamily="System"
            fontWeight="800"
            textAnchor="middle"
          >
            {formatSolarTime(solarData.sunrise)}
          </SvgText>

          {/* Sunset Right Anchor Node */}
          <Circle
            cx={skyArcMetrics.endX}
            cy={skyArcMetrics.horizonY}
            r={4.5}
            fill="#EC4899"
            stroke="#FFFBEB"
            strokeWidth={1.2}
          />
          <SvgText
            x={skyArcMetrics.endX}
            y={skyArcMetrics.horizonY + 14}
            fill="#EC4899"
            fontSize={9}
            fontFamily="System"
            fontWeight="800"
            textAnchor="middle"
          >
            {formatSolarTime(solarData.sunset)}
          </SvgText>

          {/* Active Sun Orb with Multi-Layer Glow */}
          {skyArcMetrics.isDay ? (
            <G key="arc-live-sun">
              {/* Volumetric Corona */}
              <Circle
                cx={skyArcMetrics.sunX}
                cy={skyArcMetrics.sunY}
                r={16}
                fill="url(#arcSunGlow)"
              />
              {/* Golden Sun Core */}
              <Circle
                cx={skyArcMetrics.sunX}
                cy={skyArcMetrics.sunY}
                r={5.5}
                fill="#FBBF24"
                stroke="#FFFFFF"
                strokeWidth={1.5}
              />
              {/* Floating Elevation Tooltip */}
              <G transform={`translate(${skyArcMetrics.sunX}, ${skyArcMetrics.sunY - 14})`}>
                <Rect
                  x={-18}
                  y={-7}
                  width={36}
                  height={13}
                  rx={6}
                  fill="#0B0F19EE"
                  stroke="#F59E0B"
                  strokeWidth={0.8}
                />
                <SvgText
                  x={0}
                  y={2.5}
                  fill="#FEF08A"
                  fontSize={8}
                  fontWeight="800"
                  fontFamily="System"
                  textAnchor="middle"
                >
                  +{solarData.currentSunElevation}°
                </SvgText>
              </G>
            </G>
          ) : (
            <G key="arc-night-sun">
              {/* Moonlit Night Glow */}
              <Circle
                cx={skyArcMetrics.sunX}
                cy={skyArcMetrics.sunY}
                r={10}
                fill="#6366F125"
              />
              {/* Moon Core */}
              <Circle
                cx={skyArcMetrics.sunX}
                cy={skyArcMetrics.sunY}
                r={4.5}
                fill="#4338CA"
                stroke="#818CF8"
                strokeWidth={1.2}
              />
              {/* Elevation Tooltip */}
              <G transform={`translate(${skyArcMetrics.sunX}, ${skyArcMetrics.sunY + 12})`}>
                <Rect
                  x={-18}
                  y={-6}
                  width={36}
                  height={12}
                  rx={6}
                  fill="#0B0F19EE"
                  stroke="#6366F1"
                  strokeWidth={0.8}
                />
                <SvgText
                  x={0}
                  y={2.5}
                  fill="#A5B4FC"
                  fontSize={8}
                  fontWeight="800"
                  fontFamily="System"
                  textAnchor="middle"
                >
                  {solarData.currentSunElevation}°
                </SvgText>
              </G>
            </G>
          )}
        </Svg>
      </View>

      {/* 3. Responsive Grid Readout */}
      <View style={styles.grid}>
        {/* Sunrise */}
        <View style={[styles.gridItem, { borderColor: colors.cardBorder }]}>
          <View style={styles.itemHeader}>
            <Sunrise size={13} color="#F59E0B" />
            <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
              {t('sunrise')}
            </Text>
          </View>
          <Text style={[styles.timeVal, { color: colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatSolarTime(solarData.sunrise)}
          </Text>
          <Text style={[styles.azimuthVal, { color: colors.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>
            {solarData.sunriseAzimuth}° {t('azimuth')}
          </Text>
        </View>

        {/* Sunset */}
        <View style={[styles.gridItem, { borderColor: colors.cardBorder }]}>
          <View style={styles.itemHeader}>
            <Sunset size={13} color="#EC4899" />
            <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
              {t('sunset')}
            </Text>
          </View>
          <Text style={[styles.timeVal, { color: colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatSolarTime(solarData.sunset)}
          </Text>
          <Text style={[styles.azimuthVal, { color: colors.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>
            {solarData.sunsetAzimuth}° {t('azimuth')}
          </Text>
        </View>

        {/* Current Sun Position */}
        <View style={[styles.gridItem, { borderColor: colors.cardBorder }]}>
          <View style={styles.itemHeader}>
            <Compass size={13} color={colors.accent} />
            <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
              {t('sun_azimuth')}
            </Text>
          </View>
          <Text style={[styles.timeVal, { color: colors.accent }]} numberOfLines={1} adjustsFontSizeToFit>
            {solarData.currentSunAzimuth}°
          </Text>
          <Text style={[styles.azimuthVal, { color: colors.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>
            {solarData.currentSunElevation > 0 ? `+${solarData.currentSunElevation}° ${t('elevation')}` : `${solarData.currentSunElevation}° ${t('below_horizon')}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const SolarCard = React.memo(SolarCardComponent);

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
    marginBottom: 8,
  },
  titleGroup: {
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
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  phaseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  phaseText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: 'transparent',
  },
  skyArcContainer: {
    width: '100%',
    height: 84,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
  },
  gridItem: {
    flex: 1,
    minWidth: 0,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    backgroundColor: 'transparent',
  },
  timeVal: {
    fontSize: 14,
    fontFamily: typography.fontFamily.headingBold,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  azimuthVal: {
    fontSize: 10,
    fontFamily: typography.fontFamily.regular,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
});
