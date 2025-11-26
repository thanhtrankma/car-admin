import { useState } from 'react';
import { TrendingUp, Award, DollarSign, ShoppingCart, Car } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percent: number } }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (data) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            Giá trị: <span className="font-medium text-gray-900">{data.value} triệu VNĐ</span>
          </p>
          <p className="text-sm text-gray-600">
            Tỉ trọng: <span className="font-medium text-gray-900">{data.percent}%</span>
          </p>
        </div>
      );
    }
  }
  return null;
};

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  // Revenue data for bar chart (2020, 2021, 2022)
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

  // Donut chart data
  const donutData = [
    { name: 'Honda Vision 2025', value: 79.31, percent: 13.16, color: '#9333EA' },
    { name: 'Honda SH Mode 2025', value: 202.38, percent: 33.63, color: '#F97316' },
    { name: 'Air Blade', value: 158.41, percent: 26.32, color: '#3B82F6' },
    { name: 'Wave Alpha 110', value: 161.74, percent: 26.87, color: '#FBBF24' },
  ];

  const COLORS = ['#9333EA', '#F97316', '#3B82F6', '#FBBF24'];

  // Top products data
  const topProducts = [
    { name: 'Wireless Headphones', sales: 1234, revenue: '$160,410.00', change: '+12.5%' },
    { name: 'Smart Watch', sales: 987, revenue: '$296,003.00', change: '+8.3%' },
    { name: 'Laptop Stand', sales: 856, revenue: '$42,784.00', change: '+3.2%' },
    { name: 'USB-C Hub', sales: 743, revenue: '$51,901.00', change: '+15.7%' },
    { name: 'Mechanical Keyboard', sales: 621, revenue: '$55,890.00', change: '+6.4%' },
  ];

  return (
    <div>
      {/* Toggle Buttons */}
      <div className="flex gap-2 mb-8 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
        <button
          onClick={() => setTimeRange('month')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            timeRange === 'month'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Theo tháng
        </button>
        <button
          onClick={() => setTimeRange('year')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            timeRange === 'year'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Theo năm
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue This Month/Year */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-2">
            {timeRange === 'month' ? 'Doanh số tháng này' : 'Doanh số năm này'}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {timeRange === 'month' ? '2.800' : '28.500'}M
          </p>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+15.2% so với {timeRange === 'month' ? 'tháng trước' : 'năm trước'}</span>
          </div>
        </div>

        {/* Year Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-green-200 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-2">Doanh số năm</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">28.500M</p>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12.5% so với năm trước</span>
          </div>
        </div>

        {/* Number of Cars Sold */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <Car className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-2">Số lượng xe bán ra</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">168</p>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+10.1% so với {timeRange === 'month' ? 'tháng trước' : 'năm trước'}</span>
          </div>
        </div>

        {/* Best-Selling Car */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-2">Xe bán chạy nhất</p>
          <p className="text-xl font-bold text-gray-900 mb-2">Honda Vision 2025</p>
          <div className="flex items-center text-blue-600 text-sm font-medium">
            <ShoppingCart className="w-4 h-4 mr-1" />
            <span>45 đơn đã bán</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Overview Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Biểu đồ doanh thu {timeRange === 'month' ? 'theo tháng' : 'theo năm'}
          </h2>
          <div className="h-80">
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
        </div>

        {/* Revenue Proportion Donut Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Tỉ trọng doanh thu theo loại xe</h2>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            <div className="relative">
              <ResponsiveContainer width={280} height={280}>
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
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">100%</p>
                  <p className="text-sm text-gray-500 mt-1">Tổng</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {donutData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div
                    className="w-5 h-5 rounded-lg shadow-sm"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.value} triệu VNĐ</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{item.percent}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products</h2>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-600">{product.sales} sales</p>
              </div>
              <div className="flex-1 text-right">
                <p className="font-medium text-gray-800">{product.revenue}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
              <div className="flex items-center text-green-600 ml-4">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">{product.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

