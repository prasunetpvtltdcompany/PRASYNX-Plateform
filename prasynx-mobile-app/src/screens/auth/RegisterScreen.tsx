import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing } from '../../theme';
import { PortalRole } from '../../types';

interface RegisterScreenProps {
  navigation: any;
  route: any;
}

export function RegisterScreen({ navigation, route }: RegisterScreenProps) {
  const initialRole: PortalRole = route?.params?.role || 'student';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { register, isLoading } = useAuthStore();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) return;
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const result = await register(initialRole, {
      full_name: fullName,
      email,
      password,
      phone: phone || undefined,
    });
    if (result.success) {
      alert('Registration successful! Please sign in.');
      navigation.navigate('Login');
    } else if (result.error) {
      alert(result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Register as {initialRole.replace('_', ' ')}
          </Text>
        </View>

        <Input label="Full Name" placeholder="Enter your full name" value={fullName} onChangeText={setFullName} />
        <Input label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone (optional)" placeholder="Enter your phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry />
        <Input label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          disabled={!fullName.trim() || !email.trim() || !password.trim()}
          size="lg"
          style={styles.registerBtn}
        />

        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already have an account? </Text>
          <Button title="Sign In" variant="ghost" onPress={() => navigation.navigate('Login')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.xxl },
  title: { fontSize: fontSize.xxl, fontWeight: '700' },
  subtitle: { fontSize: fontSize.md, marginTop: spacing.sm },
  registerBtn: { marginTop: spacing.md },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg },
  loginText: { fontSize: fontSize.sm },
});
