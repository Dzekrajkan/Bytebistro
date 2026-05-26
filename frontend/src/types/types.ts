export interface Categories {
  id: number,
  name: string,
  is_active: boolean,
  created_at: string
}

export interface MenuItem {
  id: number,
  name: string,
  description: string,
  price: string,
  is_available: boolean,
  created_at: string,
  category: Categories
}

export interface Table {
  id: number,
  number: number,
  seats_count: number,
  status: string,
  created_at: string
}

interface MenuItemResponse {
  id: number,
  name: string,
  price: string
}

interface listItemsResponse {
  menu_item: MenuItemResponse,
  quantity: number
}

export interface OrderResponse {
  id: number,
  table: Table,
  status: string,
  order_type: string,
  total_amount: number,
  created_at: string,
  updated_at: string,
  items: listItemsResponse[]
}

export interface GetOrderResponse {
  count: number,
  next: string | null,
  previous: string | null,
  results: OrderResponse[]
}

export interface Reports {
  time: string,
  cash: number,
  card: number,
  cash_count: number,
  card_count: number
}