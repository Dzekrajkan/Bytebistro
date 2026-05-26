import { SyncLoader } from "react-spinners"
import { useGetTablesQuery, useComplatedOrderMutation, useGetOrderQuery, useFreeTableMutation, useCancelOrderMutation } from "../api/api"
import { useEffect, useState } from "react"
import type { Table } from "../types/types"

type TableO = Table & {
  order_id: number | null
}

function Tables() {
  const { data, isLoading } = useGetTablesQuery()
  const { data: orders } = useGetOrderQuery({status: ["R", "CR"], next: null})
  const [ComplatedOrder, { isLoading: isFreeingComplatedOrder }] = useComplatedOrderMutation()
  const [CancelOrder, { isLoading: isFreeingCancelOrder }] = useCancelOrderMutation()
  const [freeTableReserved, { isLoading: isFreeingReserved }] = useFreeTableMutation()
  const [tables, setTables] = useState<TableO[]>([])
  const occupied = tables.filter((t) => t.status === "O")
  const free = tables.filter((t) => t.status === "F")
  const reserved = tables.filter((t) => t.status === "R")

  useEffect(() => {
    if (!data || !orders?.results) return
    setTables(data.map((table) => ({...table, order_id: orders.results.find((o) => o.table ? o.table.id === table.id : null)?.id ?? null})))
  }, [data, orders])

  const handleComplatedOrder = async (id: number) => {
    try {
      await ComplatedOrder(id).unwrap()
      setTables(tables.map((table) => table.order_id == id ? { ...table, order_id: null, status: "F" } : table))
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancelOrder = async (id: number) => {
    try {
      await CancelOrder(id).unwrap()
      setTables(tables.map((table) => table.order_id == id ? { ...table, order_id: null, status: "F" } : table))
    } catch (err) {
      console.error(err)
    }
  }

  const handleFreeReserved = async (id: number) => {
    try {
      await freeTableReserved(id).unwrap()
      setTables(tables.map((table) => table.order_id == id ? { ...table, order_id: null, status: "F" } : table))
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) return <div className="flex justify-center h-screen items-center"><SyncLoader speedMultiplier={0.7} size={10} color="#0789ff" /></div>

  return (
    <div className="flex flex-col h-screen bg-zinc-300/10">
      <div className="space-y-4 p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold">Tables</h2>
            <p className="text-sm text-zinc-400">Mark tables as available</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              <span className="text-zinc-500">Free({free.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
              <span className="text-zinc-500">Occupied({occupied.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
              <span className="text-zinc-500">Reserved({reserved.length})</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-20 min-[1150px]:pb-6 p-6">
        {tables.length != 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map((table) => {
              const isOccupied = table.status === "O"
              const isFree = table.status === "F"
              const isReserved = table.status === "R"
              const order = orders?.results.find(order => order.id == table.order_id)

              return (
                <div key={table.id} className={`bg-white rounded-xl shadow p-4 flex flex-col gap-3 transition-all duration-200 border-2 ${isOccupied ? "border-red-400/30" : isReserved ? "border-yellow-400/30" : "border-green-400/30"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">#{table.number}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${isFree ? "bg-green-500" : isReserved ? "bg-yellow-400" : "bg-red-400"}`} />
                  </div>
                  <p className="text-xs text-zinc-400">{table.seats_count} seats</p>
                  <p className="text-xs text-zinc-400">id order: {table.order_id}</p>
                  <div className={`text-xs font-semibold px-2.5 py-0.5 rounded-md w-fit ${isFree ? "bg-green-100 text-green-600" : isReserved ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-500"}`}>{isFree ? "Free" : isReserved ? "Reserved" : "Occupied"}</div>
                  {!isFree && table.order_id !== null && order?.status == "Ready" && <button className="mt-auto w-full py-1.5 rounded-md text-xs font-semibold border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-200" disabled={isFreeingComplatedOrder || isFreeingReserved || isFreeingCancelOrder} onClick={() => handleComplatedOrder(table.order_id as number)}>Mark as free</button>}
                  {!isFree && order?.status == "Created" && <button className="mt-auto w-full py-1.5 rounded-md text-xs font-semibold border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-200" disabled={isFreeingComplatedOrder || isFreeingReserved || isFreeingCancelOrder} onClick={() => handleCancelOrder(table.order_id as number)}>Mark as free</button>}
                  {isReserved && <button className="mt-auto w-full py-1.5 rounded-md text-xs font-semibold border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-200" disabled={isFreeingComplatedOrder || isFreeingReserved || isFreeingCancelOrder} onClick={() => handleFreeReserved(table.id as number)}>Mark as free</button>}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-zinc-400">No tables found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tables