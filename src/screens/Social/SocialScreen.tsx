import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../constants';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface SocialLink {
  emoji: string;
  label: string;
  desc: string;
  screen: keyof RootStackParamList;
  color: string;
}

const LINKS: SocialLink[] = [
  {
    emoji: '👥',
    label: 'Friends',
    desc: 'View friends & add by code',
    screen: 'Friends',
    color: COLORS.brandBlue,
  },
  {
    emoji: '⚔️',
    label: 'Challenges',
    desc: 'Send & receive challenges',
    screen: 'Challenges',
    color: COLORS.brandPurple,
  },
  {
    emoji: '🃏',
    label: 'Share Card',
    desc: 'Generate your stats card',
    screen: 'ShareCard',
    color: COLORS.brandGreen,
  },
];

export const SocialScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Social</Text>
        <Text style={styles.subheading}>Challenge friends & share your progress</Text>

        {LINKS.map((link) => (
          <TouchableOpacity
            key={link.screen}
            style={styles.card}
            onPress={() => navigation.navigate(link.screen as any)}
            activeOpacity={0.82}
          >
            <View style={[styles.iconBox, { backgroundColor: link.color + '22', borderColor: link.color + '55' }]}>
              <Text style={styles.icon}>{link.emoji}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardLabel}>{link.label}</Text>
              <Text style={styles.cardDesc}>{link.desc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32, gap: 12 },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  subheading: { fontSize: 14, color: COLORS.textMuted, marginTop: 2, marginBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 26 },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cardDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  chevron: { fontSize: 22, color: COLORS.textMuted, fontWeight: '300' },
});
