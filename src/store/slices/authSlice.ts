import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Storage } from '../../utils/storage';
import { authApi } from '../../api/client';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};


export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(credentials);
      await Storage.set('accessToken', data.accessToken);
      await Storage.set('refreshToken', data.refreshToken);
      return data.user as User;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 'Login failed. Check your credentials.',
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    payload: { name: string; email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await authApi.register(payload);
      return data.user as User;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || 'Registration failed.',
      );
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } finally {
    await Storage.clearAll();
  }
});

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await Storage.get('accessToken');
      if (!token) { return rejectWithValue('no token'); }
      const { data } = await authApi.me();
      return data.user as User;
    } catch {
      await Storage.clearAll();
      return rejectWithValue('session expired');
    }
  },
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: builder => {
    // login
    builder
      .addCase(loginUser.pending, s => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false; s.user = a.payload; s.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false; s.error = a.payload as string;
      });

    // register
    builder
      .addCase(registerUser.pending, s => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, s => { s.loading = false; })
      .addCase(registerUser.rejected, (s, a) => {
        s.loading = false; s.error = a.payload as string;
      });

    // logout
    builder.addCase(logoutUser.fulfilled, s => {
      s.user = null; s.isAuthenticated = false;
    });

    // restore session
    builder
      .addCase(restoreSession.fulfilled, (s, a) => {
        s.user = a.payload; s.isAuthenticated = true;
      })
      .addCase(restoreSession.rejected, s => {
        s.user = null; s.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
