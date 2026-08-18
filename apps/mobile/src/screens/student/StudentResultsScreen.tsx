import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const EXAMS = ['Mid-Term 2026', 'Quarterly 2026', 'Half-Yearly 2025', 'Annual 2025'];

const SUBJECT_RESULTS = [
  { name: 'Mathematics', score: 88, total: 100, grade: 'A', status: 'pass' },
  { name: 'Physics', score: 76, total: 100, grade: 'B+', status: 'pass' },
  { name: 'Chemistry', score: 82, total: 100, grade: 'A', status: 'pass' },
  { name: 'English', score: 91, total: 100, grade: 'A+', status: 'pass' },
  { name: 'Computer Science', score: 95, total: 100, grade: 'A+', status: 'pass' },
];

export function StudentResultsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const [selectedExam, setSelectedExam] = useState(0);
  const [showExamPicker, setShowExamPicker] = useState(false);

  const totalScore = SUBJECT_RESULTS.reduce((sum, s) => sum + s.score, 0);
  const totalMax = SUBJECT_RESULTS.reduce((sum, s) => sum + s.total, 0);
  const avgPercentage = ((totalScore / totalMax) * 100).toFixed(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Results" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.examSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowExamPicker(!showExamPicker)}
        >
          <Text style={[styles.examSelectorText, { color: colors.text }]}>{EXAMS[selectedExam]}</Text>
          <Text style={[styles.examSelectorArrow, { color: colors.textSecondary }]}>{showExamPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showExamPicker && (
          <Card style={styles.examPickerCard}>
            {EXAMS.map((exam, index) => (
              <TouchableOpacity
                key={exam}
                style={[styles.examOption, { borderBottomColor: colors.border }]}
                onPress={() => { setSelectedExam(index); setShowExamPicker(false); }}
              >
                <Text style={[styles.examOptionText, { color: selectedExam === index ? colors.primary : colors.text }]}>
                  {exam}
                </Text>
                {selectedExam === index && <Text style={[styles.checkMark, { color: colors.primary }]}>✓</Text>}
              </TouchableOpacity>
            ))}
          </Card>
        )}

        <Card style={styles.overallCard}>
          <Text style={[styles.overallLabel, { color: colors.textSecondary }]}>Overall Average</Text>
          <Text style={[styles.overallPercent, { color: colors.primary }]}>{avgPercentage}%</Text>
          <View style={[styles.overallProgress, { backgroundColor: colors.surfaceVariant }]}>
            <View
              style={[
                styles.overallFill,
                { backgroundColor: colors.primary, width: `${avgPercentage}%` as any },
              ]}
            />
          </View>
          <Text style={[styles.overallScore, { color: colors.textSecondary }]}>
            {totalScore} / {totalMax} marks
          </Text>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Subject-wise Results</Text>

        {SUBJECT_RESULTS.map((subject, index) => (
          <Card key={index}>
            <View style={styles.subjectRow}>
              <View style={styles.subjectInfo}>
                <Text style={[styles.subjectName, { color: colors.text }]}>{subject.name}</Text>
                <Text style={[styles.subjectScore, { color: colors.textSecondary }]}>
                  {subject.score} / {subject.total}
                </Text>
              </View>
              <View style={styles.subjectRight}>
                <Badge label={subject.grade} variant={subject.status === 'pass' ? 'success' : 'danger'} />
              </View>
            </View>
            <View style={[styles.subjectBar, { backgroundColor: colors.surfaceVariant }]}>
              <View
                style={[
                  styles.subjectFill,
                  {
                    backgroundColor: subject.score >= 90 ? colors.success : subject.score >= 75 ? colors.primary : colors.warning,
                    width: `${(subject.score / subject.total) * 100}%`,
                  },
                ]}
              />
            </View>
          </Card>
        ))}

        <Card title="Progress Overview" subtitle="Performance trend">
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBars}>
              {[65, 72, 78, 83.2].map((val, i) => (
                <View key={i} style={styles.chartCol}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: val * 1.5,
                        backgroundColor: i === 3 ? colors.primary : colors.surfaceVariant,
                      },
                    ]}
                  />
                  <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>T{i + 1}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  examSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  examSelectorText: { fontSize: fontSize.md, fontWeight: '600' },
  examSelectorArrow: { fontSize: fontSize.xs },
  examPickerCard: { marginTop: -spacing.sm, marginBottom: spacing.md },
  examOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1 },
  examOptionText: { fontSize: fontSize.sm },
  checkMark: { fontSize: fontSize.md, fontWeight: '700' },
  overallCard: { alignItems: 'center', paddingVertical: spacing.lg },
  overallLabel: { fontSize: fontSize.sm },
  overallPercent: { fontSize: fontSize.title, fontWeight: '700', marginTop: spacing.xs },
  overallProgress: { width: '100%', height: 8, borderRadius: 4, marginTop: spacing.md, overflow: 'hidden' },
  overallFill: { height: '100%', borderRadius: 4 },
  overallScore: { fontSize: fontSize.sm, marginTop: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.md },
  subjectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: fontSize.sm, fontWeight: '500' },
  subjectScore: { fontSize: fontSize.xs, marginTop: 2 },
  subjectRight: {},
  subjectBar: { height: 4, borderRadius: 2, marginTop: spacing.sm, overflow: 'hidden' },
  subjectFill: { height: '100%', borderRadius: 2 },
  chartPlaceholder: { height: 150, justifyContent: 'flex-end' },
  chartBars: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120 },
  chartCol: { alignItems: 'center' },
  chartBar: { width: 40, borderRadius: borderRadius.sm, minHeight: 20 },
  chartLabel: { fontSize: fontSize.xs, marginTop: spacing.xs },
});
