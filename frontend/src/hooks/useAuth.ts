import { useSelector } from "react-redux"
import type { RootState } from "../store/store"

export const useAuth = () => {
    const {user, isAuthenticated} = useSelector((state: RootState) => state.user)
    return {user, isAuthenticated}
}