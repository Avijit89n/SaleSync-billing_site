import api from "@/axios/interceptor";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
    customers: [],
    searchedCustomers: [],
    customerLoading: false,
    searchLoading: false,
    searchIsEnd: false,
    searchNextCursor: null,
    error: null,
    isEnd: false,
    nextCursor: null,
}

export const addCustomerReq = createAsyncThunk(
    "customer/add",
    async (data, thunkAPI) => {
        try {
            const res = await api.post("/customer/add-customer", data);
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Failed to add customer"
            );
        }
    }
)

export const getAllCustomerReq = createAsyncThunk(
    "customer/get-all",
    async (data, thunkAPI) => {
        console.log("clicked")
        const { limit, lastCreatedAt } = data;
        try {
            const res = await api.get(`/customer/get-all-customers?limit=${limit}&lastCreatedAt=${lastCreatedAt}`);
            return res.data?.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Failed to get all customers"
            );
        }
    }
)

export const customerSearchReq = createAsyncThunk(
    "customer/search",
    async (data, thunkAPI) => {
        const { limit, cursor, search } = data;

        try {
            const res = await api.get(`/customer/customer-search`, {
                params: {
                    limit,
                    cursor,
                    search
                },
                signal: thunkAPI.signal
            });

            return {
                cursor,
                results: res.data?.data
            };
        } catch (error) {
            if (
                error.name === "CanceledError" ||
                error.code === "ERR_CANCELED"
            ) {
                return thunkAPI.rejectWithValue("Request canceled");
            }

            return thunkAPI.rejectWithValue(
                error.response?.data || "Failed to search items"
            );
        }
    }
);

const customerSlice = createSlice({
    name: "customer",
    initialState,
    reducers: {
        clearSearchedCustomers: (state) => {
            state.searchedCustomers = [];
            state.searchNextCursor = null;
            state.searchIsEnd = false;
            state.searchLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCustomerReq.pending, (state) => {
                state.customerLoading = true;
                state.error = null;
            })
            .addCase(addCustomerReq.fulfilled, (state, action) => {
                state.customerLoading = false;
                state.customers = [action.payload?.data, ...state.customers]
                state.error = null;
            })
            .addCase(addCustomerReq.rejected, (state, action) => {
                state.customerLoading = false;
                state.error = action.payload;
            })


            .addCase(getAllCustomerReq.pending, (state) => {
                state.customerLoading = true;
                state.error = null;
            })
            .addCase(getAllCustomerReq.fulfilled, (state, action) => {
                state.customerLoading = false;
                state.customers = [...state.customers, ...action.payload.customers];
                state.isEnd = action.payload.isEnd;
                state.nextCursor = action.payload.nextCursor;
                state.error = null;
            })
            .addCase(getAllCustomerReq.rejected, (state, action) => {
                state.customerLoading = false;
                state.error = action.payload;
            })

            .addCase(customerSearchReq.pending, (state) => {
                state.searchLoading = true;
                state.error = null;
            })
            .addCase(customerSearchReq.fulfilled, (state, action) => {
                state.searchLoading = false;

                state.searchedCustomers = action.payload.cursor
                    ? [...state.searchedCustomers, ...action.payload.results.items]
                    : action.payload.results.items;

                state.searchIsEnd = action.payload.results.isEnd;
                state.searchNextCursor = action.payload.results.nextCursor;
                state.error = null;
            })
            .addCase(customerSearchReq.rejected, (state, action) => {
                state.searchLoading = false;
                state.error = action.payload;
                state.searchedCustomers = [];
            })

    }

})

export default customerSlice.reducer;
export const { clearSearchedCustomers } = customerSlice.actions;