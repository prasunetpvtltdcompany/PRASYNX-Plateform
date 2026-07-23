import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

type Filter = 'all' | 'pending' | 'submitted' | 'graded';

interface Assignment {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  status: Filter;
  marks?: string;
}

const ASSIGNMENTS: Assignment[] = [
  { id: '1', subject: 'Mathematics', title: 'Chapter 5: Calculus Problems', dueDate: '15 Jun 2026', status: 'pending' },
  { id: '2', subject: 'Physics', title: 'Thermodynamics Lab Report', dueDate: '14 Jun 2026', status: 'pending' },
  { id: '3', subject: 'Chemistry', title: 'Organic Chemistry Worksheet', dueDate: '12 Jun 2026', status: 'submitted' },
  { id: '4', subject: 'English', title: 'Essay: Shakespeare Analysis', dueDate: '10 Jun 2026', status: 'graded', marks: '85/100' },
  { id: '5', subject: 'Computer Science', title: 'React Native App Prototype', dueDate: '08 Jun 2026', status: 'graded', marks: '92/100' },
  { id: '6', subject: 'Chemistry', title: 'Lab Experiment Observations', dueDate: '05 Jun 2026', status: 'submitted' },
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'graded', label: 'Graded' },
];

const statusVariant = (status: Filter) => {
  switch (status) {
    case 'pending': return 'warning' as const;
    case 'submitted': return 'info' as const;
    case 'graded': return 'success' as const;
    default: return 'default' as const;
  }
};

export function StudentAssignmentsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const filtered = ASSIGNMENTS.filter((a) => activeFilter === 'all' || a.status === activeFilter);

  if (selectedAssignment) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Assignment Details"
          leftAction={<Text style={[styles.backBtn, { color: colors.primary }]}>Back</Text>}
          onLeftPress={() => setSelectedAssignment(null)}
        />
        <ScrollView contentContainerStyle={styles.scroll}>
          <Card>
            <Badge label={selectedAssignment.status.charAt(0).toUpperCase() + selectedAssignment.status.slice(1)} variant={statusVariant(selectedAssignment.status)} />
            <Text style={[styles.detailSubject, { color: colors.primary, marginTop: spacing.md }]}>{selectedAssignment.subject}</Text>
            <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedAssignment.title}</Text>
            <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Due Date</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{selectedAssignment.dueDate}</Text>
            </View>
            {selectedAssignment.marks && (
              <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Marks</Text>
                <Text style={[styles.detailValue, { color: colors.success }]}>{selectedAssignment.marks}</Text>
              </View>
            )}
            <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Description</Text>
              <Text style={[styles.detailValue, { color: colors.text, flex: 1 }]}>
                Complete all the problems and submit before the deadline. Late submissions will incur a penalty.
              </Text>
            </View>
          </Card>
          {selectedAssignment.status === 'pending' && (
            <Button title="Submit Assignment" onPress={() => {}} variant="primary" style={{ marginTop: spacing.md }} />
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Assignments" />
      <View style={[styles.filterRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilter === f.key ? colors.primary : colors.surfaceVariant,
                  borderColor: activeFilter === f.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterText, { color: activeFilter === f.key ? '#FFF' : colors.text }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No assignments found</Text>
          </View>
        ) : (
          filtered.map((assignment) => (
            <TouchableOpacity key={assignment.id} onPress={() => setSelectedAssignment(assignment)} activeOpacity={0.7}>
              <Card>
                <View style={styles.assignmentHeader}>
                  <Text style={[styles.assignmentSubject, { color: colors.primary }]}>{assignment.subject}</Text>
                  <Badge
                    label={assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    variant={statusVariant(assignment.status)}
                  />
                </View>
                <Text style={[styles.assignmentTitle, { color: colors.text }]}>{assignment.title}</Text>
                <View style={styles.assignmentFooter}>
                  <Text style={[styles.assignmentDue, { color: colors.textSecondary }]}>Due: {assignment.dueDate}</Text>
                  {assignment.marks && (
                    <Text style={[styles.assignmentMarks, { color: colors.success }]}>{assignment.marks}</Text>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  filterRow: { borderBottomWidth: 1, paddingVertical: spacing.sm },
  filterScroll: { paddingHorizontal: spacing.md, gap: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1 },
  filterText: { fontSize: fontSize.sm, fontWeight: '500' },
  assignmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assignmentSubject: { fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  assignmentTitle: { fontSize: fontSize.md, fontWeight: '600', marginTop: spacing.xs },
  assignmentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  assignmentDue: { fontSize: fontSize.xs },
  assignmentMarks: { fontSize: fontSize.sm, fontWeight: '600' },
  detailSubject: { fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  detailTitle: { fontSize: fontSize.xl, fontWeight: '700', marginTop: spacing.xs },
  detailRow: { flexDirection: 'row', paddingVertical: spacing.md, borderTopWidth: 1 },
  detailLabel: { fontSize: fontSize.sm, width: 100 },
  detailValue: { fontSize: fontSize.sm, fontWeight: '500' },
  backBtn: { fontSize: fontSize.md, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl * 2 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: fontSize.md, marginTop: spacing.md },
});
