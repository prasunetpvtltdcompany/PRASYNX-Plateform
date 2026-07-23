import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { JobProviderDashboardScreen } from '../screens/jobprovider/JobProviderDashboardScreen';
import { JobProviderPostJobScreen } from '../screens/jobprovider/JobProviderPostJobScreen';
import { JobProviderApplicantsScreen } from '../screens/jobprovider/JobProviderApplicantsScreen';
import { JobProviderInterviewsScreen } from '../screens/jobprovider/JobProviderInterviewsScreen';
import { JobProviderAnalyticsScreen } from '../screens/jobprovider/JobProviderAnalyticsScreen';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { focused: 'grid', unfocused: 'grid-outline' },
  'Post Job': { focused: 'add-circle', unfocused: 'add-circle-outline' },
  Applicants: { focused: 'people', unfocused: 'people-outline' },
  Interviews: { focused: 'calendar', unfocused: 'calendar-outline' },
  Analytics: { focused: 'bar-chart', unfocused: 'bar-chart-outline' },
};

export function JobProviderTabs() {
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
      <Tab.Screen name="Dashboard" component={JobProviderDashboardScreen} />
      <Tab.Screen name="Post Job" component={JobProviderPostJobScreen} />
      <Tab.Screen name="Applicants" component={JobProviderApplicantsScreen} />
      <Tab.Screen name="Interviews" component={JobProviderInterviewsScreen} />
      <Tab.Screen name="Analytics" component={JobProviderAnalyticsScreen} />
    </Tab.Navigator>
  );
}
