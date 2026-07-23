import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const jobs = ['All Jobs', 'Graphic Designer', 'Web Developer', 'Content Writer'];
const statusFilters = ['all', 'pending', 'shortlisted', 'interview', 'hired', 'rejected'] as const;

const applicants = [
  { id: '1', name: 'Rahul Kumar', role: 'Graphic Designer', email: 'rahul@email.com', phone: '+91-9876543201', status: 'pending' as const, applied: '2 hrs ago' },
  { id: '2', name: 'Sneha Patel', role: 'Web Developer', email: 'sneha@email.com', phone: '+91-9876543202', status: 'shortlisted' as const, applied: '5 hrs ago' },
  { id: '3', name: 'Amit Singh', role: 'Content Writer', email: 'amit@email.com', phone: '+91-9876543203', status: 'interview' as const, applied: '1 day ago' },
  { id: '4', name: 'Priya Sharma', role: 'Graphic Designer', email: 'priya@email.com', phone: '+91-9876543204', status: 'hired' as const, applied: '2 days ago' },
  { id: '5', name: 'Rohit Verma', role: 'Web Developer', email: 'rohit@email.com', phone: '+91-9876543205', status: 'rejected' as const, applied: '3 days ago' },
];

export function JobProviderApplicantsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const [selectedJob, setSelectedJob] = useState('All Jobs');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = applicants.filter((a) => {
    const matchJob = selectedJob === 'All Jobs' || a.role === selectedJob;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchJob && matchStatus;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'shortlisted': return 'info';
      case 'interview': return 'warning';
      case 'hired': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Applicants" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.jobSelector}>
        {jobs.map((job) => (
          <TouchableOpacity
            key={job}
            style={[styles.jobChip, { backgroundColor: selectedJob === job ? colors.primary : colors.surfaceVariant }]}
            onPress={() => setSelectedJob(job)}
          >
            <Text style={[styles.jobChipText, { color: selectedJob === job ? '#FFFFFF' : colors.text }]}>{job}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusRow}>
        {statusFilters.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.statusChip, { backgroundColor: statusFilter === s ? colors.primary : colors.surfaceVariant }]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.statusChipText, { color: statusFilter === s ? '#FFFFFF' : colors.text }]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((app) => (
          <TouchableOpacity key={app.id} activeOpacity={0.7}>
            <Card style={styles.appCard}>
              <View style={styles.appRow}>
                <Avatar name={app.name} size={42} />
                <View style={styles.appInfo}>
                  <Text style={[styles.appName, { color: colors.text }]}>{app.name}</Text>
                  <Text style={[styles.appRole, { color: colors.textSecondary }]}>{app.role}</Text>
                  <Text style={[styles.appContact, { color: colors.textSecondary }]}>{app.email} | {app.phone}</Text>
                </View>
                <View style={styles.appRight}>
                  <Badge label={app.status} variant={statusColor(app.status) as any} />
                  <Text style={[styles.appDate, { color: colors.textSecondary }]}>{app.applied}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No applicants found</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  jobSelector: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  jobChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  jobChipText: { fontSize: fontSize.sm, fontWeight: '500' },
  statusRow: { gap: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.sm },
  statusChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  statusChipText: { fontSize: fontSize.xs, fontWeight: '500' },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  appCard: {},
  appRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  appInfo: { flex: 1 },
  appName: { fontSize: fontSize.md, fontWeight: '600' },
  appRole: { fontSize: fontSize.sm, marginTop: 2 },
  appContact: { fontSize: fontSize.xs, marginTop: 2 },
  appRight: { alignItems: 'flex-end', gap: 4 },
  appDate: { fontSize: fontSize.xs },
  emptyText: { textAlign: 'center', marginTop: spacing.xl, fontSize: fontSize.md },
});
