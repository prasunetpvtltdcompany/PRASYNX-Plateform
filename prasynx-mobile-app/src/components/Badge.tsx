import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, borderRadius, fontSize, spacing } from '../theme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const bgMap = {
    default: colors.surfaceVariant,
    success: colors.successBg,
    warning: colors.warningBg,
    danger: colors.errorBg,
    info: colors.infoBg,
    purple: colors.secondaryBg,
  };

  const textMap = {
    default: colors.textSecondary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.error,
    info: colors.info,
    purple: colors.primary,
  };

  return (
    <View style={[styles.badge, { backgroundColor: bgMap[variant] }, style]}>
      <Text style={[styles.text, { color: textMap[variant] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
