import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

export function JobProviderAnalyticsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Analytics" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Apps', value: '156', change: '+23%', color: colors.primary },
            { label: 'Job Views', value: '2,847', change: '+12%', color: colors.secondary },
            { label: 'Hire Rate', value: '18.5%', change: '+3.2%', color: colors.success },
            { label: 'Avg. Days', value: '12', change: '-2 days', color: colors.warning },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              <Text style={[styles.statChange, { color: stat.color }]}>{stat.change}</Text>
            </View>
          ))}
        </View>

        <Card title="Popular Job Types">
          <View style={[styles.chartPlaceholder, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <View style={styles.hBarChart}>
              {[
                { label: 'Design', pct: 85, color: '#4F46E5' },
                { label: 'Development', pct: 70, color: '#0EA5E9' },
                { label: 'Content', pct: 55, color: '#22C55E' },
                { label: 'Marketing', pct: 40, color: '#F59E0B' },
                { label: 'Data Entry', pct: 30, color: '#EF4444' },
              ].map((item, i) => (
                <View key={i} style={styles.hBarRow}>
                  <Text style={[styles.hBarLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                  <View style={[styles.hBarTrack, { backgroundColor: colors.surface }]}>
                    <View style={[styles.hBarFill, { width: `${item.pct}%` as any, backgroundColor: item.color }]} />
                  </View>
                  <Text style={[styles.hBarPct, { color: colors.text }]}>{item.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        <Card title="Monthly Comparison">
          <View style={[styles.chartPlaceholder, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <View style={styles.monthlyChart}>
              {[
                { month: 'Apr', apps: 45, hires: 8 },
                { month: 'May', apps: 62, hires: 11 },
                { month: 'Jun', apps: 38, hires: 6 },
                { month: 'Jul', apps: 55, hires: 9 },
                { month: 'Aug', apps: 70, hires: 14 },
              ].map((item, i) => (
                <View key={i} style={styles.monthlyCol}>
                  <Text style={[styles.monthlyHire, { color: colors.success }]}>{item.hires}</Text>
                  <View style={styles.monthlyBars}>
                    <View style={[styles.monthlyBar, { height: item.apps * 1.2, backgroundColor: colors.primary }]} />
                    <View style={[styles.monthlyBar, { height: item.hires * 3, backgroundColor: colors.success }]} />
                  </View>
                  <Text style={[styles.monthlyLabel, { color: colors.textSecondary }]}>{item.month}</Text>
                </View>
              ))}
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Applications</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Hires</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card title="Top Performing Jobs">
          {[
            { title: 'Graphic Designer', apps: 42, views: 680, hireRate: '21%' },
            { title: 'Web Developer', apps: 38, views: 540, hireRate: '18%' },
            { title: 'Content Writer', apps: 28, views: 420, hireRate: '14%' },
          ].map((job, i) => (
            <View key={i} style={[styles.jobRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={styles.jobInfo}>
                <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
                <Text style={[styles.jobStats, { color: colors.textSecondary }]}>{job.apps} apps • {job.views} views</Text>
              </View>
              <Text style={[styles.jobRate, { color: colors.success }]}>{job.hireRate}</Text>
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
  chartPlaceholder: { borderRadius: borderRadius.md, borderWidth: 1, borderStyle: 'dashed', padding: spacing.md },
  hBarChart: { gap: spacing.sm },
  hBarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hBarLabel: { width: 80, fontSize: fontSize.xs },
  hBarTrack: { flex: 1, height: 10, borderRadius: borderRadius.full, overflow: 'hidden' },
  hBarFill: { height: '100%', borderRadius: borderRadius.full },
  hBarPct: { width: 36, fontSize: fontSize.xs, textAlign: 'right', fontWeight: '500' },
  monthlyChart: { flexDirection: 'row', gap: spacing.md, height: 120, alignItems: 'flex-end', marginBottom: spacing.sm },
  monthlyCol: { flex: 1, alignItems: 'center' },
  monthlyHire: { fontSize: fontSize.xs, fontWeight: '600', marginBottom: 4 },
  monthlyBars: { flex: 1, flexDirection: 'row', gap: 3, alignItems: 'flex-end' },
  monthlyBar: { flex: 1, borderRadius: borderRadius.sm },
  monthlyLabel: { fontSize: fontSize.xs, marginTop: 4 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: fontSize.xs },
  jobRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: fontSize.sm, fontWeight: '500' },
  jobStats: { fontSize: fontSize.xs, marginTop: 2 },
  jobRate: { fontSize: fontSize.md, fontWeight: '600' },
});
