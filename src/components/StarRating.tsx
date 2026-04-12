import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

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

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
    ]).start();
  }, [delay, scale]);

  return (
    <Animated.Text style={[{ fontSize: size, transform: [{ scale }] }]}>
      {filled ? '⭐' : '☆'}
    </Animated.Text>
  );
};

export const StarRating: React.FC<StarRatingProps> = ({ stars, size = 18, animated = false }) => {
  return (
    <View style={styles.row}>
      {[1, 2, 3].map((s, i) =>
        animated ? (
          <AnimatedStar key={s} filled={s <= stars} delay={i * 400} size={size} />
        ) : (
          <Animated.Text key={s} style={{ fontSize: size }}>
            {s <= stars ? '⭐' : '☆'}
          </Animated.Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
});
