import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { RootNavigator } from './src/navigation/RootNavigator';
import { I18nProvider } from './src/i18n';
import { supabase } from './src/services/supabase';

// ── Font imports (requires: npx expo install @expo-google-fonts/space-grotesk @expo-google-fonts/nunito-sans) ──
let fontMap: Record<string, number> = {};
try {
  const sg = require('@expo-google-fonts/space-grotesk');
  const ns = require('@expo-google-fonts/nunito-sans');
  fontMap = {
    SpaceGrotesk_500Medium:   sg.SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold: sg.SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold:     sg.SpaceGrotesk_700Bold,
    NunitoSans_400Regular:    ns.NunitoSans_400Regular,
    NunitoSans_600SemiBold:   ns.NunitoSans_600SemiBold,
    NunitoSans_700Bold:       ns.NunitoSans_700Bold,
    NunitoSans_800ExtraBold:  ns.NunitoSans_800ExtraBold,
  };
} catch {
  // Font packages not yet installed — app renders with system fonts
}

export default function App() {
  const [fontsLoaded] = useFonts(fontMap);

  // Handle Google OAuth deep link callback
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      if (url.startsWith('quickdecision://') && url.includes('code=')) {
        try {
          await supabase.auth.exchangeCodeForSession(url);
        } catch {
          // Session exchange failed silently
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, []);

  // Only block render if we actually have fonts to load
  if (Object.keys(fontMap).length > 0 && !fontsLoaded) return null;

  return (
    <I18nProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </SafeAreaProvider>
    </I18nProvider>
  );
}
