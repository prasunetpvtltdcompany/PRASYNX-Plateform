import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  avatar: string;
  status: AttendanceStatus;
}

const CLASSES = ['10', '9', '11', '12'];
const SECTIONS = ['A', 'B', 'C'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
const PERIODS = ['1 (08:00-08:45)', '2 (09:00-09:45)', '3 (10:00-10:45)', '4 (11:00-11:45)'];

const STATUS_OPTIONS: { label: string; value: AttendanceStatus; color: string }[] = [
  { label: 'P', value: 'present', color: '#22C55E' },
  { label: 'A', value: 'absent', color: '#EF4444' },
  { label: 'L', value: 'late', color: '#F59E0B' },
  { label: 'LV', value: 'leave', color: '#3B82F6' },
];

export function StaffAttendanceScreen() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [selectedSection, setSelectedSection] = useState(SECTIONS[0]);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);

  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const updateStatus = (id: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const markAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'present' })));
  };

  const summary = {
    present: students.filter((s) => s.status === 'present').length,
    absent: students.filter((s) => s.status === 'absent').length,
    late: students.filter((s) => s.status === 'late').length,
    leave: students.filter((s) => s.status === 'leave').length,
  };

  const handleSubmit = () => {
    alert(`Attendance submitted for ${selectedClass}-${selectedSection} (${selectedSubject}, ${selectedPeriod})`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Mark Attendance" subtitle={today} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Class & Section</Text>
          <View style={styles.filterRow}>
            <View style={styles.pickerGroup}>
              {CLASSES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedClass === c ? colors.primary : colors.surfaceVariant,
                      borderColor: selectedClass === c ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedClass(c)}
                >
                  <Text style={[styles.chipText, { color: selectedClass === c ? '#FFF' : colors.text }]}>
                    Class {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.pickerGroup}>
              {SECTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedSection === s ? colors.primary : colors.surfaceVariant,
                      borderColor: selectedSection === s ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedSection(s)}
                >
                  <Text style={[styles.chipText, { color: selectedSection === s ? '#FFF' : colors.text }]}>
                    Sec {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.sm }]}>Subject</Text>
          <View style={styles.filterRow}>
            {SUBJECTS.map((sub) => (
              <TouchableOpacity
                key={sub}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedSubject === sub ? colors.primary : colors.surfaceVariant,
                    borderColor: selectedSubject === sub ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedSubject(sub)}
              >
                <Text style={[styles.chipText, { color: selectedSubject === sub ? '#FFF' : colors.text }]}>
                  {sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: spacing.sm }]}>Period</Text>
          <View style={styles.filterRow}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedPeriod === p ? colors.primary : colors.surfaceVariant,
                    borderColor: selectedPeriod === p ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedPeriod(p)}
              >
                <Text style={[styles.chipText, { color: selectedPeriod === p ? '#FFF' : colors.text }]}>
                  Period {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card>
          <View style={styles.summaryRow}>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>{summary.present}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Present</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryValue, { color: colors.error }]}>{summary.absent}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Absent</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryValue, { color: colors.warning }]}>{summary.late}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Late</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryValue, { color: colors.info }]}>{summary.leave}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Leave</Text>
            </View>
          </View>
        </Card>

        <View style={styles.markAllRow}>
          <Text style={[styles.studentCount, { color: colors.text }]}>
            {students.length} Students
          </Text>
          <TouchableOpacity onPress={markAllPresent} style={[styles.markAllBtn, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark All Present</Text>
          </TouchableOpacity>
        </View>

        {students.map((student) => (
          <Card key={student.id} style={styles.studentCard}>
            <View style={styles.studentRow}>
              <Avatar name={student.name} size={36} />
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: colors.text }]}>{student.name}</Text>
                <Text style={[styles.studentRoll, { color: colors.textSecondary }]}>Roll No: {student.rollNo}</Text>
              </View>
              <View style={styles.statusOptions}>
                {STATUS_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.statusBtn,
                      {
                        backgroundColor: student.status === opt.value ? opt.color : colors.surfaceVariant,
                        borderColor: student.status === opt.value ? opt.color : colors.border,
                      },
                    ]}
                    onPress={() => updateStatus(student.id, opt.value)}
                  >
                    <Text style={[
                      styles.statusBtnText,
                      { color: student.status === opt.value ? '#FFF' : colors.textSecondary },
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        ))}

        <Button
          title="Submit Attendance"
          onPress={handleSubmit}
          size="lg"
          style={styles.submitBtn}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md },
  sectionLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.sm },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pickerGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  chipText: { fontSize: fontSize.xs, fontWeight: '500' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryStat: { alignItems: 'center' },
  summaryValue: { fontSize: fontSize.xl, fontWeight: '700' },
  summaryLabel: { fontSize: fontSize.xs, marginTop: 2 },
  markAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  studentCount: { fontSize: fontSize.md, fontWeight: '600' },
  markAllBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  markAllText: { fontSize: fontSize.sm, fontWeight: '600' },
  studentCard: { paddingVertical: spacing.sm },
  studentRow: { flexDirection: 'row', alignItems: 'center' },
  studentInfo: { flex: 1, marginLeft: spacing.sm },
  studentName: { fontSize: fontSize.md, fontWeight: '500' },
  studentRoll: { fontSize: fontSize.xs, marginTop: 2 },
  statusOptions: { flexDirection: 'row', gap: spacing.xs },
  statusBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBtnText: { fontSize: fontSize.xs, fontWeight: '700' },
  submitBtn: { marginTop: spacing.md },
  bottomSpacer: { height: spacing.xl },
});
