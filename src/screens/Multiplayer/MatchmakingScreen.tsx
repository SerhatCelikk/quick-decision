import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Props = RootStackScreenProps<'Matchmaking'>;

export const MatchmakingScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useI18n();
  const [elapsed, setElapsed] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  // Spin animation — skip when reduce motion is enabled
  useEffect(() => {
    if (reduceMotion) {
      spinAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim, reduceMotion]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to matchmaking via Supabase Realtime
  useEffect(() => {
    let userId: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;

      // Join matchmaking queue
      try { await supabase.rpc('join_matchmaking', { p_user_id: userId }); } catch { /* ignore */ }

      // Listen for match found
      channel = supabase.channel(`matchmaking:${userId}`)
        .on('broadcast', { event: 'match_found' }, (payload) => {
          const { match_id, opponent_username } = payload.payload as { match_id: string; opponent_username: string };
          // Announce opponent found to screen readers
          AccessibilityInfo.announceForAccessibility(`Opponent found: ${opponent_username}`);
          navigation.replace('LiveBattle', { matchId: match_id, opponentUsername: opponent_username });
        })
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (userId) {
        const uid = userId;
        (async () => { try { await supabase.rpc('leave_matchmaking', { p_user_id: uid }); } catch { /* ignore */ } })();
      }
    };
  }, [navigation]);

  const handleCancel = async () => {
    setCancelled(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try { await supabase.rpc('leave_matchmaking', { p_user_id: user.id }); } catch { /* ignore */ }
    }
    navigation.goBack();
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const formatElapsed = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {reduceMotion ? (
          // Static concentric circles — no rotation, no pulse
          <View style={styles.staticRingOuter}>
            <View style={styles.staticRingInner} />
          </View>
        ) : (
          // Animated rotating ring
          <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]}>
            <View style={styles.ringInner} />
          </Animated.View>
        )}

        {/* Pulsing dots (hidden in reduced motion — show system activity indicator instead) */}
        {!reduceMotion && (
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>
        )}

        <Text
          style={styles.searchingText}
          accessibilityLiveRegion="polite"
          accessibilityLabel="Searching for opponent…"
        >
          {t('searching')}
        </Text>
        <Text
          style={styles.elapsedText}
          accessibilityLabel={`Search time: ${formatElapsed(elapsed)}`}
        >
          {formatElapsed(elapsed)}
        </Text>

        {!cancelled && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel search"
            accessibilityHint="Double-tap to cancel matchmaking and go back"
          >
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 Tip: You are matched with players near your ELO rating. Average wait: 15–30 seconds.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  ring: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: COLORS.primary,
    borderTopColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ringInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
  },
  // Static alternative for reduced motion
  staticRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  staticRingInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  searchingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  elapsedText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
    marginBottom: 32,
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelText: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600' },
  tipCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    width: '100%',
  },
  tipText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
});
