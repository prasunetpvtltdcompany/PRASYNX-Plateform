import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, borderRadius, fontSize, spacing } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function Input({ label, error, leftIcon, rightIcon, onRightIconPress, style, ...props }: InputProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View style={[
        styles.inputContainer,
        {
          backgroundColor: colors.inputBg,
          borderColor: error ? colors.error : colors.border,
        },
        style,
      ]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              paddingLeft: leftIcon ? 0 : spacing.md,
              paddingRight: rightIcon ? 0 : spacing.md,
            },
          ]}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconRight}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: fontSize.xs, fontWeight: '600', marginBottom: spacing.xs, marginLeft: 2 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    height: 48,
  },
  input: { flex: 1, fontSize: fontSize.md, height: '100%' },
  iconLeft: { paddingLeft: spacing.md },
  iconRight: { paddingRight: spacing.md },
  error: { fontSize: fontSize.xs, marginTop: spacing.xs, marginLeft: 2 },
});
