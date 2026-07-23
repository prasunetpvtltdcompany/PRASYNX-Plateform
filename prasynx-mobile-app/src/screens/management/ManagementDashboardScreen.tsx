import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

interface KpiCard {
  label: string;
  value: string;
  change: string;
  color: string;
}

const kpiData: KpiCard[] = [
  { label: 'Total Students', value: '1,284', change: '+12%', color: '#4F46E5' },
  { label: 'Total Staff', value: '186', change: '+5%', color: '#0EA5E9' },
  { label: 'Attendance Rate', value: '94.2%', change: '+2.1%', color: '#22C55E' },
  { label: 'Performance', value: '87.6%', change: '+3.4%', color: '#F59E0B' },
];

export function ManagementDashboardScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Management Dashboard" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card title="Revenue Overview" subtitle="Monthly revenue for current year">
          <View style={[styles.chartPlaceholder, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <Text style={[styles.chartText, { color: colors.textSecondary }]}>Revenue Chart</Text>
            <View style={styles.barChart}>
              {[60, 80, 45, 90, 70, 85, 65, 75, 95, 80, 88, 92].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h * 1.2, backgroundColor: colors.primary, opacity: 0.6 + (h / 100) * 0.4 }]} />
              ))}
            </View>
            <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>Jan - Dec 2026</Text>
          </View>
          <View style={styles.revenueRow}>
            <View>
              <Text style={[styles.revenueLabel, { color: colors.textSecondary }]}>Total Revenue</Text>
              <Text style={[styles.revenueValue, { color: colors.text }]}>₹85,42,000</Text>
            </View>
            <View style={styles.revenueChange}>
              <Badge label="+15.3%" variant="success" />
            </View>
          </View>
        </Card>

        <View style={styles.kpiGrid}>
          {kpiData.map((kpi, index) => (
            <View key={index} style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
              <View style={[styles.kpiIndicator, { backgroundColor: kpi.color + '20' }]}>
                <View style={[styles.kpiDot, { backgroundColor: kpi.color }]} />
              </View>
              <Text style={[styles.kpiValue, { color: colors.text }]}>{kpi.value}</Text>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{kpi.label}</Text>
              <Text style={[styles.kpiChange, { color: kpi.color }]}>{kpi.change}</Text>
            </View>
          ))}
        </View>

        <Card title="Recent Activity" subtitle="Latest updates across the school">
          {[
            { text: 'New student enrollment: Aarav Sharma', time: '2 min ago' },
            { text: 'Fee collection completed for Class 10', time: '15 min ago' },
            { text: 'Staff meeting scheduled for tomorrow', time: '1 hr ago' },
            { text: 'Exam results published for Class 12', time: '3 hrs ago' },
          ].map((activity, i) => (
            <View key={i} style={[styles.activityRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: colors.text }]}>{activity.text}</Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>{activity.time}</Text>
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
  chartPlaceholder: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartText: { fontSize: fontSize.sm, marginBottom: spacing.sm },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 120, marginBottom: spacing.xs },
  bar: { flex: 1, borderRadius: borderRadius.sm },
  chartLabel: { fontSize: fontSize.xs },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  revenueLabel: { fontSize: fontSize.sm },
  revenueValue: { fontSize: fontSize.xl, fontWeight: '700', marginTop: 2 },
  revenueChange: {},
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  kpiCard: {
    flex: 1, minWidth: '45%', borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md,
  },
  kpiIndicator: { width: 32, height: 32, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  kpiDot: { width: 12, height: 12, borderRadius: 6 },
  kpiValue: { fontSize: fontSize.xl, fontWeight: '700' },
  kpiLabel: { fontSize: fontSize.sm, marginTop: 2 },
  kpiChange: { fontSize: fontSize.xs, fontWeight: '600', marginTop: 4 },
  activityRow: { flexDirection: 'row', paddingVertical: spacing.sm },
  activityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: spacing.sm },
  activityContent: { flex: 1 },
  activityText: { fontSize: fontSize.sm },
  activityTime: { fontSize: fontSize.xs, marginTop: 2 },
});
