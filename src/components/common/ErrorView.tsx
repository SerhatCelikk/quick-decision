import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<Props> = ({ message, onRetry }) => {
  const { t } = useI18n();
  return (
    <View style={styles.container}>
      <Ionicons name="warning" size={48} color={COLORS.timerWarning} style={{ marginBottom: 16 }} />
      <Text style={styles.message}>{message ?? t('somethingWentWrong')}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>{t('tryAgain')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

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
