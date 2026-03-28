import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, SafeAreaView, ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { bookingApi } from '../../api/client';
import { BookingStackParamList } from '../../types';

type Route = RouteProp<BookingStackParamList, 'BookingConfirm'>;
type Nav = NativeStackNavigationProp<BookingStackParamList, 'BookingConfirm'>;

export default function BookingConfirmScreen() {
  const route = useRoute<Route>();
  const nav = useNavigation<Nav>();
  const { pitch, slot, date } = route.params;

  const [secsLeft, setSecsLeft] = useState(120);
  const [confirming, setConfirming] = useState(false);


  useEffect(() => {
    if (secsLeft <= 0) {
      Alert.alert(
        '⏰ Reservation Expired',
        'Your 2-minute hold has expired. Please select the slot again.',
        [{ text: 'OK', onPress: () => nav.goBack() }],
      );
      return;
    }
    const id = setTimeout(() => setSecsLeft(p => p - 1), 1000);
    return () => clearTimeout(id);
  }, [secsLeft, nav]);

  const mins = Math.floor(secsLeft / 60);
  const secs = secsLeft % 60;
  const urgent = secsLeft <= 30;
  const timerBg = urgent ? '#3B1515' : '#14532D';
  const timerFg = urgent ? '#EF4444' : '#22C55E';

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const handleConfirm = async () => {
    if (secsLeft <= 0) { return; }
    setConfirming(true);
    try {
      const { data } = await bookingApi.confirm({
        pitchId: pitch.id,
        slotId: slot.id,
        date,
      });
      nav.replace('BookingSuccess', { booking: data.booking });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Booking failed. Please try again.';
      Alert.alert('Error', msg);
      if (err.response?.status === 410) { nav.goBack(); }
    } finally { setConfirming(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container}>

        {/* Timer */}
        <View style={[s.timerBox, { backgroundColor: timerBg, borderColor: timerFg }]}>
          <Text style={[s.timerLabel, { color: timerFg }]}>Slot held for</Text>
          <Text style={[s.timerValue, { color: timerFg }]}>
            {mins}:{String(secs).padStart(2, '0')}
          </Text>
          <Text style={s.timerSub}>
            {urgent ? '⚠️  Confirm now before it expires!' : 'Confirm before the timer runs out'}
          </Text>
        </View>

        {/* Summary card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Booking Summary</Text>

          {[
            { label: 'Pitch', value: pitch.name },
            { label: 'Location', value: pitch.location },
            { label: 'Date', value: formattedDate },
            { label: 'Time', value: `${slot.startTime} – ${slot.endTime}` },
          ].map(({ label, value }) => (
            <View key={label} style={s.row}>
              <Text style={s.rowLabel}>{label}</Text>
              <Text style={s.rowValue}>{value}</Text>
            </View>
          ))}

          <View style={s.divider} />

          <View style={s.row}>
            <Text style={s.totalLabel}>Total Payable</Text>
            <Text style={s.totalValue}>₹{pitch.pricePerHour}</Text>
          </View>
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          style={[s.btn, (confirming || secsLeft <= 0) && s.btnDisabled]}
          onPress={handleConfirm}
          disabled={confirming || secsLeft <= 0}
          activeOpacity={0.85}>
          {confirming
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>✅  Confirm Booking</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelBtn} onPress={() => nav.goBack()}>
          <Text style={s.cancelText}>Cancel — release slot</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  container: { padding: 20, gap: 16 },
  timerBox: {
    borderRadius: 18, padding: 22, alignItems: 'center',
    borderWidth: 2
  },
  timerLabel: { fontSize: 13, fontWeight: '600' },
  timerValue: {
    fontSize: 56, fontWeight: '900', marginVertical: 4,
    fontVariant: ['tabular-nums']
  },
  timerSub: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },
  card: {
    backgroundColor: '#1E293B', borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: '#334155'
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#F1F5F9', marginBottom: 16 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12
  },
  rowLabel: { fontSize: 14, color: '#64748B', flex: 1 },
  rowValue: {
    fontSize: 14, color: '#F1F5F9', fontWeight: '600',
    flex: 2, textAlign: 'right'
  },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 8 },
  totalLabel: { fontSize: 16, color: '#F1F5F9', fontWeight: '700' },
  totalValue: { fontSize: 22, color: '#22C55E', fontWeight: '900' },
  btn: {
    backgroundColor: '#22C55E', borderRadius: 14,
    paddingVertical: 18, alignItems: 'center'
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: '#64748B', fontSize: 14 },
});
