import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getAuthHeaders = (getState) => {
  const token = getState().auth.user?.token;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const fetchTeacherCourses = createAsyncThunk(
  'attendance/fetchTeacherCourses',
  async (params = {}, thunkAPI) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    try {
      const response = await fetch(`/api/teacher/courses?page=${page}&limit=${limit}`, {
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

export const fetchCourseAttendance = createAsyncThunk(
  'attendance/fetchCourseAttendance',
  async (arg, thunkAPI) => {
    let courseId = arg;
    let page = 1;
    let limit = 10;
    if (typeof arg === 'object') {
      courseId = arg.courseId;
      page = arg.page || 1;
      limit = arg.limit || 10;
    }
    try {
      const response = await fetch(`/api/teacher/attendance/course/${courseId}?page=${page}&limit=${limit}`, {
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

export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async (attendanceData, thunkAPI) => {
    try {
      const response = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify(attendanceData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const markBulkAttendance = createAsyncThunk(
  'attendance/markBulkAttendance',
  async (bulkData, thunkAPI) => {
    try {
      const response = await fetch('/api/teacher/attendance/bulk', {
        method: 'POST',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify(bulkData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      // Re-fetch course attendance statistics
      thunkAPI.dispatch(fetchCourseAttendance(bulkData.courseId));
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async ({ id, status, courseId }, thunkAPI) => {
    try {
      const response = await fetch(`/api/teacher/attendance/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      if (courseId) {
        thunkAPI.dispatch(fetchCourseAttendance(courseId));
      }
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchStudentAttendance = createAsyncThunk(
  'attendance/fetchStudentAttendance',
  async (params = {}, thunkAPI) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    try {
      const response = await fetch(`/api/student/attendance?page=${page}&limit=${limit}`, {
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

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    teacherCourses: [],
    records: [],
    studentStats: [],
    studentAttendance: null,
    pagination: { total: 0, page: 1, totalPages: 1, limit: 10 },
    studentPagination: { total: 0, page: 1, totalPages: 1, limit: 10 },
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetAttendanceState: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherCourses.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.teacherCourses = action.payload.data;
        } else {
          state.teacherCourses = action.payload;
        }
      })
      .addCase(fetchCourseAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCourseAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload.records || [];
        state.studentStats = action.payload.studentStats || [];
        if (action.payload.total !== undefined) {
          state.pagination = {
            total: action.payload.total,
            page: action.payload.page,
            totalPages: action.payload.totalPages,
            limit: action.payload.limit,
          };
        }
      })
      .addCase(fetchCourseAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(fetchStudentAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studentAttendance = action.payload;
        if (action.payload.total !== undefined) {
          state.studentPagination = {
            total: action.payload.total,
            page: action.payload.page,
            totalPages: action.payload.totalPages,
            limit: action.payload.limit,
          };
        }
      })
      .addCase(fetchStudentAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetAttendanceState } = attendanceSlice.actions;
export default attendanceSlice.reducer;
