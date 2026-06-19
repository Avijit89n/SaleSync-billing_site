import { logoutUser } from "@/redux/features/authSlice";
import axios from "axios";

let injectedStore = null;

export const injectStore = (store) => {
    injectedStore = store;
};


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});


api.interceptors.response.use((res) => res, (err) => {
    const status = err?.response?.status;
    const code = err?.response?.data?.code;
    const isSessionExpired = (status === 401 && (code === "TOKEN_EXPIRED" || code === "UNAUTHENTICATED"));
    if (isSessionExpired) {
        if (injectedStore) {
            injectedStore.dispatch(logoutUser());
        }
    }
    return Promise.reject(err);
});

export default api;