import { apiRequest } from './apiClient'

export interface InvoiceDto {
  id: string
  invoiceNumber: string
  customerId?:
    | string
    | {
        id?: string
        name?: string
        phone?: string
        email?: string
        address?: string
        totalOrders?: number
        totalSpent?: number
      }
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress?: string
  totalAmount: number
  productCount?: number
  created_at: string
  updated_at: string
}

export interface InvoiceItemDto {
  id: string
  productId:
    | {
        id: string
        sku: string
        name: string
        price: number
        images?: string[]
      }
    | string
  productName: string
  productSku: string
  productPrice: number
  totalPrice: number
  quantity: number
  created_at: string
}

export interface ListInvoicesParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ListInvoicesResponse {
  success: boolean
  message: string
  data: InvoiceDto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface InvoiceDetailResponse {
  invoice: InvoiceDto
  customer: {
    id: string
    name: string
    phone: string
    email?: string
    address?: string
    totalOrders?: number
    totalSpent?: number
  }
  details: InvoiceItemDto[]
}

export interface CreateInvoicePayload {
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress?: string
  identificationCard?: string
  items: {
    productId: string
  }[]
}

export const listInvoices = (params?: ListInvoicesParams) =>
  apiRequest<ListInvoicesResponse>('/invoices', { params })

export const createInvoice = (payload: CreateInvoicePayload) =>
  apiRequest<{ message: string; invoice: InvoiceDto }>('/invoices', {
    method: 'POST',
    data: payload,
  })

export const getInvoiceById = (id: string) => apiRequest<InvoiceDetailResponse>(`/invoices/${id}`)
