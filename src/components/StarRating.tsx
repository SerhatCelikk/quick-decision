import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  stars: 0 | 1 | 2 | 3;
  size?: number;
  animated?: boolean;
}

const AnimatedStar: React.FC<{ filled: boolean; delay: number; size: number }> = ({
  filled,
  delay,
  size,
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!filled) {
      scale.setValue(1);
      return;
    }
    rotate.setValue(-0.3);
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 7,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, scale, rotate, filled]);

  const spin = rotate.interpolate({ inputRange: [-0.3, 0], outputRange: ['-30deg', '0deg'] });

  return (
    <Animated.View style={{ transform: [{ scale }, { rotate: spin }] }}>
      <Ionicons
        name={filled ? 'star' : 'star-outline'}
        size={size}
        color={filled ? '#F59E0B' : '#334155'}
      />
    </Animated.View>
  );
};

export const StarRating: React.FC<StarRatingProps> = ({ stars, size = 18, animated = false }) => {
  return (
    <View style={styles.row}>
      {[1, 2, 3].map((s, i) =>
        animated ? (
          <AnimatedStar key={s} filled={s <= stars} delay={i * 350} size={size} />
        ) : (
          <Ionicons
            key={s}
            name={s <= stars ? 'star' : 'star-outline'}
            size={size}
            color={s <= stars ? '#F59E0B' : '#334155'}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
});
