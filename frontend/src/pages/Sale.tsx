import { useState } from "react"
import { useCreateOrederMutation, useGetCategoriesQuery, useGetMenuItemsQuery, useReserveTableMutation } from "../api/api"
import type { MenuItem, Table } from "../types/types"
import ModalPay from "../components/common/ModalPay";
import api from "../utils/axiosInstance";
import { SyncLoader } from "react-spinners";
import toast from "react-hot-toast";
import TrashIcon from "../components/icons/TrashIcon";

const apiUrl = import.meta.env.VITE_API_URL;

type OrderItem = MenuItem & {
  qty: number;
};

function Sale() {
    const {data: categories = [], isLoading: isLoadingCategories} = useGetCategoriesQuery()
    const {data: menuItems = [], isLoading: isLoadingMenuItems} = useGetMenuItemsQuery()
    const [reserveTable, {isLoading}] = useReserveTableMutation()
    const [createOrder, {data: order, isLoading: isLoadingOrder}] = useCreateOrederMutation()
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [createdOrder, setCreatedOrder] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterItems, setFilterItems] = useState<MenuItem[] | null>(null)
    const [idFilter, setIdFilter] = useState(0)
    const [typeOrder, setTypeOrder] = useState<"DI" | "TA">("DI")
    const [listItems, setListItems] = useState<OrderItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const price = Number(listItems.reduce((sum, item) => sum + Number(item.price) * item.qty, 0).toFixed(2))
    const Tax = Number((price * 0.1).toFixed(2))
    const totalPrice = Number((price + Tax).toFixed(2))
    const visibleItems = (filterItems !== null ? filterItems : menuItems).filter(item => searchQuery.length === 0 || item.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleAddItem = (item: MenuItem) => {
      setListItems(prev => {
        const exists = prev.find(el => el.id === item.id);

        if (exists) return prev.map(el => el.id === item.id ? { ...el, qty: el.qty + 1 } : el);

        return [...prev, { ...item, qty: 1 }];
      });
    };

    const handleRemoveItem = (item: MenuItem) => {
      setListItems(prev => {
        const exists = prev.find(el => el.id === item.id)

        if (exists) return prev.map(el => el.id === item.id ? { ...el, qty: el.qty > 1 ? el.qty - 1 : el.qty} : el);

        return [...prev]
      })
    }

    const handleDeleteItem = (item: OrderItem) => {
      setListItems(prev => prev.filter(el => el.id !== item.id))
    }

    const handleFilterItems = (id: number) => {
      setFilterItems(menuItems.filter(el => el.category.id === id))
      setIdFilter(id)
    }

    const handleCreateOrder = async () => {
      if (createdOrder) return setIsOpen(true)
      if (!selectedTable && typeOrder == 'DI') return toast("You have not reserved a table.")
      if (listItems.length == 0) return console.log("items")
      const payload = listItems.map(item => ({
        menu_item: item.id,
        quantity: item.qty
      }))
      try {
        await createOrder({table: selectedTable?.id, items: payload, order_type: typeOrder})
        setCreatedOrder(true)
        setIsOpen(true)
      } catch(err: any) { 
        console.log(err)
      }
    }

    const handlePayOrder = async (type: string) => {
      if (!order) return
      try {
        await api.post(`orders/${order.id}/pay/`, {payment_method: type})
        setCreatedOrder(false)
      } catch (err: any) {
        toast.error("Payment failed. Try again.")
        throw err
      }
    }

    const handleNewOrder = async () => {
      setListItems([])
      setIsOpen(false)
      setSelectedTable(null)
    }

    const handleGetTable = async () => {
      const res = await reserveTable().unwrap()
      setSelectedTable(res)
    }

    if (isLoadingCategories && isLoadingMenuItems) return <div className="flex justify-center h-screen items-center"><SyncLoader speedMultiplier={0.7} size={10} color="#0789ff" /></div>

    return (
      <div className="flex h-[calc(100vh-4rem)] h-screen">
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-300/10">
          <div className="border-b space-y-4 p-6">
            <div className="flex max-[600px]:flex-col gap-4 min-[601px]:items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">Choose Category</h2>
                <p className="text-sm text-zinc-400">Select items to add to order</p>
              </div>
              <div className="relative w-full min-[600px]:w-64">
                <input type="text" className="border h-9 px-4 w-full rounded-md focus-visible:outline-none focus-visible:border-blue-500" placeholder="Search menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
              </div>
            </div>
            <div className="flex items-center overflow-x-auto scrollbar-hidden gap-3 pb-4">
              <button className={`py-2 px-5 border rounded-full whitespace-nowrap ${idFilter === 0 && "bg-blue-500 text-white"}`} onClick={() => { setFilterItems(null); setIdFilter(0) }}>All Menu</button>
              {categories && categories.map(category => (<button key={category.id} className={`py-2 px-5 border rounded-full whitespace-nowrap ${idFilter === category.id && "bg-blue-500 text-white"}`} onClick={() => handleFilterItems(category.id)}>{category.name}</button>))}
            </div>
          </div>
          <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 min-[1150px]:pb-6">
            {visibleItems.length != 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-6">
                {visibleItems.map(item => (
                  <div className="bg-white rounded-xl shadow overflow-hidden w-full group hover:-translate-y-1 transition-all duration-300" key={item.id} onClick={() => handleAddItem(item)}>
                    <div className="w-full h-40 overflow-hidden">
                      <img src={`${apiUrl}media/image.png`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold line-clamp-1">{item.name}</h3>
                      <p className="text-blue-500 font-bold mt-1 text-lg">${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-400">No products found</p>
              </div>
            )}
          </div>
        </div>
        <div className="hidden min-[1150px]:block lg:w-[350px] xl:w-[400px] 2xl:w-[450px] shrink-0 h-full">
          <div className="flex flex-col h-full border-l shadow-xl">
            <div className="p-4 space-y-4 border-b">
              <div className="flex items-center justify-between bg-zinc-300/30 p-1 rounded-md gap-2">
                <button className={`w-full py-2 text-sm rounded-md text-zinc-500 font-semibold ${typeOrder == "DI" && "bg-white text-blue-700"}`} onClick={() => setTypeOrder("DI")}>Dine In</button>
                <button className={`w-full py-2 text-sm rounded-md text-zinc-500 font-semibold ${typeOrder == "TA" && "bg-white text-blue-700"}`} onClick={() => setTypeOrder("TA")}>Take Away</button>
              </div>
              {typeOrder == "DI" && (
                <button className="w-full flex justify-between border px-4 py-1 shadow bg-zinc-200/20 rounded-md" disabled={isLoading || selectedTable ? true : false} onClick={handleGetTable}>
                  <span>Table</span>
                  <span className="font-semibold text-blue-600">{selectedTable ? selectedTable.number : "Select table"}</span>
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {listItems && listItems.map(item => (
                  <div className="flex items-center justify-center gap-4" key={item.id}>
                    <div className="overflow-hidden relative w-16 h-16 rounded-lg">
                      <img src={`${apiUrl}media/image.png`} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">{item.name}</span>
                        <span className="text-sm font-semibold">${item.price}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-zinc-300/30 py-1 px-2 gap-4 rounded-full">
                          <button className="w-6 h-6 bg-white rounded-full disabled:bg-white/50" disabled={item.qty <= 1} onClick={() => handleRemoveItem(item)}>-</button>
                          <span>{item.qty}</span>
                          <button className="w-6 h-6 bg-white rounded-full" onClick={() => handleAddItem(item)}>+</button>
                        </div>
                        <div onClick={() => handleDeleteItem(item)}>
                          <TrashIcon />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span>${price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Tax (10%)</span>
                  <span>${Tax}</span>
                </div>
                <div className="border-t"></div>
                <div className="flex justify-between text-xl font-semibold">
                  <span>Total</span>
                  <span className="text-blue-500">${totalPrice}</span>
                </div>
              </div>
              <button className="flex items-center justify-center h-12 w-full bg-blue-500 py-3 rounded-md text-xl font-semibold text-white disabled:bg-blue-500/50" disabled={listItems.length == 0 || isLoadingOrder} onClick={handleCreateOrder}>Proceed to Payment</button>
            </div>
          </div>
        </div>
        {isOpen && <ModalPay onClose={() => setIsOpen(false)} onPay={(type: string) => handlePayOrder(type)} onNewOrder={handleNewOrder} price={totalPrice}/>}
    </div>
  )
}

export default Sale