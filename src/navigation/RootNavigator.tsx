import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { GameScreen } from '../screens/Game/GameScreen';
import { LevelCompletionScreen } from '../screens/LevelCompletion/LevelCompletionScreen';
import { LevelMapScreen } from '../screens/LevelMap/LevelMapScreen';
import { FriendsScreen } from '../screens/Social/FriendsScreen';
import { ChallengesScreen } from '../screens/Social/ChallengesScreen';
import { ShareCardScreen } from '../screens/Social/ShareCardScreen';
// v1.1 screens
import { AchievementsScreen } from '../screens/Achievements/AchievementsScreen';
import { SeasonalEventScreen } from '../screens/SeasonalEvent/SeasonalEventScreen';
import { PaywallScreen } from '../screens/Premium/PaywallScreen';
import { MultiplayerLobbyScreen } from '../screens/Multiplayer/MultiplayerLobbyScreen';
import { MatchmakingScreen } from '../screens/Multiplayer/MatchmakingScreen';
import { LiveBattleScreen } from '../screens/Multiplayer/LiveBattleScreen';
import { BattleResultsScreen } from '../screens/Multiplayer/BattleResultsScreen';
import { ReferralScreen } from '../screens/Referral/ReferralScreen';
import { AccountLinkScreen } from '../screens/AccountLink/AccountLinkScreen';
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
          options={{ presentation: 'fullScreenModal', headerShown: false }}
        />
        <Stack.Screen
          name="LevelCompletion"
          component={LevelCompletionScreen}
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="Friends"
          component={FriendsScreen}
          options={{ animation: 'slide_from_right', headerShown: false }}
        />
        <Stack.Screen
          name="Challenges"
          component={ChallengesScreen}
          options={{ animation: 'slide_from_right', headerShown: false }}
        />
        <Stack.Screen
          name="ShareCard"
          component={ShareCardScreen}
          options={{ animation: 'slide_from_right', headerShown: false }}
        />
        {/* v1.1 screens */}
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{ animation: 'slide_from_right', headerShown: false }}
        />
        <Stack.Screen
          name="SeasonalEvent"
          component={SeasonalEventScreen}
          options={{ animation: 'slide_from_right', headerShown: false }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="MultiplayerLobby"
          component={MultiplayerLobbyScreen}
          options={{ animation: 'slide_from_right', headerShown: false }}
        />
        <Stack.Screen
          name="Matchmaking"
          component={MatchmakingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LiveBattle"
          component={LiveBattleScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="BattleResults"
          component={BattleResultsScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Referral"
          component={ReferralScreen}
          options={{ animation: 'slide_from_right', headerShown: false }}
        />
        <Stack.Screen
          name="AccountLink"
          component={AccountLinkScreen}
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
