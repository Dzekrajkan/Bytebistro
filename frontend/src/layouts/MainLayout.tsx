import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { fetchLogout } from "../redux/authSlice"
import { useAppDispatch } from "../store/store"

function MainLayout() {
  const dispatch = useAppDispatch()
  const location = useLocation();
  const { user } = useAuth()
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await dispatch(fetchLogout())
    } catch (err: any) {
      console.log(err || "Login failed")
    }
  }

  return (
    <div>
      <aside className="hidden min-[1150px]:flex flex-col w-64 h-screen border-r fixed left-0 top-0 z-30 shadow-md">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="text-xl font-bold text-blue-500 flex items-center" translate="no">Bytebistro</div>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link to="/"  onClick={() => isActive("/")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive("/") ? "bg-blue-500 shadow-blue-500/20 text-white shadow-md" : "hover:bg-zinc-100 hover:text-black text-zinc-400"}`}>Sale</Link>
          <Link to="/tables" onClick={() => isActive("/tables")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive("/tables") ? "bg-blue-500 shadow-blue-500/20 text-white shadow-md" : "hover:bg-zinc-100 hover:text-black text-zinc-400"}`}>Tables</Link>
          <Link to="/orders" onClick={() => isActive("/orders")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive("/orders") ? "bg-blue-500 shadow-blue-500/20 text-white shadow-md" : "hover:bg-zinc-100 hover:text-black text-zinc-400"}`}>Live Orders</Link>
          <Link to="/history" onClick={() => isActive("/history")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive("/history") ? "bg-blue-500 shadow-blue-500/20 text-white shadow-md" : "hover:bg-zinc-100 hover:text-black text-zinc-400"}`}>History</Link>
          <Link to="/register" onClick={() => isActive("/register")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive("/register") ? "bg-blue-500 shadow-blue-500/20 text-white shadow-md" : "hover:bg-zinc-100 hover:text-black text-zinc-400"}`}>Register</Link>
        </nav>
        <div className="p-4 border-t">
          <div className="flex py-3 px-4 mb-2 bg-zinc-300/20 rounded-xl items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/30 rounded-full"></div>
            <div>
              <h2 className="text-sm font-semibold">{user?.username}</h2>
              <p className="text-xs text-zinc-400">ID: {user?.id}</p>
            </div>
          </div>
          <button className="w-full py-2 text-lg text-orange-600 rounded-lg hover:bg-red-500/10 transition duration-300" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="min-[1150px]:pl-64 min-h-screen pb-20 min-[1150px]:pb-0 transition-all duration-300 bg-zinc-300/10">
        <Outlet/>
      </main>

      <nav className="min-[1150px]:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-safe bg-white">
        <div className="flex items-center justify-around min-h-16">
          <Link to="/"  onClick={() => isActive("/")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${isActive("/") ? "text-blue-500" : "hover:text-black text-zinc-400"}`}>Sale</Link>
          <Link to="/tables" onClick={() => isActive("/tables")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${isActive("/tables") ? "text-blue-500" : "hover:text-black text-zinc-400"}`}>Tables</Link>
          <Link to="/orders" onClick={() => isActive("/orders")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${isActive("/orders") ? "text-blue-500" : "hover:text-black text-zinc-400"}`}>Live Orders</Link>
          <Link to="/history" onClick={() => isActive("/history")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${isActive("/history") ? "text-blue-500" : "hover:text-black text-zinc-400"}`}>History</Link>
          <Link to="/register" onClick={() => isActive("/register")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${isActive("/register") ? "text-blue-500" : "hover:text-black text-zinc-400"}`}>Register</Link>
        </div>
      </nav>
    </div>
  )
}

export default MainLayout