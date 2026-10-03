import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, {
  Circle,
  Line,
  Text as SvgText,
  G,
  Polygon,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Rect,
} from 'react-native-svg';
import { toRadians, normalizeAngle } from '../utils/angleUtils';
import { SolarData } from '../utils/sunUtils';

interface CompassDialProps {
  heading: number; // 0..359
  pitch?: number; // deg (-90..90)
  roll?: number; // deg (-180..180)
  size?: number;
  solarData?: SolarData | null;
  showSunTracker?: boolean;
  nightVision?: boolean;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topSightContainer: {
    position: 'absolute',
    zIndex: 30,
    alignItems: 'center',
  },
});

const CompassDialComponent: React.FC<CompassDialProps> = ({
  heading,
  pitch = 0,
  roll = 0,
  size,
  solarData,
  showSunTracker = true,
  nightVision = false,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscape = windowWidth > windowHeight;

  // Responsive adaptive dial diameter calculation
  const computedSize = useMemo(() => {
    if (size) return size;
    const maxAvailableWidth = windowWidth - 36;
    const maxAvailableHeight = isLandscape ? windowHeight * 0.72 : windowHeight * 0.44;
    return Math.max(260, Math.min(maxAvailableWidth, maxAvailableHeight, 380));
  }, [size, windowWidth, windowHeight, isLandscape]);

  const radius = computedSize / 2;
  const center = radius;
  const scale = computedSize / 360;

  // Proportional concentric ring radii
  const outerBezelRadius = radius - 4 * scale;
  const innerBezelRadius = radius - 14 * scale;
  const dialRadius = radius - 20 * scale;
  const tickOuterRadius = dialRadius - 4 * scale;

  const majorTickLength = 14 * scale;
  const mediumTickLength = 9 * scale;
  const minorTickLength = 5 * scale;

  const degreeRadius = dialRadius - 32 * scale;
  const intercardinalRadius = dialRadius - 62 * scale;
  const needleLength = dialRadius - 38 * scale;

  // Theme color tokens
  const colors = useMemo(() => ({
    bezelOuter: nightVision ? '#180000' : '#0B0F19',
    bezelStroke: nightVision ? '#3F0000' : '#1E293B',
    dialBg1: nightVision ? '#120000' : '#0F172A',
    dialBg2: nightVision ? '#090000' : '#050811',
    tickMajor: nightVision ? '#FF3333' : '#F8FAFC',
    tickMedium: nightVision ? '#AA2222' : '#94A3B8',
    tickMinor: nightVision ? '#661111' : '#475569',
    north: nightVision ? '#FF0000' : '#EF4444',
    south: nightVision ? '#AA0000' : '#3B82F6',
    accentText: nightVision ? '#FF4444' : '#94A3B8',
    reticleOk: nightVision ? '#FF0000' : '#10B981',
    reticleWarn: nightVision ? '#AA4400' : '#F59E0B',
  }), [nightVision]);

  // Memoize 120 precision ticks
  const ticks = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      const angleDeg = i * 3;
      const isCardinal = angleDeg % 90 === 0;
      const isMajor = angleDeg % 30 === 0;
      const isMedium = angleDeg % 15 === 0;

      const angleRad = toRadians(angleDeg - 90);
      const tickLen = isCardinal
        ? 0
        : isMajor
        ? majorTickLength
        : isMedium
        ? mediumTickLength
        : minorTickLength;

      if (tickLen === 0) return null;

      const x1 = center + tickOuterRadius * Math.cos(angleRad);
      const y1 = center + tickOuterRadius * Math.sin(angleRad);
      const x2 = center + (tickOuterRadius - tickLen) * Math.cos(angleRad);
      const y2 = center + (tickOuterRadius - tickLen) * Math.sin(angleRad);

      const strokeWidth = (isMajor ? 2 : isMedium ? 1.5 : 0.8) * Math.max(0.8, scale);
      const stroke = isMajor ? colors.tickMajor : isMedium ? colors.tickMedium : colors.tickMinor;
      const opacity = isMajor ? 0.95 : isMedium ? 0.75 : 0.45;

      return { key: i, x1, y1, x2, y2, strokeWidth, stroke, opacity };
    }).filter(Boolean);
  }, [center, tickOuterRadius, majorTickLength, mediumTickLength, minorTickLength, colors, scale]);

  // Degree numbers around the dial
  const degreeNumbers = useMemo(() => {
    return [30, 60, 120, 150, 210, 240, 300, 330].map((deg) => {
      const angleRad = toRadians(deg - 90);
      const x = center + degreeRadius * Math.cos(angleRad);
      const y = center + degreeRadius * Math.sin(angleRad);
      return { deg, text: `${deg}°`, x, y };
    });
  }, [center, degreeRadius]);

  // Intercardinals (NE, SE, SW, NW)
  const intercardinals = useMemo(() => {
    return [
      { code: 'NE', deg: 45 },
      { code: 'SE', deg: 135 },
      { code: 'SW', deg: 225 },
      { code: 'NW', deg: 315 },
    ].map(({ code, deg }) => {
      const angleRad = toRadians(deg - 90);
      const x = center + intercardinalRadius * Math.cos(angleRad);
      const y = center + intercardinalRadius * Math.sin(angleRad);
      return { code, deg, x, y };
    });
  }, [center, intercardinalRadius]);

  // Level Bubble offsets based on pitch and roll
  const maxTiltOffset = 26 * scale;
  const bubbleX = Math.max(-maxTiltOffset, Math.min(maxTiltOffset, (-roll / 30) * maxTiltOffset));
  const bubbleY = Math.max(-maxTiltOffset, Math.min(maxTiltOffset, (pitch / 30) * maxTiltOffset));
  const totalTilt = Math.sqrt(pitch * pitch + roll * roll);
  const isLevel = totalTilt <= 4;

  // Helper for marker positioning on dial perimeter
  const getMarkerCoords = (azimuthDeg: number, radiusOffset: number = 18) => {
    const rad = toRadians(azimuthDeg - 90);
    const r = dialRadius - radiusOffset * scale;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
      rad,
    };
  };

  // Helper function to generate smooth SVG path for the solar ecliptic daytime arc
  const daylightArcPath = useMemo(() => {
    if (!solarData) return '';
    const r = dialRadius - 20 * scale;
    const startRad = toRadians(solarData.sunriseAzimuth - 90);
    const endRad = toRadians(solarData.sunsetAzimuth - 90);

    const x1 = center + r * Math.cos(startRad);
    const y1 = center + r * Math.sin(startRad);
    const x2 = center + r * Math.cos(endRad);
    const y2 = center + r * Math.sin(endRad);

    const deltaDeg = normalizeAngle(solarData.sunsetAzimuth - solarData.sunriseAzimuth);
    const largeArcFlag = deltaDeg > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  }, [solarData, dialRadius, scale, center]);

  return (
    <View style={[styles.container, { width: computedSize, height: computedSize }]}>
      {/* Top Precision Heading Sight (Fixed at 12 o'clock) */}
      <View style={[styles.topSightContainer, { top: -4 * scale }]}>
        <Svg width={28 * scale} height={22 * scale} viewBox="0 0 28 22">
          <Defs>
            <LinearGradient id="sightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={nightVision ? '#FF0000' : '#F59E0B'} />
              <Stop offset="100%" stopColor={nightVision ? '#AA0000' : '#D97706'} />
            </LinearGradient>
          </Defs>
          <Polygon points="14,20 2,2 26,2" fill="url(#sightGrad)" />
          <Polygon points="14,15 6,5 22,5" fill={nightVision ? '#FF3333' : '#FBBF24'} />
          <Line x1="14" y1="0" x2="14" y2="8" stroke="#FFFFFF" strokeWidth="2" />
        </Svg>
      </View>

      {/* Main Rotating Vector Compass Dial */}
      <Svg
        width={computedSize}
        height={computedSize}
        style={{ transform: [{ rotate: `${-heading}deg` }] }}
      >
        <Defs>
          <RadialGradient id="outerBezelGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="80%" stopColor={colors.bezelOuter} />
            <Stop offset="95%" stopColor={colors.bezelStroke} />
            <Stop offset="100%" stopColor={nightVision ? '#550000' : '#334155'} />
          </RadialGradient>

          <RadialGradient id="innerDialGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.dialBg1} />
            <Stop offset="65%" stopColor={colors.bezelOuter} />
            <Stop offset="100%" stopColor={colors.dialBg2} />
          </RadialGradient>

          <RadialGradient id="centerHubGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={nightVision ? '#FF3333' : '#FBBF24'} />
            <Stop offset="70%" stopColor={nightVision ? '#AA0000' : '#D97706'} />
            <Stop offset="100%" stopColor={nightVision ? '#550000' : '#78350F'} />
          </RadialGradient>

          <RadialGradient id="levelZoneGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={isLevel ? `${colors.reticleOk}25` : `${colors.reticleWarn}15`} />
            <Stop offset="100%" stopColor="transparent" />
          </RadialGradient>

          {/* High-Impact Multi-Tier Solar Corona Glow */}
          <RadialGradient id="sunCoronaGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFBEB" stopOpacity={0.95} />
            <Stop offset="30%" stopColor="#FDE047" stopOpacity={0.8} />
            <Stop offset="60%" stopColor="#F59E0B" stopOpacity={0.4} />
            <Stop offset="100%" stopColor="#D97706" stopOpacity={0} />
          </RadialGradient>

          {/* Deep Volumetric Atmospheric Solar Corona */}
          <RadialGradient id="sunCoronaVolumetric" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFDF0" stopOpacity={1} />
            <Stop offset="22%" stopColor="#FEF08A" stopOpacity={0.85} />
            <Stop offset="48%" stopColor="#FBBF24" stopOpacity={0.45} />
            <Stop offset="78%" stopColor="#F59E0B" stopOpacity={0.12} />
            <Stop offset="100%" stopColor="#D97706" stopOpacity={0} />
          </RadialGradient>

          {/* 3D Realistic Plasma Core Gradient */}
          <RadialGradient id="sunOrb3D" cx="35%" cy="32%" r="68%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="20%" stopColor="#FFFBEB" />
            <Stop offset="45%" stopColor="#FEF08A" />
            <Stop offset="72%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#B45309" />
          </RadialGradient>

          {/* Nighttime Celestial Moonlit Gradient */}
          <RadialGradient id="sunNightOrb" cx="35%" cy="32%" r="68%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="30%" stopColor="#E0E7FF" />
            <Stop offset="65%" stopColor="#818CF8" />
            <Stop offset="90%" stopColor="#4338CA" />
            <Stop offset="100%" stopColor="#1E1B4B" />
          </RadialGradient>

          {/* Nighttime Cosmic Corona Gradient */}
          <RadialGradient id="sunNightCorona" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#C7D2FE" stopOpacity={0.7} />
            <Stop offset="40%" stopColor="#818CF8" stopOpacity={0.3} />
            <Stop offset="80%" stopColor="#4338CA" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#1E1B4B" stopOpacity={0} />
          </RadialGradient>

          {/* Luminous Celestial Ecliptic Arc Gradient */}
          <LinearGradient id="eclipticArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
            <Stop offset="50%" stopColor="#FEF08A" stopOpacity={1} />
            <Stop offset="100%" stopColor="#F43F5E" stopOpacity={0.9} />
          </LinearGradient>

          {/* Luminous Solar Laser Beam Gradient */}
          <LinearGradient id="sunLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F59E0B" stopOpacity={0.15} />
            <Stop offset="50%" stopColor="#FBBF24" stopOpacity={0.6} />
            <Stop offset="100%" stopColor="#FEF08A" stopOpacity={1} />
          </LinearGradient>
        </Defs>

        {/* 1. Outer Metallic Bezel */}
        <Circle
          cx={center}
          cy={center}
          r={outerBezelRadius}
          fill="url(#outerBezelGrad)"
          stroke={colors.bezelStroke}
          strokeWidth={2 * scale}
        />

        {/* 2. Concentric Bezel Accent Ring */}
        <Circle
          cx={center}
          cy={center}
          r={innerBezelRadius}
          fill="none"
          stroke={colors.bezelStroke}
          strokeWidth={1}
          strokeDasharray="4 2"
          opacity={0.6}
        />

        {/* 3. Deep Dark Dial Core Face */}
        <Circle
          cx={center}
          cy={center}
          r={dialRadius}
          fill="url(#innerDialGrad)"
          stroke={colors.bezelStroke}
          strokeWidth={1.5 * scale}
        />

        {/* 4. Outer Tick Track Boundary */}
        <Circle
          cx={center}
          cy={center}
          r={tickOuterRadius}
          fill="none"
          stroke={colors.bezelStroke}
          strokeWidth={1}
          opacity={0.8}
        />

        {/* 5. Inner Boundary Ring */}
        <Circle
          cx={center}
          cy={center}
          r={degreeRadius + 12 * scale}
          fill="none"
          stroke={colors.bezelStroke}
          strokeWidth={1}
          opacity={0.5}
        />

        {/* 6. Precision 120 Dial Ticks */}
        <G>
          {ticks.map((t: any) => (
            <Line
              key={t.key}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.stroke}
              strokeWidth={t.strokeWidth}
              opacity={t.opacity}
              strokeLinecap="round"
            />
          ))}
        </G>

        {/* 7. Degree Numeric Labels */}
        <G>
          {degreeNumbers.map((lbl) => (
            <SvgText
              key={lbl.deg}
              x={lbl.x}
              y={lbl.y + 4 * scale}
              fill={colors.accentText}
              fontSize={Math.max(8, 10 * scale)}
              fontWeight="700"
              fontFamily="System"
              textAnchor="middle"
            >
              {lbl.text}
            </SvgText>
          ))}
        </G>

        {/* 8. Intercardinal Labels (NE, SE, SW, NW) */}
        <G>
          {intercardinals.map((ic) => (
            <SvgText
              key={ic.code}
              x={ic.x}
              y={ic.y + 4 * scale}
              fill={nightVision ? '#AA2222' : '#64748B'}
              fontSize={Math.max(10, 12 * scale)}
              fontWeight="800"
              letterSpacing={0.5}
              textAnchor="middle"
            >
              {ic.code}
            </SvgText>
          ))}
        </G>

        {/* 9. LUXURY SWISS-GRADE REAL-TIME CELESTIAL SUN TRACKER */}
        {showSunTracker && solarData && (
          <G key="sun-tracker-layer">
            {/* A. Golden Daytime Ecliptic Path Arc across sky */}
            {daylightArcPath !== '' && (
              <G>
                {/* Luminous atmospheric sky trajectory glow */}
                <Path
                  d={daylightArcPath}
                  fill="none"
                  stroke="url(#eclipticArcGrad)"
                  strokeWidth={4 * scale}
                  opacity={0.2}
                  strokeLinecap="round"
                />
                {/* Precision dashed ecliptic flight path */}
                <Path
                  d={daylightArcPath}
                  fill="none"
                  stroke="url(#eclipticArcGrad)"
                  strokeWidth={1.5 * scale}
                  strokeDasharray="4 3"
                  opacity={0.8}
                  strokeLinecap="round"
                />
              </G>
            )}

            {/* B. Center-to-Sun High-Tech Laser Beam Vector */}
            {(() => {
              const sunPt = getMarkerCoords(solarData.currentSunAzimuth, 18);
              const innerRadius = 28 * scale;
              const startX = center + innerRadius * Math.cos(sunPt.rad);
              const startY = center + innerRadius * Math.sin(sunPt.rad);
              const isDay = solarData.isDaytime;

              return (
                <G key="sun-vector-beam">
                  {/* Outer Glow Halo Beam */}
                  <Line
                    x1={startX}
                    y1={startY}
                    x2={sunPt.x}
                    y2={sunPt.y}
                    stroke={isDay ? '#FBBF24' : '#6366F1'}
                    strokeWidth={4 * scale}
                    opacity={isDay ? 0.12 : 0.06}
                    strokeLinecap="round"
                  />
                  {/* Core Precision Laser Line */}
                  <Line
                    x1={startX}
                    y1={startY}
                    x2={sunPt.x}
                    y2={sunPt.y}
                    stroke={isDay ? 'url(#sunLaserGrad)' : '#818CF8'}
                    strokeWidth={1.4 * scale}
                    strokeDasharray="4 2"
                    opacity={isDay ? 0.9 : 0.5}
                  />
                  {/* Outer Bezel Solar Precision Alignment Pip */}
                  {(() => {
                    const rimX = center + (dialRadius + 7 * scale) * Math.cos(sunPt.rad);
                    const rimY = center + (dialRadius + 7 * scale) * Math.sin(sunPt.rad);
                    return (
                      <Circle
                        cx={rimX}
                        cy={rimY}
                        r={2.5 * scale}
                        fill={isDay ? '#FDE047' : '#A5B4FC'}
                        stroke={isDay ? '#92400E' : '#312E81'}
                        strokeWidth={1}
                      />
                    );
                  })()}
                </G>
              );
            })()}

            {/* C. Modern Sunrise Horizon Glyph (🌅 Dawn Hallmark) */}
            {(() => {
              const pt = getMarkerCoords(solarData.sunriseAzimuth, 20);
              return (
                <G key="sunrise-anchor">
                  {/* Dawn Horizon Tick */}
                  <Line
                    x1={pt.x - 5 * scale}
                    y1={pt.y}
                    x2={pt.x + 5 * scale}
                    y2={pt.y}
                    stroke="#F59E0B"
                    strokeWidth={1.5 * scale}
                    strokeLinecap="round"
                    opacity={0.9}
                  />
                  {/* Ascending Solar Half-Disc */}
                  <Circle cx={pt.x} cy={pt.y - 1.5 * scale} r={3.5 * scale} fill="#F59E0B" stroke="#FFFBEB" strokeWidth={0.8} />
                  {/* Counter-Rotated RISE Micro-Tag (Always Level & Upright!) */}
                  <G transform={`rotate(${heading}, ${pt.x}, ${pt.y}) translate(0, ${10 * scale})`}>
                    <SvgText
                      x={0}
                      y={0}
                      fill="#F59E0B"
                      fontSize={Math.max(6, 7 * scale)}
                      fontWeight="800"
                      fontFamily="System"
                      letterSpacing={0.5}
                      textAnchor="middle"
                    >
                      ▲ RISE
                    </SvgText>
                  </G>
                </G>
              );
            })()}

            {/* D. Modern Sunset Horizon Glyph (🌇 Dusk Hallmark) */}
            {(() => {
              const pt = getMarkerCoords(solarData.sunsetAzimuth, 20);
              return (
                <G key="sunset-anchor">
                  {/* Dusk Horizon Tick */}
                  <Line
                    x1={pt.x - 5 * scale}
                    y1={pt.y}
                    x2={pt.x + 5 * scale}
                    y2={pt.y}
                    stroke="#EC4899"
                    strokeWidth={1.5 * scale}
                    strokeLinecap="round"
                    opacity={0.9}
                  />
                  {/* Setting Solar Half-Disc */}
                  <Circle cx={pt.x} cy={pt.y + 1.5 * scale} r={3.5 * scale} fill="#EC4899" stroke="#FFF1F2" strokeWidth={0.8} />
                  {/* Counter-Rotated SET Micro-Tag (Always Level & Upright!) */}
                  <G transform={`rotate(${heading}, ${pt.x}, ${pt.y}) translate(0, ${10 * scale})`}>
                    <SvgText
                      x={0}
                      y={0}
                      fill="#EC4899"
                      fontSize={Math.max(6, 7 * scale)}
                      fontWeight="800"
                      fontFamily="System"
                      letterSpacing={0.5}
                      textAnchor="middle"
                    >
                      ▼ SET
                    </SvgText>
                  </G>
                </G>
              );
            })()}

            {/* E. BREATHTAKING VOLUMETRIC CELESTIAL SUN ORB */}
            {(() => {
              const pt = getMarkerCoords(solarData.currentSunAzimuth, 18);
              const isDay = solarData.isDaytime;
              const rCorona = 20 * scale;
              const rCore = 5.5 * scale;
              const rHalo = 10 * scale;

              if (isDay) {
                return (
                  <G key="live-sun-graphic">
                    {/* Layer 1: Atmospheric Corona Glow */}
                    <Circle cx={pt.x} cy={pt.y} r={rCorona} fill="url(#sunCoronaVolumetric)" />

                    {/* Layer 2: Delicate Solar Orbit Halo Ring */}
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r={rHalo}
                      fill="none"
                      stroke="#FDE047"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      opacity={0.65}
                    />

                    {/* Layer 3: 4 Delicate Astral Cross Glints */}
                    <Line x1={pt.x} y1={pt.y - rCore - 3 * scale} x2={pt.x} y2={pt.y + rCore + 3 * scale} stroke="#FFFBEB" strokeWidth={1} strokeLinecap="round" opacity={0.85} />
                    <Line x1={pt.x - rCore - 3 * scale} y1={pt.y} x2={pt.x + rCore + 3 * scale} y2={pt.y} stroke="#FFFBEB" strokeWidth={1} strokeLinecap="round" opacity={0.85} />

                    {/* Layer 4: Deep Gold Metallic Bezel Ring */}
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r={rCore + 1.8 * scale}
                      fill="#92400E"
                      stroke="#FEF08A"
                      strokeWidth={1 * scale}
                    />

                    {/* Layer 5: 3D Spherical Solar Plasma Core */}
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r={rCore}
                      fill="url(#sunOrb3D)"
                    />

                    {/* Layer 6: Specular Glint */}
                    <Circle
                      cx={pt.x - 1.5 * scale}
                      cy={pt.y - 1.5 * scale}
                      r={1.8 * scale}
                      fill="#FFFFFF"
                      opacity={0.95}
                    />

                    {/* Layer 7: COUNTER-ROTATED TELEMETRY HUD BADGE (ALWAYS LEVEL & UPRIGHT!) */}
                    <G transform={`rotate(${heading}, ${pt.x}, ${pt.y}) translate(0, ${15 * scale})`}>
                      <Rect
                        x={-19 * scale}
                        y={-6 * scale}
                        width={38 * scale}
                        height={12 * scale}
                        rx={6 * scale}
                        fill="#050811F0"
                        stroke="#F59E0B"
                        strokeWidth={1}
                      />
                      <SvgText
                        x={0}
                        y={2.8 * scale}
                        fill="#FEF08A"
                        fontSize={Math.max(7, 8 * scale)}
                        fontWeight="800"
                        fontFamily="System"
                        textAnchor="middle"
                      >
                        +{solarData.currentSunElevation}°
                      </SvgText>
                    </G>
                  </G>
                );
              } else {
                // Nighttime Moonlit Representation
                return (
                  <G key="night-sun-graphic">
                    <Circle cx={pt.x} cy={pt.y} r={16 * scale} fill="url(#sunNightCorona)" />
                    <Circle
                      cx={pt.x}
                      cy={pt.y}
                      r={9 * scale}
                      fill="none"
                      stroke="#818CF8"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      opacity={0.6}
                    />
                    <Circle cx={pt.x} cy={pt.y} r={6 * scale} fill="url(#sunNightOrb)" stroke="#C7D2FE" strokeWidth={0.8 * scale} />
                    <Path
                      d={`M ${pt.x - 1.5 * scale} ${pt.y - 3.5 * scale} A 3 3 0 0 0 ${pt.x - 1.5 * scale} ${pt.y + 3.5 * scale} A 4 4 0 0 1 ${pt.x - 1.5 * scale} ${pt.y - 3.5 * scale}`}
                      fill="#E0E7FF"
                    />
                    {/* Counter-Rotated Night Telemetry Badge (Always Level & Upright!) */}
                    <G transform={`rotate(${heading}, ${pt.x}, ${pt.y}) translate(0, ${15 * scale})`}>
                      <Rect
                        x={-19 * scale}
                        y={-6 * scale}
                        width={38 * scale}
                        height={12 * scale}
                        rx={6 * scale}
                        fill="#050811F0"
                        stroke="#6366F1"
                        strokeWidth={1}
                      />
                      <SvgText
                        x={0}
                        y={2.8 * scale}
                        fill="#C7D2FE"
                        fontSize={Math.max(7, 8 * scale)}
                        fontWeight="800"
                        fontFamily="System"
                        textAnchor="middle"
                      >
                        {solarData.currentSunElevation}°
                      </SvgText>
                    </G>
                  </G>
                );
              }
            })()}
          </G>
        )}

        {/* 10. CARDINALS: NORTH (Apex Red Indicator + 'N') */}
        <G>
          <Polygon
            points={`${center},${center - dialRadius + 5 * scale} ${center - 6 * scale},${center - dialRadius + 17 * scale} ${center + 6 * scale},${center - dialRadius + 17 * scale}`}
            fill={colors.north}
          />
          <SvgText
            x={center}
            y={center - dialRadius + 38 * scale}
            fill={colors.north}
            fontSize={Math.max(16, 22 * scale)}
            fontWeight="900"
            letterSpacing={0.5}
            textAnchor="middle"
          >
            N
          </SvgText>
        </G>

        {/* 11. CARDINALS: SOUTH */}
        <G>
          <Line
            x1={center}
            y1={center + dialRadius - 6 * scale}
            x2={center}
            y2={center + dialRadius - 18 * scale}
            stroke={colors.tickMajor}
            strokeWidth={3 * scale}
            strokeLinecap="round"
          />
          <SvgText
            x={center}
            y={center + dialRadius - 26 * scale}
            fill={colors.tickMajor}
            fontSize={Math.max(15, 20 * scale)}
            fontWeight="900"
            textAnchor="middle"
          >
            S
          </SvgText>
          <SvgText
            x={center}
            y={center + dialRadius - 46 * scale}
            fill={colors.accentText}
            fontSize={Math.max(8, 10 * scale)}
            fontWeight="700"
            textAnchor="middle"
          >
            180°
          </SvgText>
        </G>

        {/* 12. CARDINALS: EAST */}
        <G>
          <Line
            x1={center + dialRadius - 6 * scale}
            y1={center}
            x2={center + dialRadius - 18 * scale}
            y2={center}
            stroke={colors.tickMajor}
            strokeWidth={3 * scale}
            strokeLinecap="round"
          />
          <SvgText
            x={center + dialRadius - 28 * scale}
            y={center + 6 * scale}
            fill={colors.tickMajor}
            fontSize={Math.max(15, 20 * scale)}
            fontWeight="900"
            textAnchor="middle"
          >
            E
          </SvgText>
          <SvgText
            x={center + dialRadius - 48 * scale}
            y={center + 4 * scale}
            fill={colors.accentText}
            fontSize={Math.max(8, 10 * scale)}
            fontWeight="700"
            textAnchor="middle"
          >
            90°
          </SvgText>
        </G>

        {/* 13. CARDINALS: WEST */}
        <G>
          <Line
            x1={center - dialRadius + 6 * scale}
            y1={center}
            x2={center - dialRadius + 18 * scale}
            y2={center}
            stroke={colors.tickMajor}
            strokeWidth={3 * scale}
            strokeLinecap="round"
          />
          <SvgText
            x={center - dialRadius + 28 * scale}
            y={center + 6 * scale}
            fill={colors.tickMajor}
            fontSize={Math.max(15, 20 * scale)}
            fontWeight="900"
            textAnchor="middle"
          >
            W
          </SvgText>
          <SvgText
            x={center - dialRadius + 50 * scale}
            y={center + 4 * scale}
            fill={colors.accentText}
            fontSize={Math.max(8, 10 * scale)}
            fontWeight="700"
            textAnchor="middle"
          >
            270°
          </SvgText>
        </G>

        {/* 14. Tactical Crosshair Reticle Grid */}
        <G opacity={0.25}>
          <Line x1={center} y1={center - 65 * scale} x2={center} y2={center - 24 * scale} stroke={nightVision ? '#FF0000' : '#38BDF8'} strokeWidth={1} strokeDasharray="3 3" />
          <Line x1={center} y1={center + 24 * scale} x2={center} y2={center + 65 * scale} stroke={nightVision ? '#FF0000' : '#38BDF8'} strokeWidth={1} strokeDasharray="3 3" />
          <Line x1={center - 65 * scale} y1={center} x2={center - 24 * scale} y2={center} stroke={nightVision ? '#FF0000' : '#38BDF8'} strokeWidth={1} strokeDasharray="3 3" />
          <Line x1={center + 65 * scale} y1={center} x2={center + 24 * scale} y2={center} stroke={nightVision ? '#FF0000' : '#38BDF8'} strokeWidth={1} strokeDasharray="3 3" />
        </G>

        {/* 15. Concentric Level Pitch/Roll Reference Target Zone */}
        <Circle
          cx={center}
          cy={center}
          r={maxTiltOffset + 2 * scale}
          fill="url(#levelZoneGrad)"
          stroke={isLevel ? colors.reticleOk : (nightVision ? '#882222' : '#475569')}
          strokeWidth={1}
          strokeDasharray="2 2"
          opacity={isLevel ? 0.8 : 0.4}
        />
        <Circle
          cx={center}
          cy={center}
          r={12 * scale}
          fill="none"
          stroke={isLevel ? colors.reticleOk : (nightVision ? '#661111' : '#334155')}
          strokeWidth={0.8}
          opacity={0.6}
        />

        {/* 16. 3D FACETED AERONAUTICAL NEEDLE */}
        <G>
          <Polygon
            points={`${center - 10 * scale},${center} ${center},${center - needleLength} ${center},${center}`}
            fill={nightVision ? '#AA0000' : '#DC2626'}
          />
          <Polygon
            points={`${center + 10 * scale},${center} ${center},${center - needleLength} ${center},${center}`}
            fill={colors.north}
          />
          <Line
            x1={center}
            y1={center - needleLength + 6 * scale}
            x2={center}
            y2={center - 12 * scale}
            stroke={nightVision ? '#FF8888' : '#FCA5A5'}
            strokeWidth={1}
            opacity={0.9}
          />
        </G>

        <G>
          <Polygon
            points={`${center - 10 * scale},${center} ${center},${center + needleLength} ${center},${center}`}
            fill={nightVision ? '#550000' : '#1D4ED8'}
          />
          <Polygon
            points={`${center + 10 * scale},${center} ${center},${center + needleLength} ${center},${center}`}
            fill={colors.south}
          />
          <Line
            x1={center}
            y1={center + 12 * scale}
            x2={center}
            y2={center + needleLength - 6 * scale}
            stroke={nightVision ? '#AA5555' : '#93C5FD'}
            strokeWidth={1}
            opacity={0.9}
          />
        </G>

        {/* 17. Metallic Pivot Hub */}
        <Circle
          cx={center}
          cy={center}
          r={14 * scale}
          fill="url(#centerHubGrad)"
          stroke={nightVision ? '#AA0000' : '#78350F'}
          strokeWidth={1.5}
        />
        <Circle
          cx={center}
          cy={center}
          r={9 * scale}
          fill={colors.bezelOuter}
          stroke={nightVision ? '#FF3333' : '#F59E0B'}
          strokeWidth={1}
        />
        <Circle
          cx={center}
          cy={center}
          r={4 * scale}
          fill={nightVision ? '#FF6666' : '#FBBF24'}
        />

        {/* 18. Integrated Level Bubble Reticle */}
        <G transform={`rotate(${heading}, ${center}, ${center})`}>
          <Circle
            cx={center + bubbleX}
            cy={center + bubbleY}
            r={7 * scale}
            fill={isLevel ? colors.reticleOk : colors.reticleWarn}
            opacity={0.3}
          />
          <Circle
            cx={center + bubbleX}
            cy={center + bubbleY}
            r={5 * scale}
            fill={isLevel ? (nightVision ? '#FF3333' : '#34D399') : (nightVision ? '#FF9900' : '#FBBF24')}
            stroke="#FFFFFF"
            strokeWidth={1}
            opacity={0.95}
          />
          <Circle
            cx={center + bubbleX - 1.5 * scale}
            cy={center + bubbleY - 1.5 * scale}
            r={1.5 * scale}
            fill="#FFFFFF"
          />
        </G>
      </Svg>
    </View>
  );
};

export const CompassDial = React.memo(CompassDialComponent);
