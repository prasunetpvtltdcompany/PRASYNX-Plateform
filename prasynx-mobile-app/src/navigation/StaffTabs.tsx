import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StaffDashboardScreen } from '../screens/staff/StaffDashboardScreen';
import { StaffAttendanceScreen } from '../screens/staff/StaffAttendanceScreen';
import { StaffStudentManagementScreen } from '../screens/staff/StaffStudentManagementScreen';
import { StaffTimetableScreen } from '../screens/staff/StaffTimetableScreen';
import { StaffAssignmentsScreen } from '../screens/staff/StaffAssignmentsScreen';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { focused: 'grid', unfocused: 'grid-outline' },
  Attendance: { focused: 'calendar', unfocused: 'calendar-outline' },
  Students: { focused: 'people', unfocused: 'people-outline' },
  Timetable: { focused: 'time', unfocused: 'time-outline' },
  Assignments: { focused: 'document-text', unfocused: 'document-text-outline' },
};

export function StaffTabs() {
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
      <Tab.Screen name="Dashboard" component={StaffDashboardScreen} />
      <Tab.Screen name="Attendance" component={StaffAttendanceScreen} />
      <Tab.Screen name="Students" component={StaffStudentManagementScreen} />
      <Tab.Screen name="Timetable" component={StaffTimetableScreen} />
      <Tab.Screen name="Assignments" component={StaffAssignmentsScreen} />
    </Tab.Navigator>
  );
}
