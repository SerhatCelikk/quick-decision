import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'tr';

const LANG_KEY = '@quick_decision_language';

const translations = {
  en: {
    play: 'Play',
    leaderboard: 'Leaderboard',
    social: 'Social',
    profile: 'Profile',
    achievements: 'Achievements',
    premiumUpgrade: 'Go Premium',
    multiplayer: 'Multiplayer',
    referral: 'Refer Friends',
    seasonalEvent: 'Spring Knowledge Sprint',
    findOpponent: 'Find Opponent',
    quickMatch: 'Quick Match',
    challengeFriend: 'Challenge Friend',
    searching: 'Searching for opponent…',
    cancel: 'Cancel',
    battleReady: 'Battle Ready!',
    yourScore: 'Your Score',
    opponentScore: 'Opponent Score',
    youWon: 'You Won!',
    youLost: 'You Lost',
    playAgain: 'Play Again',
    backToLobby: 'Back to Lobby',
    yourReferralCode: 'Your Referral Code',
    shareInvite: 'Share Invite',
    referralExplain: 'Invite friends and earn 50 bonus coins per successful referral.',
    premiumTitle: 'Quick Decision Premium',
    premiumBenefit1: 'No Ads — play without interruptions',
    premiumBenefit2: 'Unlimited Energy — never run out of hearts',
    premiumBenefit3: 'Exclusive Premium Badges — show off your status',
    premiumBenefit4: 'Early Access — new features first',
    monthlyPlan: 'Monthly',
    yearlyPlan: 'Yearly  (Save 40%)',
    restorePurchases: 'Restore Purchases',
    eventProgress: 'Event Progress',
    eventEnds: 'Event ends',
    loading: 'Loading…',
    errorRetry: 'Something went wrong. Tap to retry.',
    language: 'Language',
    english: 'English',
    turkish: 'Türkçe',
    noAchievementsYet: 'Keep playing to earn achievements!',
    badgeUnlocked: 'Badge Unlocked!',
    rank: 'Rank',
    elo: 'ELO Rating',
    wins: 'Wins',
    losses: 'Losses',
    winStreak: 'Win Streak',
  },
  tr: {
    play: 'Oyna',
    leaderboard: 'Sıralama',
    social: 'Sosyal',
    profile: 'Profil',
    achievements: 'Başarımlar',
    premiumUpgrade: 'Premium Al',
    multiplayer: 'Çok Oyunculu',
    referral: 'Arkadaş Davet Et',
    seasonalEvent: 'Bahar Bilgi Koşusu',
    findOpponent: 'Rakip Bul',
    quickMatch: 'Hızlı Eşleşme',
    challengeFriend: 'Arkadaşa Meydan Oku',
    searching: 'Rakip aranıyor…',
    cancel: 'İptal',
    battleReady: 'Mücadele Başlıyor!',
    yourScore: 'Senin Puanın',
    opponentScore: 'Rakip Puanı',
    youWon: 'Kazandın!',
    youLost: 'Kaybettin',
    playAgain: 'Tekrar Oyna',
    backToLobby: 'Lobiye Dön',
    yourReferralCode: 'Davet Kodun',
    shareInvite: 'Davet Paylaş',
    referralExplain: 'Arkadaşlarını davet et, her başarılı davet için 50 bonus coin kazan.',
    premiumTitle: 'Quick Decision Premium',
    premiumBenefit1: 'Reklamsız — kesintisiz oyna',
    premiumBenefit2: 'Sınırsız Enerji — hiç bitme endişesi yok',
    premiumBenefit3: 'Özel Premium Rozetler — statünü göster',
    premiumBenefit4: 'Erken Erişim — yeni özellikleri ilk gör',
    monthlyPlan: 'Aylık',
    yearlyPlan: 'Yıllık  (%40 İndirimli)',
    restorePurchases: 'Satın Almaları Geri Yükle',
    eventProgress: 'Etkinlik İlerlemesi',
    eventEnds: 'Etkinlik bitiş',
    loading: 'Yükleniyor…',
    errorRetry: 'Bir şeyler yanlış gitti. Tekrar denemek için dokun.',
    language: 'Dil',
    english: 'English',
    turkish: 'Türkçe',
    noAchievementsYet: 'Başarım kazanmak için oynamaya devam et!',
    badgeUnlocked: 'Rozet Açıldı!',
    rank: 'Sıra',
    elo: 'ELO Puanı',
    wins: 'Galibiyet',
    losses: 'Mağlubiyet',
    winStreak: 'Galibiyet Serisi',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

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

  React.useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      if (stored === 'en' || stored === 'tr') setLanguageState(stored);
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANG_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => translations[language][key] ?? translations.en[key] ?? key,
    [language],
  );

  const value = React.useMemo(() => ({ language, t, setLanguage }), [language, t, setLanguage]);

  return React.createElement(I18nContext.Provider, { value }, children);
};

export const useI18n = () => useContext(I18nContext);
