import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, borderRadius, fontSize, spacing } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  onNotificationPress?: () => void;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  onLeftPress?: () => void;
}

export function Header({ title, subtitle, showSearch, onSearch, onNotificationPress, rightAction, leftAction, onLeftPress }: HeaderProps) {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <View style={styles.topRow}>
          {leftAction && (
            <TouchableOpacity onPress={onLeftPress} style={styles.iconBtn}>
              {leftAction}
            </TouchableOpacity>
          )}
          <View style={styles.titleArea}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
          </View>
          <View style={styles.actions}>
            {onNotificationPress && (
              <TouchableOpacity onPress={onNotificationPress} style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {rightAction}
          </View>
        </View>
        {showSearch && (
          <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              placeholder="Search..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              onChangeText={onSearch}
              returnKeyType="search"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 0 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
  },
  titleArea: { flex: 1 },
  title: { fontSize: fontSize.xl, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: fontSize.sm, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 42,
    marginTop: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
    height: '100%',
  },
});
