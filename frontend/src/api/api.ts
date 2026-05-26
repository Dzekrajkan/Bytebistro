import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError} from "@reduxjs/toolkit/query/react";
import { logout } from "../redux/authSlice";
import type { Table, Categories, MenuItem, GetOrderResponse, OrderResponse, Reports } from "../types/types";
import toast from "react-hot-toast";

const apiUrl = import.meta.env.VITE_API_URL;

interface listItems {
  menu_item: number,
  quantity: number
}

interface Order {
  table: number | undefined,
  order_type: "DI" | "TA",
  items: listItems[]
}

interface GetOrder {
  status: string[] | null,
  next: string | null
}

const baseQuery = fetchBaseQuery({
  baseUrl: apiUrl,
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status !== 401) {
    const detail = typeof result.error.data === "object" && result.error.data !== null ? (result.error.data as { detail?: string }).detail : `Error fetch`;

    if (detail) toast.error(`${detail} (${result.error.status})`);
  }

  if (result.error && result.error.status === 401) {
    console.log("Access token expired, trying refresh...");

    const refreshResult = await baseQuery(
      { url: "/refresh/", method: "POST" },
      api,
      extraOptions
    );
    if (refreshResult.data) {
      console.log("Token refreshed");
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout())
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Orders", "Tables"],
  endpoints: (build) => ({
    getCategories: build.query<Categories[], void>({
      query: () => "categories/",
    }),
    getMenuItems: build.query<MenuItem[], void>({
      query: () => "menu-items/",
    }),
    reserveTable: build.mutation<Table, void>({
      query: () => ({
        url: "tables/reserve/",
        method: "POST",
      })
    }),
    getOrder: build.query<GetOrderResponse, GetOrder>({
      query: ({status, next}) => ({
        url: next ? next.replace(apiUrl, "") : "orders/",
        params: status ? status.reduce((acc, s) => {
          acc.append("status", s);
          return acc;
        }, new URLSearchParams()) : undefined,
      }),
      providesTags: ["Orders"]
    }),
    getOrderById: build.query<OrderResponse, number>({
      query: (id: number) => `orders/${id}/`
    }),
    createOreder: build.mutation<OrderResponse, Order>({
      query: (order: Order) => ({
        url: "orders/",
        method: "POST",
        body: order
      })
    }),
    readyOrder: build.mutation<void, number>({
      query: (id: number) => ({
        url: `orders/${id}/ready/`,
        method: "POST"
      }),
      invalidatesTags: ["Orders"]
    }),
    cancelOrder: build.mutation<void, number>({
      query: (id: number) => ({
        url: `orders/${id}/cancel/`,
        method: "POST"
      }),
      invalidatesTags: ["Orders", "Tables"]
    }),
    complatedOrder: build.mutation<void, number>({
      query: (id: number) => ({
        url: `orders/${id}/completed/`,
        method: "POST"
      }),
      invalidatesTags: ["Tables"]
    }),
    getTables: build.query<Table[], void>({
      query: () => "tables/",
      providesTags: ["Tables"]
    }),
    freeTable: build.mutation<Table, number>({
      query: (id: number) => ({
        url: `tables/${id}/free/`,
        method: "POST"
      }),
      invalidatesTags: ["Tables"]
    }),
    getReports: build.query<Reports[], void>({
      query: () => "reports/daily/"
    })
  }),
})

export const { useGetCategoriesQuery, useGetMenuItemsQuery, useReserveTableMutation, useGetOrderQuery, useLazyGetOrderQuery, useLazyGetOrderByIdQuery, useCreateOrederMutation, useReadyOrderMutation, useCancelOrderMutation, useComplatedOrderMutation, useGetTablesQuery, useFreeTableMutation, useGetReportsQuery } = api