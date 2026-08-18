import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const reportTypes = [
  { id: 'user_activity', label: 'User Activity', icon: '👥', desc: 'User registrations, logins, engagement metrics' },
  { id: 'org_growth', label: 'Org Growth', icon: '🏫', desc: 'Organisation registrations and subscription trends' },
  { id: 'revenue', label: 'Revenue', icon: '💰', desc: 'Revenue breakdown, subscription income, refunds' },
  { id: 'audit', label: 'Audit Logs', icon: '📋', desc: 'System audit trails and admin actions' },
];

const timeRanges = ['7 Days', '30 Days', '90 Days', '1 Year', 'Custom'];

export function AdminReportsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const [selectedType, setSelectedType] = useState('user_activity');
  const [selectedRange, setSelectedRange] = useState('30 Days');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="System Reports" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Report Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reportTypeRow}>
          {reportTypes.map((rt) => (
            <TouchableOpacity
              key={rt.id}
              style={[
                styles.reportTypeCard,
                { backgroundColor: selectedType === rt.id ? colors.primary : colors.card, borderColor: colors.border },
              ]}
              onPress={() => setSelectedType(rt.id)}
            >
              <Text style={styles.reportIcon}>{rt.icon}</Text>
              <Text style={[styles.reportTypeLabel, { color: selectedType === rt.id ? '#FFFFFF' : colors.text }]}>{rt.label}</Text>
              <Text style={[styles.reportTypeDesc, { color: selectedType === rt.id ? '#FFFFFFCC' : colors.textSecondary }]}>{rt.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Card title="Date Filter">
          <Text style={[styles.rangeLabel, { color: colors.textSecondary }]}>Time Range</Text>
          <View style={styles.rangeRow}>
            {timeRanges.map((tr) => (
              <TouchableOpacity
                key={tr}
                style={[styles.rangeChip, { backgroundColor: selectedRange === tr ? colors.primary : colors.surfaceVariant }]}
                onPress={() => setSelectedRange(tr)}
              >
                <Text style={[styles.rangeChipText, { color: selectedRange === tr ? '#FFFFFF' : colors.text }]}>{tr}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedRange === 'Custom' && (
            <View style={[styles.customDateRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={[styles.dateBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Text style={[styles.dateBoxLabel, { color: colors.textSecondary }]}>From</Text>
                <Text style={[styles.dateBoxValue, { color: colors.text }]}>01 Jan 2026</Text>
              </View>
              <Text style={[styles.dateSep, { color: colors.textSecondary }]}>to</Text>
              <View style={[styles.dateBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Text style={[styles.dateBoxLabel, { color: colors.textSecondary }]}>To</Text>
                <Text style={[styles.dateBoxValue, { color: colors.text }]}>11 Jun 2026</Text>
              </View>
            </View>
          )}
        </Card>

        <Card title="Filters">
          {[
            { label: 'Organisation', value: 'All Organisations' },
            { label: 'Status', value: 'All Statuses' },
          ].map((f, i) => (
            <View key={i} style={[styles.filterRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{f.label}</Text>
              <Text style={[styles.filterValue, { color: colors.text }]}>{f.value}</Text>
            </View>
          ))}
        </Card>

        <Button title="Generate Report" onPress={() => {}} size="lg" style={styles.generateBtn} />
        <Button title="Export as CSV" onPress={() => {}} variant="outline" size="lg" style={styles.exportBtn} />
        <Button title="Export as PDF" onPress={() => {}} variant="ghost" size="lg" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm },
  reportTypeRow: { gap: spacing.sm, marginBottom: spacing.md },
  reportTypeCard: {
    width: 160, borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md,
  },
  reportIcon: { fontSize: 28, marginBottom: spacing.sm },
  reportTypeLabel: { fontSize: fontSize.md, fontWeight: '600', marginBottom: 4 },
  reportTypeDesc: { fontSize: fontSize.xs, lineHeight: 16 },
  rangeLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.sm },
  rangeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rangeChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  rangeChipText: { fontSize: fontSize.sm, fontWeight: '500' },
  customDateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md, marginTop: spacing.md },
  dateBox: { flex: 1, borderRadius: borderRadius.md, borderWidth: 1, padding: spacing.md },
  dateBoxLabel: { fontSize: fontSize.xs },
  dateBoxValue: { fontSize: fontSize.sm, fontWeight: '500', marginTop: 2 },
  dateSep: { fontSize: fontSize.sm },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  filterLabel: { fontSize: fontSize.sm },
  filterValue: { fontSize: fontSize.sm, fontWeight: '500' },
  generateBtn: { marginTop: spacing.sm },
  exportBtn: { marginTop: spacing.sm },
});
