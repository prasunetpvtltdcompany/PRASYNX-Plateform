import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';
import { useDataStore } from '../../store/dataStore';
import { ExamResult } from '../../types';

export function ParentResultsScreen({ navigation }: any) {
  const [selectedExam, setSelectedExam] = useState('');
  const { results, fetchResults } = useDataStore();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    fetchResults('1');
  }, []);

  const examNames = results?.examNames ?? [];
  const currentResults = selectedExam ? (results?.byExam?.[selectedExam] ?? []) : [];
  const trend = results?.trend ?? [];
  const totalScore = currentResults.reduce((s: number, r: any) => s + r.score, 0);
  const totalMax = currentResults.reduce((s: number, r: any) => s + r.max_score, 0);
  const overallPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return colors.success;
    if (grade.startsWith('B')) return colors.warning;
    return colors.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Results" leftAction={<Text onPress={() => navigation?.goBack()} style={{ color: colors.primary, fontSize: 24 }}>{'<'}</Text>} onLeftPress={() => navigation?.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {examNames.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Exam</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examSelector}>
              {examNames.map((exam: string) => (
                <TouchableOpacity
                  key={exam}
                  style={[styles.examChip, {
                    backgroundColor: selectedExam === exam ? colors.primary : colors.surfaceVariant,
                    borderColor: selectedExam === exam ? colors.primary : colors.border,
                  }]}
                  onPress={() => setSelectedExam(exam)}
                >
                  <Text style={[styles.examText, { color: selectedExam === exam ? '#FFFFFF' : colors.text }]}>{exam}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <Card>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Overall Percentage</Text>
          <View style={styles.overallRow}>
            <Text style={[styles.overallPct, { color: overallPct >= 85 ? colors.success : overallPct >= 60 ? colors.warning : colors.error }]}>
              {overallPct}%
            </Text>
            <View style={styles.overallDetails}>
              <Text style={[styles.overallScore, { color: colors.text }]}>Total: {totalScore}/{totalMax}</Text>
              <Text style={[styles.overallGrade, { color: colors.textSecondary }]}>Grade: {overallPct >= 90 ? 'A+' : overallPct >= 80 ? 'A' : overallPct >= 70 ? 'B+' : overallPct >= 60 ? 'B' : 'C'}</Text>
            </View>
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Subject-wise Marks</Text>
        {currentResults.map((result) => {
          const pct = Math.round((result.score / result.max_score) * 100);
          return (
            <View key={result.id} style={[styles.subjectCard, { backgroundColor: colors.card, borderColor: colors.border, ...shadows.sm }]}>
              <View style={styles.subjectRow}>
                <View style={styles.subjectInfo}>
                  <Text style={[styles.subjectName, { color: colors.text }]}>{result.subject}</Text>
                  <Text style={[styles.subjectScore, { color: colors.textSecondary }]}>
                    {result.score}/{result.max_score} ({pct}%)
                  </Text>
                </View>
                <Badge label={result.grade || ''} variant={pct >= 80 ? 'success' : pct >= 60 ? 'warning' : 'danger'} />
              </View>
              <View style={[styles.marksBar, { backgroundColor: colors.surfaceVariant }]}>
                <View style={[styles.marksFill, {
                  width: `${pct}%`,
                  backgroundColor: pct >= 80 ? colors.success : pct >= 60 ? colors.warning : colors.error,
                }]} />
              </View>
            </View>
          );
        })}

        {trend.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Trend</Text>
            <Card>
              <View style={styles.trendContainer}>
                {trend.map((point: any, index: number) => {
              const maxH = 120;
              const h = (point.pct / 100) * maxH;
              return (
                <View key={point.exam} style={styles.trendBar}>
                  <View style={[styles.trendFill, {
                    height: h,
                    backgroundColor: point.pct >= 85 ? colors.success : colors.warning,
                    borderTopLeftRadius: borderRadius.sm,
                    borderTopRightRadius: borderRadius.sm,
                  }]} />
                  <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>{point.exam}</Text>
                  <Text style={[styles.trendValue, { color: colors.text }]}>{point.pct}%</Text>
                </View>
              );
                })}
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.sm },
  examSelector: { marginBottom: spacing.md },
  examChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, marginRight: spacing.sm },
  examText: { fontSize: fontSize.sm, fontWeight: '500' },
  summaryLabel: { fontSize: fontSize.sm, marginBottom: spacing.xs },
  overallRow: { flexDirection: 'row', alignItems: 'center' },
  overallPct: { fontSize: fontSize.title, fontWeight: '700', marginRight: spacing.lg },
  overallDetails: { flex: 1 },
  overallScore: { fontSize: fontSize.md, fontWeight: '500' },
  overallGrade: { fontSize: fontSize.sm, marginTop: 2 },
  subjectCard: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  subjectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: fontSize.md, fontWeight: '500' },
  subjectScore: { fontSize: fontSize.xs, marginTop: 2 },
  marksBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  marksFill: { height: '100%', borderRadius: 3 },
  trendContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160, paddingTop: spacing.md },
  trendBar: { alignItems: 'center', width: 60 },
  trendFill: { width: 32, minHeight: 4 },
  trendLabel: { fontSize: fontSize.xs, marginTop: spacing.xs },
  trendValue: { fontSize: fontSize.xs, fontWeight: '600' },
  downloadBtn: { marginTop: spacing.lg },
});
