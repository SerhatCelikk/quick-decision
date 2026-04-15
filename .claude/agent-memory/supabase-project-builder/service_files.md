---
name: Service Files
description: Frontend service file locations and patterns
type: project
---

## Service Files (src/services/)
- **supabase.ts** — Supabase client creation (reads EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY)
- **socialService.ts** — Friends, challenges, share codes, daily challenge, social stats
- **profileService.ts** — User stats (via get_user_stats RPC), profile read, username update, language update, sign out
- **gameService.ts** — Game session logic

## Key Patterns
- All services use async/await with try/catch; never throw to caller
- getCurrentUserId() helper: supabase.auth.getUser().then(d => d.data.user?.id)
- RPC calls: supabase.rpc('function_name', { param: value })
- Error messages returned as Turkish strings in UI-facing functions
- Type assertions used for RPC results (data as { field: type })

## Screen → Service Map
- FriendsScreen → socialService: getFriends, getPendingRequests, addFriendByCode, acceptFriendRequest, declineFriendRequest, getShareCode
- ChallengesScreen → socialService: getChallenges, respondToChallenge, declineChallenge
- SocialScreen → socialService: getSocialStats (via useFocusEffect)
- LeaderboardScreen → supabase.rpc('get_leaderboard')
- MultiplayerLobbyScreen → supabase.from('multiplayer_stats'), supabase.from('multiplayer_matches')
- ProfileScreen → supabase directly + profileService: updatePreferredLanguage, signOut
- ShareCardScreen → socialService: getShareData
- DailyChallengeBanner → socialService: getDailyChallenge
