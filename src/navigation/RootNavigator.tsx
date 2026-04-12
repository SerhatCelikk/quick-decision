import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { GameScreen } from '../screens/Game/GameScreen';
import { LevelCompletionScreen } from '../screens/LevelCompletion/LevelCompletionScreen';
import { LevelMapScreen } from '../screens/LevelMap/LevelMapScreen';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="LevelMap"
          component={LevelMapScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ presentation: 'modal', headerShown: true, title: 'Game' }}
        />
        <Stack.Screen
          name="LevelCompletion"
          component={LevelCompletionScreen}
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
