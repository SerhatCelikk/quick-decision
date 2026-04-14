import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
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

const TABS: Array<{
  name: keyof TabParamList;
  activeIcon: IoniconName;
  inactiveIcon: IoniconName;
}> = [
  { name: 'WorldMap',    activeIcon: 'compass',       inactiveIcon: 'compass-outline'       },
  { name: 'Leaderboard', activeIcon: 'trophy',        inactiveIcon: 'trophy-outline'        },
  { name: 'Social',      activeIcon: 'people',        inactiveIcon: 'people-outline'        },
  { name: 'Profile',     activeIcon: 'person-circle', inactiveIcon: 'person-circle-outline' },
];

export const TabNavigator: React.FC = () => {
  const { t } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(tb => tb.name === route.name)!;
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 28 : 16,
            left: 48,
            right: 48,
            height: 62,
            borderRadius: 31,
            backgroundColor: '#312E81',
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.20)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.45,
            shadowRadius: 22,
            elevation: 24,
            paddingBottom: 0,
            paddingTop: 0,
          },
          tabBarItemStyle: {
            flex: 1,
            paddingBottom: 0,
            paddingTop: 0,
            marginBottom: 0,
            marginTop: 0,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: 'rgba(255,255,255,0.38)',
          tabBarIcon: ({ focused, color }) => {
            const iconName = focused
              ? (tab?.activeIcon ?? 'help-circle')
              : (tab?.inactiveIcon ?? 'help-circle-outline');
            return (
              <View style={styles.iconWrap}>
                {focused && <View style={styles.pill} />}
                <Ionicons name={iconName} size={26} color={color} />
              </View>
            );
          },
          tabBarButton: (props) => (
            <TouchableOpacity
              {...(props as any)}
              activeOpacity={0.75}
              style={[
                (props as any).style,
                { justifyContent: 'center', alignItems: 'center', paddingBottom: 0, paddingTop: 0 },
              ]}
            />
          ),
        };
      }}
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

const styles = StyleSheet.create({
  iconWrap: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    position: 'absolute',
    width: 48, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(253,224,71,0.18)',
    borderWidth: 1, borderColor: 'rgba(253,224,71,0.32)',
  },
});
