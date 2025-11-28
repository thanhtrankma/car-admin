import { apiRequest } from './apiClient';

export interface ProductDto {
  id: string;
  sku: string;
  code: string;
  name: string;
  vehicleType: number;
  version: string;
  weight?: string;
  cc?: string;
  manufacturedDate?: string;
  color?: string;
  chassisNumber?: string;
  engineNumber?: string;
  receiptDate?: string;
  cost: number;
  price: number;
  warehouseStatus: number;
  images?: string[];
  quantity: number;
  line?: string;
  created_at: string;
  updated_at: string;
  createdBy?: {
    username: string;
    email: string;
    id: string;
  };
  updatedBy?: {
    username: string;
    email: string;
    id: string;
  };
  deleted_at?: string | null;
  deletedBy?: string | null;
}

export interface ListProductsParams {
  search?: string;
  warehouseStatus?: number;
  vehicleType?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListProductsResponse {
  data: ProductDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductPayload {
  name: string;
  vehicleType: number;
  version: string;
  line?: string;
  weight?: string;
  cc?: string;
  manufacturedDate?: string;
  color?: string;
  chassisNumber?: string;
  engineNumber?: string;
  receiptDate?: string;
  cost: number;
  price: number;
  quantity: number;
  warehouseStatus: number;
  images?: string[];
}

export interface ProductTypeDto {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deletedBy: string | null;
}

export interface ListProductTypesResponse {
  data: ProductTypeDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const listProducts = (params?: ListProductsParams) =>
  apiRequest<ListProductsResponse>('/products', { params });

export const getProductById = (id: string) =>
  apiRequest<ProductDto>(`/products/${id}`);

export const createProduct = (payload: ProductPayload) =>
  apiRequest<ProductDto>('/products', {
    method: 'POST',
    data: payload,
  });

export const updateProduct = (id: string, payload: Partial<ProductPayload>) =>
  apiRequest<ProductDto>(`/products/${id}`, {
    method: 'PUT',
    data: payload,
  });

export const deleteProduct = (id: string) =>
  apiRequest<{ message: string; product: { id: string } }>(`/products/${id}`, {
    method: 'DELETE',
  });

export const uploadProductImages = (files: File[], bucket = 'products') => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('bucket', bucket);

  return apiRequest<string[]>('/multi-files', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getProductBySku = (sku: string) =>
  apiRequest<ProductDto>(`/products/sku/${sku}`);

export const getProductByCode = (code: string) =>
  apiRequest<ProductDto>(`/products/code/${code}`);

export const listProductTypes = (page = 1, limit = 100) =>
  apiRequest<ListProductTypesResponse>('/product-types', {
    params: { page, limit },
  });


