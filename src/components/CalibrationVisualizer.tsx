import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

export const CalibrationVisualizer: React.FC = () => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  // Figure-8 Lemniscate parametric curve coordinates calculation
  // x = a * cos(t) / (1 + sin^2(t))
  // y = a * sin(t) * cos(t) / (1 + sin^2(t))
  const translateX = animatedValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 45, 0, -45, 0],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 25, 0, -25, 0],
  });

  return (
    <View style={styles.container}>
      <Svg width={200} height={120} viewBox="0 0 200 120">
        {/* Figure-8 Lemniscate Track */}
        <Path
          d="M 100,60 C 140,20 190,20 190,60 C 190,100 140,100 100,60 C 60,20 10,20 10,60 C 10,100 60,100 100,60 Z"
          fill="none"
          stroke={colors.accentLight}
          strokeWidth={6}
        />
        <Path
          d="M 100,60 C 140,20 190,20 190,60 C 190,100 140,100 100,60 C 60,20 10,20 10,60 C 10,100 60,100 100,60 Z"
          fill="none"
          stroke={colors.accent}
          strokeWidth={2}
          strokeDasharray="6,4"
        />
      </Svg>

      {/* Animated Orbiting Phone Node */}
      <Animated.View
        style={[
          styles.orbitNode,
          {
            backgroundColor: colors.northAccent,
            borderColor: colors.card,
            transform: [{ translateX }, { translateY }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  orbitNode: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
