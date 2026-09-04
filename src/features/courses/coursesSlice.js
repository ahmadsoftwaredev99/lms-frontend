import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getAuthHeaders = (getState) => {
  const token = getState().auth.user?.token;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params = {}, thunkAPI) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    try {
      const response = await fetch(`/api/admin/courses?page=${page}&limit=${limit}`, {
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

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, thunkAPI) => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify(courseData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, courseData }, thunkAPI) => {
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify(courseData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (id, thunkAPI) => {
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
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

export const assignTeacher = createAsyncThunk(
  'courses/assignTeacher',
  async ({ courseId, teacherId }, thunkAPI) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/assign-teacher`, {
        method: 'PUT',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify({ teacherId }),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const enrollStudent = createAsyncThunk(
  'courses/enrollStudent',
  async ({ courseId, studentId }, thunkAPI) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify({ studentId }),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchStudentCourses = createAsyncThunk(
  'courses/fetchStudentCourses',
  async (params = {}, thunkAPI) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    try {
      const response = await fetch(`/api/student/courses?page=${page}&limit=${limit}`, {
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

export const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    studentCourses: [],
    pagination: { total: 0, page: 1, totalPages: 1, limit: 10 },
    studentCoursesPagination: { total: 0, page: 1, totalPages: 1, limit: 10 },
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetCoursesState: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.courses = action.payload.data;
          state.pagination = {
            total: action.payload.total,
            page: action.payload.page,
            totalPages: action.payload.totalPages,
            limit: action.payload.limit,
          };
        } else {
          state.courses = action.payload;
        }
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(fetchStudentCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStudentCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.studentCourses = action.payload.data;
          state.studentCoursesPagination = {
            total: action.payload.total,
            page: action.payload.page,
            totalPages: action.payload.totalPages,
            limit: action.payload.limit,
          };
        } else {
          state.studentCourses = action.payload;
        }
      })
      .addCase(fetchStudentCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.courses.unshift(action.payload);
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.courses[index] = action.payload;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter((c) => c._id !== action.payload);
      })
      .addCase(assignTeacher.fulfilled, (state, action) => {
        const index = state.courses.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.courses[index] = action.payload;
      })
      .addCase(enrollStudent.fulfilled, (state, action) => {
        const index = state.courses.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.courses[index] = action.payload;
      });
  },
});

export const { resetCoursesState } = coursesSlice.actions;
export default coursesSlice.reducer;
