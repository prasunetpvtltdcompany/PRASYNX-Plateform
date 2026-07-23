import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SUBJECT_DATA = [
  { name: 'Mathematics', present: 22, total: 25, percentage: 88 },
  { name: 'Physics', present: 20, total: 24, percentage: 83.3 },
  { name: 'Chemistry', present: 18, total: 22, percentage: 81.8 },
  { name: 'English', present: 23, total: 25, percentage: 92 },
  { name: 'Computer Science', present: 20, total: 20, percentage: 100 },
];

const RECENT_RECORDS = [
  { date: '10 Jun 2026', subject: 'Mathematics', status: 'present' as const },
  { date: '10 Jun 2026', subject: 'Physics', status: 'present' as const },
  { date: '09 Jun 2026', subject: 'Chemistry', status: 'absent' as const },
  { date: '09 Jun 2026', subject: 'English', status: 'present' as const },
  { date: '08 Jun 2026', subject: 'Computer Science', status: 'leave' as const },
];

export function StudentAttendanceScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const [selectedTab, setSelectedTab] = useState<'overview' | 'subject'>('overview');

  const statusColor = (status: string) => {
    switch (status) {
      case 'present': return colors.success;
      case 'absent': return colors.error;
      case 'leave': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Attendance" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryMain}>
              <Text style={[styles.percentage, { color: colors.primary }]}>87%</Text>
              <Text style={[styles.percentageLabel, { color: colors.textSecondary }]}>Overall Attendance</Text>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.summaryItem}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={[styles.summaryText, { color: colors.text }]}>Present: 103</Text>
              </View>
              <View style={styles.summaryItem}>
                <View style={[styles.dot, { backgroundColor: colors.error }]} />
                <Text style={[styles.summaryText, { color: colors.text }]}>Absent: 12</Text>
              </View>
              <View style={styles.summaryItem}>
                <View style={[styles.dot, { backgroundColor: colors.warning }]} />
                <Text style={[styles.summaryText, { color: colors.text }]}>Leave: 5</Text>
              </View>
            </View>
          </View>
        </Card>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && { backgroundColor: colors.primary }]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'overview' ? '#FFF' : colors.textSecondary }]}>
              Recent Records
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'subject' && { backgroundColor: colors.primary }]}
            onPress={() => setSelectedTab('subject')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'subject' ? '#FFF' : colors.textSecondary }]}>
              Subject Wise
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'overview' ? (
          <Card title="Recent Attendance">
            {RECENT_RECORDS.map((record, index) => (
              <View
                key={index}
                style={[styles.recordItem, { borderBottomColor: colors.border }]}
              >
                <View style={styles.recordLeft}>
                  <Text style={[styles.recordDate, { color: colors.text }]}>{record.date}</Text>
                  <Text style={[styles.recordSubject, { color: colors.textSecondary }]}>{record.subject}</Text>
                </View>
                <Badge
                  label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  variant={record.status === 'present' ? 'success' : record.status === 'absent' ? 'danger' : 'warning'}
                />
              </View>
            ))}
          </Card>
        ) : (
          <Card title="Subject-wise Breakdown">
            {SUBJECT_DATA.map((subject, index) => (
              <View
                key={index}
                style={[styles.subjectItem, { borderBottomColor: colors.border }]}
              >
                <View style={styles.subjectHeader}>
                  <Text style={[styles.subjectName, { color: colors.text }]}>{subject.name}</Text>
                  <Text style={[styles.subjectPercent, { color: subject.percentage >= 85 ? colors.success : colors.warning }]}>
                    {subject.percentage}%
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.surfaceVariant }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: subject.percentage >= 85 ? colors.success : colors.warning,
                        width: `${subject.percentage}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.subjectDetail, { color: colors.textSecondary }]}>
                  {subject.present} / {subject.total} days
                </Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  summaryCard: {},
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryMain: { flex: 1, alignItems: 'center' },
  percentage: { fontSize: fontSize.title, fontWeight: '700' },
  percentageLabel: { fontSize: fontSize.xs, marginTop: spacing.xs },
  summaryStats: { flex: 1, gap: spacing.sm },
  summaryItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  summaryText: { fontSize: fontSize.sm },
  tabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' },
  tabText: { fontSize: fontSize.sm, fontWeight: '600' },
  recordItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1 },
  recordLeft: {},
  recordDate: { fontSize: fontSize.sm, fontWeight: '500' },
  recordSubject: { fontSize: fontSize.xs, marginTop: 2 },
  subjectItem: { paddingVertical: spacing.sm, borderBottomWidth: 1 },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectName: { fontSize: fontSize.sm, fontWeight: '500' },
  subjectPercent: { fontSize: fontSize.sm, fontWeight: '600' },
  progressBar: { height: 6, borderRadius: 3, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  subjectDetail: { fontSize: fontSize.xs, marginTop: spacing.xs },
});
