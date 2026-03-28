
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}


export interface Pitch {
  id: string;
  name: string;
  location: string;
  pricePerHour: number;
}


export type SlotStatus = 'available' | 'reserved' | 'booked';

export interface Slot {
  id: string;
  pitchId: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  expiresAt?: string;
}


export interface BookingPitch {
  name: string;
  location: string;
  pricePerHour: number;
}

export interface Booking {
  id: string;
  pitch: BookingPitch;
  slotId: string;
  bookingDate: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}


export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  BookingsTab: undefined;
  ProfileTab: undefined;
};

export type BookingStackParamList = {
  PitchList: undefined;
  SlotPicker: { pitch: Pitch; date: string };
  BookingConfirm: { pitch: Pitch; slot: Slot; date: string };
  BookingSuccess: { booking: Booking };
};
