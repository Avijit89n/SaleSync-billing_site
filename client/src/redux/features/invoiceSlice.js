import api from "@/axios/interceptor";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    invoices: [],
    searchedInvoices: [],
    searchLoading: false,
    searchIsEnd: false,
    searchNextCursor: null,
    invoiceLoading: false,
    error: null,
    isEnd: false,
    nextCursor: null,
}

// Helper function to ensure all database records map to the exact same UI format
const formatInvoiceData = (invoice) => ({
    _id: invoice._id,
    id: invoice._id,
    date: invoice.invoiceDate || invoice.date,
    invoiceNo: invoice.invoiceNumber || invoice.invoiceNo,
    customer: invoice.customerName || invoice.customer,
    status: invoice.status,
    amount: invoice.grandTotal || invoice.amount,
    dueDate: invoice.dueDate,
    invoiceItems: invoice.invoiceItems || [],
});

export const addInvoiceReq = createAsyncThunk(
    "invoice/add",
    async (data, thunkAPI) => {
        try {
            const res = await api.post("/invoice/add-invoice", data);
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Failed to add invoice"
            );
        }
    }
);

export const getAllInvoiceReq = createAsyncThunk(
    "invoice/get-all",
    async (data, thunkAPI) => {
        const { limit, lastCreatedAt, filter } = data;
        try {
            const res = await api.get(`/invoice/get-all`, {
                params: {
                    limit,
                    lastCreatedAt,
                    ...(filter !== "All" && { status: filter })
                }
            });
            return res.data?.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Failed to get all invoices"
            );
        }
    }
);

export const invoiceSearchReq = createAsyncThunk(
    "invoice/search",
    async (data, thunkAPI) => {
        const { limit, cursor, search, filter } = data;

        try {
            const res = await api.get(`/invoice/invoice-search`, {
                params: {
                    limit,
                    cursor,
                    search,
                    ...(filter !== "All" && { status: filter })
                },
                signal: thunkAPI.signal
            });
            return {
                cursor,
                results: res.data?.data
            };
        } catch (error) {
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
                return thunkAPI.rejectWithValue("Request canceled");
            }

            return thunkAPI.rejectWithValue(
                error.response?.data || "Failed to search invoices"
            );
        }
    }
);

const invoiceSlice = createSlice({
    name: "invoice",
    initialState,
    reducers: {
        clearSearchedInvoices: (state) => {
            state.searchedInvoices = [];
            state.searchNextCursor = null;
            state.searchIsEnd = false;
            state.searchLoading = false;
        },
        clearInvoices: (state) => {
            state.invoices = [];
            state.nextCursor = null;
            state.isEnd = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Add Invoice Lifecycle Actions
            .addCase(addInvoiceReq.pending, (state) => {
                state.invoiceLoading = true;
                state.error = null;
            })
            .addCase(addInvoiceReq.fulfilled, (state, action) => {
                state.invoiceLoading = false;
                const formattedInvoice = formatInvoiceData(action.payload?.data || {});
                state.invoices = [formattedInvoice, ...state.invoices];
                state.error = null;
            })
            .addCase(addInvoiceReq.rejected, (state, action) => {
                state.invoiceLoading = false;
                state.error = action.payload;
            })

            // Get All Invoices Pagination Lifecycle Actions
            .addCase(getAllInvoiceReq.pending, (state) => {
                state.invoiceLoading = true;
                state.error = null;
            })
            .addCase(getAllInvoiceReq.fulfilled, (state, action) => {
                state.invoiceLoading = false;

                const rawInvoices = Array.isArray(action.payload) 
                    ? action.payload 
                    : (action.payload?.invoices || []);
                    
                const formattedInvoices = rawInvoices.map(formatInvoiceData);

                const newInvoices = formattedInvoices.filter(
                    (newInv) => !state.invoices.some((existing) => existing._id === newInv._id)
                );

                state.invoices = [...state.invoices, ...newInvoices];
                state.isEnd = action.payload?.isEnd ?? true;
                state.nextCursor = action.payload?.nextCursor ?? null;
                state.error = null;
            })
            .addCase(getAllInvoiceReq.rejected, (state, action) => {
                state.invoiceLoading = false;
                state.error = action.payload;
            })

            // Search Invoices Infinite Scrolling Lifecycle Actions
            .addCase(invoiceSearchReq.pending, (state) => {
                state.searchLoading = true;
                state.error = null;
            })
            .addCase(invoiceSearchReq.fulfilled, (state, action) => {
                state.searchLoading = false;

                const rawSearched = Array.isArray(action.payload?.results)
                    ? action.payload.results
                    : (action.payload?.results?.invoices || []);
                    
                const formattedSearched = rawSearched.map(formatInvoiceData);

                if (action.payload.cursor) {
                    const uniqueSearched = formattedSearched.filter(
                        (newInv) => !state.searchedInvoices.some((existing) => existing._id === newInv._id)
                    );
                    state.searchedInvoices = [...state.searchedInvoices, ...uniqueSearched];
                } else {
                    state.searchedInvoices = formattedSearched;
                }

                state.searchNextCursor = action.payload?.results?.nextCursor ?? null;
                state.searchIsEnd = action.payload?.results?.isEnd ?? true;
                state.error = null;
            })
            .addCase(invoiceSearchReq.rejected, (state, action) => {
                state.searchLoading = false;
                if (action.payload !== "Request canceled") {
                    state.error = action.payload;
                    state.searchedInvoices = [];
                }
            });
    }
});

export default invoiceSlice.reducer;
export const { clearSearchedInvoices, clearInvoices } = invoiceSlice.actions;