import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateUserData } from '../auth/authSlice';

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

// ==========================================
// STUDENT PROFILE THUNKS
// ==========================================
export const fetchStudentProfile = createAsyncThunk(
  'profile/fetchStudentProfile',
  async (_, thunkAPI) => {
    try {
      const response = await fetch('/api/student/profile', {
        headers: getAuthHeaders(thunkAPI.getState),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message || 'Failed to fetch student profile');
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
      if (!response.ok) return thunkAPI.rejectWithValue(data.message || 'Failed to update student profile');
      thunkAPI.dispatch(updateUserData(data));
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ==========================================
// ADMIN PROFILE THUNKS
// ==========================================
export const fetchAdminProfile = createAsyncThunk(
  'profile/fetchAdminProfile',
  async (_, thunkAPI) => {
    try {
      const response = await fetch('/api/admin/profile', {
        headers: getAuthHeaders(thunkAPI.getState),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message || 'Failed to fetch admin profile');
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateAdminProfile = createAsyncThunk(
  'profile/updateAdminProfile',
  async (profileData, thunkAPI) => {
    try {
      const isFormData = profileData instanceof FormData;
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: getAuthHeaders(thunkAPI.getState, isFormData),
        body: isFormData ? profileData : JSON.stringify(profileData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message || 'Failed to update admin profile');
      thunkAPI.dispatch(updateUserData(data));
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const changeAdminPassword = createAsyncThunk(
  'profile/changeAdminPassword',
  async (passwordData, thunkAPI) => {
    try {
      const response = await fetch('/api/admin/profile/change-password', {
        method: 'PUT',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify(passwordData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message || 'Failed to change password');
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ==========================================
// TEACHER PROFILE THUNKS
// ==========================================
export const fetchTeacherProfile = createAsyncThunk(
  'profile/fetchTeacherProfile',
  async (_, thunkAPI) => {
    try {
      const response = await fetch('/api/teacher/profile', {
        headers: getAuthHeaders(thunkAPI.getState),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message || 'Failed to fetch teacher profile');
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateTeacherProfile = createAsyncThunk(
  'profile/updateTeacherProfile',
  async (profileData, thunkAPI) => {
    try {
      const isFormData = profileData instanceof FormData;
      const response = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: getAuthHeaders(thunkAPI.getState, isFormData),
        body: isFormData ? profileData : JSON.stringify(profileData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message || 'Failed to update teacher profile');
      thunkAPI.dispatch(updateUserData(data));
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const changeTeacherPassword = createAsyncThunk(
  'profile/changeTeacherPassword',
  async (passwordData, thunkAPI) => {
    try {
      const response = await fetch('/api/teacher/profile/change-password', {
        method: 'PUT',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify(passwordData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message || 'Failed to change password');
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
    stats: null,
    assignedCourses: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
    passwordLoading: false,
    passwordError: false,
    passwordSuccess: false,
    passwordMessage: '',
  },
  reducers: {
    resetProfileState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
      state.passwordError = false;
      state.passwordSuccess = false;
      state.passwordMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Student Profile
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
      })

      // Admin Profile
      .addCase(fetchAdminProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.stats = action.payload.stats || null;
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateAdminProfile.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profile = action.payload;
        state.stats = action.payload.stats || state.stats;
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(changeAdminPassword.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = false;
        state.passwordSuccess = false;
        state.passwordMessage = '';
      })
      .addCase(changeAdminPassword.fulfilled, (state, action) => {
        state.passwordLoading = false;
        state.passwordSuccess = true;
        state.passwordMessage = action.payload.message || 'Password updated successfully';
      })
      .addCase(changeAdminPassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = true;
        state.passwordMessage = action.payload;
      })

      // Teacher Profile
      .addCase(fetchTeacherProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTeacherProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.assignedCourses = action.payload.assignedCourses || [];
      })
      .addCase(fetchTeacherProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateTeacherProfile.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
      })
      .addCase(updateTeacherProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profile = action.payload;
        state.assignedCourses = action.payload.assignedCourses || state.assignedCourses;
      })
      .addCase(updateTeacherProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(changeTeacherPassword.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = false;
        state.passwordSuccess = false;
        state.passwordMessage = '';
      })
      .addCase(changeTeacherPassword.fulfilled, (state, action) => {
        state.passwordLoading = false;
        state.passwordSuccess = true;
        state.passwordMessage = action.payload.message || 'Password updated successfully';
      })
      .addCase(changeTeacherPassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = true;
        state.passwordMessage = action.payload;
      });
  },
});

export const { resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;
