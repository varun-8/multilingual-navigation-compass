import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CompassScreen } from '../screens/CompassScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CalibrationScreen } from '../screens/CalibrationScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { useTheme } from '../hooks/useTheme';

export type RootStackParamList = {
  Compass: undefined;
  Settings: undefined;
  Calibration: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: colors.statusBar === 'light-content',
        colors: {
          primary: colors.accent,
          background: colors.background,
          card: colors.card,
          text: colors.textPrimary,
          border: colors.cardBorder,
          notification: colors.accent,
        },
      }}
    >
      <Stack.Navigator
        initialRouteName="Compass"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 280,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="Compass" component={CompassScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="Calibration"
          component={CalibrationScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
