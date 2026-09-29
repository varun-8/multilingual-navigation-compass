import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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
  Rect,
} from 'react-native-svg';
import { toRadians } from '../utils/angleUtils';

interface CompassDialProps {
  heading: number; // 0..359
  pitch?: number; // deg (-90..90)
  roll?: number; // deg (-180..180)
  size?: number;
}

const DEFAULT_SIZE = Math.min(Dimensions.get('window').width - 32, 360);

export const CompassDial: React.FC<CompassDialProps> = ({
  heading,
  pitch = 0,
  roll = 0,
  size = DEFAULT_SIZE,
}) => {
  const radius = size / 2;
  const center = radius;

  // Concentric ring radii
  const outerBezelRadius = radius - 4;
  const innerBezelRadius = radius - 14;
  const dialRadius = radius - 20;
  const tickOuterRadius = dialRadius - 4;

  const majorTickLength = 14;
  const mediumTickLength = 9;
  const minorTickLength = 5;

  const degreeRadius = dialRadius - 32;
  const cardinalRadius = dialRadius - 52;
  const intercardinalRadius = dialRadius - 62;
  const needleLength = dialRadius - 38;

  // Generate 120 precision ticks (every 3 degrees for high-end aeronautical look)
  const ticks = Array.from({ length: 120 }, (_, i) => {
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

    const strokeWidth = isMajor ? 2 : isMedium ? 1.5 : 0.8;
    const stroke = isMajor ? '#F8FAFC' : isMedium ? '#94A3B8' : '#475569';
    const opacity = isMajor ? 0.95 : isMedium ? 0.75 : 0.45;

    return { key: i, x1, y1, x2, y2, strokeWidth, stroke, opacity };
  }).filter(Boolean);

  // Degree numbers around the dial (every 30 deg except cardinals 0, 90, 180, 270)
  const degreeNumbers = [30, 60, 120, 150, 210, 240, 300, 330].map((deg) => {
    const angleRad = toRadians(deg - 90);
    const x = center + degreeRadius * Math.cos(angleRad);
    const y = center + degreeRadius * Math.sin(angleRad);
    return { deg, text: `${deg}°`, x, y };
  });

  // Intercardinals (NE, SE, SW, NW)
  const intercardinals = [
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

  // Level Bubble offsets based on pitch and roll
  const maxTiltOffset = 28;
  const bubbleX = Math.max(-maxTiltOffset, Math.min(maxTiltOffset, (-roll / 30) * maxTiltOffset));
  const bubbleY = Math.max(-maxTiltOffset, Math.min(maxTiltOffset, (pitch / 30) * maxTiltOffset));
  const totalTilt = Math.sqrt(pitch * pitch + roll * roll);
  const isLevel = totalTilt <= 4;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Top Precision Heading Sight (Fixed at 12 o'clock) */}
      <View style={styles.topSightContainer}>
        <Svg width={28} height={22} viewBox="0 0 28 22">
          <Defs>
            <LinearGradient id="sightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#D97706" />
            </LinearGradient>
          </Defs>
          {/* Tactical Marker Chevron */}
          <Polygon points="14,20 2,2 26,2" fill="url(#sightGrad)" />
          <Polygon points="14,15 6,5 22,5" fill="#FBBF24" />
          <Line x1="14" y1="0" x2="14" y2="8" stroke="#FFFFFF" strokeWidth="2" />
        </Svg>
      </View>

      {/* Main Rotating Vector Compass Dial */}
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: `${-heading}deg` }] }}
      >
        <Defs>
          {/* Outer Bezel Radial Dark Gradient */}
          <RadialGradient id="outerBezelGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="80%" stopColor="#0B0F19" />
            <Stop offset="95%" stopColor="#1E293B" />
            <Stop offset="100%" stopColor="#334155" />
          </RadialGradient>

          {/* Inner Dial Face Radial Gradient */}
          <RadialGradient id="innerDialGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#0F172A" />
            <Stop offset="65%" stopColor="#090D16" />
            <Stop offset="100%" stopColor="#050811" />
          </RadialGradient>

          {/* Glowing Center Hub Radial Gradient */}
          <RadialGradient id="centerHubGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FBBF24" />
            <Stop offset="70%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#78350F" />
          </RadialGradient>

          {/* Level Reticle Ring Gradient */}
          <RadialGradient id="levelZoneGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={isLevel ? '#10B98125' : '#F59E0B15'} />
            <Stop offset="100%" stopColor="transparent" />
          </RadialGradient>
        </Defs>

        {/* 1. Outer Stealth Metallic Bezel */}
        <Circle
          cx={center}
          cy={center}
          r={outerBezelRadius}
          fill="url(#outerBezelGrad)"
          stroke="#1E293B"
          strokeWidth={2}
        />

        {/* 2. Concentric Bezel Accent Ring */}
        <Circle
          cx={center}
          cy={center}
          r={innerBezelRadius}
          fill="none"
          stroke="#334155"
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
          stroke="#1E293B"
          strokeWidth={1.5}
        />

        {/* 4. Outer Tick Track Boundary */}
        <Circle
          cx={center}
          cy={center}
          r={tickOuterRadius}
          fill="none"
          stroke="#334155"
          strokeWidth={1}
          opacity={0.8}
        />

        {/* 5. Inner Level Boundary Ring */}
        <Circle
          cx={center}
          cy={center}
          r={degreeRadius + 12}
          fill="none"
          stroke="#1E293B"
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

        {/* 7. Degree Numeric Labels (30°, 60°, 120°, 150°, 210°, 240°, 300°, 330°) */}
        <G>
          {degreeNumbers.map((lbl) => (
            <SvgText
              key={lbl.deg}
              x={lbl.x}
              y={lbl.y + 4}
              fill="#94A3B8"
              fontSize={10}
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
              y={ic.y + 4}
              fill="#64748B"
              fontSize={12}
              fontWeight="800"
              letterSpacing={0.5}
              textAnchor="middle"
            >
              {ic.code}
            </SvgText>
          ))}
        </G>

        {/* 9. CARDINALS: NORTH (Apex Red Indicator + 'N') */}
        <G>
          {/* North Triangular Apex Marker */}
          <Polygon
            points={`${center},${center - dialRadius + 5} ${center - 6},${center - dialRadius + 17} ${center + 6},${center - dialRadius + 17}`}
            fill="#EF4444"
          />
          <SvgText
            x={center}
            y={center - dialRadius + 38}
            fill="#EF4444"
            fontSize={22}
            fontWeight="900"
            letterSpacing={0.5}
            textAnchor="middle"
          >
            N
          </SvgText>
        </G>

        {/* 10. CARDINALS: SOUTH (Line + 'S' + 180°) */}
        <G>
          <Line
            x1={center}
            y1={center + dialRadius - 6}
            x2={center}
            y2={center + dialRadius - 18}
            stroke="#F8FAFC"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <SvgText
            x={center}
            y={center + dialRadius - 26}
            fill="#F8FAFC"
            fontSize={20}
            fontWeight="900"
            textAnchor="middle"
          >
            S
          </SvgText>
          <SvgText
            x={center}
            y={center + dialRadius - 46}
            fill="#94A3B8"
            fontSize={10}
            fontWeight="700"
            textAnchor="middle"
          >
            180°
          </SvgText>
        </G>

        {/* 11. CARDINALS: EAST (Line + 'E' + 90°) */}
        <G>
          <Line
            x1={center + dialRadius - 6}
            y1={center}
            x2={center + dialRadius - 18}
            y2={center}
            stroke="#F8FAFC"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <SvgText
            x={center + dialRadius - 28}
            y={center + 6}
            fill="#F8FAFC"
            fontSize={20}
            fontWeight="900"
            textAnchor="middle"
          >
            E
          </SvgText>
          <SvgText
            x={center + dialRadius - 48}
            y={center + 4}
            fill="#94A3B8"
            fontSize={10}
            fontWeight="700"
            textAnchor="middle"
          >
            90°
          </SvgText>
        </G>

        {/* 12. CARDINALS: WEST (Line + 'W' + 270°) */}
        <G>
          <Line
            x1={center - dialRadius + 6}
            y1={center}
            x2={center - dialRadius + 18}
            y2={center}
            stroke="#F8FAFC"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <SvgText
            x={center - dialRadius + 28}
            y={center + 6}
            fill="#F8FAFC"
            fontSize={20}
            fontWeight="900"
            textAnchor="middle"
          >
            W
          </SvgText>
          <SvgText
            x={center - dialRadius + 50}
            y={center + 4}
            fill="#94A3B8"
            fontSize={10}
            fontWeight="700"
            textAnchor="middle"
          >
            270°
          </SvgText>
        </G>

        {/* 13. Tactical Crosshair Reticle Grid */}
        <G opacity={0.25}>
          <Line x1={center} y1={center - 70} x2={center} y2={center - 24} stroke="#38BDF8" strokeWidth={1} strokeDasharray="3 3" />
          <Line x1={center} y1={center + 24} x2={center} y2={center + 70} stroke="#38BDF8" strokeWidth={1} strokeDasharray="3 3" />
          <Line x1={center - 70} y1={center} x2={center - 24} y2={center} stroke="#38BDF8" strokeWidth={1} strokeDasharray="3 3" />
          <Line x1={center + 24} y1={center} x2={center + 70} y2={center} stroke="#38BDF8" strokeWidth={1} strokeDasharray="3 3" />
        </G>

        {/* 14. Concentric Level Pitch/Roll Reference Target Zone */}
        <Circle
          cx={center}
          cy={center}
          r={maxTiltOffset + 2}
          fill="url(#levelZoneGrad)"
          stroke={isLevel ? '#10B981' : '#475569'}
          strokeWidth={1}
          strokeDasharray="2 2"
          opacity={isLevel ? 0.8 : 0.4}
        />
        <Circle
          cx={center}
          cy={center}
          r={12}
          fill="none"
          stroke={isLevel ? '#10B981' : '#334155'}
          strokeWidth={0.8}
          opacity={0.6}
        />

        {/* 15. HIGH-PRECISION 3D FACETED AERONAUTICAL NEEDLE */}
        {/* North Pointer: Radiant Ruby / Neon Crimson Facets */}
        <G>
          {/* Left North Facet (Darker Shadow) */}
          <Polygon
            points={`${center - 10},${center} ${center},${center - needleLength} ${center},${center}`}
            fill="#DC2626"
          />
          {/* Right North Facet (Lighter Highlight) */}
          <Polygon
            points={`${center + 10},${center} ${center},${center - needleLength} ${center},${center}`}
            fill="#EF4444"
          />
          {/* North Spine Center Highlight Line */}
          <Line
            x1={center}
            y1={center - needleLength + 6}
            x2={center}
            y2={center - 12}
            stroke="#FCA5A5"
            strokeWidth={1}
            opacity={0.9}
          />
        </G>

        {/* South Pointer: Electric Azure / Cobalt Facets */}
        <G>
          {/* Left South Facet (Darker Shadow) */}
          <Polygon
            points={`${center - 10},${center} ${center},${center + needleLength} ${center},${center}`}
            fill="#1D4ED8"
          />
          {/* Right South Facet (Lighter Highlight) */}
          <Polygon
            points={`${center + 10},${center} ${center},${center + needleLength} ${center},${center}`}
            fill="#3B82F6"
          />
          {/* South Spine Center Highlight Line */}
          <Line
            x1={center}
            y1={center + 12}
            x2={center}
            y2={center + needleLength - 6}
            stroke="#93C5FD"
            strokeWidth={1}
            opacity={0.9}
          />
        </G>

        {/* 16. Metallic Pivot Hub with Concentric Brass Bearings */}
        <Circle
          cx={center}
          cy={center}
          r={14}
          fill="url(#centerHubGrad)"
          stroke="#78350F"
          strokeWidth={1.5}
        />
        <Circle
          cx={center}
          cy={center}
          r={9}
          fill="#0B0F19"
          stroke="#F59E0B"
          strokeWidth={1}
        />
        <Circle
          cx={center}
          cy={center}
          r={4}
          fill="#FBBF24"
        />

        {/* 17. Integrated Level Bubble Reticle (Counter-rotates to remain gravity-aligned) */}
        <G transform={`rotate(${heading}, ${center}, ${center})`}>
          {/* Bubble Glow Aura */}
          <Circle
            cx={center + bubbleX}
            cy={center + bubbleY}
            r={7}
            fill={isLevel ? '#10B981' : '#F59E0B'}
            opacity={0.3}
          />
          {/* Bubble Core */}
          <Circle
            cx={center + bubbleX}
            cy={center + bubbleY}
            r={5}
            fill={isLevel ? '#34D399' : '#FBBF24'}
            stroke="#FFFFFF"
            strokeWidth={1}
            opacity={0.95}
          />
          {/* Specular Glint */}
          <Circle
            cx={center + bubbleX - 1.5}
            cy={center + bubbleY - 1.5}
            r={1.5}
            fill="#FFFFFF"
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topSightContainer: {
    position: 'absolute',
    top: -4,
    zIndex: 30,
    alignItems: 'center',
  },
});
