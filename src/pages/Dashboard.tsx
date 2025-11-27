import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, Space, Row, Col, Statistic, Radio, Table } from 'antd';
import { DollarOutlined, CarOutlined, TrophyOutlined, ShoppingCartOutlined, ArrowUpOutlined } from '@ant-design/icons';

const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percent: number } }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (data) {
      return (
        <div style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{data.name}</p>
          <p style={{ fontSize: 12, marginBottom: 4 }}>
            Giá trị: <span style={{ fontWeight: 500 }}>{data.value} triệu VNĐ</span>
          </p>
          <p style={{ fontSize: 12 }}>
            Tỉ trọng: <span style={{ fontWeight: 500 }}>{data.percent}%</span>
          </p>
        </div>
      );
    }
  }
  return null;
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 576);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const revenueData = [
    { month: 'T1', '2020': 60, '2021': 70, '2022': 80 },
    { month: 'T2', '2020': 65, '2021': 75, '2022': 85 },
    { month: 'T3', '2020': 70, '2021': 80, '2022': 90 },
    { month: 'T4', '2020': 75, '2021': 85, '2022': 95 },
    { month: 'T5', '2020': 80, '2021': 90, '2022': 100 },
    { month: 'T6', '2020': 85, '2021': 95, '2022': 100 },
    { month: 'T7', '2020': 90, '2021': 100, '2022': 100 },
    { month: 'T8', '2020': 85, '2021': 95, '2022': 100 },
    { month: 'T9', '2020': 80, '2021': 90, '2022': 95 },
    { month: 'T10', '2020': 75, '2021': 85, '2022': 90 },
    { month: 'T11', '2020': 70, '2021': 80, '2022': 85 },
    { month: 'T12', '2020': 65, '2021': 75, '2022': 80 },
  ];

  const donutData = [
    { name: 'Honda Vision 2025', value: 79.31, percent: 13.16, color: '#9333EA' },
    { name: 'Honda SH Mode 2025', value: 202.38, percent: 33.63, color: '#F97316' },
    { name: 'Air Blade', value: 158.41, percent: 26.32, color: '#3B82F6' },
    { name: 'Wave Alpha 110', value: 161.74, percent: 26.87, color: '#FBBF24' },
  ];

  const COLORS = ['#9333EA', '#F97316', '#3B82F6', '#FBBF24'];

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

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={`Biểu đồ doanh thu ${timeRange === 'month' ? 'theo tháng' : 'theo năm'}`}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    label={{ value: 'Doanh thu (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Bar
                    dataKey="2020"
                    fill="#9333EA"
                    radius={[8, 8, 0, 0]}
                    name="2020"
                  />
                  <Bar
                    dataKey="2021"
                    fill="#F97316"
                    radius={[8, 8, 0, 0]}
                    name="2021"
                  />
                  <Bar
                    dataKey="2022"
                    fill="#3B82F6"
                    radius={[8, 8, 0, 0]}
                    name="2022"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Tỉ trọng doanh thu theo loại xe">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="percent"
                      stroke="none"
                    >
                      {donutData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <p style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>100%</p>
                  <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Tổng</p>
                </div>
              </div>
              <div style={{ width: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {donutData.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 8,
                    }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          backgroundColor: item.color,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 'bold', margin: 0 }}>{item.name}</p>
                        <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{item.value} triệu VNĐ</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 'bold', margin: 0 }}>{item.percent}%</p>
                      </div>
                    </div>
                  ))}
                </Space>
              </div>
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
              render: (revenue: string) => (
                <span style={{ fontWeight: 500, color: '#52c41a' }}>
                  {revenue} triệu VNĐ
                </span>
              ),
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
