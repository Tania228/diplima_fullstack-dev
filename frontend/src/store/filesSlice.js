import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as filesApi from '../api/filesApi';

export const fetchFiles = createAsyncThunk('files/fetch', async (userId, { rejectWithValue }) => {
  const result = await filesApi.listFiles(userId);
  if (!result.ok) {
    return rejectWithValue(result.data?.detail || 'Не удалось загрузить файлы');
  }
  return result.data;
});

export const uploadFile = createAsyncThunk('files/upload', async (payload, { rejectWithValue }) => {
  const result = await filesApi.uploadFile(payload);
  if (!result.ok) {
    return rejectWithValue(result.data?.detail || 'Не удалось загрузить файл');
  }
  return result.data;
});

export const renameFile = createAsyncThunk('files/rename', async ({ fileId, name }, { rejectWithValue }) => {
  const result = await filesApi.renameFile(fileId, name);
  if (!result.ok) {
    return rejectWithValue(result.data?.detail || 'Не удалось переименовать файл');
  }
  return result.data;
});

export const changeComment = createAsyncThunk('files/comment', async ({ fileId, comment }, { rejectWithValue }) => {
  const result = await filesApi.updateComment(fileId, comment);
  if (!result.ok) {
    return rejectWithValue(result.data?.detail || 'Не удалось сохранить комментарий');
  }
  return result.data;
});

export const removeFile = createAsyncThunk('files/remove', async (fileId, { rejectWithValue }) => {
  const result = await filesApi.deleteFile(fileId);
  if (!result.ok) {
    return rejectWithValue(result.data?.detail || 'Не удалось удалить файл');
  }
  return fileId;
});

function replaceFile(state, file) {
  state.items = state.items.map((item) => (item.id === file.id ? file : item));
  state.filesSize = state.items.reduce((sum, item) => sum + item.size, 0);
}

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    owner: null,
    items: [],
    filesCount: 0,
    filesSize: 0,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearFiles(state) {
      state.owner = null;
      state.items = [];
      state.filesCount = 0;
      state.filesSize = 0;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.owner = action.payload.owner;
        state.items = action.payload.files;
        state.filesCount = action.payload.files_count;
        state.filesSize = action.payload.files_size;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Не удалось загрузить файлы';
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.filesCount = state.items.length;
        state.filesSize = state.items.reduce((sum, item) => sum + item.size, 0);
        state.error = null;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.error = action.payload || 'Не удалось загрузить файл';
      })
      .addCase(renameFile.fulfilled, (state, action) => {
        replaceFile(state, action.payload);
        state.error = null;
      })
      .addCase(renameFile.rejected, (state, action) => {
        state.error = action.payload || 'Не удалось переименовать файл';
      })
      .addCase(changeComment.fulfilled, (state, action) => {
        replaceFile(state, action.payload);
        state.error = null;
      })
      .addCase(changeComment.rejected, (state, action) => {
        state.error = action.payload || 'Не удалось сохранить комментарий';
      })
      .addCase(removeFile.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.filesCount = state.items.length;
        state.filesSize = state.items.reduce((sum, item) => sum + item.size, 0);
        state.error = null;
      })
      .addCase(removeFile.rejected, (state, action) => {
        state.error = action.payload || 'Не удалось удалить файл';
      });
  },
});

export const { clearFiles } = filesSlice.actions;
export default filesSlice.reducer;
