import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Badge, Loader } from '../../components';

interface Period {
  id: string;
  subject: string;
  class: string;
  section: string;
  time: string;
  room: string;
}

interface Notice {
  id: string;
  title: string;
  date: string;
  content: string;
}

const QUICK_ACTIONS = [
  { label: 'Mark Attendance', icon: '📋' },
  { label: 'Create Assignment', icon: '📝' },
  { label: 'View Schedule', icon: '📅' },
  { label: 'Class Analytics', icon: '📊' },
];

export function StaffDashboardScreen() {
  const [schedule] = useState<Period[]>([]);
  const [notices] = useState<Notice[]>([]);
  const [loading] = useState(false);

  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  if (loading) return <Loader fullScreen message="Loading dashboard..." />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Staff Dashboard" subtitle="Welcome back" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card title="Today's Schedule">
          {schedule.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No schedule available</Text>
          ) : (
            schedule.map((period) => (
              <View key={period.id} style={[styles.periodRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.periodTime, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.periodTimeText, { color: colors.primary }]}>{period.time}</Text>
                </View>
                <View style={styles.periodInfo}>
                  <Text style={[styles.periodSubject, { color: colors.text }]}>{period.subject}</Text>
                  <Text style={[styles.periodMeta, { color: colors.textSecondary }]}>
                    Class {period.class}-{period.section} • Room {period.room}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Notices</Text>
        {notices.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notices available</Text>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id}>
              <View style={styles.noticeHeader}>
                <Text style={[styles.noticeTitle, { color: colors.text }]}>{notice.title}</Text>
                <Badge label={notice.date} variant="info" />
              </View>
              <Text style={[styles.noticeContent, { color: colors.textSecondary }]}>{notice.content}</Text>
            </Card>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md },
  emptyText: { fontSize: fontSize.sm, textAlign: 'center', paddingVertical: spacing.lg },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  periodTime: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  periodTimeText: { fontSize: fontSize.xs, fontWeight: '600' },
  periodInfo: { flex: 1 },
  periodSubject: { fontSize: fontSize.md, fontWeight: '500' },
  periodMeta: { fontSize: fontSize.xs, marginTop: 2 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionIcon: { fontSize: 28, marginBottom: spacing.xs },
  actionLabel: { fontSize: fontSize.sm, fontWeight: '500' },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  noticeTitle: { fontSize: fontSize.md, fontWeight: '600' },
  noticeContent: { fontSize: fontSize.sm, lineHeight: 20 },
  bottomSpacer: { height: spacing.xl },
});
