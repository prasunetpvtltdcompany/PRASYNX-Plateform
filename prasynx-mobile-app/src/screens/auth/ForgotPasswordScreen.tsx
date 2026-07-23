import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input } from '../../components';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, fontSize, spacing } from '../../theme';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const handleSendOTP = () => {
    if (!email.trim()) return;
    navigation.navigate('OTPVerification', { email });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Enter your email address and we'll send you an OTP to reset your password.
        </Text>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button title="Send OTP" onPress={handleSendOTP} disabled={!email.trim()} size="lg" style={styles.sendBtn} />
        <Button title="Back to Login" variant="ghost" onPress={() => navigation.navigate('Login')} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: fontSize.xxl, fontWeight: '700', marginBottom: spacing.sm },
  description: { fontSize: fontSize.md, marginBottom: spacing.xl, lineHeight: 22 },
  sendBtn: { marginTop: spacing.md },
});
