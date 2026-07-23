import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { StudentTabs } from './StudentTabs';
import { ParentTabs } from './ParentTabs';
import { StaffTabs } from './StaffTabs';
import { ManagementTabs } from './ManagementTabs';
import { JobProviderTabs } from './JobProviderTabs';
import { AdminTabs } from './AdminTabs';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors } from '../theme';

const Stack = createNativeStackNavigator();

function AuthStack() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
}

function RoleRouter() {
  const role = useAuthStore((s) => s.role);

  switch (role) {
    case 'student': return <StudentTabs />;
    case 'parent': return <ParentTabs />;
    case 'staff': return <StaffTabs />;
    case 'management': return <ManagementTabs />;
    case 'job_provider': return <JobProviderTabs />;
    case 'admin': return <AdminTabs />;
    default: return <StudentTabs />;
  }
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  if (isLoading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Home" component={RoleRouter} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
