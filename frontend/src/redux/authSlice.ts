import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../utils/axiosInstance";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL

interface LoginState {
    email: string,
    password: string
}

interface User {
    id: number,
    username: string,
    role: ("AD" | "CA" | "WA" | "CH")
}

interface TypeInitialState {
    user: User | null,
    isAuthenticated: boolean,
    error: string | null,
    success: string | null,
    loading: boolean
}

const initialState: TypeInitialState = {
    user: null,
    isAuthenticated: false,
    error: null,
    success: null,
    loading: false
}

export const fetchMe = createAsyncThunk<User, void, { rejectValue: string }>("user/me", async (_, { rejectWithValue }) => {
    try {
        const res = await api.get("me/")

        return res.data
    } catch(err) {
        return rejectWithValue("unauthorized");
    }
})

export const fetchLogin = createAsyncThunk<User, LoginState, { rejectValue: string }>("user/login", async ({ email, password }, { rejectWithValue }) => {
    try {
        await axios.post(`${apiUrl}login/`, { email, password }, {withCredentials: true})

        const res = await api.get("me/")

        return res.data
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return rejectWithValue(
            err.response?.data?.detail || "Login failed"
            );
        }
        return rejectWithValue("Unknown error");
    }
})


export const fetchLogout = createAsyncThunk<void, void, { rejectValue: string }>("user/logout", async (_, { rejectWithValue }) => {
    try {
        await api.post("logout/")

        return
    } catch (err) {
        return rejectWithValue("Logout unsuccessful");
    }
})


export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        logout(state) {
            state.user = null
            state.isAuthenticated = false
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchMe.pending, state => {
                state.loading = true
                state.error = null
                state.success = null
            })
            .addCase(fetchLogin.pending, state => {
                state.loading = true
                state.error = null
                state.success = null
            })
            .addCase(fetchLogout.pending, state => {
                state.loading = true
                state.error = null
                state.success = null
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.isAuthenticated = true
            })
            .addCase(fetchLogin.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.isAuthenticated = true
                state.success = "Login successful"
            })
            .addCase(fetchLogout.fulfilled, (state) => {
                state.loading = false
                state.user = null
                state.isAuthenticated = false
                state.success = "Logout successful"
            })
            .addCase(fetchMe.rejected, (state, action) => {
                state.loading = false
                state.isAuthenticated = false
                state.user = null
                state.error = action.payload || action.error.message || "Unknown error"
            })
            .addCase(fetchLogin.rejected, (state, action) => {
                state.loading = false
                state.isAuthenticated = false
                state.user = null
                state.error = action.payload || action.error.message || "Unknown error"
            })
            .addCase(fetchLogout.rejected, (state) => {
                state.loading = false
                state.error = "Logout unsuccessful"
            })
    }
})

export const { logout } = userSlice.actions