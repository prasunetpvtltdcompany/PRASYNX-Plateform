import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

interface Period {
  id: string;
  time: string;
  subject: string;
  class: string;
  section: string;
  room: string;
  teacher: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const CURRENT_TIME = '10:15';

function getCurrentPeriodIndex(periods: Period[]): number {
  const currentMinutes = parseInt(CURRENT_TIME.split(':')[0]) * 60 + parseInt(CURRENT_TIME.split(':')[1]);
  for (let i = 0; i < periods.length; i++) {
    const start = periods[i].time.split(' - ')[0];
    const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
    const end = periods[i].time.split(' - ')[1];
    const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return i;
    }
  }
  return -1;
}

const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
const todayIndex = DAYS.indexOf(todayName) >= 0 ? DAYS.indexOf(todayName) : 0;

export function StaffTimetableScreen() {
  const [selectedDay, setSelectedDay] = useState(DAYS[todayIndex]);
  const [periods] = useState<Period[]>([]);

  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const currentPeriodIdx = selectedDay === todayName ? getCurrentPeriodIndex(periods) : -1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="My Timetable" subtitle={selectedDay} />

      <View style={[styles.dayTabs, { backgroundColor: colors.surfaceVariant }]}>
        {DAYS.map((day, idx) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayTab,
              selectedDay === day && { backgroundColor: colors.primary },
            ]}
            onPress={() => {
              setSelectedDay(day);
            }}
          >
            <Text style={[
              styles.dayTabText,
              { color: selectedDay === day ? '#FFF' : colors.textSecondary },
              DAYS[idx] === todayName && !(selectedDay === day) && { color: colors.primary, fontWeight: '700' },
            ]}>
              {DAY_SHORT[idx]}
            </Text>
            {DAYS[idx] === todayName && (
              <View style={[styles.todayDot, { backgroundColor: selectedDay === day ? '#FFF' : colors.primary }]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.dayLabel, { color: colors.text }]}>
          {selectedDay}
          {selectedDay === todayName && (
            <Text style={{ color: colors.primary }}> • Today</Text>
          )}
        </Text>

        {periods.map((period, idx) => {
          const isCurrent = idx === currentPeriodIdx;
          const isFree = period.subject === 'Free Period';

          return (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodCard,
                {
                  backgroundColor: isCurrent ? colors.primary + '10' : colors.card,
                  borderColor: isCurrent ? colors.primary : colors.border,
                  borderLeftColor: isCurrent ? colors.primary : isFree ? colors.textSecondary : colors.primary,
                  borderLeftWidth: 4,
                },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.periodHeader}>
                <Badge
                  label={isCurrent ? 'Ongoing' : period.time}
                  variant={isCurrent ? 'success' : 'default'}
                 
                />
                {isFree && <Badge label="Free" variant="warning" />}
              </View>
              <Text style={[styles.periodSubject, { color: isFree ? colors.textSecondary : colors.text }]}>
                {period.subject}
              </Text>
              {!isFree && (
                <>
                  <View style={styles.periodDetails}>
                    <Text style={[styles.periodDetail, { color: colors.textSecondary }]}>
                      Class {period.class}-{period.section}
                    </Text>
                    <Text style={[styles.periodDetail, { color: colors.textSecondary }]}>
                      Room {period.room}
                    </Text>
                  </View>
                  <Text style={[styles.periodTime2, { color: colors.textSecondary }]}>
                    {period.time}
                  </Text>
                </>
              )}
              {isCurrent && (
                <View style={[styles.currentIndicator, { backgroundColor: colors.success }]} />
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dayTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  dayTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  dayTabText: { fontSize: fontSize.sm, fontWeight: '500' },
  todayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  scroll: { padding: spacing.md },
  dayLabel: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  periodCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  periodSubject: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.xs },
  periodDetails: { flexDirection: 'row', gap: spacing.md },
  periodDetail: { fontSize: fontSize.sm },
  periodTime2: { fontSize: fontSize.xs, marginTop: spacing.xs },
  currentIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomSpacer: { height: spacing.xl },
});
