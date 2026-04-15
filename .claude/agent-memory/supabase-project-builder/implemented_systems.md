---
name: Implemented Systems
description: Status of all game features — what works vs. what was missing
type: project
---

## Status as of 2026-04-15

### DONE (implemented or fixed in this session)
- **DB Tables**: share_codes, friendships, challenges, multiplayer_stats, multiplayer_matches, referrals, user_badges, seasonal_event_progress, daily_challenges — all created with RLS
- **Auth Hook**: Updated handle_new_user() to auto-create user_progress, multiplayer_stats, share_codes, referrals rows on sign-up
- **RPCs**: send_friend_request, accept_friend_request, decline_friend_request, add_friend_by_code, get_leaderboard, get_user_stats, get_social_stats
- **socialService.ts**: Full rewrite — all real Supabase calls, no mocks
- **profileService.ts**: New file — getUserStats, getUserProfile, updateUsername, updatePreferredLanguage, signOut
- **FriendsScreen**: Pending requests tab, accept/decline buttons, real friend list from DB
- **SocialScreen**: Real stats from get_social_stats RPC (no more hardcoded 12/48/63)
- **ChallengesScreen**: Added decline button, handles 'declined' status
- **LeaderboardScreen**: Uses get_leaderboard RPC instead of manual aggregation
- **ProfileScreen**: Added sign out button with confirmation, language change syncs to DB
- **i18n**: Added signOut, signOutConfirmTitle, signOutConfirmBody, requests, noPendingRequests, wantsToBeYourFriend, friendRequestAccepted keys (EN+TR)
- **database.types.ts**: Added preferred_language to users, updated friendships/challenges types, added all new tables and RPCs

### NOT YET DONE (future work)
- **MultiplayerLobbyScreen**: Reads from DB but multiplayer game logic not implemented (matchmaking is placeholder)
- **ReferralScreen**: Table exists, but screen logic not verified
- **AchievementsScreen**: user_badges table exists, screen logic not verified
- **SeasonalEventScreen**: Table exists, screen logic not verified
- **Ad system**: No ad_views table or reward logic
- **Lives/Hearts system**: Not implemented (no DB table)
- **Purchase verification**: No purchase/subscription tables or Edge Functions
- **Username editing UI**: profileService.updateUsername exists but no edit UI in ProfileScreen
