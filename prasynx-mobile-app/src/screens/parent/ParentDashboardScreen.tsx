import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';
import { useDataStore } from '../../store/dataStore';
import { Student, Notification } from '../../types';

const QUICK_ACTIONS = [
  { label: 'Attendance', icon: '📋', screen: 'ParentAttendance' },
  { label: 'Fee Payment', icon: '💳', screen: 'ParentFees' },
  { label: 'Results', icon: '📊', screen: 'ParentResults' },
  { label: 'Homework', icon: '📝', screen: 'ParentHomework' },
  { label: 'Book PTM', icon: '📅', screen: 'ParentPTM' },
];

export function ParentDashboardScreen({ navigation }: any) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showChildPicker, setShowChildPicker] = useState(false);

  const { dashboard, fetchDashboard, children, fetchChildren, notifications, fetchNotifications } = useDataStore();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    fetchDashboard('parent');
    fetchChildren?.();
    fetchNotifications?.();
  }, []);

  const selectedChild = children?.find((c: Student) => c.id === selectedChildId) || children?.[0] || null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Parent Dashboard"
        rightAction={
          <TouchableOpacity onPress={() => setShowChildPicker(!showChildPicker)} style={styles.childToggle}>
            <Text style={[styles.childToggleText, { color: colors.primary }]}>
              {selectedChild ? selectedChild.full_name.split(' ')[0] : 'Select'}
            </Text>
          </TouchableOpacity>
        }
      />

      {showChildPicker && children && children.length > 0 && (
        <View style={[styles.childPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {children.map((child: Student) => (
            <TouchableOpacity
              key={child.id}
              style={[styles.childOption, { borderBottomColor: colors.border }]}
              onPress={() => { setSelectedChildId(child.id); setShowChildPicker(false); }}
            >
              <Text style={[styles.childOptionText, {
                color: child.id === selectedChildId ? colors.primary : colors.text,
                fontWeight: child.id === selectedChildId ? '600' : '400',
              }]}>{child.full_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {selectedChild && (
          <Card style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Avatar name={selectedChild.full_name} size={56} />
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>{selectedChild.full_name}</Text>
                <Text style={[styles.profileDetail, { color: colors.textSecondary }]}>
                  Class {selectedChild.student_class} • Roll No: {selectedChild.roll_number}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {dashboard && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.sm }]}>
              <Text style={styles.statIcon}>📋</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>{dashboard.attendance}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Attendance</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.sm }]}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={[styles.statValue, { color: colors.warning }]}>{dashboard.pendingFees}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending Fees</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.sm }]}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={[styles.statValue, { color: colors.primary, fontSize: fontSize.sm }]}>{dashboard.nextExam}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Next Exam</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.sm }]}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>{dashboard.latestResult}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Latest Result</Text>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border, ...shadows.sm }]}
              onPress={() => navigation?.navigate(action.screen)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Notifications</Text>
        {notifications && notifications.length > 0 ? (
          notifications.map((notif: Notification) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notifCard, { backgroundColor: colors.card, borderColor: colors.border, ...shadows.sm }]}
            >
              <View style={styles.notifRow}>
                <View style={[styles.notifDot, { backgroundColor: notif.read ? 'transparent' : colors.primary }]} />
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, { color: colors.text, fontWeight: notif.read ? '400' : '600' }]}>{notif.title}</Text>
                  <Text style={[styles.notifBody, { color: colors.textSecondary }]} numberOfLines={2}>{notif.body}</Text>
                  <Text style={[styles.notifTime, { color: colors.textSecondary }]}>{notif.created_at}</Text>
                </View>
                <Badge label={notif.type} variant="info" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  childToggle: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  childToggleText: { fontSize: fontSize.sm, fontWeight: '600' },
  childPicker: {
    position: 'absolute', top: 60, right: spacing.md, zIndex: 100,
    borderRadius: borderRadius.md, borderWidth: 1, ...shadows.md,
  },
  childOption: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, minWidth: 160,
  },
  childOptionText: { fontSize: fontSize.sm },
  profileCard: { marginBottom: spacing.md },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileInfo: { marginLeft: spacing.md, flex: 1 },
  profileName: { fontSize: fontSize.lg, fontWeight: '600' },
  profileDetail: { fontSize: fontSize.sm, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    width: '48%', padding: spacing.md, borderRadius: borderRadius.lg,
    alignItems: 'center', marginBottom: spacing.xs,
  },
  statIcon: { fontSize: 24, marginBottom: spacing.xs },
  statValue: { fontSize: fontSize.lg, fontWeight: '700' },
  statLabel: { fontSize: fontSize.xs, marginTop: 2 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  actionCard: {
    width: '30%', padding: spacing.md, borderRadius: borderRadius.lg,
    borderWidth: 1, alignItems: 'center',
  },
  actionIcon: { fontSize: 28, marginBottom: spacing.xs },
  actionLabel: { fontSize: fontSize.xs, fontWeight: '500', textAlign: 'center' },
  notifCard: { borderRadius: borderRadius.lg, borderWidth: 1, marginBottom: spacing.sm, padding: spacing.md },
  notifRow: { flexDirection: 'row', alignItems: 'flex-start' },
  notifDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: spacing.sm },
  notifContent: { flex: 1, marginRight: spacing.sm },
  notifTitle: { fontSize: fontSize.sm, marginBottom: 2 },
  notifBody: { fontSize: fontSize.xs, lineHeight: 16, marginBottom: 4 },
  notifTime: { fontSize: fontSize.xs },
  emptyText: { textAlign: 'center', paddingVertical: spacing.xl, fontSize: fontSize.sm },
});
