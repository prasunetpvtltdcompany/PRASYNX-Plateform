import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing } from '../../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={styles.title}>Prasynx</Text>
      <Text style={styles.subtitle}>School ERP</Text>
      <ActivityIndicator color="#FFFFFF" size="large" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 42, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1 },
  subtitle: { fontSize: fontSize.lg, color: '#FFFFFFCC', marginTop: spacing.sm },
  loader: { position: 'absolute', bottom: 80 },
});
