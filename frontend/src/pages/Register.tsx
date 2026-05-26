import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import RegisterCard from "../components/register/RegisterCard"
import { useGetReportsQuery } from "../api/api"
import { SyncLoader } from "react-spinners"

function Register() {
  const {data: reports, isLoading} = useGetReportsQuery()
  const hours = Array.from({ length: 12 }, (_, i) => ({time: `${(9 + i).toString().padStart(2, "0")}:00`, cash: 0, card: 0, cash_count: 0, card_count: 0}))
  const marged = reports && hours.map(hour => reports.find((r: any) => r.time === hour.time) ?? hour)
  const cash = reports && marged?.reduce((sum, r) => sum + r.cash, 0)
  const transitionsCash = reports && marged?.reduce((sum, r) => sum + r.cash_count, 0)
  const card = reports && marged?.reduce((sum, r) => sum + r.card, 0)
  const transitionsCard = reports && marged?.reduce((sum, r) => sum + r.card_count, 0)

  if (isLoading) return <div className="flex justify-center h-screen items-center"><SyncLoader speedMultiplier={0.7} size={10} color="#0789ff" /></div>

  return(
    <div className="flex flex-col h-screen bg-zinc-300/10">
      <div className="space-y-4 p-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">Register Management</h2>
          <p className="text-zinc-400">Manage cash drawer and daily sales</p>
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="flex-1 flex flex-col gap-4">
          <div className="grid max-[1150px]:grid-cols-2 grid-cols-4 gap-4">
            <RegisterCard title="Opening Cash" value="$250.00" subtitle="Started at 9:00 AM"/>
            <RegisterCard title="Cash Sales" value={`$${cash?.toFixed(2)}`} subtitle={`+${transitionsCash} transactions`} valueColor="text-green-600"/>
            <RegisterCard title="Card Sales" value={`$${card?.toFixed(2)}`} subtitle={`+${transitionsCard} transactions`} valueColor="text-blue-600"/>
            <RegisterCard title="Expected Drawer" value={`$${(250 + Number(cash)).toFixed(2)}`} subtitle="Opening + Cash Sales"/>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-medium">Sales Overview</h3>
                <p className="text-xs text-zinc-400">Cash vs Card throughout the day</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={marged}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value) => [`$${value}`, undefined]} />
                  <Area type="monotone" dataKey="cash" name="Cash" stroke="#22c55e" strokeWidth={2} fill="url(#colorCash)" />
                  <Area type="monotone" dataKey="card" name="Card" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCard)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>  
      </div>
    </div>
  )
}

export default Register