import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/authSlice.js"
import itemSlice from "./features/itemSlice.js"
import customerSlice from "./features/customerSlice.js"
import invoiceSlice from "./features/invoiceSlice.js"



export const store = configureStore({
    reducer: {
        auth: authSlice,
        item: itemSlice,
        customer: customerSlice,
        invoice: invoiceSlice,
    }
})