import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, SafeAreaView, Alert,
} from 'react-native';
import {bookingApi} from '../../api/client';
import {Booking} from '../../types';

function BookingCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel(): void;
}) {
  const confirmed = booking.status === 'CONFIRMED';
  const isPast    = new Date(booking.bookingDate) < new Date();

  const hour    = parseInt(booking.slotId.split('_')[2], 10);
  const pad     = (h: number) => `${String(h).padStart(2, '0')}:00`;
  const timeStr = `${pad(hour)} – ${pad(hour + 1)}`;

  const formattedDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  const confirmCancel = () =>
    Alert.alert('Cancel Booking', 'Are you sure? This cannot be undone.', [
      {text: 'No',  style: 'cancel'},
      {text: 'Yes', style: 'destructive', onPress: onCancel},
    ]);

  return (
    <View style={[s.card, !confirmed && s.cardCancelled]}>
      <View style={s.cardHead}>
        <Text style={s.cardPitch}>{booking.pitch.name}</Text>
        <View style={[s.badge,
          confirmed ? s.badgeGreen : s.badgeRed]}>
          <Text style={[s.badgeText,
            confirmed ? s.badgeTextGreen : s.badgeTextRed]}>
            {confirmed ? 'Confirmed' : 'Cancelled'}
          </Text>
        </View>
      </View>

      {[
        {icon: '📍', text: booking.pitch.location},
        {icon: '📅', text: formattedDate},
        {icon: '⏰', text: timeStr},
        {icon: '💰', text: `₹${booking.pitch.pricePerHour}`},
      ].map(({icon, text}) => (
        <View key={icon} style={s.detailRow}>
          <Text style={s.detailIcon}>{icon}</Text>
          <Text style={s.detailText}>{text}</Text>
        </View>
      ))}

      {confirmed && !isPast && (
        <TouchableOpacity style={s.cancelBtn} onPress={confirmCancel}>
          <Text style={s.cancelText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}
      {confirmed && isPast && (
        <View style={s.completedBadge}>
          <Text style={s.completedText}>Completed</Text>
        </View>
      )}
    </View>
  );
}

export default function MyBookingsScreen() {
  const [bookings,   setBookings]   = useState<Booking[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const {data} = await bookingApi.getMyBookings();
      setBookings(data.bookings);
    } catch {}
    finally {setLoading(false); setRefreshing(false);}
  }, []);

  useEffect(() => {load();}, [load]);

  const handleCancel = async (id: string) => {
    try {
      await bookingApi.cancel(id);
      setBookings(prev =>
        prev.map(b => b.id === id ? {...b, status: 'CANCELLED'} : b),
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Could not cancel booking.');
    }
  };

  const upcoming = bookings.filter(
    b => b.status === 'CONFIRMED' && new Date(b.bookingDate) >= new Date(),
  ).length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>My Bookings</Text>
        <Text style={s.sub}>{upcoming} upcoming</Text>
      </View>

      {loading
        ? <ActivityIndicator size="large" color="#22C55E" style={s.spinner} />
        : (
          <FlatList
            data={bookings}
            keyExtractor={b => b.id}
            renderItem={({item}) => (
              <BookingCard booking={item} onCancel={() => handleCancel(item.id)} />
            )}
            contentContainerStyle={s.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {setRefreshing(true); load();}}
                tintColor="#22C55E"
              />
            }
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={s.emptyEmoji}>🏏</Text>
                <Text style={s.emptyText}>No bookings yet</Text>
                <Text style={s.emptySub}>Book your first pitch from Home</Text>
              </View>
            }
          />
        )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              {flex: 1, backgroundColor: '#0F172A'},
  header:            {paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16},
  title:             {fontSize: 26, fontWeight: '900', color: '#F1F5F9'},
  sub:               {fontSize: 14, color: '#64748B', marginTop: 4},
  list:              {padding: 16, gap: 14},
  card:              {backgroundColor: '#1E293B', borderRadius: 18, padding: 18,
                      borderWidth: 1, borderColor: '#334155'},
  cardCancelled:     {opacity: 0.55},
  cardHead:          {flexDirection: 'row', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 14},
  cardPitch:         {fontSize: 18, fontWeight: '800', color: '#F1F5F9', flex: 1},
  badge:             {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20},
  badgeGreen:        {backgroundColor: '#14532D'},
  badgeRed:          {backgroundColor: '#3B1515'},
  badgeText:         {fontSize: 11, fontWeight: '700'},
  badgeTextGreen:    {color: '#22C55E'},
  badgeTextRed:      {color: '#EF4444'},
  detailRow:         {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8},
  detailIcon:        {fontSize: 14, width: 20},
  detailText:        {fontSize: 14, color: '#94A3B8'},
  cancelBtn:         {marginTop: 12, borderWidth: 1, borderColor: '#EF4444',
                      borderRadius: 10, paddingVertical: 10, alignItems: 'center'},
  cancelText:        {color: '#EF4444', fontWeight: '700', fontSize: 14},
  completedBadge:    {marginTop: 12, backgroundColor: '#1E3A5F', borderRadius: 10,
                      paddingVertical: 8, alignItems: 'center'},
  completedText:     {color: '#60A5FA', fontWeight: '600', fontSize: 13},
  spinner:           {marginTop: 60},
  empty:             {alignItems: 'center', marginTop: 80, gap: 10},
  emptyEmoji:        {fontSize: 56},
  emptyText:         {fontSize: 20, fontWeight: '800', color: '#F1F5F9'},
  emptySub:          {fontSize: 14, color: '#64748B'},
});
