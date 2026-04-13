import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

type Props = RootStackScreenProps<'BattleResults'>;

export const BattleResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { won, myScore, opponentScore, opponentUsername } = route.params;
  const { t } = useI18n();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.resultBadge, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.resultEmoji}>{won ? '🏆' : '😤'}</Text>
          <Text style={[styles.resultText, { color: won ? '#ffd700' : COLORS.danger }]}>
            {won ? t('youWon') : t('youLost')}
          </Text>
        </Animated.View>

        {/* Score comparison */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCol}>
            <Text style={styles.scoreLabel}>You</Text>
            <Text style={[styles.scoreValue, { color: COLORS.primary }]}>{myScore}</Text>
          </View>
          <Text style={styles.vsDivider}>VS</Text>
          <View style={styles.scoreCol}>
            <Text style={styles.scoreLabel}>{opponentUsername}</Text>
            <Text style={[styles.scoreValue, { color: COLORS.danger }]}>{opponentScore}</Text>
          </View>
        </View>

        {/* ELO change placeholder */}
        <View style={styles.eloCard}>
          <Text style={styles.eloLabel}>{t('elo')} Change</Text>
          <Text style={[styles.eloChange, { color: won ? COLORS.success : COLORS.danger }]}>
            {won ? '+25' : '-15'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.replace('Matchmaking')}
        >
          <Text style={styles.primaryButtonText}>⚔️  {t('playAgain')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('MultiplayerLobby')}
        >
          <Text style={styles.secondaryButtonText}>{t('backToLobby')}</Text>
        </TouchableOpacity>
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
  resultBadge: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultEmoji: { fontSize: 72, marginBottom: 12 },
  resultText: { fontSize: 36, fontWeight: 'bold' },
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCol: { alignItems: 'center' },
  scoreLabel: { fontSize: 14, color: COLORS.textMuted, marginBottom: 8, fontWeight: '600' },
  scoreValue: { fontSize: 40, fontWeight: 'bold' },
  vsDivider: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMuted },
  eloCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  eloLabel: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600' },
  eloChange: { fontSize: 22, fontWeight: 'bold' },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  primaryButtonText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600' },
});
