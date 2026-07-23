import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

interface Notification {
  id: string;
  icon: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: '📝', title: 'New Assignment Posted', body: 'Mathematics Chapter 5 homework is now available on the portal.', time: '30 min ago', read: false },
  { id: '2', icon: '📅', title: 'Exam Schedule Updated', body: 'Mid-term exams have been rescheduled to begin Dec 15.', time: '2h ago', read: false },
  { id: '3', icon: '💰', title: 'Fee Payment Reminder', body: 'Your second installment fee is due on Dec 20, 2026.', time: '1d ago', read: false },
  { id: '4', icon: '🏆', title: 'Results Published', body: 'Quarterly exam results are now available. Check your performance.', time: '2d ago', read: true },
  { id: '5', icon: '📢', title: 'School Assembly', body: 'There will be a special assembly on Friday at 8 AM.', time: '3d ago', read: true },
  { id: '6', icon: '🎉', title: 'Annual Day Celebrations', body: 'Annual Day function is scheduled for Dec 22. Register for performances.', time: '5d ago', read: true },
];

export function StudentNotificationsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Notifications"
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={[styles.markAllBtn, { color: colors.primary }]}>Mark All</Text>
            </TouchableOpacity>
          ) : null
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        ) : (
          <>
            {unreadCount > 0 && (
              <Text style={[styles.unreadLabel, { color: colors.textSecondary }]}>
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </Text>
            )}
            {notifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                activeOpacity={0.7}
                onPress={() => markAsRead(notif.id)}
              >
                <Card style={{ ...styles.notifCard, ...(!notif.read ? { backgroundColor: colors.primary + '08' } : {}) }}>
                  <View style={styles.notifRow}>
                    <View style={styles.notifIconWrap}>
                      <Text style={styles.notifIcon}>{notif.icon}</Text>
                      {!notif.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={[styles.notifTitle, { color: colors.text }, !notif.read && { fontWeight: '700' }]}>
                        {notif.title}
                      </Text>
                      <Text style={[styles.notifBody, { color: colors.textSecondary }]} numberOfLines={2}>
                        {notif.body}
                      </Text>
                      <Text style={[styles.notifTime, { color: colors.textSecondary }]}>{notif.time}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  markAllBtn: { fontSize: fontSize.sm, fontWeight: '600' },
  unreadLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.sm },
  notifCard: {},
  notifRow: { flexDirection: 'row' },
  notifIconWrap: { width: 44, height: 44, borderRadius: borderRadius.md, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notifIcon: { fontSize: 22 },
  unreadDot: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4 },
  notifContent: { flex: 1, marginLeft: spacing.sm },
  notifTitle: { fontSize: fontSize.sm },
  notifBody: { fontSize: fontSize.xs, marginTop: 4, lineHeight: 16 },
  notifTime: { fontSize: fontSize.xs, marginTop: spacing.xs },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl * 2 },
  emptyIcon: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '600' },
  emptySubtitle: { fontSize: fontSize.sm, marginTop: spacing.xs, textAlign: 'center', paddingHorizontal: spacing.xl },
});
