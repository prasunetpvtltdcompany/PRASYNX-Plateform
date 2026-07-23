import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const pendingFees = [
  { name: 'Aarav Sharma', class: '10-A', amount: '₹12,500', due: '15 Jun 2026', status: 'overdue' as const },
  { name: 'Riya Patel', class: '9-B', amount: '₹8,200', due: '20 Jun 2026', status: 'pending' as const },
  { name: 'Rohit Singh', class: '11-C', amount: '₹15,000', due: '25 Jun 2026', status: 'pending' as const },
  { name: 'Priya Verma', class: '8-A', amount: '₹6,800', due: '10 Jun 2026', status: 'overdue' as const },
];

export function ManagementFinanceScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Finance" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Revenue</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>₹65.2L</Text>
            <Text style={[styles.summarySub, { color: colors.textSecondary }]}>+12.5% vs last month</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>₹32.8L</Text>
            <Text style={[styles.summarySub, { color: colors.textSecondary }]}>+8.2% vs last month</Text>
          </View>
        </View>

        <Card title="Fee Collection Progress">
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.surfaceVariant }]}>
              <View style={[styles.progressFill, { width: '72%', backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>72% Collected</Text>
          </View>
          <View style={styles.progressStats}>
            <View>
              <Text style={[styles.progressStatValue, { color: colors.text }]}>₹58.2L</Text>
              <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>Collected</Text>
            </View>
            <View>
              <Text style={[styles.progressStatValue, { color: colors.text }]}>₹22.6L</Text>
              <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>Pending</Text>
            </View>
            <View>
              <Text style={[styles.progressStatValue, { color: colors.text }]}>1,284</Text>
              <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>Students</Text>
            </View>
          </View>
        </Card>

        <Card title="Monthly Trend">
          <View style={[styles.chartPlaceholder, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <View style={styles.trendChart}>
              {[40, 65, 45, 80, 55, 75, 60, 85, 70, 90, 78, 95].map((h, i) => (
                <View key={i} style={styles.trendCol}>
                  <View style={[styles.trendBar, { height: h * 1, backgroundColor: colors.primary }]} />
                  <View style={[styles.trendBar, { height: (h * 0.6), backgroundColor: colors.error }]} />
                </View>
              ))}
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Revenue</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Expense</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card title="Pending Fees" subtitle="Students with pending fee">
          {pendingFees.map((fee, i) => (
            <View key={i} style={[styles.feeRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Avatar name={fee.name} size={36} />
              <View style={styles.feeInfo}>
                <Text style={[styles.feeName, { color: colors.text }]}>{fee.name}</Text>
                <Text style={[styles.feeClass, { color: colors.textSecondary }]}>{fee.class} • Due: {fee.due}</Text>
              </View>
              <View style={styles.feeRight}>
                <Text style={[styles.feeAmount, { color: colors.text }]}>{fee.amount}</Text>
                <Badge label={fee.status} variant={fee.status === 'overdue' ? 'danger' : 'warning'} />
              </View>
            </View>
          ))}
        </Card>

        <Card title="Budget Overview">
          {[
            { category: 'Salaries', allocated: '₹24.5L', used: '₹22.1L', pct: 90 },
            { category: 'Infrastructure', allocated: '₹8.2L', used: '₹5.6L', pct: 68 },
            { category: 'Events', allocated: '₹3.5L', used: '₹2.1L', pct: 60 },
            { category: 'Technology', allocated: '₹5.0L', used: '₹3.8L', pct: 76 },
          ].map((b, i) => (
            <View key={i} style={[styles.budgetRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={styles.budgetTop}>
                <Text style={[styles.budgetCategory, { color: colors.text }]}>{b.category}</Text>
                <Text style={[styles.budgetAmount, { color: colors.textSecondary }]}>{b.used} / {b.allocated}</Text>
              </View>
              <View style={[styles.budgetBar, { backgroundColor: colors.surfaceVariant }]}>
                <View style={[styles.budgetFill, { width: `${b.pct}%` as any, backgroundColor: b.pct > 85 ? colors.warning : colors.primary }]} />
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
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  summaryCard: { flex: 1, borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md },
  summaryLabel: { fontSize: fontSize.sm },
  summaryValue: { fontSize: fontSize.xl, fontWeight: '700', marginTop: 4 },
  summarySub: { fontSize: fontSize.xs, marginTop: 4 },
  progressContainer: { marginBottom: spacing.md },
  progressBar: { height: 10, borderRadius: borderRadius.full, overflow: 'hidden', marginBottom: spacing.sm },
  progressFill: { height: '100%', borderRadius: borderRadius.full },
  progressText: { fontSize: fontSize.xs, textAlign: 'right' },
  progressStats: { flexDirection: 'row', justifyContent: 'space-between' },
  progressStatValue: { fontSize: fontSize.md, fontWeight: '600' },
  progressStatLabel: { fontSize: fontSize.xs },
  chartPlaceholder: { borderRadius: borderRadius.md, borderWidth: 1, borderStyle: 'dashed', padding: spacing.md },
  trendChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100, marginBottom: spacing.sm },
  trendCol: { flex: 1, gap: 2, alignItems: 'center' },
  trendBar: { width: '80%', borderRadius: borderRadius.sm },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: fontSize.xs },
  feeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm },
  feeInfo: { flex: 1 },
  feeName: { fontSize: fontSize.sm, fontWeight: '500' },
  feeClass: { fontSize: fontSize.xs, marginTop: 2 },
  feeRight: { alignItems: 'flex-end', gap: 4 },
  feeAmount: { fontSize: fontSize.sm, fontWeight: '600' },
  budgetRow: { paddingVertical: spacing.sm },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  budgetCategory: { fontSize: fontSize.sm, fontWeight: '500' },
  budgetAmount: { fontSize: fontSize.xs },
  budgetBar: { height: 6, borderRadius: borderRadius.full, overflow: 'hidden' },
  budgetFill: { height: '100%', borderRadius: borderRadius.full },
});
