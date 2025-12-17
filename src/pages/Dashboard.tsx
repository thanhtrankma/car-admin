import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Radio, Table, Button, Alert, Space, Tag } from 'antd'
import {
  DollarOutlined,
  CarOutlined,
  TrophyOutlined,
  ShoppingCartOutlined,
  ArrowUpOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { getProductRemainState, listProductRemain } from '../services/productService'
import {
  getReportOverview,
  getReportRank,
  type ReportOverviewResponse,
  type ReportRankItem,
} from '../services/reportService'

const Dashboard = () => {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<'MONTH' | 'YEAR'>('MONTH')
  const [isMobile, setIsMobile] = useState(false)
  const [totalRemain, setTotalRemain] = useState(0)
  const [pendingList, setPendingList] = useState<Array<{ name: string; remain: number }>>([])
  const [loadingRemain, setLoadingRemain] = useState(false)
  const [overview, setOverview] = useState<ReportOverviewResponse['overview'] | null>(null)
  const [rankData, setRankData] = useState<ReportRankItem[]>([])
  const [loadingReport, setLoadingReport] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 576)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchRemainState = useCallback(async () => {
    setLoadingRemain(true)
    try {
      const response = await getProductRemainState()
      setTotalRemain(response.data.totalRemain)

      if (response.data.totalRemain > 0) {
        const remainList = await listProductRemain({
          page: 1,
          limit: 100,
          sortBy: 'created_at',
          sortOrder: 'desc',
        })

        // Group by name and sum remain
        const grouped = remainList.data.reduce(
          (acc, item) => {
            const existing = acc.find(g => g.name === item.name)
            if (existing) {
              existing.remain += item.remain
            } else {
              acc.push({ name: item.name, remain: item.remain })
            }
            return acc
          },
          [] as Array<{ name: string; remain: number }>
        )

        setPendingList(grouped)
      } else {
        setPendingList([])
      }
    } catch {
      // Silently fail - don't show error for this
    } finally {
      setLoadingRemain(false)
    }
  }, [])

  useEffect(() => {
    fetchRemainState()
    const interval = setInterval(fetchRemainState, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [fetchRemainState])

  const fetchReportData = useCallback(async () => {
    setLoadingReport(true)
    try {
      const [overviewRes, rankRes] = await Promise.all([
        getReportOverview(timeRange === 'MONTH' ? 'MONTH' : 'MONTH'),
        getReportRank(),
      ])
      setOverview(overviewRes.overview)
      setRankData(rankRes.data.ranking)
    } catch {
      // Silently fail
    } finally {
      setLoadingReport(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const renderRate = (rate: number | null) => {
    if (rate === null) return null
    if (rate >= 0) {
      return (
        <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
          <ArrowUpOutlined /> +{rate}% so với {timeRange === 'MONTH' ? 'tháng trước' : 'năm trước'}
        </div>
      )
    }
    return (
      <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: 12 }}>
        <ArrowUpOutlined style={{ transform: 'rotate(180deg)' }} /> {rate}% so với{' '}
        {timeRange === 'MONTH' ? 'tháng trước' : 'năm trước'}
      </div>
    )
  }

  // Helper to get overview values from new API structure
  const getOverviewValue1 = () => overview?.value1.value1 || 0
  const getOverviewRate1 = () => overview?.value1.value2 ?? null
  const getOverviewValue2 = () => overview?.value2.value1 || 0
  const getOverviewRate2 = () => overview?.value2.value2 ?? null
  const getOverviewValue3 = () => overview?.value3.value1 || 0
  const getOverviewRate3 = () => overview?.value3.value2 ?? null
  const getOverviewValue4Name = () => overview?.value4.value1 || '-'
  const getOverviewValue4Total = () => overview?.value4.value2 || 0

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Radio.Group
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="MONTH">Theo tháng</Radio.Button>
          <Radio.Button value="YEAR">Theo năm</Radio.Button>
        </Radio.Group>
      </Card>

      {totalRemain > 0 && (
        <Alert
          message={
            <Space>
              <ExclamationCircleOutlined />
              <span>
                Có <strong>{totalRemain}</strong> xe chưa hoàn tất thông tin
              </span>
            </Space>
          }
          description={
            <div style={{ marginTop: 8 }}>
              {pendingList.length > 0 ? (
                <Space wrap>
                  {pendingList.map((item, index) => (
                    <Tag key={index} color="orange" style={{ marginBottom: 4 }}>
                      <strong>{item.name}</strong> - Cần nhập thông tin:{' '}
                      <strong>{item.remain} xe</strong>
                    </Tag>
                  ))}
                </Space>
              ) : (
                <span>Có xe cần nhập thông tin số khung/số máy</span>
              )}
            </div>
          }
          type="warning"
          showIcon
          action={
            <Button
              type="primary"
              danger
              onClick={() => navigate('/pending-cars')}
              loading={loadingRemain}
            >
              Cập nhật ngay
            </Button>
          }
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="stretch">
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            loading={loadingReport}
          >
            <Statistic
              title={timeRange === 'MONTH' ? 'Doanh số tháng này' : 'Doanh số năm này'}
              value={getOverviewValue1()}
              formatter={value => formatPrice(Number(value)) + ' VNĐ'}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            {renderRate(getOverviewRate1())}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            loading={loadingReport}
          >
            <Statistic
              title="Doanh thu trung bình"
              value={getOverviewValue2()}
              formatter={value => formatPrice(Number(value)) + ' VNĐ'}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            {renderRate(getOverviewRate2())}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            loading={loadingReport}
          >
            <Statistic
              title="Số lượng xe bán ra"
              value={getOverviewValue3()}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            {renderRate(getOverviewRate3())}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            loading={loadingReport}
          >
            <Statistic
              title="Xe bán chạy nhất"
              value={getOverviewValue4Name()}
              prefix={<TrophyOutlined />}
              valueStyle={{ fontSize: 16, wordBreak: 'break-word' }}
            />
            <div style={{ marginTop: 8, color: '#1890ff', fontSize: 12 }}>
              <ShoppingCartOutlined /> {getOverviewValue4Total()} chiếc đã bán
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Xe bán chạy nhất" loading={loadingReport}>
        <Table
          dataSource={rankData}
          columns={[
            {
              title: 'Xếp hạng',
              dataIndex: 'rank',
              key: 'rank',
              width: 100,
              align: 'center',
              render: (rank: number) => (
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: 16,
                    color: rank <= 3 ? '#1890ff' : '#666',
                  }}
                >
                  #{rank}
                </span>
              ),
            },
            {
              title: 'Tên xe',
              dataIndex: 'productName',
              key: 'productName',
              render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
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
              align: 'center',
              render: (qty: number) => <span>{qty.toLocaleString('vi-VN')} xe</span>,
            },
            {
              title: 'Doanh thu',
              dataIndex: 'totalRevenue',
              key: 'totalRevenue',
              align: 'right',
              render: (revenue: number) => (
                <span style={{ fontWeight: 500, color: '#52c41a' }}>
                  {formatPrice(revenue)} VNĐ
                </span>
              ),
            },
          ]}
          rowKey="rank"
          pagination={false}
          size={isMobile ? 'small' : 'middle'}
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </Card>
    </div>
  )
}

export default Dashboard
