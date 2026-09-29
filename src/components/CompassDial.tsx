import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Polygon } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { toRadians } from '../utils/angleUtils';

interface CompassDialProps {
  heading: number; // 0..359
  pitch?: number; // deg (-90..90)
  roll?: number; // deg (-180..180)
  size?: number;
}

const DEFAULT_SIZE = Math.min(Dimensions.get('window').width - 40, 340);

export const CompassDial: React.FC<CompassDialProps> = ({
  heading,
  pitch = 0,
  roll = 0,
  size = DEFAULT_SIZE,
}) => {
  const radius = size / 2;
  const center = radius;
  const outerBezelRadius = radius - 6;
  const dialRadius = radius - 16;
  const tickOuterRadius = dialRadius - 6;

  const majorTickLength = 14;
  const mediumTickLength = 8;
  const minorTickLength = 5;

  const degreeRadius = dialRadius - 36;
  const cardinalRadius = dialRadius - 56;
  const intercardinalRadius = dialRadius - 68;
  const needleLength = dialRadius - 42;

  // Generate 72 ticks (every 5 degrees)
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const angleDeg = i * 5;
    const isCardinal = angleDeg % 90 === 0;
    const isMajor = angleDeg % 30 === 0;

    const angleRad = toRadians(angleDeg - 90);
    const tickLen = isCardinal ? 0 : isMajor ? majorTickLength : (angleDeg % 10 === 0 ? mediumTickLength : minorTickLength);

    if (tickLen === 0) return null; // Cardinals get custom lines/markers

    const x1 = center + tickOuterRadius * Math.cos(angleRad);
    const y1 = center + tickOuterRadius * Math.sin(angleRad);
    const x2 = center + (tickOuterRadius - tickLen) * Math.cos(angleRad);
    const y2 = center + (tickOuterRadius - tickLen) * Math.sin(angleRad);

    const strokeWidth = isMajor ? 2 : 1;
    const opacity = isMajor ? 0.9 : 0.4;

    return { key: i, x1, y1, x2, y2, strokeWidth, opacity };
  }).filter(Boolean);

  // Degree labels for 30°, 60°, 120°, 150°, 210°, 240°, 300°, 330°
  const degreeNumbers = [30, 60, 120, 150, 210, 240, 300, 330].map((deg) => {
    const angleRad = toRadians(deg - 90);
    const x = center + degreeRadius * Math.cos(angleRad);
    const y = center + degreeRadius * Math.sin(angleRad);
    return { deg, text: `${deg}`, x, y };
  });

  // Intercardinals NE, SE, SW, NW
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
  const maxTiltOffset = 24;
  const bubbleX = Math.max(-maxTiltOffset, Math.min(maxTiltOffset, (-roll / 30) * maxTiltOffset));
  const bubbleY = Math.max(-maxTiltOffset, Math.min(maxTiltOffset, (pitch / 30) * maxTiltOffset));
  const totalTilt = Math.sqrt(pitch * pitch + roll * roll);
  const isLevel = totalTilt <= 5;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Top Fixed Yellow/Orange Pointer Triangle (12 o'clock heading marker) */}
      <View style={styles.topSightContainer}>
        <Svg width={24} height={20} viewBox="0 0 24 20">
          <G>
            <Polygon
              points="12,18 2,2 22,2"
              fill="#F59E0B"
            />
            <Polygon
              points="12,14 5,4 19,4"
              fill="#FBBF24"
            />
          </G>
        </Svg>
      </View>

      {/* Main Rotating Vector Dial */}
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: `${-heading}deg` }] }}
      >
        {/* Outer Bezel Shadow Ring */}
        <Circle
          cx={center}
          cy={center}
          r={outerBezelRadius}
          fill="#1C2230"
          stroke="#2A3245"
          strokeWidth={3}
        />

        {/* Inner Dial Face */}
        <Circle
          cx={center}
          cy={center}
          r={dialRadius}
          fill="#151A24"
          stroke="#232B3B"
          strokeWidth={1.5}
        />

        {/* Perimeter Track Ring */}
        <Circle
          cx={center}
          cy={center}
          r={tickOuterRadius}
          fill="none"
          stroke="#2D374A"
          strokeWidth={1}
        />

        {/* Dial Ticks */}
        <G>
          {ticks.map((t: any) => (
            <Line
              key={t.key}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="#E2E8F0"
              strokeWidth={t.strokeWidth}
              opacity={t.opacity}
              strokeLinecap="round"
            />
          ))}
        </G>

        {/* Degree Numbers */}
        <G>
          {degreeNumbers.map((lbl) => (
            <SvgText
              key={lbl.deg}
              x={lbl.x}
              y={lbl.y + 4}
              fill="#94A3B8"
              fontSize={11}
              fontWeight="700"
              textAnchor="middle"
            >
              {lbl.text}
            </SvgText>
          ))}
        </G>

        {/* Intercardinals (NW, NE, SE, SW) */}
        <G>
          {intercardinals.map((ic) => (
            <SvgText
              key={ic.code}
              x={ic.x}
              y={ic.y + 4}
              fill="#64748B"
              fontSize={13}
              fontWeight="800"
              textAnchor="middle"
            >
              {ic.code}
            </SvgText>
          ))}
        </G>

        {/* North 'N' Red Label + Top Dot */}
        <G>
          <Circle
            cx={center}
            cy={center - dialRadius + 22}
            r={3}
            fill="#FFFFFF"
          />
          <SvgText
            x={center}
            y={center - dialRadius + 44}
            fill="#EF4444"
            fontSize={22}
            fontWeight="900"
            textAnchor="middle"
          >
            N
          </SvgText>
        </G>

        {/* South 'S' Label + 180 Degree Text + Line */}
        <G>
          <Line
            x1={center}
            y1={center + dialRadius - 8}
            x2={center}
            y2={center + dialRadius - 22}
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <SvgText
            x={center}
            y={center + dialRadius - 28}
            fill="#FFFFFF"
            fontSize={20}
            fontWeight="900"
            textAnchor="middle"
          >
            S
          </SvgText>
          <SvgText
            x={center}
            y={center + dialRadius - 48}
            fill="#94A3B8"
            fontSize={11}
            fontWeight="700"
            textAnchor="middle"
          >
            180
          </SvgText>
        </G>

        {/* East 'E' Label + 90 Degree Text + Horizontal Line */}
        <G>
          <Line
            x1={center + dialRadius - 8}
            y1={center}
            x2={center + dialRadius - 24}
            y2={center}
            stroke="#FFFFFF"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <SvgText
            x={center + dialRadius - 34}
            y={center + 6}
            fill="#FFFFFF"
            fontSize={20}
            fontWeight="900"
            textAnchor="middle"
          >
            E
          </SvgText>
          <SvgText
            x={center + dialRadius - 52}
            y={center + 4}
            fill="#94A3B8"
            fontSize={11}
            fontWeight="700"
            textAnchor="middle"
          >
            90
          </SvgText>
        </G>

        {/* West 'W' Label + 270 Degree Text + Horizontal Line */}
        <G>
          <Line
            x1={center - dialRadius + 8}
            y1={center}
            x2={center - dialRadius + 24}
            y2={center}
            stroke="#FFFFFF"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <SvgText
            x={center - dialRadius + 34}
            y={center + 6}
            fill="#FFFFFF"
            fontSize={20}
            fontWeight="900"
            textAnchor="middle"
          >
            W
          </SvgText>
          <SvgText
            x={center - dialRadius + 56}
            y={center + 4}
            fill="#94A3B8"
            fontSize={11}
            fontWeight="700"
            textAnchor="middle"
          >
            270
          </SvgText>
        </G>

        {/* Dual-Color Tapered Magnetic Needle */}
        {/* Red North Needle Pointer */}
        <G>
          <Polygon
            points={`${center - 11},${center} ${center},${center - needleLength} ${center + 11},${center}`}
            fill="#EF4444"
          />
          <Polygon
            points={`${center - 11},${center} ${center},${center - needleLength} ${center},${center}`}
            fill="#F87171"
          />
        </G>

        {/* Blue South Needle Pointer */}
        <G>
          <Polygon
            points={`${center - 11},${center} ${center},${center + needleLength} ${center + 11},${center}`}
            fill="#2563EB"
          />
          <Polygon
            points={`${center - 11},${center} ${center},${center + needleLength} ${center},${center}`}
            fill="#60A5FA"
          />
        </G>

        {/* Golden Pivot Center Ring */}
        <Circle
          cx={center}
          cy={center}
          r={12}
          fill="#F59E0B"
        />
        <Circle
          cx={center}
          cy={center}
          r={6}
          fill="#151A24"
        />

        {/* Level Bubble Overlay Dot (Counter-rotates to stay upright relative to screen) */}
        <G transform={`rotate(${heading}, ${center}, ${center})`}>
          <Circle
            cx={center + bubbleX}
            cy={center + bubbleY}
            r={5}
            fill={isLevel ? '#34D399' : '#FBBF24'}
            opacity={0.9}
          />
          <Circle
            cx={center + bubbleX}
            cy={center + bubbleY}
            r={2}
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
    top: -2,
    zIndex: 20,
    alignItems: 'center',
  },
});
