import api from "@/axios/interceptor.js";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  accountUsers: [],
  pendingRequests: [],
  accountStats: null,
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

export const directLoginReq = createAsyncThunk(
  "auth/direct-login",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/auth/direct-login", data);
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

export const getCurrentAccountReq = createAsyncThunk(
  "auth/get-current-account",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/auth/account/me");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch account");
    }
  }
);

export const getAccountUsersReq = createAsyncThunk(
  "auth/get-account-users",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/auth/account/users");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch users");
    }
  }
);

export const getAccountStatsReq = createAsyncThunk(
  "auth/get-account-stats",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/auth/account/stats");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch account statistics");
    }
  }
);

export const getPendingRequestsReq = createAsyncThunk(
  "auth/get-pending-requests",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/auth/account/approval/pending");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch pending requests");
    }
  }
);

export const approveAdminRequestReq = createAsyncThunk(
  "auth/approve-admin",
  async (id, thunkAPI) => {
    try {
      const res = await api.get(`/auth/account/approval/${id}/approve`);
      console.log("Approve Admin Response:", res.data);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to approve admin");
    }
  }
);

export const rejectAdminRequestReq = createAsyncThunk(
  "auth/reject-admin",
  async (id, thunkAPI) => {
    try {
      const res = await api.get(`/auth/account/approval/${id}/reject`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to reject admin");
    }
  }
);

export const deleteAdminReq = createAsyncThunk(
  "auth/delete-admin",
  async (id, thunkAPI) => {
    try {
      const res = await api.delete(`/auth/account/users/${id}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to delete admin");
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
      state.accountUsers = [];
      state.pendingRequests = [];
      state.accountStats = null;
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
        state.accountUsers = [];
        state.pendingRequests = [];
        state.accountStats = null;
      })
      .addCase(userLogoutReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        state.accountUsers = [];
        state.pendingRequests = [];
        state.accountStats = null;
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

      .addCase(directLoginReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(directLoginReq.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.data?.user || action.payload?.user || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(directLoginReq.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      .addCase(getCurrentAccountReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentAccountReq.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.data?.user || action.payload?.user || state.user;
        state.error = null;
      })
      .addCase(getCurrentAccountReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAccountUsersReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccountUsersReq.fulfilled, (state, action) => {
        state.loading = false;
        state.accountUsers = action.payload?.data?.users || action.payload?.users || [];
        state.error = null;
      })
      .addCase(getAccountUsersReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAccountStatsReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccountStatsReq.fulfilled, (state, action) => {
        state.loading = false;
        state.accountStats = action.payload?.data?.stats || action.payload?.stats || null;
        state.error = null;
      })
      .addCase(getAccountStatsReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getPendingRequestsReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingRequestsReq.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload?.data?.users || action.payload?.users || [];
        state.error = null;
      })
      .addCase(getPendingRequestsReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(approveAdminRequestReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveAdminRequestReq.fulfilled, (state, action) => {
        state.loading = false;
        const approvedUser = action.payload?.data?.user || action.payload?.user;

        if (approvedUser) {
          state.pendingRequests = state.pendingRequests.filter(
            (user) => String(user._id) !== String(approvedUser._id)
          );

          const alreadyExists = state.accountUsers.some(
            (user) => String(user._id) === String(approvedUser._id)
          );

          if (!alreadyExists) {
            state.accountUsers.push(approvedUser);
          }
        }
        state.error = null;
      })
      .addCase(approveAdminRequestReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(rejectAdminRequestReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectAdminRequestReq.fulfilled, (state, action) => {
        state.loading = false;
        const rejectedUser = action.payload?.data?.user || action.payload?.user;

        if (rejectedUser) {
          state.pendingRequests = state.pendingRequests.filter(
            (user) => String(user._id) !== String(rejectedUser._id)
          );
        }
        state.error = null;
      })
      .addCase(rejectAdminRequestReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteAdminReq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminReq.fulfilled, (state, action) => {
        state.loading = false;
        const deletedUser = action.payload?.data?.user || action.payload?.user;

        if (deletedUser) {
          state.accountUsers = state.accountUsers.filter(
            (user) => String(user._id) !== String(deletedUser._id)
          );
        }
        state.error = null;
      })
      .addCase(deleteAdminReq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { loginUser, logoutUser, clearAuthError } = authSlice.actions;

export default authSlice.reducer;