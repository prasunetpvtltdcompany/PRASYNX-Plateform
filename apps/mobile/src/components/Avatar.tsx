import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, fontSize } from '../theme';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
  color?: string;
}

export function Avatar({ name, imageUrl, size = 40, color }: AvatarProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = color || colors.primary;
  const fSize = size * 0.4;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <Text style={[styles.initials, { fontSize: fSize, color: '#FFFFFF' }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {},
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  initials: { fontWeight: '600' },
});
