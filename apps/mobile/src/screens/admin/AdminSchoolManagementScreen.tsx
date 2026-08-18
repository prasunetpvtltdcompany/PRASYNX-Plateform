import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal as RNModal } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const orgs = [
  { id: '1', name: 'Green Valley School', email: 'admin@greenvalley.edu', status: 'verified' as const, created: 'Jan 2026', users: 2450 },
  { id: '2', name: 'Sunshine Academy', email: 'admin@sunshine.edu', status: 'verified' as const, created: 'Feb 2026', users: 1820 },
  { id: '3', name: 'Star International', email: 'admin@starintl.edu', status: 'pending' as const, created: 'Mar 2026', users: 980 },
  { id: '4', name: 'Bright Future School', email: 'admin@brightfuture.edu', status: 'suspended' as const, created: 'Dec 2025', users: 3200 },
  { id: '5', name: 'Excel Academy', email: 'admin@excel.edu', status: 'pending' as const, created: 'Apr 2026', users: 450 },
];

export function AdminSchoolManagementScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<typeof orgs[0] | null>(null);

  const filtered = orgs.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()));

  const statusBadge = (status: string) => {
    switch (status) {
      case 'verified': return { label: 'Verified', variant: 'success' as const };
      case 'pending': return { label: 'Pending', variant: 'warning' as const };
      case 'suspended': return { label: 'Suspended', variant: 'danger' as const };
      default: return { label: status, variant: 'default' as const };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Organisations" rightAction={<Button title="+ Create" onPress={() => setShowModal(true)} />} />
      <View style={[styles.searchBar, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
        <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search organisations..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((org) => {
          const badge = statusBadge(org.status);
          return (
            <TouchableOpacity key={org.id} onPress={() => setSelectedOrg(org)} activeOpacity={0.7}>
              <Card>
                <View style={styles.orgRow}>
                  <Avatar name={org.name} size={44} />
                  <View style={styles.orgInfo}>
                    <Text style={[styles.orgName, { color: colors.text }]}>{org.name}</Text>
                    <Text style={[styles.orgEmail, { color: colors.textSecondary }]}>{org.email}</Text>
                    <Text style={[styles.orgMeta, { color: colors.textSecondary }]}>Created: {org.created} • {org.users.toLocaleString()} users</Text>
                  </View>
                  <Badge label={badge.label} variant={badge.variant} />
                </View>
                {org.status !== 'verified' && (
                  <View style={[styles.orgActions, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                    {org.status === 'pending' && (
                      <Button title="Verify" onPress={() => {}} style={styles.orgActionBtn} />
                    )}
                    <Button title="Suspend" onPress={() => {}} variant="outline" style={styles.orgActionBtn} textStyle={{ color: colors.error }} />
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedOrg && (
        <RNModal visible={!!selectedOrg} transparent animationType="slide">
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Organisation Details</Text>
                <TouchableOpacity onPress={() => setSelectedOrg(null)}>
                  <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.detailContent}>
                <View style={styles.detailAvatar}>
                  <Avatar name={selectedOrg.name} size={64} />
                </View>
                <Text style={[styles.detailName, { color: colors.text }]}>{selectedOrg.name}</Text>
                <Text style={[styles.detailEmail, { color: colors.textSecondary }]}>{selectedOrg.email}</Text>
                <View style={styles.detailInfo}>
                  {[
                    { label: 'Status', value: selectedOrg.status },
                    { label: 'Created', value: selectedOrg.created },
                    { label: 'Total Users', value: selectedOrg.users.toLocaleString() },
                  ].map((item, i) => (
                    <View key={i} style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{item.value}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.detailActions}>
                  {selectedOrg.status === 'pending' && <Button title="Verify Organisation" onPress={() => setSelectedOrg(null)} style={styles.detailBtn} />}
                  {selectedOrg.status !== 'suspended' && <Button title="Suspend" onPress={() => setSelectedOrg(null)} variant="outline" style={styles.detailBtn} textStyle={{ color: colors.error }} />}
                </View>
              </ScrollView>
            </View>
          </View>
        </RNModal>
      )}

      <RNModal visible={showModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Organisation</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalForm}>
              {[
                { label: 'Organisation Name' }, { label: 'Email' }, { label: 'Phone' }, { label: 'Address' },
              ].map((field, i) => (
                <View key={i} style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{field.label}</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              ))}
              <View style={styles.modalActions}>
                <Button title="Cancel" onPress={() => setShowModal(false)} variant="outline" style={styles.modalBtn} />
                <Button title="Create" onPress={() => setShowModal(false)} style={styles.modalBtn} />
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
  list: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  orgRow: { flexDirection: 'row', gap: spacing.sm },
  orgInfo: { flex: 1 },
  orgName: { fontSize: fontSize.md, fontWeight: '600' },
  orgEmail: { fontSize: fontSize.sm, marginTop: 2 },
  orgMeta: { fontSize: fontSize.xs, marginTop: 2 },
  orgActions: { flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.sm, marginTop: spacing.sm },
  orgActionBtn: { flex: 1 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '600' },
  modalClose: { fontSize: 22 },
  detailContent: { padding: spacing.lg, alignItems: 'center' },
  detailAvatar: { marginBottom: spacing.md },
  detailName: { fontSize: fontSize.xl, fontWeight: '600' },
  detailEmail: { fontSize: fontSize.sm, marginTop: 4 },
  detailInfo: { width: '100%', marginTop: spacing.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  detailLabel: { fontSize: fontSize.sm },
  detailValue: { fontSize: fontSize.sm, fontWeight: '500' },
  detailActions: { width: '100%', gap: spacing.sm, marginTop: spacing.lg },
  detailBtn: {},
  modalForm: { padding: spacing.md },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  fieldInput: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  modalBtn: { flex: 1 },
});
