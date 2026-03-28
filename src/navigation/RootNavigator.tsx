import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '../hooks/useAppDispatch';
import {restoreSession} from '../store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import {RootStackParamList} from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const dispatch        = useAppDispatch();
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    dispatch(restoreSession()).finally(() => setBooting(false));
  }, [dispatch]);

  if (booting) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false, animation: 'fade'}}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
