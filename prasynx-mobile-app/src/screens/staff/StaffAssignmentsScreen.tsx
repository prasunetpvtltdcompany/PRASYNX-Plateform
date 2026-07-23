import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

type AssignmentStatus = 'active' | 'due_soon' | 'closed';

interface Submission {
  studentName: string;
  rollNo: string;
  submittedOn: string;
  status: 'submitted' | 'pending' | 'graded';
  grade?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  class: string;
  section: string;
  dueDate: string;
  totalSubmissions: number;
  totalStudents: number;
  status: AssignmentStatus;
  submissions: Submission[];
}

const FILTERS: { label: string; value: AssignmentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Due Soon', value: 'due_soon' },
  { label: 'Closed', value: 'closed' },
];

const CLASSES = ['9', '10', '11', '12'];
const SECTIONS = ['A', 'B', 'C'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];

const INITIAL_FORM = {
  title: '', description: '', subject: SUBJECTS[0],
  class: CLASSES[0], section: SECTIONS[0], dueDate: '',
};

export function StaffAssignmentsScreen() {
  const [assignments] = useState<Assignment[]>([]);
  const [activeFilter, setActiveFilter] = useState<AssignmentStatus | 'all'>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const filtered = assignments.filter((a) => {
    if (activeFilter === 'all') return true;
    return a.status === activeFilter;
  });

  const handleCreate = () => {
    if (!form.title || !form.dueDate) return;
    alert(`Assignment "${form.title}" created successfully for ${form.class}-${form.section}!`);
    setShowCreateModal(false);
    setForm(INITIAL_FORM);
  };

  const viewSubmissions = (a: Assignment) => {
    setSelectedAssignment(a);
    setShowSubmissions(true);
  };

  const getFilterBadge = (status: AssignmentStatus) => {
    switch (status) {
      case 'active': return 'info';
      case 'due_soon': return 'warning';
      case 'closed': return 'danger';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Assignments"
        rightAction={
          <TouchableOpacity onPress={() => setShowCreateModal(true)}>
            <Text style={[styles.createBtn, { color: colors.primary }]}>+ New</Text>
          </TouchableOpacity>
        }
      />

      <View style={[styles.filterRow, { backgroundColor: colors.surfaceVariant }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterChip,
              { backgroundColor: activeFilter === f.value ? colors.primary : 'transparent' },
            ]}
            onPress={() => setActiveFilter(f.value)}
          >
            <Text style={[
              styles.filterText,
              { color: activeFilter === f.value ? '#FFF' : colors.textSecondary },
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map((assignment) => {
          const remaining = assignment.dueDate;
          return (
            <TouchableOpacity
              key={assignment.id}
              onPress={() => viewSubmissions(assignment)}
              activeOpacity={0.7}
            >
              <Card>
                <View style={styles.assignmentHeader}>
                  <Text style={[styles.assignmentTitle, { color: colors.text }]}>{assignment.title}</Text>
                  <Badge label={assignment.status.replace('_', ' ')} variant={getFilterBadge(assignment.status)} />
                </View>
                <Text style={[styles.assignmentDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {assignment.description}
                </Text>
                <View style={styles.assignmentMeta}>
                  <Text style={[styles.metaItem, { color: colors.textSecondary }]}>
                    {assignment.subject}
                  </Text>
                  <Text style={[styles.metaItem, { color: colors.textSecondary }]}>
                    Class {assignment.class}-{assignment.section}
                  </Text>
                </View>
                <View style={styles.assignmentFooter}>
                  <View>
                    <Text style={[styles.dueLabel, { color: colors.textSecondary }]}>Due Date</Text>
                    <Text style={[styles.dueValue, { color: colors.text }]}>{remaining}</Text>
                  </View>
                  <View style={styles.submissionsStat}>
                    <Text style={[styles.submissionsCount, { color: colors.primary }]}>
                      {assignment.totalSubmissions}/{assignment.totalStudents}
                    </Text>
                    <Text style={[styles.submissionsLabel, { color: colors.textSecondary }]}>Submissions</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal visible={showSubmissions} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {selectedAssignment && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Submissions</Text>
                  <TouchableOpacity onPress={() => setShowSubmissions(false)}>
                    <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.modalSubtitle, { color: colors.text }]}>{selectedAssignment.title}</Text>
                <Text style={[styles.modalMeta, { color: colors.textSecondary }]}>
                  {selectedAssignment.class}-{selectedAssignment.section} • {selectedAssignment.subject}
                </Text>
                <Text style={[styles.submissionSummary, { color: colors.primary }]}>
                  {selectedAssignment.totalSubmissions} / {selectedAssignment.totalStudents} submitted
                </Text>
                <ScrollView>
                  {selectedAssignment.submissions.length > 0 ? (
                    selectedAssignment.submissions.map((sub, idx) => (
                      <View key={idx} style={[styles.submissionRow, { borderBottomColor: colors.border }]}>
                        <Avatar name={sub.studentName} size={32} />
                        <View style={styles.submissionInfo}>
                          <Text style={[styles.submissionName, { color: colors.text }]}>{sub.studentName}</Text>
                          <Text style={[styles.submissionRoll, { color: colors.textSecondary }]}>
                            Roll {sub.rollNo} • {sub.submittedOn}
                          </Text>
                        </View>
                        <Badge
                          label={sub.status === 'graded' ? `Graded: ${sub.grade}` : sub.status}
                          variant={sub.status === 'graded' ? 'success' : sub.status === 'submitted' ? 'info' : 'warning'}
                        />
                      </View>
                    ))
                  ) : (
                    <Text style={[styles.noSubmissions, { color: colors.textSecondary }]}>
                      No submissions yet
                    </Text>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Assignment</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                value={form.title} onChangeText={(t) => setForm({ ...form, title: t })}
                placeholder="Assignment title" placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border, minHeight: 60 }]}
                value={form.description} onChangeText={(t) => setForm({ ...form, description: t })}
                placeholder="Description (optional)" placeholderTextColor={colors.textSecondary}
                multiline
              />
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Subject</Text>
              <View style={styles.chipRow}>
                {SUBJECTS.map((sub) => (
                  <TouchableOpacity
                    key={sub}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: form.subject === sub ? colors.primary : colors.surfaceVariant,
                        borderColor: form.subject === sub ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setForm({ ...form, subject: sub })}
                  >
                    <Text style={[styles.chipText, { color: form.subject === sub ? '#FFF' : colors.text }]}>{sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.formRow}>
                <View style={styles.halfField}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Class</Text>
                  <View style={styles.chipRow}>
                    {CLASSES.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: form.class === c ? colors.primary : colors.surfaceVariant,
                            borderColor: form.class === c ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setForm({ ...form, class: c })}
                      >
                        <Text style={[styles.chipText, { color: form.class === c ? '#FFF' : colors.text }]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.halfField}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Section</Text>
                  <View style={styles.chipRow}>
                    {SECTIONS.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: form.section === s ? colors.primary : colors.surfaceVariant,
                            borderColor: form.section === s ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setForm({ ...form, section: s })}
                      >
                        <Text style={[styles.chipText, { color: form.section === s ? '#FFF' : colors.text }]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Due Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                value={form.dueDate} onChangeText={(t) => setForm({ ...form, dueDate: t })}
                placeholder="YYYY-MM-DD" placeholderTextColor={colors.textSecondary}
              />
              <Button
                title="Create Assignment"
                onPress={handleCreate}
                size="lg"
                style={styles.submitBtn}
                disabled={!form.title || !form.dueDate}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  createBtn: { fontSize: fontSize.md, fontWeight: '600' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  filterText: { fontSize: fontSize.sm, fontWeight: '500' },
  scroll: { padding: spacing.md },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  assignmentTitle: { fontSize: fontSize.md, fontWeight: '600', flex: 1, marginRight: spacing.sm },
  assignmentDesc: { fontSize: fontSize.sm, marginBottom: spacing.sm, lineHeight: 20 },
  assignmentMeta: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  metaItem: { fontSize: fontSize.xs },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  dueLabel: { fontSize: fontSize.xs },
  dueValue: { fontSize: fontSize.sm, fontWeight: '500' },
  submissionsStat: { alignItems: 'center' },
  submissionsCount: { fontSize: fontSize.md, fontWeight: '700' },
  submissionsLabel: { fontSize: fontSize.xs },
  bottomSpacer: { height: spacing.xl },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalTitle: { fontSize: fontSize.lg, fontWeight: '700' },
  modalClose: { fontSize: fontSize.lg, padding: spacing.xs },
  modalSubtitle: { fontSize: fontSize.md, fontWeight: '600' },
  modalMeta: { fontSize: fontSize.sm, marginTop: 2 },
  submissionSummary: { fontSize: fontSize.sm, fontWeight: '600', marginTop: spacing.sm, marginBottom: spacing.md },
  submissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  submissionInfo: { flex: 1, marginLeft: spacing.sm },
  submissionName: { fontSize: fontSize.sm, fontWeight: '500' },
  submissionRoll: { fontSize: fontSize.xs, marginTop: 2 },
  noSubmissions: { textAlign: 'center', paddingVertical: spacing.xl, fontSize: fontSize.sm },
  inputLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  chipText: { fontSize: fontSize.xs, fontWeight: '500' },
  formRow: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1 },
  submitBtn: { marginTop: spacing.lg, marginBottom: spacing.xl },
});
