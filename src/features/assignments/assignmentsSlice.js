import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const getAuthHeaders = (getState) => {
  const token = getState().auth.user?.token;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const fetchTeacherAssignments = createAsyncThunk(
  'assignments/fetchTeacherAssignments',
  async (params = {}, thunkAPI) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    try {
      const response = await fetch(`/api/teacher/assignments?page=${page}&limit=${limit}`, {
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

export const createAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async (assignmentData, thunkAPI) => {
    try {
      const response = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify(assignmentData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchSubmissions = createAsyncThunk(
  'assignments/fetchSubmissions',
  async (arg, thunkAPI) => {
    let assignmentId = arg;
    let page = 1;
    let limit = 10;
    if (typeof arg === 'object') {
      assignmentId = arg.assignmentId;
      page = arg.page || 1;
      limit = arg.limit || 10;
    }
    try {
      const response = await fetch(`/api/teacher/assignments/${assignmentId}/submissions?page=${page}&limit=${limit}`, {
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

export const approveReopenRequest = createAsyncThunk(
  'assignments/approveReopenRequest',
  async (submissionId, thunkAPI) => {
    try {
      const response = await fetch(`/api/teacher/submissions/${submissionId}/approve-reopen`, {
        method: 'PUT',
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

export const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState: {
    assignments: [],
    submissions: [],
    pagination: { total: 0, page: 1, totalPages: 1, limit: 10 },
    submissionsPagination: { total: 0, page: 1, totalPages: 1, limit: 10 },
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetAssignmentsState: (state) => {
      state.isError = false;
      state.message = '';
    },
    clearSubmissions: (state) => {
      state.submissions = [];
      state.submissionsPagination = { total: 0, page: 1, totalPages: 1, limit: 10 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherAssignments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTeacherAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.assignments = action.payload.data;
          state.pagination = {
            total: action.payload.total,
            page: action.payload.page,
            totalPages: action.payload.totalPages,
            limit: action.payload.limit,
          };
        } else {
          state.assignments = action.payload;
        }
      })
      .addCase(fetchTeacherAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.assignments.unshift(action.payload);
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.submissions = action.payload.data;
          state.submissionsPagination = {
            total: action.payload.total,
            page: action.payload.page,
            totalPages: action.payload.totalPages,
            limit: action.payload.limit,
          };
        } else {
          state.submissions = action.payload;
        }
      })
      .addCase(approveReopenRequest.fulfilled, (state, action) => {
        const index = state.submissions.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.submissions[index] = action.payload;
      });
  },
});

export const { resetAssignmentsState, clearSubmissions } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;
