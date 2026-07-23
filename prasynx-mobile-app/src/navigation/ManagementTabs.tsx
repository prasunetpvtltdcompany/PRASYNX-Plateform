import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ManagementDashboardScreen } from '../screens/management/ManagementDashboardScreen';
import { ManagementReportsScreen } from '../screens/management/ManagementReportsScreen';
import { ManagementStaffScreen } from '../screens/management/ManagementStaffScreen';
import { ManagementFinanceScreen } from '../screens/management/ManagementFinanceScreen';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { focused: 'grid', unfocused: 'grid-outline' },
  Reports: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
  Staff: { focused: 'people', unfocused: 'people-outline' },
  Finance: { focused: 'wallet', unfocused: 'wallet-outline' },
};

export function ManagementTabs() {
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
      <Tab.Screen name="Dashboard" component={ManagementDashboardScreen} />
      <Tab.Screen name="Reports" component={ManagementReportsScreen} />
      <Tab.Screen name="Staff" component={ManagementStaffScreen} />
      <Tab.Screen name="Finance" component={ManagementFinanceScreen} />
    </Tab.Navigator>
  );
}
