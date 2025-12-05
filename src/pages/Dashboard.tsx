import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Radio, Table, Button, Alert } from 'antd';
import { DollarOutlined, CarOutlined, TrophyOutlined, ShoppingCartOutlined, ArrowUpOutlined, ExclamationCircleOutlined, EditOutlined } from '@ant-design/icons';
import { listProducts, type ProductDto } from '../services/productService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');
  const [isMobile, setIsMobile] = useState(false);
  const [incompleteCarsCount, setIncompleteCarsCount] = useState(0);
  const [incompleteCarsLoading, setIncompleteCarsLoading] = useState(false);
  const [incompleteCarsByGroup, setIncompleteCarsByGroup] = useState<Array<{ name: string; count: number }>>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 576);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchIncompleteCars = useCallback(async () => {
    setIncompleteCarsLoading(true);
    try {
      const response = await listProducts({
        page: 1,
        limit: 1000,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      const incomplete = response.data.filter(
        (product: ProductDto) => !product.chassisNumber || !product.engineNumber
      );

      setIncompleteCarsCount(incomplete.length);

      // Group by name
      const grouped = new Map<string, number>();
      incomplete.forEach((product: ProductDto) => {
        const key = product.name;
        grouped.set(key, (grouped.get(key) || 0) + 1);
      });

      setIncompleteCarsByGroup(
        Array.from(grouped.entries()).map(([name, count]) => ({ name, count }))
      );
    } catch (error) {
      console.error('Không thể tải danh sách xe chưa hoàn tất:', error);
    } finally {
      setIncompleteCarsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncompleteCars();
  }, [fetchIncompleteCars]);

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

      {/* Alert for incomplete cars */}
      {incompleteCarsCount > 0 && (
        <Alert
          message={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <ExclamationCircleOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                <strong>Có {incompleteCarsCount} xe chưa hoàn tất thông tin</strong>
                <div style={{ marginTop: 4, fontSize: 13, color: '#666' }}>
                  {incompleteCarsByGroup.map((group, idx) => (
                    <span key={group.name}>
                      {group.name}: {group.count} xe
                      {idx < incompleteCarsByGroup.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                type="primary"
                danger
                icon={<EditOutlined />}
                onClick={() => navigate('/cars')}
                loading={incompleteCarsLoading}
              >
                Cập nhật ngay
              </Button>
            </div>
          }
          type="warning"
          showIcon={false}
          style={{ marginBottom: 24, border: '1px solid #ffb84d', backgroundColor: '#fffbe6' }}
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
