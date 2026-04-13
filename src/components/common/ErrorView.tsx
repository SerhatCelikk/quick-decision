import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<Props> = ({
  message = 'Something went wrong.',
  onRetry,
}) => (
  <View style={styles.container}>
    <Text style={styles.emoji}>⚠️</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    flex: 1,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  message: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20 },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
