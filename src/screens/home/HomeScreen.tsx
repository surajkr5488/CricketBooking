import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { pitchApi } from '../../api/client';
import { Pitch, BookingStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<BookingStackParamList, 'PitchList'>;

const PITCH_EMOJI: Record<string, string> = {
  'Turf Ground': '🌿',
  'Box Cricket': '📦',
  'Indoor Nets': '🏟️',
};

function getNext7Days(): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));

  const load = useCallback(async () => {
    try {
      const { data } = await pitchApi.getAll();
      setPitches(data.pitches);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const days = getNext7Days();


  const renderDay = (d: Date) => {
    const str = toDateStr(d);
    const selected = str === selectedDate;
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
    return (
      <TouchableOpacity
        key={str}
        style={[s.pill, selected && s.pillActive]}
        onPress={() => setSelectedDate(str)}>
        <Text style={[s.pillDay, selected && s.pillTextActive]}>{dayName}</Text>
        <Text style={[s.pillNum, selected && s.pillTextActive]}>{d.getDate()}</Text>
      </TouchableOpacity>
    );
  };


  const renderPitch = ({ item }: { item: Pitch }) => (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.8}
      onPress={() => nav.navigate('SlotPicker', { pitch: item, date: selectedDate })}>
      <View style={s.cardLeft}>
        <Text style={s.cardEmoji}>{PITCH_EMOJI[item.name] ?? '🏏'}</Text>
        <View style={s.cardInfo}>
          <Text style={s.cardName}>{item.name}</Text>
          <Text style={s.cardLoc}>📍 {item.location}</Text>
        </View>
      </View>
      <View style={s.cardRight}>
        <Text style={s.price}>₹{item.pricePerHour}</Text>
        <Text style={s.priceLabel}>/hr</Text>
        <Text style={s.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerEmoji}>🏏</Text>
        <View>
          <Text style={s.headerTitle}>Book a Pitch</Text>
          <Text style={s.headerSub}>Select date & venue</Text>
        </View>
      </View>

      {/* Date strip */}
      <Text style={s.sectionLabel}>SELECT DATE</Text>
      <FlatList
        horizontal
        data={days}
        keyExtractor={d => toDateStr(d)}
        renderItem={({ item }) => renderDay(item)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.dayList}
      />

      {/* Pitches */}
      <Text style={s.sectionLabel}>AVAILABLE PITCHES</Text>
      {loading
        ? <ActivityIndicator size="large" color="#22C55E" style={s.spinner} />
        : (
          <FlatList
            data={pitches}
            keyExtractor={p => p.id}
            renderItem={renderPitch}
            contentContainerStyle={s.pitchList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); load(); }}
                tintColor="#22C55E"
              />
            }
            ListEmptyComponent={
              <Text style={s.empty}>No pitches found</Text>
            }
          />
        )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16
  },
  headerEmoji: { fontSize: 36 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#F1F5F9' },
  headerSub: { fontSize: 14, color: '#64748B', marginTop: 2 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#475569',
    letterSpacing: 1, paddingHorizontal: 20, marginBottom: 10
  },
  dayList: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  pill: {
    backgroundColor: '#1E293B', borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 14,
    alignItems: 'center', minWidth: 54,
    borderWidth: 1, borderColor: '#334155'
  },
  pillActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  pillDay: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  pillNum: { fontSize: 18, color: '#F1F5F9', fontWeight: '800', marginTop: 2 },
  pillTextActive: { color: '#fff' },
  pitchList: { paddingHorizontal: 16, gap: 12, paddingBottom: 20 },
  card: {
    backgroundColor: '#1E293B', borderRadius: 18, padding: 18,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: '#334155'
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  cardEmoji: { fontSize: 32 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 17, fontWeight: '700', color: '#F1F5F9' },
  cardLoc: { fontSize: 13, color: '#64748B', marginTop: 3 },
  cardRight: { alignItems: 'flex-end' },
  price: { fontSize: 20, fontWeight: '800', color: '#22C55E' },
  priceLabel: { fontSize: 12, color: '#64748B' },
  arrow: { fontSize: 22, color: '#475569', marginTop: 4 },
  spinner: { marginTop: 60 },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 60, fontSize: 16 },
});
