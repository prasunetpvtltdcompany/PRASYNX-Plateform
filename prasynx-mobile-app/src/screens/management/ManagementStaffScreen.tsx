import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal as RNModal } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const departments = ['All', 'Teaching', 'Administration', 'Accounts', 'Library', 'Lab'];
const staffData = [
  { id: '1', name: 'Dr. Priya Sharma', subject: 'Mathematics', email: 'priya@school.com', phone: '+91-9876543210', dept: 'Teaching', status: 'active' },
  { id: '2', name: 'Mr. Amit Verma', subject: 'Physics', email: 'amit@school.com', phone: '+91-9876543211', dept: 'Teaching', status: 'active' },
  { id: '3', name: 'Ms. Neha Gupta', subject: 'English', email: 'neha@school.com', phone: '+91-9876543212', dept: 'Teaching', status: 'active' },
  { id: '4', name: 'Mr. Rajesh Kumar', subject: 'Accountant', email: 'rajesh@school.com', phone: '+91-9876543213', dept: 'Accounts', status: 'active' },
  { id: '5', name: 'Mrs. Sunita Patel', subject: 'Librarian', email: 'sunita@school.com', phone: '+91-9876543214', dept: 'Library', status: 'inactive' },
];

export function ManagementStaffScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState<typeof staffData[0] | null>(null);

  const filtered = staffData.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.subject.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || s.dept === deptFilter;
    return matchSearch && matchDept;
  });

  const openAdd = () => {
    setEditStaff(null);
    setShowModal(true);
  };

  const openEdit = (staff: typeof staffData[0]) => {
    setEditStaff(staff);
    setShowModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Staff Management" rightAction={<Button title="+ Add" onPress={openAdd} />} />
      <View style={[styles.searchBar, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
        <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search staff by name or subject..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {departments.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.filterChip, { backgroundColor: deptFilter === d ? colors.primary : colors.surfaceVariant }]}
            onPress={() => setDeptFilter(d)}
          >
            <Text style={[styles.filterChipText, { color: deptFilter === d ? '#FFFFFF' : colors.text }]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((staff) => (
          <TouchableOpacity key={staff.id} onPress={() => openEdit(staff)} activeOpacity={0.7}>
            <Card style={styles.staffCard}>
              <View style={styles.staffRow}>
                <Avatar name={staff.name} size={44} />
                <View style={styles.staffInfo}>
                  <Text style={[styles.staffName, { color: colors.text }]}>{staff.name}</Text>
                  <Text style={[styles.staffSubject, { color: colors.textSecondary }]}>{staff.subject}</Text>
                  <Text style={[styles.staffContact, { color: colors.textSecondary }]}>{staff.email} | {staff.phone}</Text>
                </View>
                <Badge label={staff.status} variant={staff.status === 'active' ? 'success' : 'warning'} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <RNModal visible={showModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{editStaff ? 'Edit Staff' : 'Add Staff'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalForm}>
              {[
                { label: 'Full Name', value: editStaff?.name || '' },
                { label: 'Email', value: editStaff?.email || '' },
                { label: 'Phone', value: editStaff?.phone || '' },
                { label: 'Subject/Role', value: editStaff?.subject || '' },
              ].map((field, i) => (
                <View key={i} style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                    value={field.value}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              ))}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Department</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptRow}>
                {departments.filter((d) => d !== 'All').map((d) => (
                  <TouchableOpacity key={d} style={[styles.deptChip, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                    <Text style={[styles.deptChipText, { color: colors.text }]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Role Assignment</Text>
              <View style={[styles.roleBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Text style={[styles.roleText, { color: colors.text }]}>Teacher</Text>
              </View>
              <Button title={editStaff ? 'Update Staff' : 'Add Staff'} onPress={() => setShowModal(false)} size="lg" style={styles.submitBtn} />
            </ScrollView>
          </View>
        </View>
      </RNModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.md, marginTop: spacing.sm,
    borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md, height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: fontSize.sm },
  filterRow: { gap: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.sm, marginBottom: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  filterChipText: { fontSize: fontSize.sm, fontWeight: '500' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  staffCard: {},
  staffRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  staffInfo: { flex: 1 },
  staffName: { fontSize: fontSize.md, fontWeight: '600' },
  staffSubject: { fontSize: fontSize.sm, marginTop: 2 },
  staffContact: { fontSize: fontSize.xs, marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '600' },
  modalClose: { fontSize: 22 },
  modalForm: { padding: spacing.md },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  fieldInput: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md },
  deptRow: { gap: spacing.sm, marginBottom: spacing.md },
  deptChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1 },
  deptChipText: { fontSize: fontSize.sm },
  roleBox: { borderRadius: borderRadius.md, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  roleText: { fontSize: fontSize.md },
  submitBtn: { marginTop: spacing.sm },
});
