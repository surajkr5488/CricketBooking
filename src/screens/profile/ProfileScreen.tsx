import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { logoutUser } from '../../store/slices/authSlice';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  const handleLogout = () =>
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => dispatch(logoutUser()) },
    ]);

  const menuItems = [
    { icon: '🔔', label: 'Notifications', sub: 'Manage alert preferences' },
    { icon: '🔒', label: 'Change Password', sub: 'Update your credentials' },
    { icon: '📞', label: 'Support', sub: 'Contact our team' },
    { icon: '📋', label: 'Terms & Privacy', sub: 'Legal information' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container}>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.name}>{user?.name}</Text>
          <Text style={s.email}>{user?.email}</Text>
          <View style={s.memberBadge}>
            <Text style={s.memberText}>🏅 Cricket Member</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={s.menu}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[s.menuItem, idx === menuItems.length - 1 && s.menuItemLast]}
              activeOpacity={0.7}>
              <Text style={s.menuIcon}>{item.icon}</Text>
              <View style={s.menuText}>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={s.menuSub}>{item.sub}</Text>
              </View>
              <Text style={s.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>



        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={s.logoutText}>🚪  Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  container: { padding: 20, alignItems: 'center', gap: 16 },
  avatarWrap: { alignItems: 'center', paddingVertical: 8 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: '#22C55E', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#F1F5F9' },
  email: { fontSize: 14, color: '#64748B', marginTop: 4 },
  memberBadge: {
    marginTop: 10, backgroundColor: '#1E3A5F',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20
  },
  memberText: { color: '#60A5FA', fontSize: 13, fontWeight: '600' },
  menu: {
    backgroundColor: '#1E293B', borderRadius: 18,
    width: '100%', overflow: 'hidden',
    borderWidth: 1, borderColor: '#334155'
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14, gap: 14,
    borderBottomWidth: 1, borderBottomColor: '#334155'
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: { fontSize: 22, width: 28 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#F1F5F9' },
  menuSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  menuArrow: { fontSize: 20, color: '#475569' },
  version: { fontSize: 12, color: '#334155' },
  logoutBtn: {
    width: '100%', backgroundColor: '#3B1515', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#EF4444'
  },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});
