import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {slotApi} from '../../api/client';
import {Slot, SlotStatus} from '../../types';

interface SlotsState {
  slots:   Slot[];
  loading: boolean;
  error:   string | null;
}

const initialState: SlotsState = {
  slots:   [],
  loading: false,
  error:   null,
};

export const fetchSlots = createAsyncThunk(
  'slots/fetch',
  async (
    {pitchId, date}: {pitchId: string; date: string},
    {rejectWithValue},
  ) => {
    try {
      const {data} = await slotApi.getSlots(pitchId, date);
      return data.slots as Slot[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to load slots',
      );
    }
  },
);

const slotsSlice = createSlice({
  name: 'slots',
  initialState,
  reducers: {
    // Called by Socket.io real-time events
    updateSlotStatus(
      state,
      action: PayloadAction<{
        slotId:     string;
        status:     SlotStatus;
        expiresAt?: string;
      }>,
    ) {
      const slot = state.slots.find(s => s.id === action.payload.slotId);
      if (slot) {
        slot.status    = action.payload.status;
        slot.expiresAt = action.payload.expiresAt;
      }
    },
    clearSlots(state) {
      state.slots = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSlots.pending,   s => {s.loading = true;  s.error = null;})
      .addCase(fetchSlots.fulfilled, (s, a) => {
        s.loading = false; s.slots = a.payload;
      })
      .addCase(fetchSlots.rejected,  (s, a) => {
        s.loading = false; s.error = a.payload as string;
      });
  },
});

export const {updateSlotStatus, clearSlots} = slotsSlice.actions;
export default slotsSlice.reducer;
