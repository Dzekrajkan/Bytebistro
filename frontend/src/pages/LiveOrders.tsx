import { SyncLoader } from "react-spinners"
import { useCancelOrderMutation, useGetOrderQuery, useLazyGetOrderQuery, useReadyOrderMutation } from "../api/api"
import { useEffect, useState } from "react"
import type { GetOrderResponse, OrderResponse } from "../types/types"

function LiveOrders() {
  const {data, isLoading} = useGetOrderQuery({status: ["S"], next: null})
  const [getOrders] = useLazyGetOrderQuery()
  const [orderReady, {isLoading: isLoadingOrderReady}] = useReadyOrderMutation()
  const [orderCancel, {isLoading: isLoadingOrderCancel}] = useCancelOrderMutation()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [pageInfo, setPageInfo] = useState<GetOrderResponse | null>(null)

  useEffect(() => {
    if (data?.results) {
      setOrders(data.results)
      setPageInfo(data)
    }
  }, [data])

  const handleNext = async () => {
    if (!pageInfo?.next) return

    const res = await getOrders({status: ["S"], next: pageInfo.next}).unwrap()
    setOrders(res.results)
    setPageInfo(res)
  }

  const handlePrev = async () => {
    if (!pageInfo?.previous) return

    const res = await getOrders({status: ["S"], next: pageInfo.previous}).unwrap()
    setOrders(res.results)
    setPageInfo(res)
  }

  if (isLoading) return <div className="flex justify-center h-screen items-center"><SyncLoader speedMultiplier={0.7} size={10} color="#0789ff" /></div>

  return(
    <div className="flex flex-col h-screen bg-zinc-300/10">
      <div className="space-y-4 p-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">Live Orders</h2>
          <p className="text-zinc-400">Manage incoming orders</p>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {orders?.length === 0 ? (
          <p className="text-center">No orders found</p>
        ) : (
        <div className="grid max-[800px]:grid-cols-2 grid-cols-3 gap-6">
            {orders?.map(order => (
            <div className="bg-white shadow-md flex flex-col p-4 space-y-4 rounded-lg h-full" key={order.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">#{order.id}</span>
                    <div className="text-xs font-semibold px-2.5 py-0.5 bg-blue-500 text-white rounded-md">{order.order_type}</div>
                  </div>
                  <p className="text-sm text-zinc-500">Alice Johnson</p>
                </div>
                <div className="text-xs text-zinc-500 bg-zinc-300/30 px-2.5 py-0.5 rounded-sm">10:45 AM</div>
              </div>
              <div className="flex flex-col space-y-3 flex-1">
                <div className="flex flex-wrap gap-1 text-zinc-400">
                  {order.items.map(item => (
                    <div className="gap-1 items-center flex" key={item.menu_item.id}>
                      <span>{item.menu_item.name} </span>
                      <span>x{item.quantity},</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-semibold">Total</span>
                  <span className="text-lg font-semibold text-blue-500">${order.total_amount}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-full bg-red-500/20 py-2 rounded-md text-red-500 flex justify-center items-center hover:bg-red-500 hover:text-white transition-all duration-300" disabled={isLoadingOrderReady || isLoadingOrderCancel} onClick={() => orderCancel(order.id)}>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" className="lucide lucide-x h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
                <button className="w-full bg-green-600 py-1 rounded-md text-white flex justify-center items-center hover:bg-green-600/80 transition-colors" disabled={isLoadingOrderReady || isLoadingOrderCancel} onClick={() => orderReady(order.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </button>
              </div>
            </div>
            ))}
          </div>
          )}
      </div>
      <div className="flex items-center justify-center h-[80px] gap-10 mb-16 min-[1150px]:mb-0">
        <button className="p-1 disabled:text-zinc-400 transition-transform duration-200 enabled:hover:scale-90" disabled={!pageInfo?.previous} onClick={handlePrev}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2L6 12L18 22" stroke="currentColor"></path>
          </svg>
        </button>
        <button className="p-1 disabled:text-zinc-400 transition-transform duration-200 enabled:hover:scale-90" disabled={!pageInfo?.next} onClick={handleNext}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2L18 12L6 22" stroke="currentColor"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default LiveOrders