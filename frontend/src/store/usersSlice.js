import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as usersApi from '../api/usersApi';

export const fetchUsers = createAsyncThunk('users/fetch', async (_, { rejectWithValue }) => {
  const result = await usersApi.listUsers();
  if (!result.ok) {
    return rejectWithValue(result.data?.detail || 'Не удалось загрузить пользователей');
  }
  return result.data;
});

export const changeAdminFlag = createAsyncThunk(
  'users/changeAdmin',
  async ({ userId, isAdmin }, { rejectWithValue }) => {
    const result = await usersApi.updateAdmin(userId, isAdmin);
    if (!result.ok) {
      return rejectWithValue(result.data?.detail || 'Не удалось изменить права');
    }
    return result.data;
  },
);

export const removeUser = createAsyncThunk('users/remove', async (userId, { rejectWithValue }) => {
  const result = await usersApi.deleteUser(userId);
  if (!result.ok) {
    return rejectWithValue(result.data?.detail || 'Не удалось удалить пользователя');
  }
  return userId;
});

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearUsers(state) {
      state.items = [];
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Не удалось загрузить пользователей';
      })
      .addCase(changeAdminFlag.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
        state.error = null;
      })
      .addCase(changeAdminFlag.rejected, (state, action) => {
        state.error = action.payload || 'Не удалось изменить права';
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.error = null;
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.error = action.payload || 'Не удалось удалить пользователя';
      });
  },
});

export const { clearUsers } = usersSlice.actions;
export default usersSlice.reducer;
