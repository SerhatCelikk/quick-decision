import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing, AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../../types';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Props = RootStackScreenProps<'Matchmaking'>;

const DOT_COUNT = 3;

export const MatchmakingScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useI18n();
  const [elapsed, setElapsed] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const reduceMotion = useReducedMotion();

  // Outer ring spin
  const spinAnim = useRef(new Animated.Value(0)).current;
  // Inner ring counter-spin
  const spinInner = useRef(new Animated.Value(0)).current;
  // Pulse scale for center circle
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Dot pulse anims
  const dotAnims = useRef(Array.from({ length: DOT_COUNT }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (reduceMotion) { spinAnim.setValue(0); return; }

    const outerSpin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true }),
    );
    const innerSpin = Animated.loop(
      Animated.timing(spinInner, { toValue: -1, duration: 2800, easing: Easing.linear, useNativeDriver: true }),
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );

    outerSpin.start();
    innerSpin.start();
    pulse.start();

    // Staggered dot pulse
    const dotLoops = dotAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay((DOT_COUNT - i) * 200),
        ]),
      ),
    );
    dotLoops.forEach(l => l.start());

    return () => {
      outerSpin.stop(); innerSpin.stop(); pulse.stop();
      dotLoops.forEach(l => l.stop());
    };
  }, [spinAnim, spinInner, pulseAnim, dotAnims, reduceMotion]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let userId: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;

      try { await supabase.rpc('join_matchmaking', { p_user_id: userId }); } catch { /* ignore */ }

      channel = supabase.channel(`matchmaking:${userId}`)
        .on('broadcast', { event: 'match_found' }, (payload) => {
          const { match_id, opponent_username } = payload.payload as { match_id: string; opponent_username: string };
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

  const formatElapsed = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinI = spinInner.interpolate({ inputRange: [-1, 0], outputRange: ['-360deg', '0deg'] });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Animated rings */}
        {reduceMotion ? (
          <View style={styles.staticOuter}>
            <View style={styles.staticInner} />
          </View>
        ) : (
          <View style={styles.ringsWrap}>
            <Animated.View style={[styles.outerRing, { transform: [{ rotate: spin }] }]} />
            <Animated.View style={[styles.innerRing, { transform: [{ rotate: spinI }] }]} />
            <Animated.View style={[styles.centerCircle, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.centerGrad}>
                <Ionicons name="people" size={32} color="#fff" />
              </LinearGradient>
            </Animated.View>
          </View>
        )}

        {/* Dots */}
        {!reduceMotion && (
          <View style={styles.dots}>
            {dotAnims.map((anim, i) => (
              <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
            ))}
          </View>
        )}

        <Text style={styles.searchingText} accessibilityLiveRegion="polite">
          {t('searching')}
        </Text>
        <Text style={styles.elapsedText} accessibilityLabel={`Search time: ${formatElapsed(elapsed)}`}>
          {formatElapsed(elapsed)}
        </Text>

        {!cancelled && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel search"
          >
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>
        )}

        {/* Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="information-circle" size={16} color={COLORS.timerSafe} />
          <Text style={styles.tipText}>{t('matchmakingTip')}</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

const OUTER_SIZE = 180;
const INNER_SIZE = 140;
const CENTER_SIZE = 90;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 0 },

  ringsWrap: {
    width: OUTER_SIZE, height: OUTER_SIZE, alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  outerRing: {
    position: 'absolute', width: OUTER_SIZE, height: OUTER_SIZE, borderRadius: OUTER_SIZE / 2,
    borderWidth: 3, borderColor: COLORS.primary, borderTopColor: 'transparent',
    borderLeftColor: COLORS.primary + '55',
  },
  innerRing: {
    position: 'absolute', width: INNER_SIZE, height: INNER_SIZE, borderRadius: INNER_SIZE / 2,
    borderWidth: 2, borderColor: COLORS.accent, borderBottomColor: 'transparent',
    borderRightColor: COLORS.accent + '44',
  },
  centerCircle: {
    width: CENTER_SIZE, height: CENTER_SIZE, borderRadius: CENTER_SIZE / 2,
    overflow: 'hidden',
  },
  centerGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  staticOuter: {
    width: OUTER_SIZE, height: OUTER_SIZE, borderRadius: OUTER_SIZE / 2,
    borderWidth: 3, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  staticInner: {
    width: INNER_SIZE, height: INNER_SIZE, borderRadius: INNER_SIZE / 2,
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border,
  },

  dots: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dot: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  searchingText: {
    fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8, marginTop: 8,
    letterSpacing: 0.3,
  },
  elapsedText: {
    fontSize: 32, fontWeight: '900', color: COLORS.primary,
    fontVariant: ['tabular-nums'], marginBottom: 32, letterSpacing: 2,
  },

  cancelButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 100, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 32, minHeight: 44,
  },
  cancelText: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600' },

  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    width: '100%', borderWidth: 1, borderColor: COLORS.timerSafe + '30',
  },
  tipText: { flex: 1, fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
});
