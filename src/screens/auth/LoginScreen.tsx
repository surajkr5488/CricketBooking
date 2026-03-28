import React, {useState, useEffect} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView, SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '../../hooks/useAppDispatch';
import {loginUser, clearError} from '../../store/slices/authSlice';
import {AuthStackParamList} from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const nav      = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const {loading, error} = useAppSelector(s => s.auth);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (error) {Alert.alert('Login Failed', error); dispatch(clearError());}
  }, [error, dispatch]);

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    dispatch(loginUser({email: email.trim().toLowerCase(), password}));
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.container}
          keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={s.header}>
            <Text style={s.logo}>🏏</Text>
            <Text style={s.title}>Cricket Booking</Text>
            <Text style={s.subtitle}>Sign in to your account</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.label}>EMAIL</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <Text style={s.label}>PASSWORD</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Sign In</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.linkRow}
              onPress={() => nav.navigate('Register')}>
              <Text style={s.linkText}>
                Don't have an account?{' '}
                <Text style={s.link}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        {flex: 1, backgroundColor: '#0F172A'},
  kav:         {flex: 1},
  container:   {flexGrow: 1, justifyContent: 'center', padding: 24},
  header:      {alignItems: 'center', marginBottom: 36},
  logo:        {fontSize: 60, marginBottom: 12},
  title:       {fontSize: 28, fontWeight: '800', color: '#F1F5F9', letterSpacing: -0.5},
  subtitle:    {fontSize: 15, color: '#64748B', marginTop: 4},
  card:        {backgroundColor: '#1E293B', borderRadius: 20, padding: 24,
                borderWidth: 1, borderColor: '#334155'},
  label:       {fontSize: 11, fontWeight: '700', color: '#64748B',
                letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase'},
  input:       {backgroundColor: '#0F172A', borderRadius: 12, paddingHorizontal: 16,
                paddingVertical: 14, fontSize: 16, color: '#F1F5F9',
                marginBottom: 16, borderWidth: 1, borderColor: '#334155'},
  btn:         {backgroundColor: '#22C55E', borderRadius: 12,
                paddingVertical: 16, alignItems: 'center', marginTop: 4},
  btnDisabled: {opacity: 0.6},
  btnText:     {color: '#fff', fontSize: 16, fontWeight: '700'},
  linkRow:     {alignItems: 'center', marginTop: 18},
  linkText:    {color: '#64748B', fontSize: 14},
  link:        {color: '#22C55E', fontWeight: '700'},
});
