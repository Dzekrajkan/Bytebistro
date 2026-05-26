import { SyncLoader } from "react-spinners"
import { useGetOrderQuery, useLazyGetOrderByIdQuery, useLazyGetOrderQuery } from "../api/api"
import formatDate from "../utils/formatDate"
import { useEffect, useState } from "react"
import type { GetOrderResponse, OrderResponse } from "../types/types"
import api from "../utils/axiosInstance"
import TrashIcon from "../components/icons/TrashIcon"

function History() {
  const {data, isLoading: isLoadingOrders} = useGetOrderQuery({status: ["CA", "CO"], next: null})
  const [getOrders] = useLazyGetOrderQuery()
  const [getOrderById, {isLoading: isLoadingOrderById}] = useLazyGetOrderByIdQuery()
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [pageInfo, setPageInfo] = useState<GetOrderResponse | null>(null)
  const [searchValue, setSearchValue] = useState("")
  const id = Number(searchValue)

  useEffect(() => {
    if (data?.results) {
      setOrders(data.results)
      setPageInfo(data)
    }
  }, [data])

  const handleGetOrder = async() => {
    const res = await getOrderById(id).unwrap()
    setOrder(res)
  }

  const handleLoadMore = async () => {
    if (!pageInfo?.next) return

    const res = await getOrders({status: ["CA", "CO"], next: pageInfo.next}).unwrap()
    setOrders(prev => [...prev, ...res.results])
    setPageInfo(res)
  }

  const handleDeleteOrder = async(id: number) => {
    try {
      await api.delete(`orders/${id}/`)
      setOrders(orders.filter(order => order.id != id))
      setOrder(null)
    } catch(err: any) {
      console.log(err)
    }
  }
  
  if (isLoadingOrders || isLoadingOrderById) return <div className="flex justify-center h-screen items-center"><SyncLoader speedMultiplier={0.7} size={10} color="#0789ff" /></div>

  return(
    <div className="flex flex-col h-screen bg-zinc-300/10">
      <div className="space-y-6 p-6">
        <div className="flex max-[600px]:flex-col gap-4 min-[601px]:items-center justify-between">
          <div className="flex flex-col"> 
            <h2 className="text-2xl font-bold">Order History</h2>
            <p className="text-zinc-400">View past transactions</p>
          </div>
          <div className="relative w-full min-[601px]:w-64 flex gap-2">
            <button className="h-9 w-12 border rounded-md bg-white flex items-center justify-center text-zinc-500 hover:text-black transition-colors duration-200" onClick={() => {setOrder(null), setSearchValue("")}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="lucide lucide-x h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
            <input type="number" className="border h-9 px-4 w-full rounded-md focus-visible:outline-none focus-visible:border-blue-500" placeholder="Search orders..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter") return handleGetOrder()}}/>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="h-10 text-zinc-500 border-b">
                  <th className="text-left font-medium p-2 whitespace-nowrap">Order ID</th>
                  <th className="text-left font-medium p-2 whitespace-nowrap">Date & Time</th>
                  <th className="text-left font-medium p-2">Type</th>
                  <th className="text-left font-medium p-2">Payment</th>
                  <th className="text-left font-medium p-2">Status</th>
                  <th className="text-right font-medium p-2">Total</th>
                  <th className="font-medium p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {!order ? orders?.length != 0 && orders?.map(order => (
                  <tr className="border-b h-12" key={order.id}>
                    <td className="p-2 align-middle font-semibold">#{order.id}</td>
                    <td className="p-2 whitespace-nowrap text-zinc-500">{formatDate(order.created_at)}</td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="border inline-flex px-2 py-0.5 rounded-md text-xs font-semibold">{order.order_type}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">Credit Card</td>
                    <td className="p-2 whitespace-nowrap">
                      <div className={`px-3 py-0.5 pb-1 inline-flex rounded-md text-xs font-semibold items-center ${order.status == "Completed" && "bg-green-600 text-white" || order.status == "Cancelled" && "bg-red-500/15 text-red-700"}`}>{order.status}</div>
                    </td>
                    <td className="p-2 text-right font-semibold">${order.total_amount}</td>
                    <td className="p-2 text-center" onClick={() => handleDeleteOrder(order.id)}>
                      <div className="flex items-center justify-center">
                        <TrashIcon />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr className="border-b h-12" key={order.id}>
                    <td className="p-2 align-middle font-semibold">#{order.id}</td>
                    <td className="p-2 whitespace-nowrap text-zinc-500">{formatDate(order.created_at)}</td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="border inline-flex px-2 py-0.5 rounded-md text-xs font-semibold">Dine-in</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">Credit Card</td>
                    <td className="p-2 whitespace-nowrap">
                      <div className={`px-3 py-0.5 pb-1 inline-flex rounded-md text-xs font-semibold items-center ${order.status == "Completed" && "bg-green-600 text-white" || order.status == "Cancelled" && "bg-red-500/15 text-red-700"}`}>{order.status}</div>
                    </td>
                    <td className="p-2 text-right font-semibold">${order.total_amount}</td>
                    <td className="p-2 text-center" onClick={() => handleDeleteOrder(order.id)}>
                      <div className="flex items-center justify-center">
                        <TrashIcon />
                      </div>
                    </td>
                  </tr>
                )}
                
              </tbody>
            </table>
          </div>
        </div>
        {pageInfo?.next != null && (
          <div className="flex justify-center">
            <button onClick={handleLoadMore}>Load more</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default History