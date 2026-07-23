import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const activities = [
  { text: 'New organisation registered: Green Valley School', time: '5 min ago', type: 'org' },
  { text: 'User account created: admin@example.com', time: '12 min ago', type: 'user' },
  { text: 'Subscription renewed: Sunshine School', time: '1 hr ago', type: 'sub' },
  { text: 'Organisation verified: Star International', time: '2 hrs ago', type: 'verify' },
  { text: 'Report generated: Monthly Revenue Report', time: '4 hrs ago', type: 'report' },
];

export function AdminDashboardScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Admin Dashboard" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {[
            { label: 'Organisations', value: '128', change: '+8', color: colors.primary },
            { label: 'Total Users', value: '24,580', change: '+342', color: colors.secondary },
            { label: 'Active Subs', value: '96', change: '75%', color: colors.success },
            { label: 'Revenue', value: '₹18.6L', change: '+12%', color: colors.warning },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              <Text style={[styles.statChange, { color: stat.color }]}>{stat.change}</Text>
            </View>
          ))}
        </View>

        <Card title="Revenue Overview" subtitle="Monthly revenue for the current year">
          <View style={[styles.chartPlaceholder, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <View style={styles.barChart}>
              {[55, 70, 45, 85, 65, 80, 60, 90, 75, 95, 82, 88].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h * 1.2, backgroundColor: colors.primary, opacity: 0.6 + (h / 100) * 0.4 }]} />
              ))}
            </View>
            <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>Revenue (in Lakhs) - 2026</Text>
          </View>
        </Card>

        <Card title="Recent Activity" subtitle="Latest system activities">
          {activities.map((act, i) => (
            <View key={i} style={[styles.activityRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={[styles.activityIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={styles.activityIconText}>
                  {act.type === 'org' ? '🏫' : act.type === 'user' ? '👤' : act.type === 'sub' ? '💳' : act.type === 'verify' ? '✅' : '📊'}
                </Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: colors.text }]}>{act.text}</Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>{act.time}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    flex: 1, minWidth: '45%', borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md,
  },
  statValue: { fontSize: fontSize.xxl, fontWeight: '700' },
  statLabel: { fontSize: fontSize.sm, marginTop: 2 },
  statChange: { fontSize: fontSize.xs, fontWeight: '600', marginTop: 4 },
  chartPlaceholder: { borderRadius: borderRadius.md, borderWidth: 1, borderStyle: 'dashed', padding: spacing.md, alignItems: 'center' },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 120, marginBottom: spacing.xs },
  bar: { flex: 1, borderRadius: borderRadius.sm },
  chartLabel: { fontSize: fontSize.xs },
  activityRow: { flexDirection: 'row', paddingVertical: spacing.sm, gap: spacing.sm },
  activityIcon: { width: 36, height: 36, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center' },
  activityIconText: { fontSize: 16 },
  activityContent: { flex: 1 },
  activityText: { fontSize: fontSize.sm },
  activityTime: { fontSize: fontSize.xs, marginTop: 2 },
});
