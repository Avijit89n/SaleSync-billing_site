import api from "@/axios/interceptor.js";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,

    // Account management
    accountUsers: [],
    pendingRequests: [],
    accountStats: null,
};

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export const userLoginReq = createAsyncThunk(
    "auth/login",
    async (data, thunkAPI) => {
        try {
            const res = await api.post(
                "/auth/login",
                data
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Failed to login"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| DIRECT LOGIN
|--------------------------------------------------------------------------
*/

export const directLoginReq = createAsyncThunk(
    "auth/direct-login",
    async (data, thunkAPI) => {
        try {
            const res = await api.post(
                "/auth/direct-login",
                data
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Failed to login"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| CHECK AUTH
|--------------------------------------------------------------------------
*/

export const checkUserAuthReq = createAsyncThunk(
    "auth/check",
    async (_, thunkAPI) => {
        try {
            const res = await api.get(
                "/auth/check-user-auth"
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ||
                    "Failed to check user auth"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| VERIFY EMAIL OTP
|--------------------------------------------------------------------------
*/

export const userVarificationReq = createAsyncThunk(
    "auth/verify",
    async (data, thunkAPI) => {
        try {
            const res = await api.post(
                "/auth/verify",
                data
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ||
                    "Failed to verify"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

export const registerUserReq = createAsyncThunk(
    "auth/register",
    async (data, thunkAPI) => {
        try {
            const res = await api.post(
                "/auth/register",
                data
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ||
                    "Failed to register"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export const userLogoutReq = createAsyncThunk(
    "auth/logout",
    async (_, thunkAPI) => {
        try {
            const res = await api.get(
                "/auth/logout"
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ||
                    "Failed to logout"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| ACCOUNT - CURRENT USER
|--------------------------------------------------------------------------
*/

export const getCurrentAccountReq = createAsyncThunk(
    "auth/get-current-account",
    async (_, thunkAPI) => {
        try {
            const res = await api.get(
                "/auth/account/me"
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ||
                    "Failed to fetch account"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| ACCOUNT - GET USERS
|--------------------------------------------------------------------------
*/

export const getAccountUsersReq = createAsyncThunk(
    "auth/get-account-users",
    async (_, thunkAPI) => {
        try {
            const res = await api.get(
                "/auth/account/users"
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ||
                    "Failed to fetch users"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| ACCOUNT - GET STATISTICS
|--------------------------------------------------------------------------
*/

export const getAccountStatsReq = createAsyncThunk(
    "auth/get-account-stats",
    async (_, thunkAPI) => {
        try {
            const res = await api.get(
                "/auth/account/stats"
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ||
                    "Failed to fetch account statistics"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| ACCOUNT - GET PENDING REQUESTS
|--------------------------------------------------------------------------
*/

export const getPendingRequestsReq = createAsyncThunk(
    "auth/get-pending-requests",
    async (_, thunkAPI) => {
        try {
            const res = await api.get(
                "/auth/account/approval/pending"
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ||
                    "Failed to fetch pending requests"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| ACCOUNT - APPROVE ADMIN
|--------------------------------------------------------------------------
*/

export const approveAdminRequestReq = createAsyncThunk(
    "auth/approve-admin",
    async (id, thunkAPI) => {
        try {
            const res = await api.patch(
                `/auth/account/approval/${id}/approve`
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ||
                    "Failed to approve admin"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| ACCOUNT - REJECT ADMIN
|--------------------------------------------------------------------------
*/

export const rejectAdminRequestReq = createAsyncThunk(
    "auth/reject-admin",
    async (id, thunkAPI) => {
        try {
            const res = await api.patch(
                `/auth/account/approval/${id}/reject`
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ||
                    "Failed to reject admin"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| ACCOUNT - DELETE ADMIN
|--------------------------------------------------------------------------
*/

export const deleteAdminReq = createAsyncThunk(
    "auth/delete-admin",
    async (id, thunkAPI) => {
        try {
            const res = await api.delete(
                `/auth/account/users/${id}`
            );

            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data ||
                    "Failed to delete admin"
            );
        }
    }
);


/*
|--------------------------------------------------------------------------
| AUTH SLICE
|--------------------------------------------------------------------------
*/

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

            /*
            |--------------------------------------------------------------------------
            | LOGIN
            |--------------------------------------------------------------------------
            */

            .addCase(
                userLoginReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                userLoginReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload?.data?.user ||
                        action.payload?.user ||
                        null;

                    state.isAuthenticated = true;
                    state.error = null;
                }
            )

            .addCase(
                userLoginReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.isAuthenticated = false;
                    state.user = null;
                    state.error = action.payload;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | REGISTER
            |--------------------------------------------------------------------------
            */

            .addCase(
                registerUserReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                    state.isAuthenticated = false;
                    state.user = null;
                }
            )

            .addCase(
                registerUserReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload?.data?.user ||
                        action.payload?.user ||
                        null;

                    /*
                     * Registration does NOT authenticate
                     * the user.
                     *
                     * User must verify OTP first.
                     */
                    state.isAuthenticated = false;
                    state.error = null;
                }
            )

            .addCase(
                registerUserReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                    state.isAuthenticated = false;
                    state.user = null;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | EMAIL OTP VERIFICATION
            |--------------------------------------------------------------------------
            */

            .addCase(
                userVarificationReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                userVarificationReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload?.data?.user ||
                        action.payload?.user ||
                        null;

                    /*
                     * Email verification alone does NOT
                     * authenticate the user.
                     *
                     * The account is now waiting for
                     * Admin/Superadmin approval.
                     */
                    state.isAuthenticated = false;
                    state.error = null;
                }
            )

            .addCase(
                userVarificationReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                    state.isAuthenticated = false;
                    state.user = null;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | LOGOUT
            |--------------------------------------------------------------------------
            */

            .addCase(
                userLogoutReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                userLogoutReq.fulfilled,
                (state) => {
                    state.loading = false;
                    state.user = null;
                    state.isAuthenticated = false;
                    state.error = null;

                    state.accountUsers = [];
                    state.pendingRequests = [];
                    state.accountStats = null;
                }
            )

            .addCase(
                userLogoutReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;

                    state.user = null;
                    state.isAuthenticated = false;

                    state.accountUsers = [];
                    state.pendingRequests = [];
                    state.accountStats = null;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | CHECK USER AUTH
            |--------------------------------------------------------------------------
            */

            .addCase(
                checkUserAuthReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                checkUserAuthReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload?.data?.user ||
                        action.payload?.user ||
                        null;

                    state.isAuthenticated =
                        !!state.user;

                    state.error = null;
                }
            )

            .addCase(
                checkUserAuthReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.user = null;
                    state.isAuthenticated = false;
                    state.error = action.payload;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | DIRECT LOGIN
            |--------------------------------------------------------------------------
            */

            .addCase(
                directLoginReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                directLoginReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload?.data?.user ||
                        action.payload?.user ||
                        null;

                    state.isAuthenticated = true;
                    state.error = null;
                }
            )

            .addCase(
                directLoginReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.user = null;
                    state.isAuthenticated = false;
                    state.error = action.payload;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | CURRENT ACCOUNT
            |--------------------------------------------------------------------------
            */

            .addCase(
                getCurrentAccountReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                getCurrentAccountReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.user =
                        action.payload?.data?.user ||
                        action.payload?.user ||
                        state.user;

                    state.error = null;
                }
            )

            .addCase(
                getCurrentAccountReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | ACCOUNT USERS
            |--------------------------------------------------------------------------
            */

            .addCase(
                getAccountUsersReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                getAccountUsersReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.accountUsers =
                        action.payload?.data?.users ||
                        action.payload?.users ||
                        [];

                    state.error = null;
                }
            )

            .addCase(
                getAccountUsersReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | ACCOUNT STATISTICS
            |--------------------------------------------------------------------------
            */

            .addCase(
                getAccountStatsReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                getAccountStatsReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.accountStats =
                        action.payload?.data?.stats ||
                        action.payload?.stats ||
                        null;

                    state.error = null;
                }
            )

            .addCase(
                getAccountStatsReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | PENDING APPROVAL REQUESTS
            |--------------------------------------------------------------------------
            */

            .addCase(
                getPendingRequestsReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                getPendingRequestsReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.pendingRequests =
                        action.payload?.data?.users ||
                        action.payload?.users ||
                        [];

                    state.error = null;
                }
            )

            .addCase(
                getPendingRequestsReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | APPROVE ADMIN
            |--------------------------------------------------------------------------
            */

            .addCase(
                approveAdminRequestReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                approveAdminRequestReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    const approvedUser =
                        action.payload?.data?.user ||
                        action.payload?.user;

                    if (approvedUser) {
                        state.pendingRequests =
                            state.pendingRequests.filter(
                                (user) =>
                                    String(user._id) !==
                                    String(approvedUser._id)
                            );

                        const alreadyExists =
                            state.accountUsers.some(
                                (user) =>
                                    String(user._id) ===
                                    String(approvedUser._id)
                            );

                        if (!alreadyExists) {
                            state.accountUsers.push(
                                approvedUser
                            );
                        }
                    }

                    state.error = null;
                }
            )

            .addCase(
                approveAdminRequestReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | REJECT ADMIN
            |--------------------------------------------------------------------------
            */

            .addCase(
                rejectAdminRequestReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                rejectAdminRequestReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    const rejectedUser =
                        action.payload?.data?.user ||
                        action.payload?.user;

                    if (rejectedUser) {
                        state.pendingRequests =
                            state.pendingRequests.filter(
                                (user) =>
                                    String(user._id) !==
                                    String(rejectedUser._id)
                            );
                    }

                    state.error = null;
                }
            )

            .addCase(
                rejectAdminRequestReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )


            /*
            |--------------------------------------------------------------------------
            | DELETE ADMIN
            |--------------------------------------------------------------------------
            */

            .addCase(
                deleteAdminReq.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                deleteAdminReq.fulfilled,
                (state, action) => {
                    state.loading = false;

                    const deletedUser =
                        action.payload?.data?.user ||
                        action.payload?.user;

                    if (deletedUser) {
                        state.accountUsers =
                            state.accountUsers.filter(
                                (user) =>
                                    String(user._id) !==
                                    String(deletedUser._id)
                            );
                    }

                    state.error = null;
                }
            )

            .addCase(
                deleteAdminReq.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    },
});


export const {
    logoutUser,
    loginUser,
    clearAuthError,
} = authSlice.actions;


export default authSlice.reducer;