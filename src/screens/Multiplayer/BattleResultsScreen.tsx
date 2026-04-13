import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../../types';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

type Props = RootStackScreenProps<'BattleResults'>;

export const BattleResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { won, myScore, opponentScore, opponentUsername } = route.params;
  const { t } = useI18n();
  const scaleAnim  = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 70, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, opacityAnim, slideAnim]);

  const winGradient: readonly [string, string] = ['#1A1400', '#2A2000'];
  const lossGradient: readonly [string, string] = ['#1A0008', '#2A0012'];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={won ? winGradient : lossGradient} style={styles.heroBg} pointerEvents="none" />

      <View style={styles.content}>

        {/* Result badge */}
        <Animated.View style={[styles.resultBadge, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <View style={[styles.resultIconWrap, {
            backgroundColor: (won ? COLORS.gold : COLORS.danger) + '22',
            borderColor: (won ? COLORS.gold : COLORS.danger) + '55',
          }]}>
            <Ionicons name={won ? 'trophy' : 'skull'} size={52} color={won ? COLORS.gold : COLORS.danger} />
          </View>
          <Text style={[styles.resultText, { color: won ? COLORS.gold : COLORS.danger }]}>
            {won ? t('youWon') : t('youLost')}
          </Text>
          <Text style={styles.resultSub}>
            {won ? t('outstandingPerformance') : t('betterLuckNextTime')}
          </Text>
        </Animated.View>

        {/* Score comparison */}
        <Animated.View style={[styles.scoreCard, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.scoreCol}>
            <View style={[styles.scoreAvatar, { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary + '55' }]}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.scoreName}>{t('you')}</Text>
            <Text style={[styles.scoreValue, { color: COLORS.primary }]}>{myScore}</Text>
          </View>
          <View style={styles.vsDivider}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={styles.scoreCol}>
            <View style={[styles.scoreAvatar, { backgroundColor: COLORS.danger + '22', borderColor: COLORS.danger + '55' }]}>
              <Ionicons name="person" size={20} color={COLORS.danger} />
            </View>
            <Text style={styles.scoreName}>{opponentUsername}</Text>
            <Text style={[styles.scoreValue, { color: COLORS.danger }]}>{opponentScore}</Text>
          </View>
        </Animated.View>

        {/* ELO change */}
        <Animated.View style={[styles.eloCard, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.eloLeft}>
            <Ionicons name="trending-up" size={18} color={won ? COLORS.success : COLORS.danger} />
            <Text style={styles.eloLabel}>{t('eloChange')}</Text>
          </View>
          <Text style={[styles.eloChange, { color: won ? COLORS.success : COLORS.danger }]}>
            {won ? '+25' : '-15'}
          </Text>
        </Animated.View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.primaryWrap}
          onPress={() => navigation.replace('Matchmaking')}
          activeOpacity={0.88}
        >
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.primaryBtn}>
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>{t('playAgain')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('MultiplayerLobby')}
        >
          <Text style={styles.secondaryBtnText}>{t('backToLobby')}</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },

  resultBadge: { alignItems: 'center', gap: 10, marginBottom: 8 },
  resultIconWrap: {
    width: 100, height: 100, borderRadius: 30, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  resultText: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  resultSub: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },

  scoreCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 22, padding: 24,
    width: '100%', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  scoreCol: { flex: 1, alignItems: 'center', gap: 8 },
  scoreAvatar: {
    width: 44, height: 44, borderRadius: 14, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  scoreName: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  scoreValue: { fontSize: 36, fontWeight: '900' },
  vsDivider: { paddingHorizontal: 16 },
  vsText: { fontSize: 14, fontWeight: '900', color: COLORS.textMuted, letterSpacing: 1 },

  eloCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    width: '100%', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  eloLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eloLabel: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  eloChange: { fontSize: 24, fontWeight: '900' },

  primaryWrap: {
    width: '100%', borderRadius: 18, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  primaryBtn: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  secondaryBtn: { paddingVertical: 14, alignItems: 'center', width: '100%' },
  secondaryBtnText: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600' },
});
