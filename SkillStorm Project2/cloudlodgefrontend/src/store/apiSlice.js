import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../api/apiFetch";
import { clearToken } from "./authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.token || localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    api.dispatch(clearToken());
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Users",
    "Rooms",
    "RoomTypes",
    "Reservations",
    "Availability",
    "Profile",
    "Dashboard",
    "Payments",
  ],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    register: builder.mutation({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    getAuthMe: builder.query({
      query: () => "/auth/me",
    }),
    getProfile: builder.query({
      query: () => "/profile",
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    getUser: builder.query({
      query: (id) => `/users/${id}`,
    }),
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
    getDashboard: builder.query({
      query: (params) => ({
        url: "/dashboard",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getRoomTypes: builder.query({
      query: () => "/roomtypes",
      providesTags: ["RoomTypes"],
    }),
    getRoomType: builder.query({
      query: (id) => `/roomtypes/${id}`,
    }),
    createRoomType: builder.mutation({
      query: (body) => ({
        url: "/roomtypes/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RoomTypes"],
    }),
    updateRoomType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/roomtypes/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["RoomTypes"],
    }),
    deleteRoomType: builder.mutation({
      query: (id) => ({
        url: `/roomtypes/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RoomTypes"],
    }),
    getRooms: builder.query({
      query: () => "/rooms",
      providesTags: ["Rooms"],
    }),
    getRoom: builder.query({
      query: (id) => `/rooms/${id}`,
    }),
    searchRooms: builder.query({
      query: (params) => ({
        url: "/rooms/search",
        params,
      }),
    }),
    createRoom: builder.mutation({
      query: (body) => ({
        url: "/rooms/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Rooms"],
    }),
    updateRoom: builder.mutation({
      query: ({ id, body }) => ({
        url: `/rooms/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Rooms"],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/rooms/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Rooms"],
    }),
    setRoomActive: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/rooms/set-active/${id}`,
        method: "PUT",
        params: { isActive },
      }),
      invalidatesTags: ["Rooms"],
    }),
    getReservationsByUser: builder.query({
      query: (userId) => `/reservations/user/${userId}`,
      providesTags: ["Reservations"],
    }),
    createReservation: builder.mutation({
      query: (body) => ({
        url: "/reservations/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reservations"],
    }),
    updateReservation: builder.mutation({
      query: ({ id, body }) => ({
        url: `/reservations/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Reservations"],
    }),
    deleteReservation: builder.mutation({
      query: (id) => ({
        url: `/reservations/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reservations"],
    }),
    getAvailabilityForRoom: builder.query({
      query: (roomId) => `/availability/room/${roomId}`,
      providesTags: ["Availability"],
    }),
    getAvailabilityForReservation: builder.query({
      query: (reservationId) => `/availability/reservation/${reservationId}`,
      providesTags: ["Availability"],
    }),
    createAvailability: builder.mutation({
      query: (body) => ({
        url: "/availability/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Availability"],
    }),
    deleteAvailability: builder.mutation({
      query: (id) => ({
        url: `/availability/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Availability"],
    }),
    getStripeConfig: builder.query({
      query: () => "/payments/config",
      providesTags: ["Payments"],
    }),
    createPaymentIntent: builder.mutation({
      query: (body) => ({
        url: "/payments/intent",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payments"],
    }),
    createSetupIntent: builder.mutation({
      query: () => ({
        url: "/payments/setup-intent",
        method: "POST",
      }),
      invalidatesTags: ["Payments"],
    }),
    deletePaymentMethod: builder.mutation({
      query: (paymentMethodId) => ({
        url: `/payments/methods/${paymentMethodId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payments", "Profile"],
    }),
    syncPaymentMethods: builder.mutation({
      query: () => ({
        url: "/payments/methods/sync",
        method: "POST",
      }),
      invalidatesTags: ["Payments", "Profile"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetAuthMeQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useLazyGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetDashboardQuery,
  useGetRoomTypesQuery,
  useGetRoomTypeQuery,
  useLazyGetRoomTypeQuery,
  useCreateRoomTypeMutation,
  useUpdateRoomTypeMutation,
  useDeleteRoomTypeMutation,
  useGetRoomsQuery,
  useGetRoomQuery,
  useLazyGetRoomQuery,
  useLazySearchRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useSetRoomActiveMutation,
  useGetReservationsByUserQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useDeleteReservationMutation,
  useGetAvailabilityForRoomQuery,
  useLazyGetAvailabilityForRoomQuery,
  useGetAvailabilityForReservationQuery,
  useLazyGetAvailabilityForReservationQuery,
  useCreateAvailabilityMutation,
  useDeleteAvailabilityMutation,
  useGetStripeConfigQuery,
  useCreatePaymentIntentMutation,
  useCreateSetupIntentMutation,
  useDeletePaymentMethodMutation,
  useSyncPaymentMethodsMutation,
} = apiSlice;
