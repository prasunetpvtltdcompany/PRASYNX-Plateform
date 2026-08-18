import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, borderRadius, fontSize, spacing, shadows } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_GAP = spacing.md;
const CARD_WIDTH = (width - spacing.lg * 2 - CARD_GAP) / 2;

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  colors: any;
}

function StatCard({ icon, label, value, trend, colors }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }, shadows.xs]}>
      <View style={[styles.statIcon, { backgroundColor: colors.secondaryBg }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
      {trend && (
        <Badge
          label={trend.value}
          variant={trend.positive ? 'success' : 'danger'}
        />
      )}
    </View>
  );
}

export function StudentDashboardScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#6D4CFF', '#7C3AED', '#2D1B69']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroGreeting}>Welcome back,</Text>
            <Text style={styles.heroName}>Student</Text>
            <Text style={styles.heroSub}>Stay on top of your academic journey</Text>
          </View>
          <View style={styles.heroDeco}>
            <Ionicons name="school" size={80} color="#FFFFFF20" />
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <StatCard icon="calendar" label="Attendance" value="85%" trend={{ value: '+5%', positive: true }} colors={colors} />
          <StatCard icon="checkmark-circle" label="Assignments" value="12/15" trend={{ value: '80%', positive: true }} colors={colors} />
          <StatCard icon="time" label="Classes Today" value="6" colors={colors} />
          <StatCard icon="trophy" label="Avg. Score" value="78%" trend={{ value: '+2%', positive: true }} colors={colors} />
        </View>

        <Card title="Today's Schedule" subtitle="Your classes for today">
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleDot, { backgroundColor: colors.primary }]} />
            <View style={styles.scheduleInfo}>
              <Text style={[styles.scheduleSubject, { color: colors.text }]}>Mathematics</Text>
              <Text style={[styles.scheduleTime, { color: colors.textMuted }]}>09:00 AM - 10:00 AM</Text>
            </View>
            <Badge label="Room 201" variant="info" />
          </View>
          <View style={[styles.scheduleItem, { borderTopWidth: 1, borderTopColor: colors.borderLight }]}>
            <View style={[styles.scheduleDot, { backgroundColor: colors.chart2 }]} />
            <View style={styles.scheduleInfo}>
              <Text style={[styles.scheduleSubject, { color: colors.text }]}>Physics</Text>
              <Text style={[styles.scheduleTime, { color: colors.textMuted }]}>10:15 AM - 11:15 AM</Text>
            </View>
            <Badge label="Lab 3" variant="warning" />
          </View>
          <View style={[styles.scheduleItem, { borderTopWidth: 1, borderTopColor: colors.borderLight }]}>
            <View style={[styles.scheduleDot, { backgroundColor: colors.chart3 }]} />
            <View style={styles.scheduleInfo}>
              <Text style={[styles.scheduleSubject, { color: colors.text }]}>English Literature</Text>
              <Text style={[styles.scheduleTime, { color: colors.textMuted }]}>11:30 AM - 12:30 PM</Text>
            </View>
            <Badge label="Room 105" variant="info" />
          </View>
        </Card>

        <Card title="Quick Actions">
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="scan" size={24} color={colors.primary} />
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>Scan QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="chatbubbles" size={24} color={colors.primary} />
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>AI Tutor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>Homework</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl },
  hero: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
    minHeight: 160,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroContent: { flex: 1 },
  heroGreeting: { fontSize: fontSize.md, color: '#FFFFFFCC', marginBottom: 2 },
  heroName: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 4 },
  heroSub: { fontSize: fontSize.sm, color: '#FFFFFFAA' },
  heroDeco: { marginLeft: spacing.md },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    paddingBottom: 0,
    gap: CARD_GAP,
  },
  statCard: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: CARD_GAP,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5, marginBottom: 2 },
  statLabel: { fontSize: fontSize.xs, fontWeight: '500', marginBottom: spacing.xs },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  scheduleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  scheduleInfo: { flex: 1 },
  scheduleSubject: { fontSize: fontSize.md, fontWeight: '600' },
  scheduleTime: { fontSize: fontSize.xs, marginTop: 2 },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  quickActionLabel: { fontSize: fontSize.xs, fontWeight: '500', marginTop: spacing.xs },
});
