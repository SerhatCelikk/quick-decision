import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { WorldMapScreen } from '../screens/WorldMap/WorldMapScreen';
import { LeaderboardScreen } from '../screens/Leaderboard/LeaderboardScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SocialScreen } from '../screens/Social/SocialScreen';
import { useI18n } from '../i18n';
import { COLORS } from '../constants';
import type { TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  WorldMap:    { active: 'compass',       inactive: 'compass-outline' },
  Leaderboard: { active: 'trophy',        inactive: 'trophy-outline' },
  Social:      { active: 'people',        inactive: 'people-outline' },
  Profile:     { active: 'person-circle', inactive: 'person-circle-outline' },
};

// Tab bar height: 60px visible + safe area bottom
const TAB_HEIGHT = 60;

export const TabNavigator: React.FC = () => {
  const { t } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // The tabBar itself must be tall enough to fit icons + label
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: TAB_HEIGHT + (Platform.OS === 'ios' ? 24 : 0),
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        // Icon: plain Ionicons, no wrapper View with extra padding
        tabBarIcon: ({ focused, color }) => {
          const icons = ICONS[route.name] ?? { active: 'help-circle', inactive: 'help-circle-outline' };
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={26}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="WorldMap"
        component={WorldMapScreen}
        options={{ tabBarLabel: t('play'), tabBarButtonTestID: 'tab-world-map' }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ tabBarLabel: t('leaderboard'), tabBarButtonTestID: 'tab-leaderboard' }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{ tabBarLabel: t('social'), tabBarButtonTestID: 'tab-social' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t('profile'), tabBarButtonTestID: 'tab-profile' }}
      />
    </Tab.Navigator>
  );
};
