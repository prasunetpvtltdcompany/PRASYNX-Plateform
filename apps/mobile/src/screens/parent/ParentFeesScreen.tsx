import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';
import { useDataStore } from '../../store/dataStore';

export function ParentFeesScreen({ navigation }: any) {
  const { fees, fetchFees } = useDataStore();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    fetchFees('1');
  }, []);

  const feeRecords = fees?.records ?? [];
  const paymentHistory = fees?.history ?? [];
  const totalFees = feeRecords.reduce((s: number, r: any) => s + r.total, 0);
  const totalPaid = feeRecords.reduce((s: number, r: any) => s + r.paid, 0);
  const totalPending = feeRecords.reduce((s: number, r: any) => s + r.pending, 0);
  const progressPct = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Fees" leftAction={<Text onPress={() => navigation?.goBack()} style={{ color: colors.primary, fontSize: 24 }}>{'<'}</Text>} onLeftPress={() => navigation?.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Fee Summary</Text>
          <View style={styles.amountRow}>
            <View style={styles.amountBlock}>
              <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.amountValue, { color: colors.text }]}>₹{totalFees.toLocaleString()}</Text>
            </View>
            <View style={styles.amountBlock}>
              <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Paid</Text>
              <Text style={[styles.amountValue, { color: colors.success }]}>₹{totalPaid.toLocaleString()}</Text>
            </View>
            <View style={styles.amountBlock}>
              <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Pending</Text>
              <Text style={[styles.amountValue, { color: colors.error }]}>₹{totalPending.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBg, { backgroundColor: colors.surfaceVariant }]}>
              <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: totalPending === 0 ? colors.success : colors.warning }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>{Math.round(progressPct)}% paid</Text>
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Fee Breakdown</Text>
        {feeRecords.map((record: any) => {
          const statusColor = record.status === 'paid' ? colors.success : record.status === 'partial' ? colors.warning : colors.error;
          const statusLabel = record.status === 'paid' ? 'Paid' : record.status === 'partial' ? 'Partial' : record.status === 'overdue' ? 'Overdue' : 'Pending';
          const isOverdue = record.status === 'pending' && new Date(record.due_date) < new Date();
          return (
            <TouchableOpacity
              key={record.id}
              style={[styles.feeCard, { backgroundColor: colors.card, borderColor: colors.border, ...shadows.sm }]}
            >
              <View style={styles.feeHeader}>
                <Text style={[styles.feeTerm, { color: colors.text }]}>
                  Term
                </Text>
                <Badge label={statusLabel} variant={record.status === 'paid' ? 'success' : record.status === 'partial' ? 'warning' : 'danger'} />
              </View>
              <View style={styles.feeDetails}>
                <View style={styles.feeDetail}>
                  <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Total</Text>
                  <Text style={[styles.feeValue, { color: colors.text }]}>₹{record.total.toLocaleString()}</Text>
                </View>
                <View style={styles.feeDetail}>
                  <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Paid</Text>
                  <Text style={[styles.feeValue, { color: colors.success }]}>₹{record.paid.toLocaleString()}</Text>
                </View>
                <View style={styles.feeDetail}>
                  <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Pending</Text>
                  <Text style={[styles.feeValue, { color: colors.error }]}>₹{record.pending.toLocaleString()}</Text>
                </View>
              </View>
              <View style={[styles.feeProgress, { backgroundColor: colors.surfaceVariant }]}>
                <View style={[styles.feeProgressFill, {
                  width: `${record.total > 0 ? (record.paid / record.total) * 100 : 0}%`,
                  backgroundColor: statusColor,
                }]} />
              </View>
              <View style={styles.dueRow}>
                <Text style={[styles.dueDate, { color: isOverdue ? colors.error : colors.textSecondary }]}>
                  {isOverdue ? 'Overdue: ' : 'Due: '}{record.due_date}
                </Text>
                {record.pending > 0 && (
                  <Button title="Pay Now" onPress={() => {}} style={styles.payBtn} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment History</Text>
        {paymentHistory.map((payment: any) => (
          <View key={payment.id} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border, ...shadows.sm }]}>
            <View style={styles.historyRow}>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyTerm, { color: colors.text }]}>{payment.term}</Text>
                <Text style={[styles.historyDate, { color: colors.textSecondary }]}>{payment.date}</Text>
              </View>
              <Text style={[styles.historyAmount, { color: colors.success }]}>₹{payment.amount.toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  summaryTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.md },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  amountBlock: { alignItems: 'center' },
  amountLabel: { fontSize: fontSize.xs, marginBottom: 2 },
  amountValue: { fontSize: fontSize.lg, fontWeight: '700' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  progressBg: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  progressText: { fontSize: fontSize.xs, fontWeight: '500' },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.sm },
  feeCard: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  feeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  feeTerm: { fontSize: fontSize.md, fontWeight: '600' },
  feeDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  feeDetail: { alignItems: 'center' },
  feeLabel: { fontSize: fontSize.xs },
  feeValue: { fontSize: fontSize.sm, fontWeight: '600', marginTop: 2 },
  feeProgress: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: spacing.sm },
  feeProgressFill: { height: '100%', borderRadius: 3 },
  dueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dueDate: { fontSize: fontSize.xs },
  payBtn: { paddingHorizontal: spacing.sm },
  historyCard: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyInfo: { flex: 1 },
  historyTerm: { fontSize: fontSize.sm, fontWeight: '500' },
  historyDate: { fontSize: fontSize.xs, marginTop: 2 },
  historyAmount: { fontSize: fontSize.md, fontWeight: '700' },
});
