import { apiRequest } from './apiClient'

export interface CustomerDto {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalOrders?: number
  totalSpent?: number
  created_at?: string
  updated_at?: string
  carUsing?: string
}

export interface ListCustomersParams {
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ListCustomersResponse {
  success: boolean
  message: string
  data: CustomerDto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CustomerPayload {
  name: string
  email: string
  phone: string
  address: string
  carUsing?: string
}

export interface CustomerDetailResponse {
  success: boolean
  message: string
  data: CustomerDto
}

export const listCustomers = (params?: ListCustomersParams) =>
  apiRequest<ListCustomersResponse>('/customers', { params })

export const getCustomerById = (id: string) =>
  apiRequest<CustomerDetailResponse>(`/customers/${id}`)

export const createCustomer = (payload: CustomerPayload) =>
  apiRequest<CustomerDetailResponse>('/customers', {
    method: 'POST',
    data: payload,
  })

export const updateCustomer = (id: string, payload: CustomerPayload) =>
  apiRequest<CustomerDetailResponse>(`/customers/${id}`, {
    method: 'PUT',
    data: payload,
  })

export const deleteCustomer = (id: string) =>
  apiRequest<CustomerDetailResponse>(`/customers/${id}`, {
    method: 'DELETE',
  })
