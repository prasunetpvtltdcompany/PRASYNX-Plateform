import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, borderRadius, fontSize, spacing, shadows } from '../../theme';
import { PortalRole } from '../../types';

interface LoginScreenProps {
  navigation: any;
}

const ROLES: { label: string; value: PortalRole }[] = [
  { label: 'Student', value: 'student' },
  { label: 'Parent', value: 'parent' },
  { label: 'Staff', value: 'staff' },
  { label: 'Management', value: 'management' },
  { label: 'Admin', value: 'admin' },
  { label: 'Job Provider', value: 'job_provider' },
];

const { width } = Dimensions.get('window');

export function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<PortalRole>('student');

  const { login, isLoading } = useAuthStore();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    const result = await login(selectedRole, email, password);
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  return (
    <LinearGradient
      colors={['#6D4CFF', '#7C3AED', '#2D1B69']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: '#FFFFFF' }, shadows.xl]}>
            <View style={styles.brand}>
              <LinearGradient
                colors={['#6D4CFF', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoIcon}
              >
                <Text style={styles.logoText}>P</Text>
              </LinearGradient>
              <Text style={styles.brandName}>Prasynx</Text>
              <Text style={styles.brandSub}>School ERP</Text>
            </View>

            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[
                    styles.roleChip,
                    {
                      backgroundColor: selectedRole === r.value ? '#6D4CFF' : '#F3F0FF',
                    },
                  ]}
                  onPress={() => setSelectedRole(r.value)}
                >
                  <Text style={[
                    styles.roleText,
                    { color: selectedRole === r.value ? '#FFFFFF' : '#6D4CFF' },
                  ]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: '#374151' }]}>Email</Text>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.fieldLabel, { color: '#374151' }]}>Password</Text>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={!email.trim() || !password.trim()}
              size="lg"
              style={styles.loginBtn}
            />

            <View style={styles.registerRow}>
              <Text style={[styles.registerText, { color: '#64748B' }]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register', { role: selectedRole })}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  card: {
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  brandName: { fontSize: 26, fontWeight: '700', color: '#0F172A', letterSpacing: -0.5 },
  brandSub: { fontSize: fontSize.sm, color: '#64748B', marginTop: 2 },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    justifyContent: 'center',
  },
  roleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  roleText: { fontSize: fontSize.xs, fontWeight: '600' },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: '600', marginBottom: spacing.xs, marginLeft: 2 },
  forgot: { textAlign: 'right', fontSize: fontSize.sm, fontWeight: '600', color: '#6D4CFF', marginBottom: spacing.lg },
  loginBtn: { marginTop: spacing.xs },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  registerText: { fontSize: fontSize.sm },
  registerLink: { fontSize: fontSize.sm, fontWeight: '600', color: '#6D4CFF' },
});
