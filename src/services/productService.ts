import { apiRequest } from './apiClient'

export interface ProductDto {
  id: string
  sku: string
  code: string
  name: string
  vehicleType: number
  version: string
  weight?: string
  cc?: string
  manufacturedDate?: string
  color?: string
  chassisNumber?: string
  engineNumber?: string
  receiptDate?: string
  cost: number
  price: number
  warehouseStatus: number
  images?: string[]
  quantity: number
  line?: string
  created_at: string
  updated_at: string
  createdBy?: {
    username: string
    email: string
    id: string
  }
  updatedBy?: {
    username: string
    email: string
    id: string
  }
  deleted_at?: string | null
  deletedBy?: string | null
}

export interface ListProductsParams {
  search?: string
  warehouseStatus?: number
  vehicleType?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ListProductsResponse {
  data: ProductDto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ProductPayload {
  name: string
  vehicleType: number
  version: string
  line?: string
  weight?: string
  cc?: string
  manufacturedDate?: string
  color?: string
  chassisNumber?: string
  engineNumber?: string
  receiptDate?: string
  cost?: number
  price: number
  quantity?: number
  warehouseStatus: number
  images?: string[]
  productRemainId?: string
}

export interface ProductTypeDto {
  id: string
  name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  deletedBy: string | null
}

export interface ListProductTypesResponse {
  data: ProductTypeDto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const listProducts = (params?: ListProductsParams) =>
  apiRequest<ListProductsResponse>('/products', { params })

export const getProductById = (id: string) => apiRequest<ProductDto>(`/products/${id}`)

export const createProduct = (payload: ProductPayload) =>
  apiRequest<ProductDto>('/products', {
    method: 'POST',
    data: payload,
  })

export const updateProduct = (id: string, payload: Partial<ProductPayload>) =>
  apiRequest<ProductDto>(`/products/${id}`, {
    method: 'PUT',
    data: payload,
  })

export const deleteProduct = (id: string) =>
  apiRequest<{ message: string; product: { id: string } }>(`/products/${id}`, {
    method: 'DELETE',
  })

export const uploadProductImages = (files: File[], bucket = 'products') => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  formData.append('bucket', bucket)

  return apiRequest<string[]>('/multi-files', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getProductBySku = (sku: string) => apiRequest<ProductDto>(`/products/sku/${sku}`)

export const getProductByCode = (code: string) => apiRequest<ProductDto>(`/products/code/${code}`)

export const listProductTypes = (page = 1, limit = 100) =>
  apiRequest<ListProductTypesResponse>('/product-types', {
    params: { page, limit },
  })

export interface WarehouseDto {
  id: string
  publicCode: string
  receiptDate: string
  quantity: number
  createdBy: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  deletedBy: string | null
}

export interface ListWarehousesParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ListWarehousesResponse {
  data: WarehouseDto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const listWarehouses = (params?: ListWarehousesParams) =>
  apiRequest<ListWarehousesResponse>('/warehouses', { params })

export interface WarehouseDetailDto {
  id: string
  publicCode: string
  receiptDate: string
  quantity: number
  createdBy: {
    username: string
    email: string
    id: string
  }
  created_at: string
  updated_at: string
  deleted_at: string | null
  deletedBy: string | null
  warehouseDetails: Array<{
    id: string
    wareHouseId: string
    productTypeId: {
      name: string
      code: string
      id: string
    }
    publicCode: string
    code: string
    name: string
    cost: number
    totalCost: number
    quantity: number
    remain: number
    totalProductCreated: number
    types: number[]
    abbreviation: string
    createdBy: {
      username: string
      email: string
      id: string
    }
    created_at: string
    updated_at: string
    deleted_at: string | null
    deletedBy: string | null
  }>
}

export interface WarehouseDetailResponse {
  success: boolean
  message: string
  data: WarehouseDetailDto
}

export const getWarehouseById = (id: string) =>
  apiRequest<WarehouseDetailResponse>(`/warehouses/${id}`)

export interface ImportWarehouseResponse {
  success: boolean
  data: {
    importInfo: {
      importDate: string
      importCode: string
    }
    summary: Array<{
      code: string
      name: string
      amount: number
      unitPrice: string
    }>
    details: Array<{
      internalCode: string
      code: string
      name: string
      type: string
      version: string
      weight: string
      capacity: string
      year: string
      color: string
      chassisNumber: string
      engineNumber: string
      status: string
      costPrice: string
      salePrice: string
    }>
    groupedByCode: Array<{
      code: string
      name: string
      totalAmount: number
      unitPrice: string
      details: Array<{
        internalCode: string
        code: string
        name: string
        type: string
        version: string
        weight: string
        capacity: string
        year: string
        color: string
        chassisNumber: string
        engineNumber: string
        status: string
        costPrice: string
        salePrice: string
      }>
      count: number
    }>
  }
}

export const importWarehouseFromExcel = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<ImportWarehouseResponse>('/warehouses/import', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export interface ProductRemainStateResponse {
  success: boolean
  data: {
    totalRemain: number
  }
}

export interface ProductRemainDto {
  id: string
  deleted_at: string | null
  deletedBy: string | null
  wareHouseId: string
  productTypeId: string
  publicCode: string
  code: string
  name: string
  cost: number
  totalCost: number
  quantity: number
  remain: number
  totalProductCreated: number
  types: number[]
  abbreviation: string
  createdBy: string
  created_at: string
  updated_at: string
}

export interface ListProductRemainParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ListProductRemainResponse {
  data: ProductRemainDto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const getProductRemainState = () =>
  apiRequest<ProductRemainStateResponse>('/product-remain/state')

export const listProductRemain = (params?: ListProductRemainParams) =>
  apiRequest<ListProductRemainResponse>('/product-remain', { params })
