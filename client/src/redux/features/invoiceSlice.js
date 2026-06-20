import api from "@/axios/interceptor";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Initial State Blueprint matching the UI Consumption specifications
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

// 1. Add Invoice Thunk
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

// 2. Paginated Base List Fetching Thunk
export const getAllInvoiceReq = createAsyncThunk(
    "invoice/get-all",
    async (data, thunkAPI) => {
        const { limit, lastCreatedAt } = data;
        try {
            const res = await api.get(`/invoice/get-all`, {
                params: {
                    limit,
                    lastCreatedAt
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

// 3. Search Invoices with Native Abort Controller Signals Supported
export const invoiceSearchReq = createAsyncThunk(
    "invoice/search",
    async (data, thunkAPI) => {
        const { limit, cursor, search } = data;

        try {
            const res = await api.get(`/invoice/invoice-search`, {
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
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
                return thunkAPI.rejectWithValue("Request canceled");
            }

            return thunkAPI.rejectWithValue(
                error.response?.data || "Failed to search invoices"
            );
        }
    }
);

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

const invoiceSlice = createSlice({
    name: "invoice",
    initialState,
    reducers: {
        // Essential reducer utilized by the debounce watcher to clean up searching states
        clearSearchedInvoices: (state) => {
            state.searchedInvoices = [];
            state.searchNextCursor = null;
            state.searchIsEnd = false;
            state.searchLoading = false;
        }
    },
    // Add this helper function right above your invoiceSlice declaration
    // Inside your invoiceSlice.js extraReducers block:
    extraReducers: (builder) => {
        builder
            // --- ADD INVOICE ---
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

            // --- GET ALL INVOICES ---
            .addCase(getAllInvoiceReq.pending, (state) => {
                state.invoiceLoading = true;
                state.error = null;
            })
            .addCase(getAllInvoiceReq.fulfilled, (state, action) => {
                state.invoiceLoading = false;

                // Bulletproof array extraction in case backend doesn't send pagination keys
                const rawInvoices = Array.isArray(action.payload)
                    ? action.payload
                    : (action.payload?.invoices || []);

                const formattedInvoices = rawInvoices.map(formatInvoiceData);

                // Filter duplicates
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

            // --- SEARCH INVOICES ---
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
export const { clearSearchedInvoices } = invoiceSlice.actions;