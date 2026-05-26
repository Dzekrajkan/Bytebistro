import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { api } from "../api/api";
import { userSlice } from "../redux/authSlice";

const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        user: userSlice.reducer,
    },
    
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

export default store