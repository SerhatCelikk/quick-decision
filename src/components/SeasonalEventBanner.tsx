import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface Props {
  onPress: () => void;
}

export const SeasonalEventBanner: React.FC<Props> = ({ onPress }) => (
  <TouchableOpacity style={styles.banner} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.left}>
      <Text style={styles.emoji}>🌸</Text>
    </View>
    <View style={styles.center}>
      <Text style={styles.label}>SEASONAL EVENT</Text>
      <Text style={styles.title}>Spring Knowledge Sprint</Text>
      <Text style={styles.sub}>Ends April 30 · Exclusive badges</Text>
    </View>
    <View style={styles.right}>
      <Text style={styles.arrow}>›</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d2010',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#22c55e60',
  },
  left: { marginRight: 12 },
  emoji: { fontSize: 32 },
  center: { flex: 1 },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4ade80',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: { fontSize: 15, fontWeight: '700', color: '#f0fdf4' },
  sub: { fontSize: 12, color: '#86efac', marginTop: 2 },
  right: { marginLeft: 8 },
  arrow: { fontSize: 24, color: '#4ade80', fontWeight: 'bold' },
});
