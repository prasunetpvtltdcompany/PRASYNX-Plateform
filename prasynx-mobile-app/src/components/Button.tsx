import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, borderRadius, fontSize, spacing } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, style, textStyle, icon,
}: ButtonProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const padV = size === 'sm' ? spacing.sm : size === 'lg' ? 14 : spacing.md;
  const padH = size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.lg;
  const fSize = size === 'sm' ? fontSize.sm : size === 'lg' ? fontSize.lg : fontSize.md;
  const rad = size === 'sm' ? borderRadius.md : borderRadius.lg;

  const content = (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          paddingVertical: padV,
          paddingHorizontal: padH,
          borderRadius: rad,
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'secondary' && {
          backgroundColor: colors.secondaryBg,
        },
        variant === 'outline' && {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
        },
        variant === 'ghost' && {
          backgroundColor: 'transparent',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={[
            styles.text,
            {
              color: variant === 'primary' ? '#FFFFFF' : colors.primary,
              fontSize: fSize,
              marginLeft: icon ? spacing.sm : 0,
            },
            variant === 'secondary' && { color: colors.primary },
            textStyle,
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );

  if (variant === 'primary') {
    return (
      <LinearGradient
        colors={['#6D4CFF', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          { borderRadius: rad, opacity: disabled ? 0.5 : 1 },
          style,
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          activeOpacity={0.8}
          style={[
            styles.gradientButton,
            { paddingVertical: padV, paddingHorizontal: padH, borderRadius: rad },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              {icon}
              <Text style={[
                styles.text,
                { color: '#FFFFFF', fontSize: fSize, marginLeft: icon ? spacing.sm : 0 },
                textStyle,
              ]}>
                {title}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    shadowColor: '#6D4CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
