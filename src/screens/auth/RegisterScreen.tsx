import React, {useState, useEffect} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView, SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '../../hooks/useAppDispatch';
import {registerUser, clearError} from '../../store/slices/authSlice';
import {AuthStackParamList} from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const nav      = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const {loading, error} = useAppSelector(s => s.auth);

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (error) {Alert.alert('Registration Failed', error); dispatch(clearError());}
  }, [error, dispatch]);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    const res = await dispatch(
      registerUser({name: name.trim(), email: email.trim().toLowerCase(), password}),
    );
    if (registerUser.fulfilled.match(res)) {
      Alert.alert('Success! 🎉', 'Account created. Please sign in.', [
        {text: 'Sign In', onPress: () => nav.navigate('Login')},
      ]);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.container}
          keyboardShouldPersistTaps="handled">

          <View style={s.header}>
            <Text style={s.logo}>🏏</Text>
            <Text style={s.title}>Create Account</Text>
            <Text style={s.subtitle}>Join and book your first pitch</Text>
          </View>

          <View style={s.card}>
            {[
              {label: 'FULL NAME',    value: name,     setter: setName,
               placeholder: 'Virat Kohli', cap: 'words' as const},
              {label: 'EMAIL',        value: email,    setter: setEmail,
               placeholder: 'you@example.com', cap: 'none' as const, kb: 'email-address' as const},
              {label: 'PASSWORD',     value: password, setter: setPassword,
               placeholder: '••••••••', secure: true, cap: 'none' as const},
            ].map(f => (
              <View key={f.label}>
                <Text style={s.label}>{f.label}</Text>
                <TextInput
                  style={s.input}
                  placeholder={f.placeholder}
                  placeholderTextColor="#64748B"
                  value={f.value}
                  onChangeText={f.setter}
                  autoCapitalize={f.cap}
                  autoCorrect={false}
                  keyboardType={f.kb}
                  secureTextEntry={f.secure}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.linkRow}
              onPress={() => nav.navigate('Login')}>
              <Text style={s.linkText}>
                Already have an account?{' '}
                <Text style={s.link}>Sign In</Text>
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
