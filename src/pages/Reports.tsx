import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Car, Calendar } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState<'sales' | 'inventory'>('sales');
  const [timeRange, setTimeRange] = useState<'day' | 'month'>('month');

  const monthlyRevenue = [
    { month: 'Tháng 1', revenue: 1800000000 },
    { month: 'Tháng 2', revenue: 2100000000 },
    { month: 'Tháng 3', revenue: 1950000000 },
    { month: 'Tháng 4', revenue: 2300000000 },
    { month: 'Tháng 5', revenue: 2500000000 },
    { month: 'Tháng 6', revenue: 2800000000 },
  ];

  const dailyRevenue = [
    { day: 'Ngày 1', revenue: 95000000 },
    { day: 'Ngày 2', revenue: 120000000 },
    { day: 'Ngày 3', revenue: 85000000 },
    { day: 'Ngày 4', revenue: 110000000 },
    { day: 'Ngày 5', revenue: 130000000 },
    { day: 'Ngày 6', revenue: 105000000 },
  ];

  const topSellingCars = [
    { name: 'Honda Vision 2025', sales: 45, revenue: 1462050000 },
    { name: 'Honda SH Mode 2025', sales: 38, revenue: 2217300000 },
    { name: 'Air Blade', sales: 32, revenue: 1446080000 },
    { name: 'Wave Alpha 110', sales: 28, revenue: 542640000 },
    { name: 'Winner X', sales: 25, revenue: 1205250000 },
  ];

  const inventoryData = [
    { code: 'H001', name: 'Wave Alpha', type: 'Xe số', quantity: 10, status: 'Còn hàng' },
    { code: 'H002', name: 'Vision', type: 'Xe tay ga', quantity: 8, status: 'Còn hàng' },
    { code: 'H003', name: 'SH Mode', type: 'Xe tay ga', quantity: 5, status: 'Còn hàng' },
    { code: 'H004', name: 'Air Blade', type: 'Xe tay ga', quantity: 3, status: 'Còn hàng' },
    { code: 'H005', name: 'Winner X', type: 'Xe côn tay', quantity: 0, status: 'Hết hàng' },
    { code: 'H006', name: 'Lead', type: 'Xe tay ga', quantity: 2, status: 'Còn hàng' },
    { code: 'H007', name: 'SH 150i', type: 'Xe tay ga', quantity: 1, status: 'Còn hàng' },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const revenueData = timeRange === 'month' ? monthlyRevenue : dailyRevenue;
  const maxRevenue = Math.max(...revenueData.map(r => r.revenue));
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);
  const totalCarsSold = topSellingCars.reduce((sum, car) => sum + car.sales, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Báo cáo</h1>
          <p className="text-gray-500 text-sm">Xem báo cáo doanh số và tồn kho</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={() => setReportType('sales')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              reportType === 'sales'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Báo cáo doanh số
          </button>
          <button
            onClick={() => setReportType('inventory')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              reportType === 'inventory'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Báo cáo tồn kho
          </button>
        </div>
      </div>

      {/* Sales Report */}
      {reportType === 'sales' && (
        <>
          {/* Time Range Toggle */}
          <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
            <button
              onClick={() => setTimeRange('day')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                timeRange === 'day'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Theo ngày
            </button>
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
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{formatPrice(totalRevenue)} VNĐ</p>
                  <p className="text-green-600 text-sm mt-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +15.2%
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Số lượng xe bán ra</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{totalCarsSold}</p>
                  <p className="text-green-600 text-sm mt-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12.5%
                  </p>
                </div>
                <div className="bg-blue-500 p-3 rounded-full">
                  <Car className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Xe bán chạy nhất</p>
                  <p className="text-xl font-bold text-gray-800 mt-2">{topSellingCars[0]?.name}</p>
                  <p className="text-blue-600 text-sm mt-2 flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {topSellingCars[0]?.sales} đơn
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Doanh thu TB/{timeRange === 'month' ? 'tháng' : 'ngày'}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {formatPrice(totalRevenue / revenueData.length)} VNĐ
                  </p>
                  <p className="text-green-600 text-sm mt-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +10.1%
                  </p>
                </div>
                <div className="bg-orange-500 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Doanh thu {timeRange === 'month' ? 'theo tháng' : 'theo ngày'}
            </h2>
            <div className="space-y-4">
              {revenueData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.month || item.day}</span>
                    <span className="text-sm font-bold text-gray-800">{formatPrice(item.revenue)} VNĐ</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all"
                      style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Cars */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Xe bán chạy nhất</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Xếp hạng</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Tên xe</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Số lượng bán</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellingCars.map((car, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium">{car.name}</td>
                      <td className="py-3 px-4 text-gray-800">{car.sales} xe</td>
                      <td className="py-3 px-4 text-gray-800">{formatPrice(car.revenue)} VNĐ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Inventory Report */}
      {reportType === 'inventory' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Báo cáo tồn kho</h2>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Tổng số loại xe</p>
              <p className="text-2xl font-bold text-blue-600">{inventoryData.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Xe còn hàng</p>
              <p className="text-2xl font-bold text-green-600">
                {inventoryData.filter(item => item.status === 'Còn hàng').length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Xe hết hàng</p>
              <p className="text-2xl font-bold text-red-600">
                {inventoryData.filter(item => item.status === 'Hết hàng').length}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">Mã xe</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">Tên xe</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">Loại xe</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">Số lượng tồn</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((item) => (
                  <tr key={item.code} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800 font-medium">{item.code}</td>
                    <td className="py-3 px-4 text-gray-800">{item.name}</td>
                    <td className="py-3 px-4 text-gray-800">{item.type}</td>
                    <td className="py-3 px-4 text-gray-800">{item.quantity}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Còn hàng'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

