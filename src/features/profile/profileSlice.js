import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getAuthHeaders = (getState, isMultipart = false) => {
  const token = getState().auth.user?.token;
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

import { updateUserData } from '../auth/authSlice';

export const fetchStudentProfile = createAsyncThunk(
  'profile/fetchStudentProfile',
  async (_, thunkAPI) => {
    try {
      const response = await fetch('/api/student/profile', {
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

export const updateStudentProfile = createAsyncThunk(
  'profile/updateStudentProfile',
  async (profileData, thunkAPI) => {
    try {
      const isFormData = profileData instanceof FormData;
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: getAuthHeaders(thunkAPI.getState, isFormData),
        body: isFormData ? profileData : JSON.stringify(profileData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      thunkAPI.dispatch(updateUserData(data));
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
  },
  reducers: {
    resetProfileState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateStudentProfile.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profile = action.payload;
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;
