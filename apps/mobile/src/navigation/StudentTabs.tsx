import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { StudentAttendanceScreen } from '../screens/student/StudentAttendanceScreen';
import { StudentAssignmentsScreen } from '../screens/student/StudentAssignmentsScreen';
import { StudentTimetableScreen } from '../screens/student/StudentTimetableScreen';
import { StudentNotificationsScreen } from '../screens/student/StudentNotificationsScreen';
import { StudentAITutorScreen } from '../screens/student/StudentAITutorScreen';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { focused: 'grid', unfocused: 'grid-outline' },
  Attendance: { focused: 'calendar', unfocused: 'calendar-outline' },
  Assignments: { focused: 'document-text', unfocused: 'document-text-outline' },
  Timetable: { focused: 'time', unfocused: 'time-outline' },
  Notifications: { focused: 'notifications', unfocused: 'notifications-outline' },
  'AI Tutor': { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
};

export function StudentTabs() {
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
          const icons = ICONS[route.name] || ICONS.Dashboard;
          return (
            <Ionicons
              name={focused ? icons.focused : icons.unfocused}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={StudentDashboardScreen} />
      <Tab.Screen name="Attendance" component={StudentAttendanceScreen} />
      <Tab.Screen name="Assignments" component={StudentAssignmentsScreen} />
      <Tab.Screen name="Timetable" component={StudentTimetableScreen} />
      <Tab.Screen name="Notifications" component={StudentNotificationsScreen} />
      <Tab.Screen name="AI Tutor" component={StudentAITutorScreen} />
    </Tab.Navigator>
  );
}
