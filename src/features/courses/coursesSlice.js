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
    const limit = params?.limit || 6;
    const allQuery = params?.all ? '?all=true' : `?page=${page}&limit=${limit}`;
    try {
      const response = await fetch(`/api/admin/courses${allQuery}`, {
        headers: getAuthHeaders(thunkAPI.getState),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return { ...data, isAll: !!params?.all };
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
  async ({ courseId, studentId, studentIds }, thunkAPI) => {
    try {
      const body = studentIds ? { studentIds } : { studentId };
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchAdminCourses = fetchCourses;

export const fetchTeacherCourses = createAsyncThunk(
  'courses/fetchTeacherCourses',
  async (params = {}, thunkAPI) => {
    const page = params?.page || 1;
    const limit = params?.limit || 6;
    const allParam = params?.all ? '&all=true' : '';
    try {
      const response = await fetch(`/api/teacher/courses?page=${page}&limit=${limit}${allParam}`, {
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

export const fetchCourseRoster = createAsyncThunk(
  'courses/fetchCourseRoster',
  async (courseId, thunkAPI) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/roster`, {
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

export const fetchStudentCourses = createAsyncThunk(
  'courses/fetchStudentCourses',
  async (params = {}, thunkAPI) => {
    const page = params?.page || 1;
    const limit = params?.limit || 6;
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

export const unenrollStudent = createAsyncThunk(
  'courses/unenrollStudent',
  async ({ courseId, studentId, studentIds }, thunkAPI) => {
    try {
      let response;
      if (studentIds && studentIds.length > 0) {
        response = await fetch(`/api/courses/${courseId}/unenroll`, {
          method: 'POST',
          headers: getAuthHeaders(thunkAPI.getState),
          body: JSON.stringify({ studentIds }),
        });
      } else {
        response = await fetch(`/api/courses/${courseId}/enroll/${studentId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(thunkAPI.getState),
        });
      }
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
    allCourses: [],
    teacherCourses: [],
    studentCourses: [],
    currentRoster: [],
    currentRosterCourse: null,
    rosterLoading: false,
    pagination: { total: 0, page: 1, totalPages: 1, limit: 6 },
    teacherCoursesPagination: { total: 0, page: 1, totalPages: 1, limit: 6 },
    studentCoursesPagination: { total: 0, page: 1, totalPages: 1, limit: 6 },
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetCoursesState: (state) => {
      state.isError = false;
      state.message = '';
    },
    clearCurrentRoster: (state) => {
      state.currentRoster = [];
      state.currentRosterCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isAll) {
          state.allCourses = action.payload.data || action.payload;
          return;
        }
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
      .addCase(fetchTeacherCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTeacherCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.teacherCourses = action.payload.data;
          state.teacherCoursesPagination = {
            total: action.payload.total,
            page: action.payload.page,
            totalPages: action.payload.totalPages,
            limit: action.payload.limit,
          };
        } else {
          state.teacherCourses = action.payload;
        }
      })
      .addCase(fetchTeacherCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(fetchCourseRoster.pending, (state) => {
        state.rosterLoading = true;
      })
      .addCase(fetchCourseRoster.fulfilled, (state, action) => {
        state.rosterLoading = false;
        state.currentRoster = action.payload.roster || [];
        state.currentRosterCourse = action.payload.course || null;
      })
      .addCase(fetchCourseRoster.rejected, (state, action) => {
        state.rosterLoading = false;
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
        const courseData = action.payload.course || action.payload;
        if (courseData?._id) {
          const index = state.courses.findIndex((c) => c._id === courseData._id);
          if (index !== -1) state.courses[index] = courseData;

          const teacherIndex = state.teacherCourses.findIndex((c) => c._id === courseData._id);
          if (teacherIndex !== -1) state.teacherCourses[teacherIndex] = courseData;
        }
        if (action.payload.roster) {
          state.currentRoster = action.payload.roster;
        }
      })
      .addCase(unenrollStudent.fulfilled, (state, action) => {
        const courseData = action.payload.course;
        const removedIds = action.payload.studentIds || (action.payload.studentId ? [action.payload.studentId] : []);
        if (courseData?._id) {
          const index = state.courses.findIndex((c) => c._id === courseData._id);
          if (index !== -1) state.courses[index] = courseData;

          const teacherIndex = state.teacherCourses.findIndex((c) => c._id === courseData._id);
          if (teacherIndex !== -1) state.teacherCourses[teacherIndex] = courseData;
        } else if (action.payload.courseId && removedIds.length > 0) {
          const cIndex = state.courses.findIndex((c) => c._id === action.payload.courseId);
          if (cIndex !== -1 && state.courses[cIndex].enrolledStudents) {
            state.courses[cIndex].enrolledStudents = state.courses[cIndex].enrolledStudents.filter(
              (s) => !removedIds.includes((s._id || s).toString())
            );
          }
          const tIndex = state.teacherCourses.findIndex((c) => c._id === action.payload.courseId);
          if (tIndex !== -1 && state.teacherCourses[tIndex].enrolledStudents) {
            state.teacherCourses[tIndex].enrolledStudents = state.teacherCourses[tIndex].enrolledStudents.filter(
              (s) => !removedIds.includes((s._id || s).toString())
            );
          }
        }
        if (action.payload.roster) {
          state.currentRoster = action.payload.roster;
        } else if (removedIds.length > 0) {
          state.currentRoster = state.currentRoster.filter(
            (r) => !removedIds.includes((r.student?._id || r.student)?.toString())
          );
        }
      });
  },
});

export const { resetCoursesState, clearCurrentRoster } = coursesSlice.actions;
export default coursesSlice.reducer;
