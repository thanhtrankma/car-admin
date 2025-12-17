import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Space,
  Table,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Radio,
  Button,
  message,
  Spin,
} from 'antd'
import {
  DollarOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import {
  getReportOverview,
  getReportChart,
  getReportRank,
  getReportInventory,
  exportReportExcel,
  type ReportOverviewResponse,
  type ReportChartItem,
  type ReportRankItem,
  type ReportInventoryItem,
} from '../services/reportService'

const VEHICLE_TYPE_LABELS: Record<number, string> = {
  1: 'Xe số',
  2: 'Xe tay ga',
  3: 'Xe côn tay',
}

const Reports = () => {
  const [reportType, setReportType] = useState<'sales' | 'inventory'>('sales')
  const [timeRange, setTimeRange] = useState<'DAY' | 'MONTH'>('MONTH')
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // Data states
  const [overview, setOverview] = useState<ReportOverviewResponse['overview'] | null>(null)
  const [chartData, setChartData] = useState<ReportChartItem[]>([])
  const [rankData, setRankData] = useState<ReportRankItem[]>([])
  const [inventoryData, setInventoryData] = useState<ReportInventoryItem[]>([])
  const [inventorySummary, setInventorySummary] = useState<{
    totalGroups: number
    totalProducts: number
    totalInStock: number
    totalOutOfStock: number
  } | null>(null)

  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true)
      const [overviewRes, chartRes, rankRes] = await Promise.all([
        getReportOverview(timeRange),
        getReportChart(),
        getReportRank(),
      ])
      setOverview(overviewRes.overview)
      setChartData(chartRes.data)
      setRankData(rankRes.data.ranking)
    } catch {
      message.error('Không thể tải dữ liệu báo cáo')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getReportInventory()
      setInventoryData(res.data.inventory)
      setInventorySummary(res.data.summary)
    } catch {
      message.error('Không thể tải dữ liệu tồn kho')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (reportType === 'sales') {
      fetchSalesData()
    } else {
      fetchInventoryData()
    }
  }, [reportType, fetchSalesData, fetchInventoryData])

  const handleExport = async () => {
    try {
      setExportLoading(true)
      await exportReportExcel()
      message.success('Xuất báo cáo thành công!')
    } catch {
      message.error('Không thể xuất báo cáo')
    } finally {
      setExportLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const maxRevenue = Math.max(...chartData.map(r => r.price), 1)
  const totalRevenue = chartData.reduce((sum, r) => sum + r.price, 0)

  const salesColumns = [
    {
      title: 'Xếp hạng',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank: number): React.ReactNode => (
        <span style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>#{rank}</span>
      ),
    },
    {
      title: 'Tên xe',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version',
      render: (version: string | null) => version || '-',
    },
    {
      title: 'Màu sắc',
      dataIndex: 'color',
      key: 'color',
      render: (color: string | null) => color || '-',
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      render: (qty: number) => `${qty} xe`,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (revenue: number) => formatPrice(revenue) + ' VNĐ',
    },
  ]

  const inventoryColumns = [
    {
      title: 'Mã xe',
      dataIndex: 'productTypeCode',
      key: 'productTypeCode',
    },
    {
      title: 'Tên xe',
      dataIndex: 'productTypeName',
      key: 'productTypeName',
    },
    {
      title: 'Loại xe',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      render: (type: number) => VEHICLE_TYPE_LABELS[type] || '-',
    },
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version',
      render: (version: string | null) => version || '-',
    },
    {
      title: 'Màu',
      dataIndex: 'color',
      key: 'color',
      render: (color: string | null) => color || '-',
    },
    {
      title: 'Số lượng tồn',
      dataIndex: 'inStockQuantity',
      key: 'inStockQuantity',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>{status ? 'Còn hàng' : 'Hết hàng'}</Tag>
      ),
    },
  ]

  const renderRateIcon = (rate: number | null) => {
    if (rate === null) return null
    if (rate >= 0) {
      return (
        <span style={{ color: '#52c41a' }}>
          <ArrowUpOutlined /> +{rate}%
        </span>
      )
    }
    return (
      <span style={{ color: '#ff4d4f' }}>
        <ArrowDownOutlined /> {rate}%
      </span>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
          marginBottom: 24,
          gap: window.innerWidth < 768 ? 16 : 0,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: window.innerWidth < 576 ? 20 : 24,
              fontWeight: 'bold',
              marginBottom: 8,
            }}
          >
            Báo cáo
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>Xem báo cáo doanh số và tồn kho</p>
        </div>
        <Space
          direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'}
          style={{ width: window.innerWidth < 768 ? '100%' : 'auto' }}
        >
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exportLoading}
            block={window.innerWidth < 768}
          >
            Xuất Excel
          </Button>
          <Radio.Group
            value={reportType}
            onChange={e => setReportType(e.target.value)}
            buttonStyle="solid"
            size={window.innerWidth < 576 ? 'small' : 'middle'}
          >
            <Radio.Button value="sales">Báo cáo doanh số</Radio.Button>
            <Radio.Button value="inventory">Báo cáo tồn kho</Radio.Button>
          </Radio.Group>
        </Space>
      </div>

      <Spin spinning={loading}>
        {reportType === 'sales' && (
          <>
            <Card style={{ marginBottom: 16 }}>
              <Radio.Group
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="DAY">Theo ngày</Radio.Button>
                <Radio.Button value="MONTH">Theo tháng</Radio.Button>
              </Radio.Group>
            </Card>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="stretch">
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Statistic
                    title="Tổng doanh thu"
                    value={overview?.value1.value1 || 0}
                    formatter={value => formatPrice(Number(value)) + ' VNĐ'}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    {renderRateIcon(overview?.value1.value2 ?? null)} so với{' '}
                    {timeRange === 'MONTH' ? 'tháng trước' : 'ngày trước'}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Statistic
                    title="Số hoá đơn"
                    value={overview?.value2.value1 || 0}
                    formatter={value => formatPrice(Number(value))}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                  {overview?.value2.value2 !== null && (
                    <div style={{ marginTop: 8, fontSize: 12 }}>
                      {renderRateIcon(overview?.value2.value2 ?? null)} so với{' '}
                      {timeRange === 'MONTH' ? 'tháng trước' : 'ngày trước'}
                    </div>
                  )}
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Statistic
                    title="Số lượng xe bán ra"
                    value={overview?.value3.value1 || 0}
                    prefix={<CarOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    {renderRateIcon(overview?.value3.value2 ?? null)} so với{' '}
                    {timeRange === 'MONTH' ? 'tháng trước' : 'ngày trước'}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Statistic
                    title="Xe bán chạy nhất"
                    value={overview?.value4.value1 || '-'}
                    prefix={<ShoppingCartOutlined />}
                    valueStyle={{ fontSize: 18, wordBreak: 'break-word', color: '#1890ff' }}
                  />
                  <div style={{ marginTop: 8, fontSize: 12, color: '#1890ff' }}>
                    {overview?.value4.value2 || 0} đơn
                  </div>
                </Card>
              </Col>
            </Row>

            <Card style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 24 }}>
                {timeRange === 'MONTH'
                  ? 'Doanh thu theo tháng'
                  : 'So sánh doanh thu giữa các ngày trong tuần'}
              </h2>
              {chartData.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  {chartData.map((item, index) => (
                    <div key={index}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{item.date}</span>
                        <span style={{ fontWeight: 'bold' }}>
                          {formatPrice(item.price)} VNĐ ({item.quantity} xe)
                        </span>
                      </div>
                      <Progress
                        percent={(item.price / maxRevenue) * 100}
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                        showInfo={false}
                      />
                    </div>
                  ))}
                  <Card style={{ background: '#f0f9ff', marginTop: 8 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: 16 }}>Tổng doanh thu:</span>
                      <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                        {formatPrice(totalRevenue)} VNĐ
                      </span>
                    </div>
                  </Card>
                </Space>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  Không có dữ liệu
                </div>
              )}
            </Card>

            <Card>
              <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                Xe bán chạy nhất
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <Table
                  columns={salesColumns}
                  dataSource={rankData}
                  rowKey="rank"
                  pagination={false}
                  scroll={{ x: 'max-content' }}
                  locale={{ emptyText: 'Không có dữ liệu' }}
                />
              </div>
            </Card>
          </>
        )}

        {reportType === 'inventory' && (
          <Card>
            <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 24 }}>Báo cáo tồn kho</h2>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Tổng nhóm xe"
                    value={inventorySummary?.totalGroups || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Tổng số xe"
                    value={inventorySummary?.totalProducts || 0}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Xe còn hàng"
                    value={inventorySummary?.totalInStock || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Xe hết hàng"
                    value={inventorySummary?.totalOutOfStock || 0}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>
            <div style={{ overflowX: 'auto' }}>
              <Table
                columns={inventoryColumns}
                dataSource={inventoryData}
                rowKey={(record, index) => `${record.productTypeId}-${index}`}
                pagination={false}
                scroll={{ x: 'max-content' }}
                locale={{ emptyText: 'Không có dữ liệu' }}
              />
            </div>
          </Card>
        )}
      </Spin>
    </div>
  )
}

export default Reports
