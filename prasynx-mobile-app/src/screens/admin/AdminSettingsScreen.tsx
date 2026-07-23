import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing, borderRadius, shadows } from '../../theme';
import { Card, Button, Header, Avatar, Badge, Loader } from '../../components';

export function AdminSettingsScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const [name, setName] = useState('Admin User');
  const [email, setEmail] = useState('admin@prasynx.com');
  const [phone, setPhone] = useState('+91-9876543000');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card title="Profile">
          <View style={styles.avatarSection}>
            <Avatar name={name} size={64} />
            <TouchableOpacity>
              <Text style={[styles.changePhoto, { color: colors.primary }]}>Change Photo</Text>
            </TouchableOpacity>
          </View>
          {[
            { label: 'Full Name', value: name, setter: setName },
            { label: 'Email', value: email, setter: setEmail },
            { label: 'Phone', value: phone, setter: setPhone },
          ].map((field, i) => (
            <View key={i} style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{field.label}</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                value={field.value}
                onChangeText={field.setter}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          ))}
          <Button title="Save Profile" onPress={() => {}} />
        </Card>

        <Card title="Security">
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>Change your password</Text>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Current Password</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>New Password</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <Button title="Update Password" onPress={() => {}} variant="outline" />
        </Card>

        <Card title="App Settings">
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Receive system alerts</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, { backgroundColor: notifications ? colors.primary : colors.border }]}
              onPress={() => setNotifications(!notifications)}
            >
              <View style={[styles.toggleKnob, { alignSelf: notifications ? 'flex-end' : 'flex-start', backgroundColor: '#FFFFFF' }]} />
            </TouchableOpacity>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Toggle dark theme</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, { backgroundColor: isDark ? colors.primary : colors.border }]}
              onPress={toggleTheme}
            >
              <View style={[styles.toggleKnob, { alignSelf: isDark ? 'flex-end' : 'flex-start', backgroundColor: '#FFFFFF' }]} />
            </TouchableOpacity>
          </View>
        </Card>

        <Card title="About">
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
          </View>
          <View style={[styles.aboutRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Build</Text>
            <Text style={[styles.aboutValue, { color: colors.text }]}>2026.06.11</Text>
          </View>
          <TouchableOpacity style={[styles.aboutRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.aboutLabel, { color: colors.primary }]}>Contact Support</Text>
            <Text style={[styles.aboutArrow, { color: colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aboutRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.aboutLabel, { color: colors.primary }]}>Privacy Policy</Text>
            <Text style={[styles.aboutArrow, { color: colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aboutRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.aboutLabel, { color: colors.primary }]}>Terms of Service</Text>
            <Text style={[styles.aboutArrow, { color: colors.textSecondary }]}>→</Text>
          </TouchableOpacity>
        </Card>

        <Button
          title="Logout"
          onPress={() => {}}
          variant="outline"
          size="lg"
          style={styles.logoutBtn}
          textStyle={{ color: colors.error }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: spacing.lg },
  changePhoto: { fontSize: fontSize.sm, fontWeight: '500', marginTop: spacing.sm },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing.xs },
  fieldInput: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.md },
  sectionDesc: { fontSize: fontSize.sm, marginBottom: spacing.md },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: fontSize.md, fontWeight: '500' },
  settingDesc: { fontSize: fontSize.xs, marginTop: 2 },
  toggle: {
    width: 48, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center',
  },
  toggleKnob: { width: 24, height: 24, borderRadius: 12 },
  aboutRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  aboutLabel: { fontSize: fontSize.md },
  aboutValue: { fontSize: fontSize.md, fontWeight: '500' },
  aboutArrow: { fontSize: fontSize.lg },
  logoutBtn: { marginTop: spacing.md, borderColor: '#EF4444' },
});
