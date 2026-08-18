import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ParentDashboardScreen } from '../screens/parent/ParentDashboardScreen';
import { ParentAttendanceScreen } from '../screens/parent/ParentAttendanceScreen';
import { ParentFeesScreen } from '../screens/parent/ParentFeesScreen';
import { ParentResultsScreen } from '../screens/parent/ParentResultsScreen';
import { ParentNotificationsScreen } from '../screens/parent/ParentNotificationsScreen';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { focused: 'grid', unfocused: 'grid-outline' },
  Attendance: { focused: 'calendar', unfocused: 'calendar-outline' },
  Fees: { focused: 'wallet', unfocused: 'wallet-outline' },
  Results: { focused: 'trophy', unfocused: 'trophy-outline' },
  Notifications: { focused: 'notifications', unfocused: 'notifications-outline' },
};

export function ParentTabs() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = isDark ? darkColors : lightColors;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = ICONS[route.name] || { focused: 'grid', unfocused: 'grid-outline' };
          return <Ionicons name={focused ? icons.focused : icons.unfocused} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={ParentDashboardScreen} />
      <Tab.Screen name="Attendance" component={ParentAttendanceScreen} />
      <Tab.Screen name="Fees" component={ParentFeesScreen} />
      <Tab.Screen name="Results" component={ParentResultsScreen} />
      <Tab.Screen name="Notifications" component={ParentNotificationsScreen} />
    </Tab.Navigator>
  );
}
