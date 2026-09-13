import api from "@/axios/interceptor.js";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const userLoginReq = createAsyncThunk(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/auth/login", data);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to login");
    }
  }
);

export const checkUserAuthReq = createAsyncThunk(
  "auth/check",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/auth/check-user-auth");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to check user auth");
    }
  }
);

export const userVarificationReq = createAsyncThunk(
  "auth/verify",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/auth/verify", data);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to verify");
    }
  }
);

export const registerUserReq = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/auth/register", data);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to register");
    }
  }
);

export const userLogoutReq = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/auth/logout");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to logout");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLoginReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userLoginReq.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.data?.user || action.payload?.user || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(userLoginReq.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      .addCase(registerUserReq.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(registerUserReq.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.data?.user || action.payload?.user || null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(registerUserReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(userVarificationReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userVarificationReq.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.data?.user || action.payload?.user || null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(userVarificationReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(userLogoutReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userLogoutReq.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(userLogoutReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(checkUserAuthReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkUserAuthReq.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.data?.user || action.payload?.user || null;
        state.isAuthenticated = !!state.user;
        state.error = null;
      })
      .addCase(checkUserAuthReq.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
  },
});

export const { loginUser, logoutUser, clearAuthError } = authSlice.actions;

export default authSlice.reducer;