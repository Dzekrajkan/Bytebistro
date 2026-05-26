interface RegisterCardProps {
  title: string
  value: string
  subtitle: string
  valueColor?: string
  icon?: React.ReactNode
}

function RegisterCard({ title, value, subtitle, valueColor = "text-black", icon }: RegisterCardProps) {
  return (
    <div className="bg-white flex flex-col p-6 rounded-xl shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className={`text-2xl font-bold ${valueColor}`}>{value}</h3>
        <p className="text-xs text-zinc-400">{subtitle}</p>
      </div>
    </div>
  )
}

export default RegisterCard