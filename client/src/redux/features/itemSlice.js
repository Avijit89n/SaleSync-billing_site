import api from "@/axios/interceptor";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


const initialState = {
    items: [],
    searchedItems: [],
    searchLoading: false,
    searchIsEnd: false,
    searchNextCursor: null,
    itemLoading: false,
    error: null,
    isEnd: false,
    nextCursor: null,
}

export const addItemReq = createAsyncThunk(
    "item/add",
    async (data, thunkAPI) => {
        try {
            const res = await api.post("/item/additem", data);
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Failed to add item"
            );
        }
    }
)

export const getAllItemReq = createAsyncThunk(
    "item/get-all",
    async (data, thunkAPI) => {
        const { limit, lastCreatedAt } = data;
        try {
            const res = await api.get(`/item/get-all`, {
                params: {
                    limit,
                    lastCreatedAt
                }
            });
            return res.data?.data;
        } catch (error) {
            console.log(error)
            return thunkAPI.rejectWithValue(
                error.response?.data || "Failed to get all items"
            );
        }
    }
)

export const itemSearchReq = createAsyncThunk(
    "item/search",
    async (data, thunkAPI) => {
        const { limit, cursor, search } = data;

        try {
            const res = await api.get(`/item/item-search`, {
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
                error.response?.data || "Failed to search items"
            );
        }
    }
);

const itemSlice = createSlice({
    name: "item",
    initialState,
    reducers: {
        clearSearchedItems: (state) => {
            state.searchedItems = [];
            state.searchNextCursor = null;
            state.searchIsEnd = false;
            state.searchLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addItemReq.pending, (state) => {
                state.itemLoading = true;
                state.error = null;
            })
            .addCase(addItemReq.fulfilled, (state, action) => {
                state.itemLoading = false;
                state.items = [action.payload?.data, ...state.items]
                state.error = null;
            })
            .addCase(addItemReq.rejected, (state, action) => {
                state.itemLoading = false;
                state.error = action.payload;
            })


            .addCase(getAllItemReq.pending, (state) => {
                state.itemLoading = true;
                state.error = null;
            })

            .addCase(getAllItemReq.fulfilled, (state, action) => {
                state.itemLoading = false;
                state.items = [...state.items, ...action.payload.items];
                state.isEnd = action.payload.isEnd;
                state.nextCursor = action.payload.nextCursor;
                state.error = null;
            })

            .addCase(getAllItemReq.rejected, (state, action) => {
                state.itemLoading = false;
                state.error = action.payload;
            })

            .addCase(itemSearchReq.pending, (state) => {
                state.searchLoading = true;
                state.error = null;
            })
            .addCase(itemSearchReq.fulfilled, (state, action) => {
                state.searchLoading = false;

                state.searchedItems = action.payload.cursor
                    ? [...state.searchedItems, ...action.payload.results.items]
                    : action.payload.results.items;

                state.searchNextCursor = action.payload.results.nextCursor;
                state.searchIsEnd = action.payload.results.isEnd;
                state.error = null;
            })
            .addCase(itemSearchReq.rejected, (state, action) => {
                state.searchLoading = false;
                state.error = action.payload;
                state.searchedItems = [];
            })

    }
})

export default itemSlice.reducer;
export const { clearSearchedItems } = itemSlice.actions;