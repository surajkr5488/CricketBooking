import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen           from '../screens/home/HomeScreen';
import SlotPickerScreen     from '../screens/booking/SlotPickerScreen';
import BookingConfirmScreen from '../screens/booking/BookingConfirmScreen';
import BookingSuccessScreen from '../screens/booking/BookingSuccessScreen';
import {BookingStackParamList} from '../types';

const Stack = createNativeStackNavigator<BookingStackParamList>();

export default function BookingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      {backgroundColor: '#1E293B'},
        headerTintColor:  '#F1F5F9',
        headerTitleStyle: {fontWeight: '700', fontSize: 17},
        contentStyle:     {backgroundColor: '#0F172A'},
        animation:        'slide_from_right',
      }}>
      <Stack.Screen
        name="PitchList"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SlotPicker"
        component={SlotPickerScreen}
        options={({route}) => ({title: route.params.pitch.name})}
      />
      <Stack.Screen
        name="BookingConfirm"
        component={BookingConfirmScreen}
        options={{title: 'Confirm Booking'}}
      />
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{headerShown: false, gestureEnabled: false}}
      />
    </Stack.Navigator>
  );
}
