import { useState } from 'react'
import { Card, Space, Table, Row, Col, Statistic, Progress, Tag, Radio } from 'antd'
import {
  DollarOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'

const Reports = () => {
  const [reportType, setReportType] = useState<'sales' | 'inventory'>('sales')
  const [timeRange, setTimeRange] = useState<'day' | 'month'>('month')

  type MonthlyRevenue = { month: string; revenue: number }
  type DailyRevenue = { day: string; revenue: number }

  const monthlyRevenue: MonthlyRevenue[] = [
    { month: 'Tháng 1', revenue: 1800000000 },
    { month: 'Tháng 2', revenue: 2100000000 },
    { month: 'Tháng 3', revenue: 1950000000 },
    { month: 'Tháng 4', revenue: 2300000000 },
    { month: 'Tháng 5', revenue: 2500000000 },
    { month: 'Tháng 6', revenue: 2800000000 },
  ]

  // Generate daily revenue data with actual dates (today and 6 previous days)
  const generateDailyRevenue = (): DailyRevenue[] => {
    const today = new Date()
    const revenues = [100000000, 95000000, 120000000, 85000000, 110000000, 105000000, 130000000]

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - index) // index 0 = today, index 1 = yesterday, etc.
      const day = date.getDate()
      const month = date.getMonth() + 1
      const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`

      return {
        day: formattedDate,
        revenue: revenues[index],
      }
    })
  }

  const dailyRevenue: DailyRevenue[] = generateDailyRevenue()

  const topSellingCars = [
    { name: 'Honda Vision 2025', version: '2025', color: 'Trắng', sales: 45, revenue: 1462050000 },
    { name: 'Honda SH Mode 2025', version: '2025', color: 'Đen', sales: 38, revenue: 2217300000 },
    { name: 'Air Blade', version: '2024', color: 'Xám', sales: 32, revenue: 1446080000 },
    { name: 'Wave Alpha 110', version: '2025', color: 'Đỏ', sales: 28, revenue: 542640000 },
    { name: 'Winner X', version: '2025', color: 'Xanh', sales: 25, revenue: 1205250000 },
  ]

  const inventoryData = [
    {
      code: 'H001',
      name: 'Wave Alpha',
      type: 'Xe số',
      version: '2025',
      color: 'Đỏ',
      quantity: 10,
      status: 'Còn hàng',
    },
    {
      code: 'H002',
      name: 'Vision',
      type: 'Xe tay ga',
      version: '2025',
      color: 'Trắng',
      quantity: 8,
      status: 'Còn hàng',
    },
    {
      code: 'H003',
      name: 'SH Mode',
      type: 'Xe tay ga',
      version: '2025',
      color: 'Đen',
      quantity: 5,
      status: 'Còn hàng',
    },
    {
      code: 'H004',
      name: 'Air Blade',
      type: 'Xe tay ga',
      version: '2024',
      color: 'Xám',
      quantity: 3,
      status: 'Còn hàng',
    },
    {
      code: 'H005',
      name: 'Winner X',
      type: 'Xe côn tay',
      version: '2025',
      color: 'Xanh',
      quantity: 0,
      status: 'Hết hàng',
    },
    {
      code: 'H006',
      name: 'Lead',
      type: 'Xe tay ga',
      version: '2024',
      color: 'Trắng',
      quantity: 2,
      status: 'Còn hàng',
    },
    {
      code: 'H007',
      name: 'SH 150i',
      type: 'Xe tay ga',
      version: '2025',
      color: 'Đỏ',
      quantity: 1,
      status: 'Còn hàng',
    },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const revenueDataset = timeRange === 'month' ? monthlyRevenue : dailyRevenue
  const normalizedRevenueData = revenueDataset.map(item =>
    'month' in item
      ? { label: item.month, revenue: item.revenue }
      : { label: item.day, revenue: item.revenue }
  )
  const maxRevenue = Math.max(...normalizedRevenueData.map(r => r.revenue))
  const totalRevenue = normalizedRevenueData.reduce((sum, r) => sum + r.revenue, 0)
  const totalCarsSold = topSellingCars.reduce((sum, car) => sum + car.sales, 0)

  const salesColumns = [
    {
      title: 'Xếp hạng',
      key: 'rank',
      render: (_: unknown, __: unknown, index: number): React.ReactNode => (
        <span style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>#{index + 1}</span>
      ),
    },
    {
      title: 'Tên xe',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Màu sắc',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales: number) => `${sales} xe`,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => formatPrice(revenue) + ' VNĐ',
    },
  ]

  const inventoryColumns = [
    {
      title: 'Mã xe',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tên xe',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại xe',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Màu',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Số lượng tồn',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Còn hàng' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
  ]

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
        <Radio.Group
          value={reportType}
          onChange={e => setReportType(e.target.value)}
          buttonStyle="solid"
          size={window.innerWidth < 576 ? 'small' : 'middle'}
        >
          <Radio.Button value="sales">Báo cáo doanh số</Radio.Button>
          <Radio.Button value="inventory">Báo cáo tồn kho</Radio.Button>
        </Radio.Group>
      </div>

      {reportType === 'sales' && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Radio.Group
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="day">Theo ngày</Radio.Button>
              <Radio.Button value="month">Theo tháng</Radio.Button>
            </Radio.Group>
          </Card>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="stretch">
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Statistic
                  title="Tổng doanh thu"
                  value={totalRevenue}
                  formatter={value => formatPrice(Number(value)) + ' VNĐ'}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +15.2% so với{' '}
                  {timeRange === 'month' ? 'tháng trước' : 'ngày trước'}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Statistic
                  title="Số lượng xe bán ra"
                  value={totalCarsSold}
                  prefix={<CarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +12.5% so với{' '}
                  {timeRange === 'month' ? 'tháng trước' : 'ngày trước'}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Statistic
                  title="Xe bán chạy nhất"
                  value={topSellingCars[0]?.name || '-'}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ fontSize: 18, wordBreak: 'break-word', color: '#1890ff' }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#1890ff' }}>
                  {topSellingCars[0]?.sales || 0} đơn
                </div>
                {/* <div style={{ marginTop: 4, fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +8.3% so với {timeRange === 'month' ? 'tháng trước' : 'ngày trước'}
                </div> */}
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Statistic
                  title={`Doanh thu TB/${timeRange === 'month' ? 'tháng' : 'ngày'}`}
                  value={Math.round(totalRevenue / normalizedRevenueData.length)}
                  formatter={value => formatPrice(Number(value)) + ' VNĐ'}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#52c41a' }}>
                  <ArrowUpOutlined /> +10.1% so với{' '}
                  {timeRange === 'month' ? 'tháng trước' : 'ngày trước'}
                </div>
              </Card>
            </Col>
          </Row>

          <Card style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 24 }}>
              {timeRange === 'month'
                ? 'Doanh thu theo tháng'
                : 'So sánh doanh thu giữa các ngày trong tuần '}
            </h2>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {normalizedRevenueData.map((item, index) => (
                <div key={index}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}
                  >
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontWeight: 'bold' }}>{formatPrice(item.revenue)} VNĐ</span>
                  </div>
                  <Progress
                    percent={(item.revenue / maxRevenue) * 100}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    showInfo={false}
                  />
                </div>
              ))}
            </Space>
          </Card>

          <Card>
            <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Xe bán chạy nhất</h2>
            <div style={{ overflowX: 'auto' }}>
              <Table
                columns={salesColumns}
                dataSource={topSellingCars}
                rowKey="name"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            </div>
          </Card>
        </>
      )}

      {reportType === 'inventory' && (
        <Card>
          <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 24 }}>Báo cáo tồn kho</h2>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Tổng số xe"
                  value={inventoryData.length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Xe còn hàng"
                  value={inventoryData.filter(item => item.status === 'Còn hàng').length}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Xe hết hàng"
                  value={inventoryData.filter(item => item.status === 'Hết hàng').length}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>
          <div style={{ overflowX: 'auto' }}>
            <Table
              columns={inventoryColumns}
              dataSource={inventoryData}
              rowKey="code"
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </div>
        </Card>
      )}
    </div>
  )
}

export default Reports
