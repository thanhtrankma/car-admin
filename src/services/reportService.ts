import { apiRequest } from './apiClient'

export interface ReportOverviewResponse {
  overview: {
    value1: {
      total: number
      rate: number | null
    }
    value2: {
      total: number
      rate: number | null
    }
    value3: {
      total: number
      rate: number | null
    }
    value4: {
      name: string
      total: number
    }
  }
}

export interface ReportChartItem {
  date: string
  price: number
  quantity: number
  count: number
}

export interface ReportChartResponse {
  success: boolean
  message: string
  data: ReportChartItem[]
}

export interface ReportRankItem {
  rank: number
  productName: string
  version: string | null
  color: string | null
  totalQuantity: number
  totalRevenue: number
}

export interface ReportRankResponse {
  success: boolean
  message: string
  data: {
    ranking: ReportRankItem[]
    summary: {
      totalQuantity: number
      totalRevenue: number
      totalProducts: number
    }
  }
}

export interface ReportInventoryItem {
  productTypeId: string
  vehicleType: number
  version: string | null
  color: string | null
  productTypeCode: string
  productTypeName: string
  totalQuantity: number
  inStockQuantity: number
  outOfStockQuantity: number
  status: boolean
}

export interface ReportInventoryResponse {
  success: boolean
  data: {
    summary: {
      totalGroups: number
      totalProducts: number
      totalInStock: number
      totalOutOfStock: number
    }
    inventory: ReportInventoryItem[]
  }
}

export const getReportOverview = (type: 'DAY' | 'MONTH' = 'MONTH') =>
  apiRequest<ReportOverviewResponse>('/report', { params: { type } })

export const getReportChart = () => apiRequest<ReportChartResponse>('/report/chart')

export const getReportRank = () => apiRequest<ReportRankResponse>('/report/rank')

export const getReportInventory = () => apiRequest<ReportInventoryResponse>('/report/inventory')

export const exportReportExcel = async () => {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(
    `${import.meta.env.PROD ? '/api' : 'http://171.244.43.84:9004/honda'}/report/export-excel`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Không thể xuất báo cáo')
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bao-cao-${new Date().toISOString().split('T')[0]}.xlsx`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
