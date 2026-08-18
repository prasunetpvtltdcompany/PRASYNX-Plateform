import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, borderRadius, fontSize, spacing, shadows } from '../theme';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  action?: React.ReactNode;
}

export function Card({ title, subtitle, children, style, onPress, action }: CardProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          shadowColor: '#000',
        },
        shadows.sm,
        style,
      ]}
    >
      {(title || action) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
            {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
          </View>
          {action && <View>{action}</View>}
        </View>
      )}
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerText: { flex: 1 },
  title: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: 2 },
  subtitle: { fontSize: fontSize.sm },
});
