import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

interface CompassNeedleProps {
  size?: number;
}

export const CompassNeedle: React.FC<CompassNeedleProps> = ({ size = 36 }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 36 36">
        {/* Glowing Top Pointer Notch */}
        <Polygon
          points="18,2 25,18 21,15 18,24 15,15 11,18"
          fill={colors.northAccent}
        />
        <Polygon
          points="18,4 23,17 18,13 13,17"
          fill="#FFFFFF"
          opacity={0.4}
        />
        {/* Subtle Sight Line */}
        <Circle cx="18" cy="28" r="2.5" fill={colors.northAccent} />
        <Circle cx="18" cy="28" r="1.2" fill="#FFFFFF" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
