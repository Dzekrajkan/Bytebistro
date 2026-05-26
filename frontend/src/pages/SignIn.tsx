import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { type SignInFormData, SignInSchema } from "../schemas/schema"
import { useAppDispatch } from "../store/store"
import { useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { fetchLogin } from "../redux/authSlice"
import { useAuth } from "../hooks/useAuth"
import toast from "react-hot-toast"

function SignIn() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation();
  const { isAuthenticated } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema)
  })
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated])

  const onSubmit = async (data: SignInFormData) => {
    try {
      await dispatch(fetchLogin(data)).unwrap()
    } catch (err: any) {
      toast.error(err || "Login failed")
    }
  }

  return (
    <main className="min-h-screen flex">
      <div className="flex-col justify-between p-10 hidden lg:flex w-[420px] shrink-0 bg-blue-500 text-white">
        <div className="text-xl font-bold tracking-tight">☕ Bytebistro</div>
        <div>
          <p className="text-3xl font-bold leading-snug md-3">Manage your restaurant smarter.</p>
          <p className="text-blue-100 text-sm">Orders, tables, and sales — all in one place.</p>
        </div>
        <p className="text-blue-200 text-xs">© 2026 Bytebistro</p>
      </div>
      <div className="flex-1 bg-zinc-300/10 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold md-1">Sign in</h2>
            <p className="text-sm text-zinc-400">Enter your credentials to continue</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Email</label>
              <input type="text" className="border h-9 px-4 w-full rounded-md focus-visible:outline-none focus-visible:border-blue-500 text-sm" placeholder="you@example.com" {...register("email")}/>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Password</label>
              <input type="password" className="border h-9 px-4 w-full rounded-md focus-visible:outline-none focus-visible:border-blue-500 text-sm" placeholder="••••••••" {...register("password")}/>
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>
            <button type="submit" className="h-10 w-full rounded-md text-white font-semibold bg-blue-500 disabled:bg-blue-500/50" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign In"}</button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default SignIn