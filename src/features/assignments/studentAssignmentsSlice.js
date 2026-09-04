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

export const fetchStudentAssignments = createAsyncThunk(
  'studentAssignments/fetchStudentAssignments',
  async (params = {}, thunkAPI) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    try {
      const response = await fetch(`/api/student/assignments?page=${page}&limit=${limit}`, {
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

export const uploadSubmission = createAsyncThunk(
  'studentAssignments/uploadSubmission',
  async (submissionData, thunkAPI) => {
    try {
      const isFormData = submissionData instanceof FormData;
      const response = await fetch('/api/student/submissions', {
        method: 'POST',
        headers: getAuthHeaders(thunkAPI.getState, isFormData),
        body: isFormData ? submissionData : JSON.stringify(submissionData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      
      // Refresh student assignments after uploading
      thunkAPI.dispatch(fetchStudentAssignments());
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const editSubmission = createAsyncThunk(
  'studentAssignments/editSubmission',
  async ({ submissionId, formData }, thunkAPI) => {
    try {
      const isFormData = formData instanceof FormData;
      const response = await fetch(`/api/student/submissions/${submissionId}`, {
        method: 'PUT',
        headers: getAuthHeaders(thunkAPI.getState, isFormData),
        body: isFormData ? formData : JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);

      thunkAPI.dispatch(fetchStudentAssignments());
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const requestReopenSubmission = createAsyncThunk(
  'studentAssignments/requestReopenSubmission',
  async ({ submissionId, assignmentId }, thunkAPI) => {
    try {
      const targetId = submissionId || assignmentId;
      const response = await fetch(`/api/student/submissions/${targetId}/reopen-request`, {
        method: 'POST',
        headers: getAuthHeaders(thunkAPI.getState),
        body: JSON.stringify({ assignmentId }),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);

      thunkAPI.dispatch(fetchStudentAssignments());
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const downloadSubmission = createAsyncThunk(
  'studentAssignments/downloadSubmission',
  async (submissionId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      const response = await fetch(`/api/student/submissions/${submissionId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData.message || 'Failed to download file');
      }

      // Check content type to see if binary file stream or JSON fileUrl returned
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.fileUrl) {
          window.open(data.fileUrl, '_blank');
        }
        return data;
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `submission-${submissionId}.dat`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return { success: true };
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const studentAssignmentsSlice = createSlice({
  name: 'studentAssignments',
  initialState: {
    assignments: [],
    pagination: { total: 0, page: 1, totalPages: 1, limit: 10 },
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
  },
  reducers: {
    resetStudentAssignmentsState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentAssignments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStudentAssignments.fulfilled, (state, action) => {
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
      .addCase(fetchStudentAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(uploadSubmission.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
      })
      .addCase(uploadSubmission.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(uploadSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(editSubmission.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
      })
      .addCase(editSubmission.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(editSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(requestReopenSubmission.fulfilled, (state) => {
        state.isSuccess = true;
      })
      .addCase(requestReopenSubmission.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetStudentAssignmentsState } = studentAssignmentsSlice.actions;
export default studentAssignmentsSlice.reducer;
