import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  parentContact: string;
  email: string;
  address: string;
}

const CLASSES = ['9', '10', '11', '12'];
const SECTIONS = ['A', 'B', 'C'];

const INITIAL_FORM = {
  name: '', rollNo: '', class: '10', section: 'A',
  parentContact: '', email: '', address: '',
};

export function StaffStudentManagementScreen() {
  const [students] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.includes(searchQuery);
    const matchesClass = selectedClass === 'All' || s.class === selectedClass;
    const matchesSection = selectedSection === 'All' || s.section === selectedSection;
    return matchesSearch && matchesClass && matchesSection;
  });

  const handleAddStudent = () => {
    alert(`Student ${form.name} added successfully!`);
    setShowAddModal(false);
    setForm(INITIAL_FORM);
  };

  const viewDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Student Management"
        rightAction={
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Text style={[styles.addBtn, { color: colors.primary }]}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
          <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name or roll number..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Card>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Filter by Class</Text>
          <View style={styles.chipRow}>
            {['All', ...CLASSES].map((c) => (
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
                  {c === 'All' ? 'All' : `Class ${c}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.filterLabel, { color: colors.textSecondary, marginTop: spacing.sm }]}>Section</Text>
          <View style={styles.chipRow}>
            {['All', ...SECTIONS].map((s) => (
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
                  {s === 'All' ? 'All' : `Sec ${s}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
        </Text>

        {filteredStudents.map((student) => (
          <TouchableOpacity key={student.id} onPress={() => viewDetail(student)} activeOpacity={0.7}>
            <Card style={styles.studentCard}>
              <View style={styles.studentRow}>
                <Avatar name={student.name} size={44} />
                <View style={styles.studentInfo}>
                  <Text style={[styles.studentName, { color: colors.text }]}>{student.name}</Text>
                  <Text style={[styles.studentMeta, { color: colors.textSecondary }]}>
                    Roll No: {student.rollNo} • Class {student.class}-{student.section}
                  </Text>
                  <Text style={[styles.studentContact, { color: colors.textSecondary }]}>
                    📞 {student.parentContact}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Student</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                value={form.name} onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="Student name" placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Roll Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                value={form.rollNo} onChangeText={(t) => setForm({ ...form, rollNo: t })}
                placeholder="Roll number" placeholderTextColor={colors.textSecondary}
              />
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
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Parent Contact</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                value={form.parentContact} onChangeText={(t) => setForm({ ...form, parentContact: t })}
                placeholder="Phone number" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad"
              />
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
                value={form.email} onChangeText={(t) => setForm({ ...form, email: t })}
                placeholder="Email address" placeholderTextColor={colors.textSecondary} keyboardType="email-address"
              />
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border, minHeight: 60 }]}
                value={form.address} onChangeText={(t) => setForm({ ...form, address: t })}
                placeholder="Address" placeholderTextColor={colors.textSecondary} multiline
              />
              <Button title="Add Student" onPress={handleAddStudent} size="lg" style={styles.submitBtn} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {selectedStudent && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Student Details</Text>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.detailAvatar}>
                  <Avatar name={selectedStudent.name} size={64} />
                </View>
                <Text style={[styles.detailName, { color: colors.text }]}>{selectedStudent.name}</Text>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Roll Number</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{selectedStudent.rollNo}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Class</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{selectedStudent.class} - {selectedStudent.section}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Parent Contact</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{selectedStudent.parentContact}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{selectedStudent.email}</Text>
                </View>
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Address</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{selectedStudent.address}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md },
  addBtn: { fontSize: fontSize.md, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontSize: fontSize.sm },
  filterLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: fontSize.xs, fontWeight: '500' },
  resultCount: { fontSize: fontSize.sm, marginBottom: spacing.sm },
  studentCard: { paddingVertical: spacing.sm },
  studentRow: { flexDirection: 'row', alignItems: 'center' },
  studentInfo: { flex: 1, marginLeft: spacing.sm },
  studentName: { fontSize: fontSize.md, fontWeight: '600' },
  studentMeta: { fontSize: fontSize.xs, marginTop: 2 },
  studentContact: { fontSize: fontSize.xs, marginTop: 2 },
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
    marginBottom: spacing.md,
  },
  modalTitle: { fontSize: fontSize.lg, fontWeight: '700' },
  modalClose: { fontSize: fontSize.lg, padding: spacing.xs },
  inputLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
  },
  formRow: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1 },
  submitBtn: { marginTop: spacing.lg, marginBottom: spacing.xl },
  detailAvatar: { alignItems: 'center', marginBottom: spacing.md },
  detailName: { fontSize: fontSize.xl, fontWeight: '700', textAlign: 'center', marginBottom: spacing.lg },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailLabel: { fontSize: fontSize.sm, flex: 1 },
  detailValue: { fontSize: fontSize.sm, fontWeight: '500', flex: 1, textAlign: 'right' },
});
