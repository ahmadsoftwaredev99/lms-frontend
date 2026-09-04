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

export const fetchTeacherMaterials = createAsyncThunk(
  'material/fetchTeacherMaterials',
  async (params = {}, thunkAPI) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    try {
      const response = await fetch(`/api/teacher/materials?page=${page}&limit=${limit}`, {
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

export const uploadMaterial = createAsyncThunk(
  'material/uploadMaterial',
  async (materialData, thunkAPI) => {
    try {
      const isFormData = materialData instanceof FormData;
      const response = await fetch('/api/teacher/materials', {
        method: 'POST',
        headers: getAuthHeaders(thunkAPI.getState, isFormData),
        body: isFormData ? materialData : JSON.stringify(materialData),
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteMaterial = createAsyncThunk(
  'material/deleteMaterial',
  async (id, thunkAPI) => {
    try {
      const response = await fetch(`/api/teacher/materials/${id}`, {
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

export const fetchStudentMaterials = createAsyncThunk(
  'material/fetchStudentMaterials',
  async (params = {}, thunkAPI) => {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    try {
      const response = await fetch(`/api/student/materials?page=${page}&limit=${limit}`, {
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

export const materialSlice = createSlice({
  name: 'material',
  initialState: {
    materials: [],
    studentMaterials: [],
    pagination: { total: 0, page: 1, totalPages: 1, limit: 10 },
    studentPagination: { total: 0, page: 1, totalPages: 1, limit: 10 },
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetMaterialState: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherMaterials.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTeacherMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.materials = action.payload.data;
          state.pagination = {
            total: action.payload.total,
            page: action.payload.page,
            totalPages: action.payload.totalPages,
            limit: action.payload.limit,
          };
        } else {
          state.materials = action.payload;
        }
      })
      .addCase(fetchTeacherMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(fetchStudentMaterials.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStudentMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.studentMaterials = action.payload.data;
          state.studentPagination = {
            total: action.payload.total,
            page: action.payload.page,
            totalPages: action.payload.totalPages,
            limit: action.payload.limit,
          };
        } else {
          state.studentMaterials = action.payload;
        }
      })
      .addCase(fetchStudentMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(uploadMaterial.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(uploadMaterial.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials.unshift(action.payload);
      })
      .addCase(uploadMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.materials = state.materials.filter((m) => m._id !== action.payload);
      });
  },
});

export const { resetMaterialState } = materialSlice.actions;
export default materialSlice.reducer;
