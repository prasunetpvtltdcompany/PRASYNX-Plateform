import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const interviews = [
  {
    id: '1',
    applicant: 'Rahul Kumar',
    jobTitle: 'Graphic Designer',
    date: '15 Jun 2026',
    time: '10:00 AM',
    status: 'scheduled' as const,
    mode: 'Online',
  },
  {
    id: '2',
    applicant: 'Sneha Patel',
    jobTitle: 'Web Developer',
    date: '16 Jun 2026',
    time: '2:30 PM',
    status: 'scheduled' as const,
    mode: 'In-Person',
  },
  {
    id: '3',
    applicant: 'Amit Singh',
    jobTitle: 'Content Writer',
    date: '18 Jun 2026',
    time: '11:00 AM',
    status: 'completed' as const,
    mode: 'Online',
  },
  {
    id: '4',
    applicant: 'Priya Sharma',
    jobTitle: 'Graphic Designer',
    date: '10 Jun 2026',
    time: '3:00 PM',
    status: 'cancelled' as const,
    mode: 'Online',
  },
];

export function JobProviderInterviewsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return { label: 'Scheduled', variant: 'info' as const };
      case 'completed': return { label: 'Completed', variant: 'success' as const };
      case 'cancelled': return { label: 'Cancelled', variant: 'danger' as const };
      default: return { label: status, variant: 'default' as const };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Interviews" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {interviews.map((interview) => {
          const badge = statusBadge(interview.status);
          return (
            <Card key={interview.id} style={styles.interviewCard}>
              <View style={styles.cardTop}>
                <Avatar name={interview.applicant} size={44} />
                <View style={styles.cardInfo as any}>
                  <Text style={[styles.applicantName, { color: colors.text }]}>{interview.applicant}</Text>
                  <Text style={[styles.jobTitle, { color: colors.textSecondary }]}>{interview.jobTitle}</Text>
                </View>
                <Badge label={badge.label} variant={badge.variant} />
              </View>
              <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailIcon, { color: colors.textSecondary }]}>📅</Text>
                  <View>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{interview.date}</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailIcon, { color: colors.textSecondary }]}>⏰</Text>
                  <View>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Time</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{interview.time}</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailIcon, { color: colors.textSecondary }]}>📍</Text>
                  <View>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Mode</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{interview.mode}</Text>
                  </View>
                </View>
              </View>
              {interview.status === 'scheduled' && (
                <View style={styles.actionRow}>
                  <Button title="Reschedule" onPress={() => {}} variant="outline" style={styles.actionBtn} />
                  <Button title="Cancel" onPress={() => {}} variant="ghost" textStyle={{ color: colors.error }} />
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  interviewCard: {},
  cardInfo: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  applicantName: { fontSize: fontSize.md, fontWeight: '600' },
  jobTitle: { fontSize: fontSize.sm, marginTop: 2 },
  detailRow: { flexDirection: 'row', paddingTop: spacing.sm, marginTop: spacing.sm },
  detailItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  detailIcon: { fontSize: 16 },
  detailLabel: { fontSize: fontSize.xs },
  detailValue: { fontSize: fontSize.sm, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: { flex: 1 },
});
