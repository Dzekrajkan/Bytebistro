import { useState } from "react"

function ModalPay({ onClose, onPay, onNewOrder, price }: { onClose: () => void, onPay: (type: string) => Promise<void>, onNewOrder: () => void, price: number }) {
  const [isPaid, setIsPaid] = useState(false)
  const [isLoadingCash, setIsLoadingCash] = useState(false)
  const [isLoadingCard, setIsLoadingCard] = useState(false)

  const handlePay = async (type: string) => {
    if (type == "CS") setIsLoadingCash(true)
    if (type == "CR") setIsLoadingCard(true)
    try {
      await onPay(type)
      setIsPaid(true)
    } catch (err) {
      console.log(err)
    } finally {
      setIsLoadingCash(false)
      setIsLoadingCard(false)
    }
  }

  if (isPaid) return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="relative bg-white rounded-xl p-8 shadow-lg z-10 w-[500px] flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-green-500">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-2xl text-center font-bold">Payment Successful!</h2>
        <p className="text-zinc-400 text-sm text-center">Your order has been placed and payment was received.</p>
        <p className="text-3xl font-extrabold text-blue-500 ">${price}</p>
        <button className="w-full h-12 text-white text-lg rounded-md font-semibold bg-blue-500 hover:bg-blue-600 transition-colors duration-200" onClick={onNewOrder}>New order</button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="relative bg-white rounded-xl shadow-lg z-10 w-[500px] flex flex-col items-center gap-4">
        <div className="flex flex-col items-center p-6 space-y-1.5 w-full">
          <h2 className="text-2xl font-semibold text-center">Select Payment Method</h2>
          <div className="text-center py-2">
            <p className="text-sm text-zinc-400">Total Amount</p>
            <h3 className="text-3xl font-bold text-blue-500">${price}</h3>
          </div>
        </div>
        <div className="pt-2 py-10 px-6 w-full grid grid-cols-2 gap-4">
          <button disabled={isLoadingCash} className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-border rounded-xl w-full hover:border-blue-500 hover:bg-blue-500/5 transition-all group disabled:opacity-50" onClick={() => handlePay("CS")}>
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeWidth="2" strokeLinejoin="round" stroke="currentColor" className="lucide lucide-credit-card w-12 h-12 text-zinc-500 group-hover:text-blue-500 transition-colors">
              <rect width="20" height="12" x="2" y="6" rx="2"></rect>
              <circle cx={12} cy={12} r={2}></circle>
              <path d="M6 12h.01M18 12h.01"></path>
            </svg>
            <span className="font-semibold text-lg">{isLoadingCash ? "Processing..." : "Cash"}</span>
          </button>
          <button disabled={isLoadingCard} className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-border rounded-xl w-full hover:border-blue-500 hover:bg-blue-500/5 transition-all group disabled:opacity-50" onClick={() => handlePay("CR")}>
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeWidth="2" strokeLinejoin="round" stroke="currentColor" className="lucide lucide-credit-card w-12 h-12 text-zinc-500 group-hover:text-blue-500 transition-colors">
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
            <span className="font-semibold text-lg">{isLoadingCard ? "Processing..." : "Card"}</span>
          </button>
        </div>
        <button className="absolute right-4 top-4 text-zinc-400 hover:text-black transition-colors duration-200" onClick={onClose}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" className="lucide lucide-x h-4 w-4" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ModalPay