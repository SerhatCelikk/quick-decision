import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

export type Language = 'en' | 'tr';

const LANG_KEY = '@quick_decision_language';

const translations = {
  en: {
    // ── Tab navigation ─────────────────────────────────────────────────────────
    play: 'Play',
    leaderboard: 'Leaderboard',
    social: 'Social',
    profile: 'Profile',
    achievements: 'Achievements',

    // ── General / shared ───────────────────────────────────────────────────────
    loading: 'Loading…',
    error: 'Error',
    errorRetry: 'Something went wrong. Tap to retry.',
    goBack: 'Go Back',
    // ── AccountLink ────────────────────────────────────────────────────────────
    accountLinkTitle: 'Link Your Account',
    accountLinkSubtitle: 'Save your progress and unlock social features by linking your Google account.',
    accountLinkPerk1: 'Keep your progress forever',
    accountLinkPerk2: 'Add friends & challenge players',
    accountLinkPerk3: 'Secure cloud backup',
    accountLinkPerk4: 'Access leaderboards worldwide',
    accountLinkGoogle: 'Continue with Google',
    accountLinkDisclaimer: 'Your existing progress will be preserved. We never post without permission.',
    cancel: 'Cancel',
    share: 'Share',
    add: 'Add',
    level: 'Level',
    rank: 'Rank',
    you: 'You',
    vs: 'VS',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    done: 'Done',

    // ── Language ───────────────────────────────────────────────────────────────
    language: 'Language',
    english: 'English',
    turkish: 'Türkçe',

    // ── Premium ────────────────────────────────────────────────────────────────
    premiumUpgrade: 'Go Premium',
    premiumTitle: 'Quick Decision Premium',
    premiumBenefit1: 'No Ads — play without interruptions',
    premiumBenefit2: 'Unlimited Energy — never run out of hearts',
    premiumBenefit3: 'Exclusive Premium Badges — show off your status',
    premiumBenefit4: 'Early Access — new features first',
    monthlyPlan: 'Monthly',
    yearlyPlan: 'Yearly  (Save 40%)',
    restorePurchases: 'Restore Purchases',
    unlockFullExperience: 'Unlock the full Quick Decision experience',
    bestValue: 'BEST VALUE',
    subscriptionLegal: 'Subscription auto-renews. Cancel anytime in App Store / Google Play settings.',
    unlimitedHeartsNoAds: 'Unlimited hearts · No ads · Exclusive content',
    premiumIapNote: 'In-app purchase requires a signed build. Ready for TestFlight / internal testing.',

    // ── Multiplayer / lobby ───────────────────────────────────────────────────
    multiplayer: 'Multiplayer',
    multiplayerTitle: 'Multiplayer',
    findOpponent: 'Find Opponent',
    quickMatch: 'Quick Match',
    challengeFriend: 'Challenge Friend',
    searching: 'Searching for opponent…',
    battleReady: 'Battle Ready!',
    yourScore: 'Your Score',
    opponentScore: 'Opponent Score',
    youWon: 'You Won!',
    youLost: 'You Lost',
    playAgain: 'Play Again',
    backToLobby: 'Back to Lobby',
    elo: 'ELO Rating',
    eloChange: 'ELO Change',
    wins: 'Wins',
    losses: 'Losses',
    winStreak: 'Win Streak',
    recentBattles: 'RECENT BATTLES',
    multiplayerFreeInfo: 'Multiplayer matches don\'t cost energy. Play as many as you like!',
    outstandingPerformance: 'Outstanding performance!',
    betterLuckNextTime: 'Better luck next time!',
    matchmakingTip: 'Matched with players near your ELO. Average wait: 15–30 seconds.',

    // ── Game screen ───────────────────────────────────────────────────────────
    outOfHearts: 'Out of Hearts!',
    outOfHeartsBody: 'Watch an ad to refill your hearts and keep playing.',
    watchAdRefill: 'Watch Ad to Refill',
    connectionError: 'Connection Error',
    connectionErrorBody: 'Could not load questions. Please check your connection.',
    loadingLevel: 'Loading Level',
    savingResults: 'Saving results…',
    heartsRemaining: 'Hearts remaining',
    sec: 'sec',

    // ── Level completion ──────────────────────────────────────────────────────
    levelComplete: 'Level Complete!',
    almostThere: 'Almost There!',
    levelCompleteMsg: 'Brilliant! Next level is unlocked.',
    correct: 'Correct',
    accuracy: 'Accuracy',
    next: 'Next',
    retry: 'Retry',
    nextLevel: 'Next Level',
    tryAgain: 'Try Again',
    worldMap: 'World Map',
    xpEarned: 'XP earned',
    passLabel: 'Pass:',
    heartsRemainingLabel: 'Hearts remaining',

    // ── Leaderboard ───────────────────────────────────────────────────────────
    leaderboardSubtitle: 'Top players by total score',
    loadingRankings: 'Loading rankings…',
    noScoresYet: 'No scores yet',
    playSomeGames: 'Play some games to appear here!',

    // ── Profile ───────────────────────────────────────────────────────────────
    yourStats: 'YOUR STATS',
    passRate: 'Pass Rate',
    bestStreak: 'Best Streak',
    totalScore: 'Total Score',
    gamesPlayed: 'Games Played',
    highestLevel: 'Highest Level',
    earnedBadges: 'You have earned badges!',
    startEarningBadges: 'Start earning badges',

    // ── Achievements ──────────────────────────────────────────────────────────
    noAchievementsYet: 'Keep playing to earn achievements!',
    badgeUnlocked: 'Badge Unlocked!',
    unlockedLabel: 'unlocked',
    doneLabel: 'done',
    earned: 'Earned',

    // Badge names
    badge_first_win_name: 'First Win',
    badge_level_5_name: 'Level 5',
    badge_level_10_name: 'Level 10',
    badge_streak_5_name: 'On Fire',
    badge_streak_10_name: 'Unstoppable',
    badge_games_10_name: 'Dedicated',
    badge_games_50_name: 'Veteran',
    badge_perfect_game_name: 'Perfectionist',
    badge_speed_demon_name: 'Speed Demon',
    badge_multiplayer_1_name: 'First Battle',
    badge_multiplayer_5w_name: 'Champion',
    badge_referral_1_name: 'Recruiter',
    badge_spring_event_name: 'Spring Scholar',
    badge_premium_name: 'Premium Member',
    badge_turkish_mode_name: 'Bilingual',

    // Badge descriptions
    badge_first_win_desc: 'Pass your first level',
    badge_level_5_desc: 'Reach level 5',
    badge_level_10_desc: 'Reach level 10',
    badge_streak_5_desc: 'Achieve a 5x answer streak',
    badge_streak_10_desc: 'Achieve a 10x answer streak',
    badge_games_10_desc: 'Play 10 games',
    badge_games_50_desc: 'Play 50 games',
    badge_perfect_game_desc: 'Get 100% accuracy in a game',
    badge_speed_demon_desc: 'Answer 5 questions in under 2s each',
    badge_multiplayer_1_desc: 'Complete your first multiplayer match',
    badge_multiplayer_5w_desc: 'Win 5 multiplayer matches',
    badge_referral_1_desc: 'Invite a friend who joins',
    badge_spring_event_desc: 'Complete Spring Knowledge Sprint',
    badge_premium_desc: 'Subscribe to Quick Decision Premium',
    badge_turkish_mode_desc: 'Play in Turkish mode',

    // ── Referral ──────────────────────────────────────────────────────────────
    referral: 'Refer Friends',
    referralExplain: 'Invite friends and earn 50 bonus coins per successful referral.',
    yourReferralCode: 'Your Referral Code',
    shareInvite: 'Share Invite',
    howItWorks: 'HOW IT WORKS',
    successful: 'Successful',
    pendingLabel: 'Pending',
    coinsEarned: 'Coins Earned',
    shareFailed: 'Share failed',
    shareFailedBody: 'Could not open share sheet.',
    referralStep1: 'Share your unique referral code with friends',
    referralStep2: 'Friend downloads and signs up with your code',
    referralStep3: 'They play their first 3 games',
    referralStep4: 'You both receive 50 bonus coins!',

    // ── Friends ───────────────────────────────────────────────────────────────
    friends: 'Friends',
    myFriendCode: 'MY FRIEND CODE',
    addFriend: 'ADD FRIEND',
    enterFriendCode: 'Enter friend code',
    shareFriendCodeHint: 'Share this code so friends can add you',
    noFriendsYet: 'Share your code to invite friends!',

    // ── Challenges ───────────────────────────────────────────────────────────
    challenges: 'Challenges',
    incomingTab: 'Incoming',
    outgoingTab: 'Outgoing',
    noIncomingChallenges: 'No incoming challenges yet',
    noOutgoingChallenges: 'No challenges sent yet',
    acceptChallenge: 'Accept Challenge',
    youWonBattle: 'You won!',
    youLostBattle: 'You lost — challenge them back!',
    pendingStatus: 'Pending',
    completedStatus: 'Done',
    expiredStatus: 'Expired',

    // ── Seasonal event ────────────────────────────────────────────────────────
    seasonalEvent: 'Spring Knowledge Sprint',
    eventProgress: 'EVENT PROGRESS',
    eventEnds: 'Event ends',
    milestones: 'MILESTONES',
    questionsLabel: 'Answered',
    correctLabel: 'Correct',
    eventInfoText: 'Play any game mode during the event. Spring-themed questions are automatically included and count toward your progress.',

    // ── Share card ────────────────────────────────────────────────────────────
    shareYourStats: 'Share Your Stats',
    showOffProgress: 'Show off your progress',
    shareCard: 'Share Card',
    signInToSeeCard: 'Sign in to see your card',
    challengeMeWithCode: 'Challenge me with code',
    thinkFastTagline: 'Think fast. Decide faster.',

    // ── World map ─────────────────────────────────────────────────────────────
    selectWorld: 'Select World',
    dailyChallenge: 'Daily Challenge',
    todayLabel: 'TODAY',
    continueJourney: 'Continue your journey',
    worldLocked: 'Complete previous world to unlock',
    appTagline: 'How weird is the world?',
    chooseYourWorld: 'Choose Your World',
    tapWorldToStart: 'Tap a world to start playing',
    moreWorldsComing: 'More worlds coming',
    moreWorldsSubtitle: 'Memes · Guinness · Pop Culture',
    springKnowledgeSprint: 'Spring Knowledge Sprint',

    // ── Level map ─────────────────────────────────────────────────────────────
    milestoneAlmostThere: 'Almost There',
    milestoneHalfway: 'Halfway',
    milestoneWarmingUp: 'Warming Up',
    milestoneStartHere: 'Start Here',
    worldCompleteTitle: 'World Complete!',
    worldCompleteHint: 'Finish all {n} levels to claim the trophy',
    levelsCompletedFmt: '{n} / {total} completed',
    mapBeginning: 'Beginning',
    levelsCountFmt: '{n} / {total} levels',

    // ── Social screen ─────────────────────────────────────────────────────────
    socialSubheading: 'Challenge friends & grow together',
    actionsSection: 'ACTIONS',
    socialFriendsDesc: 'Add friends & see their progress',
    socialChallengesDesc: 'Send & receive trivia challenges',
    socialShareCardLabel: 'Share Card',
    socialShareCardDesc: 'Generate your stats card to share',
    socialBattlesStat: 'Battles',
    liveBattleTitle: 'Live Battle',
    liveBattleDesc: 'Play against a real opponent now',
    liveLabel: 'LIVE',

    // ── Share card tiers ──────────────────────────────────────────────────────
    tierLegendary: 'Legendary',
    tierElite: 'Elite',
    tierPro: 'Pro',
    tierRising: 'Rising',

    // ── Share messages ────────────────────────────────────────────────────────
    shareCardTitle: 'My Quick Decision Stats',
    friendShareMsg: 'Add me on Quick Decision! My friend code is: {code}\nDownload the app and enter my code to challenge me!',
    friendShareTitle: 'Quick Decision — Friend Request',
    friendsCountFmt: 'Friends ({n})',
    noFriendsHeading: 'No friends yet',
    friendsSuccessTitle: 'Success',
    friendsErrorTitle: 'Error',
    requests: 'Requests',
    noPendingRequests: 'No pending friend requests',
    wantsToBeYourFriend: 'Wants to be your friend',
    friendRequestAccepted: 'Friend request accepted!',

    // ── Sign out ──────────────────────────────────────────────────────────────
    signOut: 'Sign Out',
    signOutConfirmTitle: 'Sign Out',
    signOutConfirmBody: 'Are you sure you want to sign out?',

    // ── Challenges ────────────────────────────────────────────────────────────
    challengeCompleteTitle: 'Challenge Complete!',
    challengeCompleteBody: 'You scored {score} pts vs {opponentScore} pts',
    yourScorePending: 'Your score',

    // ── Seasonal event extras ─────────────────────────────────────────────────
    springEventSubtitle: 'Answer spring-themed questions to earn exclusive badges',
    eventEndDate: 'April 30, 2026',
    progressToMilestoneFmt: '{n} / {total} to next milestone ({pct}%)',
    answerNQuestionsFmt: 'Answer {n} questions',

    // ── Paywall ───────────────────────────────────────────────────────────────
    premiumSubscriptionTitle: 'Premium Subscription',
    restorePurchasesChecking: 'Checking for previous purchases…',
    subscribeBtnFmt: 'Subscribe — {price}',

    // ── Profile ───────────────────────────────────────────────────────────────
    playerDefault: 'Player',

    // ── Game screen ───────────────────────────────────────────────────────────
    exitGameLabel: 'Exit game',

    // ── Daily challenge banner ────────────────────────────────────────────────
    dailyChallengeLabel: 'DAILY CHALLENGE',
    expired: 'Expired',
    targetLabel: 'Target',
    playersLabel: 'Players',

    // ── Energy bar ────────────────────────────────────────────────────────────
    nextHeartInFmt: 'Next heart in {time}',

    // ── Fact reveal ───────────────────────────────────────────────────────────
    factTimesUp: "Time's Up!",
    factCorrect: 'Correct!',
    factWrong: 'Wrong!',
    streakSuffix: 'Streak!',
    answerFasterTip: 'Answer faster next time!',
    keepGoingMsg: "Keep going — you've got this!",
    didYouKnow: 'Did you know?',
    tipLabel: 'Tip',
    tipText: 'Read each option carefully — some are very close!',
    continueBtn: 'Continue',

    // ── Seasonal event banner ─────────────────────────────────────────────────
    seasonalEventLabel: 'SEASONAL EVENT',
    springEventEnds: 'Ends April 30 · Exclusive badges',
    springEventAccessibility: 'Spring Knowledge Sprint seasonal event',

    // ── Level node ────────────────────────────────────────────────────────────
    levelNodeLockedSuffix: ': locked',
    levelNodeCompletedFmt: ': completed, {stars} stars',
    levelNodeCurrentSuffix: ': current level',
    levelNodeUnlockedSuffix: ': unlocked',
    completePrevLevels: 'Complete previous levels to unlock',
    doubleTapToStart: 'Double-tap to start',

    // ── World card ────────────────────────────────────────────────────────────
    completePrevWorld: 'Complete previous world',

    // ── Error view ────────────────────────────────────────────────────────────
    somethingWentWrong: 'Something went wrong.',
  },

  tr: {
    // ── Tab navigation ─────────────────────────────────────────────────────────
    play: 'Oyna',
    leaderboard: 'Sıralama',
    social: 'Sosyal',
    profile: 'Profil',
    achievements: 'Başarımlar',

    // ── General / shared ───────────────────────────────────────────────────────
    loading: 'Yükleniyor…',
    error: 'Hata',
    errorRetry: 'Bir şeyler yanlış gitti. Tekrar denemek için dokun.',
    goBack: 'Geri Dön',
    // ── AccountLink ────────────────────────────────────────────────────────────
    accountLinkTitle: 'Hesabını İlişkilendir',
    accountLinkSubtitle: 'Google hesabını bağlayarak ilerlemenizi kaydet ve sosyal özelliklerin kilidini aç.',
    accountLinkPerk1: 'İlerlemenizi sonsuza dek koru',
    accountLinkPerk2: 'Arkadaş ekle ve oyuncularla yarış',
    accountLinkPerk3: 'Güvenli bulut yedekleme',
    accountLinkPerk4: 'Dünya geneli lider tablolarına eriş',
    accountLinkGoogle: 'Google ile Devam Et',
    accountLinkDisclaimer: 'Mevcut ilerlemeniz korunacak. İzinsiz hiçbir zaman paylaşım yapılmaz.',
    cancel: 'İptal',
    share: 'Paylaş',
    add: 'Ekle',
    level: 'Seviye',
    rank: 'Sıra',
    you: 'Sen',
    vs: 'VS',
    yes: 'Evet',
    no: 'Hayır',
    ok: 'Tamam',
    done: 'Bitti',

    // ── Language ───────────────────────────────────────────────────────────────
    language: 'Dil',
    english: 'English',
    turkish: 'Türkçe',

    // ── Premium ────────────────────────────────────────────────────────────────
    premiumUpgrade: 'Premium Al',
    premiumTitle: 'Quick Decision Premium',
    premiumBenefit1: 'Reklamsız — kesintisiz oyna',
    premiumBenefit2: 'Sınırsız Enerji — hiç bitme endişesi yok',
    premiumBenefit3: 'Özel Premium Rozetler — statünü göster',
    premiumBenefit4: 'Erken Erişim — yeni özellikleri ilk gör',
    monthlyPlan: 'Aylık',
    yearlyPlan: 'Yıllık  (%40 İndirimli)',
    restorePurchases: 'Satın Almaları Geri Yükle',
    unlockFullExperience: 'Quick Decision deneyiminin tamamını aç',
    bestValue: 'EN İYİ DEĞER',
    subscriptionLegal: 'Abonelik otomatik yenilenir. App Store / Google Play ayarlarından istediğiniz zaman iptal edebilirsiniz.',
    unlimitedHeartsNoAds: 'Sınırsız can · Reklamsız · Özel içerik',
    premiumIapNote: 'Uygulama içi satın alma imzalı bir derleme gerektirir. TestFlight / dahili test için hazır.',

    // ── Multiplayer / lobby ───────────────────────────────────────────────────
    multiplayer: 'Çok Oyunculu',
    multiplayerTitle: 'Çok Oyunculu',
    findOpponent: 'Rakip Bul',
    quickMatch: 'Hızlı Eşleşme',
    challengeFriend: 'Arkadaşa Meydan Oku',
    searching: 'Rakip aranıyor…',
    battleReady: 'Mücadele Başlıyor!',
    yourScore: 'Senin Puanın',
    opponentScore: 'Rakip Puanı',
    youWon: 'Kazandın!',
    youLost: 'Kaybettin',
    playAgain: 'Tekrar Oyna',
    backToLobby: 'Lobiye Dön',
    elo: 'ELO Puanı',
    eloChange: 'ELO Değişimi',
    wins: 'Galibiyet',
    losses: 'Mağlubiyet',
    winStreak: 'Galibiyet Serisi',
    recentBattles: 'SON SAVAŞLAR',
    multiplayerFreeInfo: 'Çok oyunculu maçlar enerji harcamaz. İstediğin kadar oyna!',
    outstandingPerformance: 'Muhteşem performans!',
    betterLuckNextTime: 'Bir dahaki sefere şansın daha iyi olsun!',
    matchmakingTip: 'ELO\'una yakın oyuncularla eşleşiyorsun. Ortalama bekleme: 15–30 saniye.',

    // ── Game screen ───────────────────────────────────────────────────────────
    outOfHearts: 'Canın Bitti!',
    outOfHeartsBody: 'Canlarını doldurmak ve oynamaya devam etmek için reklam izle.',
    watchAdRefill: 'Reklam İzle ve Doldur',
    connectionError: 'Bağlantı Hatası',
    connectionErrorBody: 'Sorular yüklenemedi. Bağlantını kontrol et.',
    loadingLevel: 'Bölüm Yükleniyor',
    savingResults: 'Sonuçlar kaydediliyor…',
    heartsRemaining: 'Kalan can',
    sec: 'sn',

    // ── Level completion ──────────────────────────────────────────────────────
    levelComplete: 'Bölüm Tamamlandı!',
    almostThere: 'Neredeyse Bitti!',
    levelCompleteMsg: 'Harika! Bir sonraki bölüm açıldı.',
    correct: 'Doğru',
    accuracy: 'Doğruluk',
    next: 'Sonraki',
    retry: 'Tekrar',
    nextLevel: 'Sonraki Bölüm',
    tryAgain: 'Tekrar Dene',
    worldMap: 'Dünya Haritası',
    xpEarned: 'XP kazanıldı',
    passLabel: 'Geçiş:',
    heartsRemainingLabel: 'Kalan can',

    // ── Leaderboard ───────────────────────────────────────────────────────────
    leaderboardSubtitle: 'Toplam puana göre en iyi oyuncular',
    loadingRankings: 'Sıralama yükleniyor…',
    noScoresYet: 'Henüz puan yok',
    playSomeGames: 'Burada görünmek için birkaç oyun oyna!',

    // ── Profile ───────────────────────────────────────────────────────────────
    yourStats: 'İSTATİSTİKLERİN',
    passRate: 'Geçiş Oranı',
    bestStreak: 'En İyi Seri',
    totalScore: 'Toplam Puan',
    gamesPlayed: 'Oynanan Oyun',
    highestLevel: 'En Yüksek Seviye',
    earnedBadges: 'Rozetler kazandın!',
    startEarningBadges: 'Rozet kazanmaya başla',

    // ── Achievements ──────────────────────────────────────────────────────────
    noAchievementsYet: 'Başarım kazanmak için oynamaya devam et!',
    badgeUnlocked: 'Rozet Açıldı!',
    unlockedLabel: 'açıldı',
    doneLabel: 'tamamlandı',
    earned: 'Kazanıldı',

    // Badge names
    badge_first_win_name: 'İlk Galibiyet',
    badge_level_5_name: '5. Seviye',
    badge_level_10_name: '10. Seviye',
    badge_streak_5_name: 'Ateş Topu',
    badge_streak_10_name: 'Durdurulamaz',
    badge_games_10_name: 'Kararlı',
    badge_games_50_name: 'Tecrübeli',
    badge_perfect_game_name: 'Mükemmeliyetçi',
    badge_speed_demon_name: 'Hız Canavarı',
    badge_multiplayer_1_name: 'İlk Savaş',
    badge_multiplayer_5w_name: 'Şampiyon',
    badge_referral_1_name: 'İşe Alımcı',
    badge_spring_event_name: 'Bahar Akademisyeni',
    badge_premium_name: 'Premium Üye',
    badge_turkish_mode_name: 'İki Dilli',

    // Badge descriptions
    badge_first_win_desc: 'İlk bölümünü geç',
    badge_level_5_desc: '5. seviyeye ulaş',
    badge_level_10_desc: '10. seviyeye ulaş',
    badge_streak_5_desc: '5\'lik cevap serisi yap',
    badge_streak_10_desc: '10\'luk cevap serisi yap',
    badge_games_10_desc: '10 oyun oyna',
    badge_games_50_desc: '50 oyun oyna',
    badge_perfect_game_desc: 'Bir oyunda %100 doğruluk elde et',
    badge_speed_demon_desc: '5 soruyu 2 saniyenin altında cevapla',
    badge_multiplayer_1_desc: 'İlk çok oyunculu maçını tamamla',
    badge_multiplayer_5w_desc: '5 çok oyunculu maç kazan',
    badge_referral_1_desc: 'Katılan bir arkadaşı davet et',
    badge_spring_event_desc: 'Bahar Bilgi Koşusu\'nu tamamla',
    badge_premium_desc: 'Quick Decision Premium\'a abone ol',
    badge_turkish_mode_desc: 'Türkçe modda oyna',

    // ── Referral ──────────────────────────────────────────────────────────────
    referral: 'Arkadaş Davet Et',
    referralExplain: 'Arkadaşlarını davet et, her başarılı davet için 50 bonus coin kazan.',
    yourReferralCode: 'Davet Kodun',
    shareInvite: 'Davet Paylaş',
    howItWorks: 'NASIL ÇALIŞIR',
    successful: 'Başarılı',
    pendingLabel: 'Bekliyor',
    coinsEarned: 'Kazanılan Coin',
    shareFailed: 'Paylaşım Başarısız',
    shareFailedBody: 'Paylaşım sayfası açılamadı.',
    referralStep1: 'Benzersiz davet kodunu arkadaşlarınla paylaş',
    referralStep2: 'Arkadaşın uygulamayı indirip kodunla kayıt olur',
    referralStep3: 'İlk 3 oyununu oynuyorlar',
    referralStep4: 'İkiniz de 50 bonus coin alıyorsunuz!',

    // ── Friends ───────────────────────────────────────────────────────────────
    friends: 'Arkadaşlar',
    myFriendCode: 'ARKADAŞ KODUM',
    addFriend: 'ARKADAŞ EKLE',
    enterFriendCode: 'Arkadaş kodu gir',
    shareFriendCodeHint: 'Arkadaşların seni ekleyebilmesi için bu kodu paylaş',
    noFriendsYet: 'Arkadaşlarını davet etmek için kodunu paylaş!',

    // ── Challenges ───────────────────────────────────────────────────────────
    challenges: 'Meydan Okumalar',
    incomingTab: 'Gelen',
    outgoingTab: 'Giden',
    noIncomingChallenges: 'Henüz gelen meydan okuma yok',
    noOutgoingChallenges: 'Henüz meydan okuma gönderilmedi',
    acceptChallenge: 'Meydan Okumayı Kabul Et',
    youWonBattle: 'Kazandın!',
    youLostBattle: 'Kaybettin — geri meydan oku!',
    pendingStatus: 'Bekliyor',
    completedStatus: 'Tamamlandı',
    expiredStatus: 'Süresi Doldu',

    // ── Seasonal event ────────────────────────────────────────────────────────
    seasonalEvent: 'Bahar Bilgi Koşusu',
    eventProgress: 'ETKİNLİK İLERLEMESİ',
    eventEnds: 'Etkinlik bitiş',
    milestones: 'AŞAMALAR',
    questionsLabel: 'Cevaplanan',
    correctLabel: 'Doğru',
    eventInfoText: 'Etkinlik süresince herhangi bir oyun modunda oyna. Bahar temalı sorular otomatik olarak dahil edilir ve ilerlemenize sayılır.',

    // ── Share card ────────────────────────────────────────────────────────────
    shareYourStats: 'İstatistiklerini Paylaş',
    showOffProgress: 'İlerlemenle övün',
    shareCard: 'Kartı Paylaş',
    signInToSeeCard: 'Kartını görmek için giriş yap',
    challengeMeWithCode: 'Bu kodla bana meydan oku',
    thinkFastTagline: 'Hızlı düşün. Daha hızlı karar ver.',

    // ── World map ─────────────────────────────────────────────────────────────
    selectWorld: 'Dünya Seç',
    dailyChallenge: 'Günlük Meydan Okuma',
    todayLabel: 'BUGÜN',
    continueJourney: 'Yolculuğuna devam et',
    worldLocked: 'Kilidi açmak için önceki dünyayı tamamla',
    appTagline: 'Dünya ne kadar tuhaf?',
    chooseYourWorld: 'Dünyanı Seç',
    tapWorldToStart: 'Oynamak için bir dünyaya dokun',
    moreWorldsComing: 'Daha fazla dünya geliyor',
    moreWorldsSubtitle: 'Memler · Guinness · Pop Kültür',
    springKnowledgeSprint: 'Bahar Bilgi Koşusu',

    // ── Level map ─────────────────────────────────────────────────────────────
    milestoneAlmostThere: 'Neredeyse Bitti',
    milestoneHalfway: 'Yarı Yol',
    milestoneWarmingUp: 'Isınma',
    milestoneStartHere: 'Buradan Başla',
    worldCompleteTitle: 'Dünya Tamamlandı!',
    worldCompleteHint: 'Kupayı almak için tüm {n} seviyeyi bitir',
    levelsCompletedFmt: '{n} / {total} tamamlandı',
    mapBeginning: 'Başlangıç',
    levelsCountFmt: '{n} / {total} seviye',

    // ── Social screen ─────────────────────────────────────────────────────────
    socialSubheading: 'Arkadaşlarına meydan oku ve birlikte büyü',
    actionsSection: 'İŞLEMLER',
    socialFriendsDesc: 'Arkadaş ekle ve ilerlemelerini gör',
    socialChallengesDesc: 'Bilgi meydan okumaları gönder ve al',
    socialShareCardLabel: 'Kart Paylaş',
    socialShareCardDesc: 'Paylaşmak için istatistik kartı oluştur',
    socialBattlesStat: 'Savaşlar',
    liveBattleTitle: 'Canlı Savaş',
    liveBattleDesc: 'Şimdi gerçek bir rakiple oyna',
    liveLabel: 'CANLI',

    // ── Share card tiers ──────────────────────────────────────────────────────
    tierLegendary: 'Efsanevi',
    tierElite: 'Elit',
    tierPro: 'Pro',
    tierRising: 'Yükselen',

    // ── Share messages ────────────────────────────────────────────────────────
    shareCardTitle: 'Quick Decision İstatistiklerim',
    friendShareMsg: 'Beni Quick Decision\'da ekle! Arkadaş kodum: {code}\nUygulamayı indir ve kodumu girerek bana meydan oku!',
    friendShareTitle: 'Quick Decision — Arkadaş İsteği',
    friendsCountFmt: 'Arkadaşlar ({n})',
    noFriendsHeading: 'Henüz arkadaş yok',
    friendsSuccessTitle: 'Başarılı',
    friendsErrorTitle: 'Hata',
    requests: 'İstekler',
    noPendingRequests: 'Bekleyen arkadaşlık isteği yok',
    wantsToBeYourFriend: 'Arkadaşın olmak istiyor',
    friendRequestAccepted: 'Arkadaşlık isteği kabul edildi!',

    // ── Sign out ──────────────────────────────────────────────────────────────
    signOut: 'Çıkış Yap',
    signOutConfirmTitle: 'Çıkış Yap',
    signOutConfirmBody: 'Çıkış yapmak istediğinize emin misiniz?',

    // ── Challenges ────────────────────────────────────────────────────────────
    challengeCompleteTitle: 'Meydan Okuma Tamamlandı!',
    challengeCompleteBody: '{score} puan yaptın, rakip {opponentScore} puan',
    yourScorePending: 'Senin puanın',

    // ── Seasonal event extras ─────────────────────────────────────────────────
    springEventSubtitle: 'Özel rozetler kazanmak için bahar temalı soruları cevapla',
    eventEndDate: '30 Nisan 2026',
    progressToMilestoneFmt: 'Sonraki aşamaya {n} / {total} ({pct}%)',
    answerNQuestionsFmt: '{n} soru cevapla',

    // ── Paywall ───────────────────────────────────────────────────────────────
    premiumSubscriptionTitle: 'Premium Abonelik',
    restorePurchasesChecking: 'Önceki satın almalar kontrol ediliyor…',
    subscribeBtnFmt: 'Abone Ol — {price}',

    // ── Profile ───────────────────────────────────────────────────────────────
    playerDefault: 'Oyuncu',

    // ── Game screen ───────────────────────────────────────────────────────────
    exitGameLabel: 'Oyundan çık',

    // ── Daily challenge banner ────────────────────────────────────────────────
    dailyChallengeLabel: 'GÜNLÜK MEYDAN OKUMA',
    expired: 'Süresi Doldu',
    targetLabel: 'Hedef',
    playersLabel: 'Oyuncular',

    // ── Energy bar ────────────────────────────────────────────────────────────
    nextHeartInFmt: 'Sonraki can {time} içinde',

    // ── Fact reveal ───────────────────────────────────────────────────────────
    factTimesUp: 'Süre Doldu!',
    factCorrect: 'Doğru!',
    factWrong: 'Yanlış!',
    streakSuffix: 'Seri!',
    answerFasterTip: 'Bir dahaki sefere daha hızlı cevapla!',
    keepGoingMsg: 'Devam et — başarabilirsin!',
    didYouKnow: 'Biliyor muydun?',
    tipLabel: 'İpucu',
    tipText: 'Her seçeneği dikkatlice oku — bazıları çok yakın!',
    continueBtn: 'Devam',

    // ── Seasonal event banner ─────────────────────────────────────────────────
    seasonalEventLabel: 'MEVSİMSEL ETKİNLİK',
    springEventEnds: '30 Nisan\'da bitiyor · Özel rozetler',
    springEventAccessibility: 'Bahar Bilgi Koşusu mevsimsel etkinliği',

    // ── Level node ────────────────────────────────────────────────────────────
    levelNodeLockedSuffix: ': kilitli',
    levelNodeCompletedFmt: ': tamamlandı, {stars} yıldız',
    levelNodeCurrentSuffix: ': mevcut seviye',
    levelNodeUnlockedSuffix: ': açık',
    completePrevLevels: 'Kilidi açmak için önceki seviyeleri tamamla',
    doubleTapToStart: 'Başlamak için çift dokun',

    // ── World card ────────────────────────────────────────────────────────────
    completePrevWorld: 'Önceki dünyayı tamamla',

    // ── Error view ────────────────────────────────────────────────────────────
    somethingWentWrong: 'Bir şeyler yanlış gitti.',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface I18nContextValue {
  language: Language;
  t: (key: TranslationKey) => string;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'en',
  t: (key) => key,
  setLanguage: () => {},
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load from AsyncStorage (fast, local) then verify/sync with Supabase
  React.useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      if (stored === 'en' || stored === 'tr') setLanguageState(stored);
    });

    // Also load from Supabase user profile (cross-device sync)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('users') as any).select('preferred_language').eq('id', user.id).single()
        .then(({ data }: { data: { preferred_language?: string } | null }) => {
          if (data?.preferred_language === 'en' || data?.preferred_language === 'tr') {
            setLanguageState(data.preferred_language as Language);
            AsyncStorage.setItem(LANG_KEY, data.preferred_language);
          }
        })
        .catch(() => { /* column may not exist yet — ignore */ });
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANG_KEY, lang);

    // Persist to Supabase for cross-device sync
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from('users') as any).update({ preferred_language: lang }).eq('id', user.id)
          .then(() => { /* silent sync */ })
          .catch(() => { /* ignore if column not yet migrated */ });
      }
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey): string =>
      (translations[language] as Record<string, string>)[key]
      ?? (translations.en as Record<string, string>)[key]
      ?? key,
    [language],
  );

  const value = React.useMemo(() => ({ language, t, setLanguage }), [language, t, setLanguage]);

  return React.createElement(I18nContext.Provider, { value }, children);
};

export const useI18n = () => useContext(I18nContext);
