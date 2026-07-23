import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface Period {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  isCurrent?: boolean;
}

const TIMETABLE: Record<string, Period[]> = {
  Mon: [
    { time: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Dr. Sharma', room: '101' },
    { time: '08:45 - 09:30', subject: 'Physics', teacher: 'Mr. Verma', room: '102', isCurrent: true },
    { time: '09:30 - 10:15', subject: 'Chemistry', teacher: 'Mrs. Patel', room: '103' },
    { time: '10:15 - 10:30', subject: 'Break', teacher: '', room: '' },
    { time: '10:30 - 11:15', subject: 'English', teacher: 'Ms. Gupta', room: '104' },
    { time: '11:15 - 12:00', subject: 'Computer Science', teacher: 'Mr. Kumar', room: '105' },
    { time: '12:00 - 12:45', subject: 'Physical Education', teacher: 'Coach Singh', room: 'Ground' },
  ],
  Tue: [
    { time: '08:00 - 08:45', subject: 'Physics', teacher: 'Mr. Verma', room: '102' },
    { time: '08:45 - 09:30', subject: 'Chemistry', teacher: 'Mrs. Patel', room: '103' },
    { time: '09:30 - 10:15', subject: 'Mathematics', teacher: 'Dr. Sharma', room: '101' },
    { time: '10:15 - 10:30', subject: 'Break', teacher: '', room: '' },
    { time: '10:30 - 11:15', subject: 'Computer Science', teacher: 'Mr. Kumar', room: '105' },
    { time: '11:15 - 12:00', subject: 'English', teacher: 'Ms. Gupta', room: '104' },
    { time: '12:00 - 12:45', subject: 'Library', teacher: 'Mrs. Joshi', room: 'Library' },
  ],
  Wed: [
    { time: '08:00 - 08:45', subject: 'Chemistry', teacher: 'Mrs. Patel', room: '103' },
    { time: '08:45 - 09:30', subject: 'Mathematics', teacher: 'Dr. Sharma', room: '101' },
    { time: '09:30 - 10:15', subject: 'Physics', teacher: 'Mr. Verma', room: '102' },
    { time: '10:15 - 10:30', subject: 'Break', teacher: '', room: '' },
    { time: '10:30 - 11:15', subject: 'English', teacher: 'Ms. Gupta', room: '104' },
    { time: '11:15 - 12:00', subject: 'Computer Science', teacher: 'Mr. Kumar', room: '105' },
    { time: '12:00 - 12:45', subject: 'Art', teacher: 'Mr. Desai', room: 'Art Room' },
  ],
  Thu: [
    { time: '08:00 - 08:45', subject: 'English', teacher: 'Ms. Gupta', room: '104' },
    { time: '08:45 - 09:30', subject: 'Computer Science', teacher: 'Mr. Kumar', room: '105' },
    { time: '09:30 - 10:15', subject: 'Mathematics', teacher: 'Dr. Sharma', room: '101' },
    { time: '10:15 - 10:30', subject: 'Break', teacher: '', room: '' },
    { time: '10:30 - 11:15', subject: 'Physics', teacher: 'Mr. Verma', room: '102' },
    { time: '11:15 - 12:00', subject: 'Chemistry', teacher: 'Mrs. Patel', room: '103' },
    { time: '12:00 - 12:45', subject: 'Moral Science', teacher: 'Father George', room: '106' },
  ],
  Fri: [
    { time: '08:00 - 08:45', subject: 'Computer Science', teacher: 'Mr. Kumar', room: '105' },
    { time: '08:45 - 09:30', subject: 'English', teacher: 'Ms. Gupta', room: '104' },
    { time: '09:30 - 10:15', subject: 'Mathematics', teacher: 'Dr. Sharma', room: '101' },
    { time: '10:15 - 10:30', subject: 'Break', teacher: '', room: '' },
    { time: '10:30 - 11:15', subject: 'Physics', teacher: 'Mr. Verma', room: '102' },
    { time: '11:15 - 12:00', subject: 'Chemistry', teacher: 'Mrs. Patel', room: '103' },
    { time: '12:00 - 12:45', subject: 'Sports', teacher: 'Coach Singh', room: 'Ground' },
  ],
};

const todayIndex = new Date().getDay();
const defaultDay = todayIndex >= 1 && todayIndex <= 5 ? DAYS[todayIndex - 1] : 'Mon';

export function StudentTimetableScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const [selectedDay, setSelectedDay] = useState(defaultDay);

  const periods = TIMETABLE[selectedDay];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Timetable"
        subtitle={`${DAY_FULL[DAYS.indexOf(selectedDay)]}, June 2026`}
      />
      <View style={[styles.dayTabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayTab,
              selectedDay === day && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayTabText,
                { color: selectedDay === day ? colors.primary : colors.textSecondary },
                selectedDay === day && { fontWeight: '700' },
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {periods.map((period, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            style={[
              styles.periodCard,
              {
                backgroundColor: period.isCurrent ? colors.primary + '10' : colors.card,
                borderColor: period.isCurrent ? colors.primary : colors.border,
                borderLeftColor: period.isCurrent ? colors.primary : period.subject === 'Break' ? colors.warning : colors.border,
                borderLeftWidth: 4,
              },
            ]}
          >
            <View style={styles.periodHeader}>
              <Text style={[styles.periodTime, { color: colors.textSecondary }]}>{period.time}</Text>
              {period.isCurrent && (
                <Badge label="Ongoing" variant="info" />
              )}
            </View>
            <Text style={[styles.periodSubject, { color: colors.text }]}>
              {period.subject === 'Break' ? '☕ Break' : period.subject}
            </Text>
            {period.subject !== 'Break' && (
              <View style={styles.periodDetails}>
                <Text style={[styles.periodTeacher, { color: colors.textSecondary }]}>
                  👨‍🏫 {period.teacher}
                </Text>
                <Text style={[styles.periodRoom, { color: colors.textSecondary }]}>
                  🏫 Room {period.room}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  dayTabs: { flexDirection: 'row', borderBottomWidth: 1 },
  dayTab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  dayTabText: { fontSize: fontSize.sm, fontWeight: '500' },
  periodCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  periodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  periodTime: { fontSize: fontSize.xs },
  periodSubject: { fontSize: fontSize.lg, fontWeight: '600', marginTop: spacing.xs },
  periodDetails: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  periodTeacher: { fontSize: fontSize.sm },
  periodRoom: { fontSize: fontSize.sm },
});
