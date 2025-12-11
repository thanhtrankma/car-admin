import { apiRequest } from './apiClient'

export interface UserDto {
  id: string
  username: string
  email: string
  fullName: string
  role: string
  status: string
  created_at: string
  updated_at: string
  avatar_url?: string
  phone_number?: string
}

export interface UserPayload {
  username: string
  email: string
  fullName: string
  password?: string
  role: string
  status: string
  avatar_url?: string
  phone_number?: string
}

export interface ListUsersParams {
  search?: string
  role?: string
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ListUsersResponse {
  data: UserDto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const listUsers = (params?: ListUsersParams) =>
  apiRequest<ListUsersResponse>('/users', { params })

export const getUserById = (id: string) => apiRequest<UserDto>(`/users/${id}`)

export const createUser = (payload: UserPayload) =>
  apiRequest<UserDto>('/users', {
    method: 'POST',
    data: payload,
  })

export const updateUser = (id: string, payload: UserPayload) =>
  apiRequest<UserDto>(`/users/${id}`, {
    method: 'PUT',
    data: payload,
  })

export const deleteUser = (id: string) =>
  apiRequest<{ message: string }>(`/users/${id}`, {
    method: 'DELETE',
  })

export const changeUserStatus = (id: string, status: string) =>
  apiRequest<UserDto>(`/users/${id}/status`, {
    method: 'PATCH',
    data: { status },
  })
