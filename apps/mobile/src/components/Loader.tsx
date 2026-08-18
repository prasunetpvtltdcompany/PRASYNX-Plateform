import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, fontSize } from '../theme';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'small' | 'large';
}

export function Loader({ fullScreen, message, size = 'large' }: LoaderProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size={size} color={colors.primary} />
        {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={[styles.message, { color: colors.textSecondary, marginLeft: 8 }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20 },
  message: { fontSize: fontSize.sm, marginTop: 12 },
});
