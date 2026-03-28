import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { BookingStackParamList } from '../../types';

type Route = RouteProp<BookingStackParamList, 'BookingSuccess'>;

export default function BookingSuccessScreen() {
  const route = useRoute<Route>();
  const nav = useNavigation();
  const { booking } = route.params;

  const goHome = () =>
    nav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));

  const formattedDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });


  const hour = parseInt(booking.slotId.split('_')[2], 10);
  const pad = (h: number) => `${String(h).padStart(2, '0')}:00`;
  const timeStr = `${pad(hour)} – ${pad(hour + 1)}`;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container}>

        {/* Icon */}
        <View style={s.iconWrap}>
          <Text style={s.icon}>🎉</Text>
        </View>
        <Text style={s.title}>Booking Confirmed!</Text>
        <Text style={s.subtitle}>Your pitch is reserved. See you on the ground!</Text>

        {/* Ticket */}
        <View style={s.ticket}>
          <View style={s.ticketHeader}>
            <Text style={s.ticketEmoji}>🏏</Text>
            <Text style={s.ticketPitch}>{booking.pitch.name}</Text>
          </View>

          {/* Tear-line */}
          <View style={s.tearRow}>
            <View style={s.cutCircle} />
            <View style={s.dashes} />
            <View style={s.cutCircle} />
          </View>

          {[
            { icon: '📍', label: 'Location', value: booking.pitch.location },
            { icon: '📅', label: 'Date', value: formattedDate },
            { icon: '⏰', label: 'Time Slot', value: timeStr },
            { icon: '💰', label: 'Amount Paid', value: `₹${booking.pitch.pricePerHour}` },
            { icon: '🆔', label: 'Booking ID', value: booking.id.slice(0, 8).toUpperCase() },
          ].map(({ icon, label, value }) => (
            <View key={label} style={s.ticketRow}>
              <Text style={s.ticketIcon}>{icon}</Text>
              <Text style={s.ticketLabel}>{label}</Text>
              <Text style={s.ticketValue}>{value}</Text>
            </View>
          ))}

          <View style={s.statusBadge}>
            <Text style={s.statusText}>✓  CONFIRMED</Text>
          </View>
        </View>

        <TouchableOpacity style={s.btn} onPress={goHome} activeOpacity={0.85}>
          <Text style={s.btnText}>Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  container: { padding: 24, alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#14532D', alignItems: 'center',
    justifyContent: 'center', marginTop: 8
  },
  icon: { fontSize: 52 },
  title: { fontSize: 26, fontWeight: '900', color: '#F1F5F9', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center' },
  ticket: {
    backgroundColor: '#1E293B', borderRadius: 20, padding: 22,
    width: '100%', borderWidth: 1, borderColor: '#334155'
  },
  ticketHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  ticketEmoji: { fontSize: 28 },
  ticketPitch: { fontSize: 20, fontWeight: '800', color: '#F1F5F9' },
  tearRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: -22, marginBottom: 16
  },
  cutCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#0F172A' },
  dashes: { flex: 1, borderTopWidth: 1.5, borderColor: '#334155', borderStyle: 'dashed' },
  ticketRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, gap: 10
  },
  ticketIcon: { fontSize: 16, width: 24 },
  ticketLabel: { fontSize: 13, color: '#64748B', width: 90 },
  ticketValue: { fontSize: 14, color: '#F1F5F9', fontWeight: '600', flex: 1 },
  statusBadge: {
    marginTop: 16, backgroundColor: '#14532D', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center'
  },
  statusText: { color: '#22C55E', fontWeight: '800', fontSize: 14, letterSpacing: 1.5 },
  btn: {
    width: '100%', backgroundColor: '#22C55E', borderRadius: 14,
    paddingVertical: 18, alignItems: 'center', marginTop: 4
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
