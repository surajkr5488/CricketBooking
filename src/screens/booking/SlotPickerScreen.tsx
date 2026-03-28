import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchSlots } from '../../store/slices/slotsSlice';
import { usePitchSocket } from '../../hooks/usePitchSocket';
import { bookingApi } from '../../api/client';
import { BookingStackParamList, Slot } from '../../types';

type Route = RouteProp<BookingStackParamList, 'SlotPicker'>;
type Nav = NativeStackNavigationProp<BookingStackParamList, 'SlotPicker'>;


function Countdown({ expiresAt }: { expiresAt: string }) {
  const [secs, setSecs] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );
  useEffect(() => {
    if (secs <= 0) { return; }
    const id = setInterval(() => setSecs(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(id);
  }, [secs]);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return (
    <Text style={cd.text}>⏱ {m}:{String(s).padStart(2, '0')}</Text>
  );
}
const cd = StyleSheet.create({ text: { fontSize: 12, color: '#F59E0B', fontWeight: '600' } });


function SlotCard({ slot, onPress, busy }: { slot: Slot; onPress(): void; busy: boolean }) {
  const avail = slot.status === 'available';
  const reserved = slot.status === 'reserved';
  const booked = slot.status === 'booked';

  const borderColor = booked ? '#EF4444' : reserved ? '#F59E0B' : '#22C55E';
  const badgeColor = borderColor;
  const badgeLabel = booked ? 'Booked' : reserved ? 'Held' : 'Available';
  const timeColor = avail ? '#F1F5F9' : '#64748B';

  return (
    <TouchableOpacity
      style={[s.slotCard, { borderColor }]}
      onPress={onPress}
      disabled={!avail || busy}
      activeOpacity={0.75}>
      <View>
        <Text style={[s.slotTime, { color: timeColor }]}>
          {slot.startTime} – {slot.endTime}
        </Text>
        {reserved && slot.expiresAt && <Countdown expiresAt={slot.expiresAt} />}
      </View>
      <View style={[s.badge, { backgroundColor: badgeColor + '22' }]}>
        <Text style={[s.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}


export default function SlotPickerScreen() {
  const route = useRoute<Route>();
  const nav = useNavigation<Nav>();
  const { pitch, date } = route.params;

  const dispatch = useAppDispatch();
  const { slots, loading } = useAppSelector(st => st.slots);
  const [busy, setBusy] = useState(false);


  usePitchSocket(pitch.id, date);

  useEffect(() => {
    dispatch(fetchSlots({ pitchId: pitch.id, date }));
  }, [pitch.id, date, dispatch]);

  const handlePress = async (slot: Slot) => {
    if (slot.status !== 'available') { return; }
    setBusy(true);
    try {
      await bookingApi.reserve({ pitchId: pitch.id, slotId: slot.id, date });
      nav.navigate('BookingConfirm', { pitch, slot, date });
    } catch (err: any) {
      Alert.alert('Unavailable', err.response?.data?.error || 'Could not reserve slot.');
    } finally { setBusy(false); }
  };

  const available = slots.filter(sl => sl.status === 'available').length;
  const booked = slots.filter(sl => sl.status === 'booked').length;

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <SafeAreaView style={s.safe}>
      {/* Pitch banner */}
      <View style={s.banner}>
        <Text style={s.bannerDate}>📅 {formattedDate}</Text>
        <Text style={s.bannerLoc}>📍 {pitch.location}</Text>
        <Text style={s.bannerPrice}>₹{pitch.pricePerHour} / hour</Text>
      </View>

      {/* Legend */}
      <View style={s.legend}>
        {[
          { color: '#22C55E', label: `${available} Available` },
          { color: '#F59E0B', label: 'Held' },
          { color: '#EF4444', label: `${booked} Booked` },
        ].map(({ color, label }) => (
          <View key={label} style={s.legendItem}>
            <View style={[s.dot, { backgroundColor: color }]} />
            <Text style={s.legendText}>{label}</Text>
          </View>
        ))}
        <View style={s.liveRow}>
          <View style={[s.dot, { backgroundColor: '#22C55E' }]} />
          <Text style={[s.legendText, { color: '#22C55E' }]}>Live</Text>
        </View>
      </View>

      {loading
        ? <ActivityIndicator size="large" color="#22C55E" style={s.spinner} />
        : (
          <FlatList
            data={slots}
            keyExtractor={sl => sl.id}
            renderItem={({ item }) => (
              <SlotCard slot={item} onPress={() => handlePress(item)} busy={busy} />
            )}
            contentContainerStyle={s.list}
            ListEmptyComponent={
              <Text style={s.empty}>No slots available for this date.</Text>
            }
          />
        )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  banner: {
    backgroundColor: '#1E293B', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#334155'
  },
  bannerDate: { fontSize: 15, color: '#F1F5F9', fontWeight: '700' },
  bannerLoc: { fontSize: 13, color: '#64748B', marginTop: 4 },
  bannerPrice: { fontSize: 14, color: '#22C55E', marginTop: 4, fontWeight: '700' },
  legend: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 10
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#64748B' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },
  list: { padding: 16, gap: 10 },
  slotCard: {
    backgroundColor: '#1E293B', borderRadius: 14, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1.5
  },
  slotTime: { fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  spinner: { marginTop: 60 },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 60, fontSize: 15 },
});
