import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants';

interface Props {
  onPress: () => void;
}

export const SeasonalEventBanner: React.FC<Props> = ({ onPress }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  }, [shimmerAnim]);

  const shimmerX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 300],
  });

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Spring Knowledge Sprint seasonal event"
    >
      <LinearGradient
        colors={['#064E3B', '#047857', '#064E3B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Shimmer */}
        <Animated.View
          style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
          pointerEvents="none"
        />

        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="leaf" size={26} color="#34D399" />
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.eventLabel}>SEASONAL EVENT</Text>
          <Text style={styles.eventTitle}>Spring Knowledge Sprint</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={11} color="#6EE7B7" />
            <Text style={styles.eventMeta}>Ends April 30 · Exclusive badges</Text>
          </View>
        </View>

        {/* Arrow */}
        <View style={styles.arrowWrap}>
          <Ionicons name="chevron-forward" size={20} color="#34D399" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#10B98155',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ skewX: '-20deg' }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderWidth: 1,
    borderColor: '#34D39944',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  eventLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0FDF4',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  eventMeta: {
    fontSize: 11,
    color: '#6EE7B7',
  },
  arrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(52,211,153,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
