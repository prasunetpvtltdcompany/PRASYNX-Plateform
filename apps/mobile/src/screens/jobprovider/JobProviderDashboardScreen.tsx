import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const recentApps = [
  { name: 'Rahul Kumar', role: 'Graphic Designer', status: 'pending' as const, date: '2 hrs ago' },
  { name: 'Sneha Patel', role: 'Web Developer', status: 'shortlisted' as const, date: '5 hrs ago' },
  { name: 'Amit Singh', role: 'Content Writer', status: 'interview' as const, date: '1 day ago' },
];

export function JobProviderDashboardScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Dashboard" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar name="Tech Corp" size={52} />
            <View style={styles.profileInfo}>
              <Text style={[styles.companyName, { color: colors.text }]}>Tech Corp Solutions</Text>
              <Text style={[styles.companyDetail, { color: colors.textSecondary }]}>info@techcorp.com • +91-9876543200</Text>
              <Badge label="Verified" variant="success" />
            </View>
          </View>
        </Card>

        <View style={styles.statsRow}>
          {[
            { label: 'Active Jobs', value: '12' },
            { label: 'Total Jobs', value: '48' },
            { label: 'Applications', value: '156' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Card title="Recent Applications">
          {recentApps.map((app, i) => (
            <View key={i} style={[styles.appRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Avatar name={app.name} size={36} />
              <View style={styles.appInfo}>
                <Text style={[styles.appName, { color: colors.text }]}>{app.name}</Text>
                <Text style={[styles.appRole, { color: colors.textSecondary }]}>{app.role}</Text>
              </View>
              <View style={styles.appRight}>
                <Badge label={app.status} variant={app.status === 'shortlisted' ? 'info' : app.status === 'interview' ? 'warning' : 'default'} />
                <Text style={[styles.appDate, { color: colors.textSecondary }]}>{app.date}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card title="Quick Actions">
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.actionIcon}>📌</Text>
              <Text style={styles.actionLabel}>Post Job</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionLabel}>Applicants</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.warning }]}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionLabel}>Interviews</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  profileCard: {},
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profileInfo: { flex: 1 },
  companyName: { fontSize: fontSize.lg, fontWeight: '600' },
  companyDetail: { fontSize: fontSize.xs, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: fontSize.xxl, fontWeight: '700' },
  statLabel: { fontSize: fontSize.xs, marginTop: 4 },
  appRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm },
  appInfo: { flex: 1 },
  appName: { fontSize: fontSize.sm, fontWeight: '500' },
  appRole: { fontSize: fontSize.xs, marginTop: 2 },
  appRight: { alignItems: 'flex-end', gap: 4 },
  appDate: { fontSize: fontSize.xs },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, padding: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  actionIcon: { fontSize: 24, marginBottom: spacing.xs },
  actionLabel: { fontSize: fontSize.xs, fontWeight: '600', color: '#FFFFFF' },
});
