import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../../components';
import { useThemeStore } from '../../store/themeStore';
import { lightColors, darkColors, borderRadius, fontSize, spacing } from '../../theme';

interface OTPVerificationScreenProps {
  navigation: any;
  route: any;
}

export function OTPVerificationScreen({ navigation, route }: OTPVerificationScreenProps) {
  const email = route?.params?.email || '';
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length !== 4) return;
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Verify OTP</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Enter the 4-digit code sent to {email}
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref as TextInput; }}
              style={[
                styles.otpInput,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <Button title="Verify OTP" onPress={handleVerify} disabled={otp.join('').length !== 4} size="lg" style={styles.verifyBtn} />
        <Button title="Resend OTP" variant="ghost" onPress={() => {}} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: fontSize.xxl, fontWeight: '700', marginBottom: spacing.sm },
  description: { fontSize: fontSize.md, marginBottom: spacing.xl },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
  otpInput: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: fontSize.xxl,
    fontWeight: '600',
  },
  verifyBtn: { marginTop: spacing.md },
});
