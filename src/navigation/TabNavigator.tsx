import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WorldMapScreen } from '../screens/WorldMap/WorldMapScreen';
import { LeaderboardScreen } from '../screens/Leaderboard/LeaderboardScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SocialScreen } from '../screens/Social/SocialScreen';
import { useI18n } from '../i18n';
import type { TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();

const TabIcon = ({ emoji, color }: { emoji: string; color: string }) => (
  <Text style={{ fontSize: 22, color }}>{emoji}</Text>
);

export const TabNavigator: React.FC = () => {
  const { t } = useI18n();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="WorldMap"
        component={WorldMapScreen}
        options={{
          tabBarLabel: t('play'),
          tabBarIcon: ({ color }) => <TabIcon emoji="🌍" color={color} />,
          tabBarButtonTestID: 'tab-world-map',
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: t('leaderboard'),
          tabBarIcon: ({ color }) => <TabIcon emoji="🏆" color={color} />,
          tabBarButtonTestID: 'tab-leaderboard',
        }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{
          tabBarLabel: t('social'),
          tabBarIcon: ({ color }) => <TabIcon emoji="👥" color={color} />,
          tabBarButtonTestID: 'tab-social',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
          tabBarButtonTestID: 'tab-profile',
        }}
      />
    </Tab.Navigator>
  );
};
