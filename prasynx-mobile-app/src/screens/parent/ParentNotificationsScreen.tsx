import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';
import { useDataStore } from '../../store/dataStore';
import { Notification } from '../../types';

const CATEGORIES = ['All', 'Academic', 'Events', 'Fee', 'General'] as const;

const CATEGORY_ICONS: Record<string, string> = {
  academic: '📚',
  events: '🎉',
  fee: '💰',
  general: '📢',
  holiday: '🏖️',
  exam: '📝',
};

const TIME_AGO = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export function ParentNotificationsScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { notifications, fetchNotifications } = useDataStore();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const allNotifications = notifications ?? [];
  const filtered = selectedCategory === 'All'
    ? allNotifications
    : allNotifications.filter((n: Notification) => n.type.toLowerCase() === selectedCategory.toLowerCase());

  const unreadCount = allNotifications.filter((n: Notification) => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Notifications"
        leftAction={<Text onPress={() => navigation?.goBack()} style={{ color: colors.primary, fontSize: 24 }}>{'<'}</Text>}
        onLeftPress={() => navigation?.goBack()}
        rightAction={
          unreadCount > 0 ? (
            <Badge label={`${unreadCount}`} variant="danger" />
          ) : undefined
        }
      />

      <View style={[styles.categoryRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, {
                backgroundColor: selectedCategory === cat ? colors.primary : colors.surfaceVariant,
              }]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, {
                color: selectedCategory === cat ? '#FFFFFF' : colors.text,
                fontWeight: selectedCategory === cat ? '600' : '400',
              }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications</Text>
          </View>
        ) : (
          filtered.map((notif) => {
            const icon = CATEGORY_ICONS[notif.type.toLowerCase()] || '📢';
            return (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notifCard, {
                  backgroundColor: notif.read ? colors.card : colors.surfaceVariant,
                  borderColor: colors.border,
                  ...shadows.sm,
                }]}
                activeOpacity={0.7}
              >
                <View style={styles.notifRow}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={styles.notifIcon}>{icon}</Text>
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                      <Text style={[styles.notifTitle, {
                        color: colors.text,
                        fontWeight: notif.read ? '400' : '600',
                      }]}>{notif.title}</Text>
                      {!notif.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.notifBody, { color: colors.textSecondary }]} numberOfLines={2}>{notif.body}</Text>
                    <View style={styles.notifFooter}>
                      <Badge label={notif.type} variant={notif.type === 'fee' ? 'warning' : notif.type === 'events' ? 'info' : 'default'} />
                      <Text style={[styles.notifTime, { color: colors.textSecondary }]}>{TIME_AGO(notif.created_at)}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoryRow: { borderBottomWidth: 1, paddingVertical: spacing.sm },
  categoryScroll: { paddingHorizontal: spacing.md, gap: spacing.sm },
  categoryChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  categoryText: { fontSize: fontSize.sm },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  emptyState: { alignItems: 'center', marginTop: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fontSize.md },
  notifCard: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  notifRow: { flexDirection: 'row' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  notifIcon: { fontSize: 18 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  notifTitle: { fontSize: fontSize.sm, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: spacing.xs },
  notifBody: { fontSize: fontSize.xs, lineHeight: 16, marginBottom: spacing.sm },
  notifFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  notifTime: { fontSize: fontSize.xs },
});
