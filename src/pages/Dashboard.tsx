import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Radio, Table, Button, Alert, Space, Tag } from 'antd';
import { DollarOutlined, CarOutlined, TrophyOutlined, ShoppingCartOutlined, ArrowUpOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getProductRemainState, listProductRemain } from '../services/productService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');
  const [isMobile, setIsMobile] = useState(false);
  const [totalRemain, setTotalRemain] = useState(0);
  const [pendingList, setPendingList] = useState<Array<{ name: string; remain: number }>>([]);
  const [loadingRemain, setLoadingRemain] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 576);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchRemainState = useCallback(async () => {
    setLoadingRemain(true);
    try {
      const response = await getProductRemainState();
      setTotalRemain(response.data.totalRemain);
      
      if (response.data.totalRemain > 0) {
        const remainList = await listProductRemain({
          page: 1,
          limit: 100,
          sortBy: 'created_at',
          sortOrder: 'desc',
        });
        
        // Group by name and sum remain
        const grouped = remainList.data.reduce((acc, item) => {
          const existing = acc.find(g => g.name === item.name);
          if (existing) {
            existing.remain += item.remain;
          } else {
            acc.push({ name: item.name, remain: item.remain });
          }
          return acc;
        }, [] as Array<{ name: string; remain: number }>);
        
        setPendingList(grouped);
      } else {
        setPendingList([]);
      }
    } catch {
      // Silently fail - don't show error for this
    } finally {
      setLoadingRemain(false);
    }
  }, []);

  useEffect(() => {
    fetchRemainState();
    const interval = setInterval(fetchRemainState, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchRemainState]);

  const topProducts = [
    { key: 1, rank: 1, name: 'Honda SH Mode 2025', sales: 156, revenue: '15.600' },
    { key: 2, rank: 2, name: 'Honda Vision 2025', sales: 142, revenue: '11.360' },
    { key: 3, rank: 3, name: 'Air Blade 160', sales: 128, revenue: '19.200' },
    { key: 4, rank: 4, name: 'Wave Alpha 110', sales: 115, revenue: '8.050' },
    { key: 5, rank: 5, name: 'Honda Lead 125', sales: 98, revenue: '12.250' },
    { key: 6, rank: 6, name: 'Honda PCX 160', sales: 87, revenue: '18.270' },
    { key: 7, rank: 7, name: 'Honda Winner X', sales: 76, revenue: '11.400' },
    { key: 8, rank: 8, name: 'Honda CRF150L', sales: 65, revenue: '13.650' },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Radio.Group
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="month">Theo tháng</Radio.Button>
          <Radio.Button value="year">Theo năm</Radio.Button>
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
                      <strong>{item.name}</strong> - Cần nhập thông tin: <strong>{item.remain} xe</strong>
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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={timeRange === 'month' ? 'Doanh số tháng này' : 'Doanh số năm này'}
              value={timeRange === 'month' ? '2.800' : '28.500'}
              suffix="M"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
              <ArrowUpOutlined /> +15.2% so với {timeRange === 'month' ? 'tháng trước' : 'năm trước'}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Doanh số năm"
              value="28.500"
              suffix="M"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
              <ArrowUpOutlined /> +12.5% so với năm trước
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Số lượng xe bán ra"
              value={168}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
              <ArrowUpOutlined /> +10.1% so với {timeRange === 'month' ? 'tháng trước' : 'năm trước'}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Xe bán chạy nhất"
              value="Honda Vision 2025"
              prefix={<TrophyOutlined />}
              valueStyle={{ fontSize: 16 }}
            />
            <div style={{ marginTop: 8, color: '#1890ff', fontSize: 12 }}>
              <ShoppingCartOutlined /> 45 đơn đã bán
            </div>
          </Card>
        </Col>
      </Row>


      <Card title="Xe bán chạy nhất">
        <Table
          dataSource={topProducts}
          columns={[
            {
              title: 'Xếp hạng',
              dataIndex: 'rank',
              key: 'rank',
              width: 100,
              align: 'center',
              render: (rank: number) => (
                <span style={{ fontWeight: 'bold', fontSize: 16, color: rank <= 3 ? '#1890ff' : '#666' }}>
                  #{rank}
                </span>
              ),
            },
            {
              title: 'Tên xe',
              dataIndex: 'name',
              key: 'name',
              render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
            },
            {
              title: 'Số lượng bán',
              dataIndex: 'sales',
              key: 'sales',
              align: 'center',
              render: (sales: number) => <span>{sales.toLocaleString('vi-VN')} xe</span>,
            },
            {
              title: 'Doanh thu',
              dataIndex: 'revenue',
              key: 'revenue',
              align: 'right',
              render: (revenue: string) => {
                // Convert from millions to billions
                const billions = (parseFloat(revenue) / 1000).toFixed(3);
                return (
                  <span style={{ fontWeight: 500, color: '#52c41a' }}>
                    {billions} tỷ VNĐ
                  </span>
                );
              },
            },
          ]}
          pagination={false}
          size={isMobile ? 'small' : 'middle'}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
