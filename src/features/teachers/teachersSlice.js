import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getAuthHeaders = (getState) => {
  const token = getState().auth.user?.token;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const fetchTeachers = createAsyncThunk(
  'teachers/fetchTeachers',
  async (params = {}, thunkAPI) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    try {
      const response = await fetch(`/api/admin/teachers?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders(thunkAPI.getState),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const createTeacher = createAsyncThunk(
  'teachers/createTeacher',
  async (teacherData, thunkAPI) => {
    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify(teacherData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateTeacher = createAsyncThunk(
  'teachers/updateTeacher',
  async ({ id, teacherData }, thunkAPI) => {
    try {
      const response = await fetch(`/api/admin/teachers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify(teacherData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  'teachers/deleteTeacher',
  async (id, thunkAPI) => {
    try {
      const response = await fetch(`/api/admin/teachers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(thunkAPI.getState),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const teachersSlice = createSlice({
  name: 'teachers',
  initialState: {
    teachers: [],
    pagination: { total: 0, page: 1, totalPages: 1, limit: 10 },
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetTeachersState: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.teachers = action.payload.data;
          state.pagination = {
            total: action.payload.total,
            page: action.payload.page,
            totalPages: action.payload.totalPages,
            limit: action.payload.limit,
          };
        } else {
          state.teachers = action.payload;
        }
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.teachers.unshift(action.payload);
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        const index = state.teachers.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.teachers[index] = action.payload;
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.teachers = state.teachers.filter((t) => t._id !== action.payload);
      });
  },
});

export const { resetTeachersState } = teachersSlice.actions;
export default teachersSlice.reducer;
