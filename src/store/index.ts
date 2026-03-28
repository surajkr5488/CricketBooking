import {configureStore} from '@reduxjs/toolkit';
import authReducer  from './slices/authSlice';
import slotsReducer from './slices/slotsSlice';

export const store = configureStore({
  reducer: {
    auth:  authReducer,
    slots: slotsReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
