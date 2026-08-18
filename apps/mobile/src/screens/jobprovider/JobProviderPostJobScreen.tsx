import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

const jobTypes = ['Local', 'Online'];
const payTypes = ['Fixed', 'Hourly'];
const targetRoles = ['Student', 'Staff', 'Any'];

export function JobProviderPostJobScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState('Local');
  const [area, setArea] = useState('');
  const [payType, setPayType] = useState('Fixed');
  const [payAmount, setPayAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [slots, setSlots] = useState('');
  const [skills, setSkills] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [targetRole, setTargetRole] = useState('Any');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Post a Job" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card title="Job Details">
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Job Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. Graphic Designer"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              placeholder="Describe the job..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>
        </Card>

        <Card title="Job Type & Location">
          <Text style={[styles.label, { color: colors.textSecondary }]}>Type *</Text>
          <View style={styles.optionRow}>
            {jobTypes.map((jt) => (
              <TouchableOpacity
                key={jt}
                style={[styles.optionChip, { backgroundColor: jobType === jt ? colors.primary : colors.surfaceVariant }]}
                onPress={() => setJobType(jt)}
              >
                <Text style={[styles.optionText, { color: jobType === jt ? '#FFFFFF' : colors.text }]}>{jt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.field, { marginTop: spacing.sm }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Area/Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. Bangalore"
              placeholderTextColor={colors.textSecondary}
              value={area}
              onChangeText={setArea}
            />
          </View>
        </Card>

        <Card title="Compensation">
          <Text style={[styles.label, { color: colors.textSecondary }]}>Pay Type *</Text>
          <View style={styles.optionRow}>
            {payTypes.map((pt) => (
              <TouchableOpacity
                key={pt}
                style={[styles.optionChip, { backgroundColor: payType === pt ? colors.primary : colors.surfaceVariant }]}
                onPress={() => setPayType(pt)}
              >
                <Text style={[styles.optionText, { color: payType === pt ? '#FFFFFF' : colors.text }]}>{pt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.field, { marginTop: spacing.sm }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Pay Amount *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. 50000"
              placeholderTextColor={colors.textSecondary}
              value={payAmount}
              onChangeText={setPayAmount}
              keyboardType="numeric"
            />
          </View>
        </Card>

        <Card title="Additional Info">
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Duration</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. 3 months"
              placeholderTextColor={colors.textSecondary}
              value={duration}
              onChangeText={setDuration}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Number of Slots</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. 2"
              placeholderTextColor={colors.textSecondary}
              value={slots}
              onChangeText={setSlots}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Skills Required</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. Photoshop, Illustrator"
              placeholderTextColor={colors.textSecondary}
              value={skills}
              onChangeText={setSkills}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Target Role</Text>
            <View style={styles.optionRow}>
              {targetRoles.map((tr) => (
                <TouchableOpacity
                  key={tr}
                  style={[styles.optionChip, { backgroundColor: targetRole === tr ? colors.primary : colors.surfaceVariant }]}
                  onPress={() => setTargetRole(tr)}
                >
                  <Text style={[styles.optionText, { color: targetRole === tr ? '#FFFFFF' : colors.text }]}>{tr}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        <Card title="Contact Info">
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Contact Info *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              placeholder="Phone or email for applicants"
              placeholderTextColor={colors.textSecondary}
              value={contactInfo}
              onChangeText={setContactInfo}
            />
          </View>
        </Card>

        <Button title="Submit Job" onPress={() => {}} size="lg" style={styles.submitBtn} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  field: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  input: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', gap: spacing.sm },
  optionChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  optionText: { fontSize: fontSize.sm, fontWeight: '500' },
  submitBtn: { marginTop: spacing.sm },
});
