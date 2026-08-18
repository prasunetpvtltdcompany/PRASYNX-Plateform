import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';
import { useDataStore } from '../../store/dataStore';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DATE_RANGES = ['This Week', 'This Month', 'This Term', 'Custom'];

export function ParentAttendanceScreen({ navigation }: any) {
  const [selectedRange, setSelectedRange] = useState('This Month');
  const { attendance, fetchAttendance } = useDataStore();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    fetchAttendance('1');
  }, []);

  const overallAttendance = attendance?.overallPercentage ?? 0;
  const attendanceColor = overallAttendance >= 90 ? colors.success : overallAttendance >= 75 ? colors.warning : colors.error;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Attendance" leftAction={<Text onPress={() => navigation?.goBack()} style={{ color: colors.primary, fontSize: 24 }}>{'<'}</Text>} onLeftPress={() => navigation?.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.summaryRow}>
            <View style={styles.percentageCircle}>
              <View style={[styles.circle, { borderColor: attendanceColor }]}>
                <Text style={[styles.percentageText, { color: attendanceColor }]}>{overallAttendance}%</Text>
              </View>
            </View>
            <View style={styles.summaryDetails}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Overall Attendance</Text>
              <Text style={[styles.summarySub, { color: colors.textSecondary }]}>Last 30 days</Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStat}>
                  <Text style={[styles.statValue, { color: colors.success }]}>{attendance?.present ?? 0}</Text>
                  <Text style={[styles.statLabelSmall, { color: colors.textSecondary }]}>Present</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={[styles.statValue, { color: colors.error }]}>{attendance?.absent ?? 0}</Text>
                  <Text style={[styles.statLabelSmall, { color: colors.textSecondary }]}>Absent</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={[styles.statValue, { color: colors.warning }]}>{attendance?.late ?? 0}</Text>
                  <Text style={[styles.statLabelSmall, { color: colors.textSecondary }]}>Late</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Date Range</Text>
        <View style={styles.rangeRow}>
          {DATE_RANGES.map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.rangeChip, {
                backgroundColor: selectedRange === range ? colors.primary : colors.surfaceVariant,
                borderColor: selectedRange === range ? colors.primary : colors.border,
              }]}
              onPress={() => setSelectedRange(range)}
            >
              <Text style={[styles.rangeText, { color: selectedRange === range ? '#FFFFFF' : colors.text }]}>{range}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {attendance?.monthly && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Breakdown</Text>
            <Card>
              {attendance.monthly.map((month: any, index: number) => {
                const pct = Math.round((month.present / month.total) * 100);
                const barColor = pct >= 90 ? colors.success : pct >= 75 ? colors.warning : colors.error;
                return (
                  <View key={month.month} style={[styles.monthRow, index < attendance.monthly.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm, marginBottom: spacing.sm }]}>
                    <Text style={[styles.monthLabel, { color: colors.text }]}>{month.month}</Text>
                    <View style={styles.barContainer}>
                      <View style={[styles.barBg, { backgroundColor: colors.surfaceVariant }]}>
                        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                      </View>
                    </View>
                    <Text style={[styles.monthPct, { color: barColor, fontWeight: '600' }]}>{pct}%</Text>
                    <Text style={[styles.monthCount, { color: colors.textSecondary }]}>{month.present}/{month.total}</Text>
                  </View>
                );
              })}
            </Card>
          </>
        )}

        {attendance?.subjects && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Subject-wise Attendance</Text>
            {attendance.subjects.map((sub: any) => {
              const subColor = sub.percentage >= 90 ? colors.success : sub.percentage >= 75 ? colors.warning : colors.error;
              return (
                <TouchableOpacity
                  key={sub.subject}
                  style={[styles.subjectCard, { backgroundColor: colors.card, borderColor: colors.border, ...shadows.sm }]}
                >
                  <View style={styles.subjectRow}>
                    <View style={styles.subjectInfo}>
                      <Text style={[styles.subjectName, { color: colors.text }]}>{sub.subject}</Text>
                      <Text style={[styles.subjectCount, { color: colors.textSecondary }]}>Present: {sub.present}/{sub.total} days</Text>
                    </View>
                    <Badge label={`${sub.percentage}%`} variant={sub.percentage >= 90 ? 'success' : sub.percentage >= 75 ? 'warning' : 'danger'} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  percentageCircle: { marginRight: spacing.lg },
  circle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 4,
    justifyContent: 'center', alignItems: 'center',
  },
  percentageText: { fontSize: fontSize.xl, fontWeight: '700' },
  summaryDetails: { flex: 1 },
  summaryLabel: { fontSize: fontSize.lg, fontWeight: '600' },
  summarySub: { fontSize: fontSize.sm, marginTop: 2, marginBottom: spacing.sm },
  summaryStats: { flexDirection: 'row', gap: spacing.md },
  summaryStat: { alignItems: 'center' },
  statValue: { fontSize: fontSize.md, fontWeight: '700' },
  statLabelSmall: { fontSize: fontSize.xs },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.sm },
  rangeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  rangeChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1 },
  rangeText: { fontSize: fontSize.sm, fontWeight: '500' },
  monthRow: { flexDirection: 'row', alignItems: 'center' },
  monthLabel: { width: 40, fontSize: fontSize.sm, fontWeight: '500' },
  barContainer: { flex: 1, marginHorizontal: spacing.sm },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  monthPct: { width: 40, textAlign: 'right', fontSize: fontSize.sm },
  monthCount: { width: 50, textAlign: 'right', fontSize: fontSize.xs, marginLeft: spacing.xs },
  subjectCard: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  subjectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: fontSize.md, fontWeight: '500' },
  subjectCount: { fontSize: fontSize.xs, marginTop: 2 },
});
