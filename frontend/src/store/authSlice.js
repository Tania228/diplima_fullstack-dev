import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as authApi from '../api/authApi';

export const fetchCurrentUser = createAsyncThunk('auth/me', async () => {
  const result = await authApi.me();
  if (result.status === 401) {
    return null;
  }
  if (!result.ok) {
    throw new Error(result.data?.detail || 'Не удалось получить профиль');
  }
  return result.data;
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  const result = await authApi.login(payload);
  if (!result.ok) {
    return rejectWithValue(result.data || { detail: 'Не удалось войти' });
  }
  return result.data;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    initialized: false,
    submitting: false,
    error: null,
  },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.initialized = true;
      })
      .addCase(login.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.submitting = false;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.detail || 'Не удалось войти';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
