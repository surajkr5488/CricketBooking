import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BookingNavigator  from './BookingNavigator';
import MyBookingsScreen  from '../screens/booking/MyBookingsScreen';
import ProfileScreen     from '../screens/profile/ProfileScreen';
import {MainTabParamList} from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({icon, focused}: {icon: string; focused: boolean}) {
  return (
    <Text style={[styles.icon, focused && styles.iconActive]}>{icon}</Text>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.bar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.label,
        tabBarActiveTintColor:   '#22C55E',
        tabBarInactiveTintColor: '#475569',
      }}>
      <Tab.Screen
        name="HomeTab"
        component={BookingNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({focused}) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({focused}) => <TabIcon icon="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({focused}) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor:  '#1E293B',
    borderTopColor:   '#334155',
    borderTopWidth:   1,
    height:           64,
    paddingBottom:    8,
    paddingTop:       6,
  },
  label: {fontSize: 11, fontWeight: '600'},
  icon:  {fontSize: 20, opacity: 0.45},
  iconActive: {opacity: 1},
});
