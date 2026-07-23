import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const reportTypes = [
  { id: 'academic', label: 'Academic', icon: '📚', desc: 'Exam results, grades, subject performance' },
  { id: 'attendance', label: 'Attendance', icon: '📋', desc: 'Attendance records, trends, monthly stats' },
  { id: 'financial', label: 'Financial', icon: '💰', desc: 'Revenue, expenses, fee collection' },
  { id: 'staff', label: 'Staff', icon: '👨‍🏫', desc: 'Staff details, performance, payroll' },
  { id: 'custom', label: 'Custom', icon: '⚙️', desc: 'Build your own report with custom fields' },
];

export function ManagementReportsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const [selectedType, setSelectedType] = useState('academic');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-12-31');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Reports" />
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

        <Card title="Date Range">
          <View style={styles.dateRow}>
            <View style={[styles.dateInput, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>From</Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>{fromDate}</Text>
            </View>
            <Text style={[styles.dateSeparator, { color: colors.textSecondary }]}>to</Text>
            <View style={[styles.dateInput, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>To</Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>{toDate}</Text>
            </View>
          </View>
        </Card>

        <Card title="Filters">
          {[
            { label: 'Class', value: 'All Classes' },
            { label: 'Section', value: 'All Sections' },
            { label: 'Department', value: 'All Departments' },
          ].map((filter, i) => (
            <View key={i} style={[styles.filterRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{filter.label}</Text>
              <Text style={[styles.filterValue, { color: colors.text }]}>{filter.value}</Text>
            </View>
          ))}
        </Card>

        <Button title="Generate Report" onPress={() => {}} size="lg" style={styles.generateBtn} />
        <Button title="Download as PDF" onPress={() => {}} variant="outline" size="lg" style={styles.downloadBtn} />
        <Button title="Export to Excel" onPress={() => {}} variant="ghost" size="lg" />
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
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dateInput: {
    flex: 1, borderRadius: borderRadius.md, borderWidth: 1, padding: spacing.md,
  },
  dateLabel: { fontSize: fontSize.xs },
  dateValue: { fontSize: fontSize.sm, fontWeight: '500', marginTop: 2 },
  dateSeparator: { fontSize: fontSize.sm },
  filterRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm,
  },
  filterLabel: { fontSize: fontSize.sm },
  filterValue: { fontSize: fontSize.sm, fontWeight: '500' },
  generateBtn: { marginTop: spacing.sm },
  downloadBtn: { marginTop: spacing.sm },
});
