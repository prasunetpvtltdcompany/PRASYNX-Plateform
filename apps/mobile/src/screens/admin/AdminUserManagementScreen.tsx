import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal as RNModal } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const users = [
  { id: '1', name: 'Dr. Priya Sharma', email: 'priya@school.com', role: 'Management', status: 'active' as const },
  { id: '2', name: 'Amit Verma', email: 'amit@school.com', role: 'Staff', status: 'active' as const },
  { id: '3', name: 'Neha Gupta', email: 'neha@school.com', role: 'Staff', status: 'active' as const },
  { id: '4', name: 'Rahul Kumar', email: 'rahul@college.edu', role: 'Student', status: 'active' as const },
  { id: '5', name: 'Sneha Patel', email: 'sneha@techcorp.com', role: 'Job Provider', status: 'suspended' as const },
  { id: '6', name: 'Rohit Singh', email: 'rohit@school.com', role: 'Parent', status: 'inactive' as const },
];

const roles = ['All', 'Admin', 'Management', 'Staff', 'Student', 'Parent', 'Job Provider'];

export function AdminUserManagementScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="User Management" rightAction={<Button title="+ Create" onPress={() => setShowModal(true)} />} />
      <View style={[styles.searchBar, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
        <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name or email..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleRow}>
        {roles.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleChip, { backgroundColor: roleFilter === r ? colors.primary : colors.surfaceVariant }]}
            onPress={() => setRoleFilter(r)}
          >
            <Text style={[styles.roleChipText, { color: roleFilter === r ? '#FFFFFF' : colors.text }]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((user) => (
          <TouchableOpacity key={user.id} activeOpacity={0.7}>
            <Card>
              <View style={styles.userRow}>
                <Avatar name={user.name} size={42} />
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                  <Text style={[styles.userRole, { color: colors.primary }]}>{user.role}</Text>
                </View>
                <View style={styles.userActions}>
                  <Badge label={user.status} variant={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'danger' : 'warning'} />
                  <View style={styles.actionBtns}>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.smallBtnText, { color: colors.success }]}>Activate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.error + '20' }]}>
                      <Text style={[styles.smallBtnText, { color: colors.error }]}>Suspend</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <RNModal visible={showModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create User</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalForm}>
              {[
                { label: 'Full Name' }, { label: 'Email' }, { label: 'Phone' }, { label: 'Password' },
              ].map((field, i) => (
                <View key={i} style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              ))}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Role</Text>
              <View style={[styles.roleSelector, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Text style={[styles.roleSelectorText, { color: colors.text }]}>Select Role</Text>
              </View>
              <View style={styles.modalActions}>
                <Button title="Cancel" onPress={() => setShowModal(false)} variant="outline" style={styles.modalBtn} />
                <Button title="Create User" onPress={() => setShowModal(false)} style={styles.modalBtn} />
              </View>
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
  roleRow: { gap: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.sm, marginBottom: spacing.sm },
  roleChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  roleChipText: { fontSize: fontSize.sm, fontWeight: '500' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  userRow: { flexDirection: 'row', gap: spacing.sm },
  userInfo: { flex: 1 },
  userName: { fontSize: fontSize.md, fontWeight: '600' },
  userEmail: { fontSize: fontSize.sm, marginTop: 2 },
  userRole: { fontSize: fontSize.xs, fontWeight: '500', marginTop: 2 },
  userActions: { alignItems: 'flex-end', gap: spacing.xs },
  actionBtns: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  smallBtn: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  smallBtnText: { fontSize: fontSize.xs, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '600' },
  modalClose: { fontSize: 22 },
  modalForm: { padding: spacing.md },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  fieldInput: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md },
  roleSelector: { borderRadius: borderRadius.md, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md },
  roleSelectorText: { fontSize: fontSize.md },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  modalBtn: { flex: 1 },
});
