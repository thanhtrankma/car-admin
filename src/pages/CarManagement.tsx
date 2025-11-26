import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Info, Download, ChevronUp, ChevronsUpDown } from 'lucide-react';

interface Car {
  code: string;
  name: string;
  type: string;
  version: string;
  createdAt: string;
  costPrice: number;
  sellingPrice: number;
  status: string;
  quantity: number;
}

const CarManagement = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([
    { code: 'H001', name: 'Wave Alpha', type: 'Xe số', version: '2023', createdAt: '20/10/2025 14:00', costPrice: 18240000, sellingPrice: 19380000, status: 'Còn hàng', quantity: 10 },
    { code: 'H002', name: 'Vision', type: 'Xe tay ga', version: '2024', createdAt: '20/10/2025 14:01', costPrice: 30960000, sellingPrice: 32490000, status: 'Còn hàng', quantity: 10 },
    { code: 'H003', name: 'SH Mode', type: 'Xe tay ga', version: '2023 ABS', createdAt: '20/10/2025 14:02', costPrice: 55420000, sellingPrice: 58350000, status: 'Còn hàng', quantity: 7 },
    { code: 'H004', name: 'Air Blade', type: 'Xe tay ga', version: '2024 160cc', createdAt: '20/10/2025 14:03', costPrice: 42780000, sellingPrice: 45190000, status: 'Còn hàng', quantity: 8 },
    { code: 'H005', name: 'Winner X', type: 'Xe côn tay', version: '2023', createdAt: '20/10/2025 14:03', costPrice: 45360000, sellingPrice: 48210000, status: 'Còn hàng', quantity: 15 },
    { code: 'H006', name: 'Lead', type: 'Xe tay ga', version: '2024 Smartkey', createdAt: '20/10/2025 14:03', costPrice: 38540000, sellingPrice: 40890000, status: 'Còn hàng', quantity: 12 },
    { code: 'H007', name: 'SH 150i', type: 'Xe tay ga', version: '2024 CBS', createdAt: '20/10/2025 14:02', costPrice: 85120000, sellingPrice: 89480000, status: 'Còn hàng', quantity: 10 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [nameFilter, setNameFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCars = cars.filter(car =>
    (car.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
     car.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || car.status === statusFilter) &&
    (typeFilter === '' || car.type === typeFilter) &&
    (nameFilter === '' || car.name === nameFilter)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleDelete = (code: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      setCars(cars.filter(car => car.code !== code));
    }
  };

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const uniqueStatuses = Array.from(new Set(cars.map(car => car.status)));
  const uniqueTypes = Array.from(new Set(cars.map(car => car.type)));
  const uniqueNames = Array.from(new Set(cars.map(car => car.name)));

  return (
    <div>
      {/* Header with Title and Action Buttons */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Danh sách sản phẩm</h1>
          <p className="text-gray-500 text-sm">Quản lý thông tin xe trong hệ thống</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg flex items-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
            <Download className="w-5 h-5 mr-2" />
            Nhập từ Excel
          </button>
          <button 
            onClick={() => navigate('/cars/add')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, tên xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-600 font-medium text-sm">Bộ lọc nhanh:</span>
          <button
            onClick={() => {
              setTypeFilter('');
              setStatusFilter('');
              setNameFilter('');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              typeFilter === '' && statusFilter === '' && nameFilter === ''
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setTypeFilter('Xe số');
              setStatusFilter('');
              setNameFilter('');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              typeFilter === 'Xe số'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Xe số
          </button>
          <button
            onClick={() => {
              setTypeFilter('Xe tay ga');
              setStatusFilter('');
              setNameFilter('');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              typeFilter === 'Xe tay ga'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Xe tay ga
          </button>
          <button
            onClick={() => {
              setTypeFilter('Xe côn tay');
              setStatusFilter('');
              setNameFilter('');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              typeFilter === 'Xe côn tay'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Xe côn tay
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-gray-600 font-medium text-sm">Bộ lọc chi tiết:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 appearance-none cursor-pointer"
          >
            <option value="">Trạng thái</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 appearance-none cursor-pointer"
          >
            <option value="">Loại xe</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-300 appearance-none cursor-pointer"
          >
            <option value="">Tên xe</option>
            {uniqueNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cars Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    Mã xe
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    Tên xe
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    Loại xe
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    Phiên bản
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    Thời gian tạo
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    Giá vốn
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    Giá bán
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    Trạng thái
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    Số lượng
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedCars.map((car) => (
                <tr key={car.code} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-150">
                  <td className="py-3 px-4 text-gray-800 font-medium">{car.code}</td>
                  <td className="py-3 px-4 text-gray-800">{car.name}</td>
                  <td className="py-3 px-4 text-gray-800">{car.type}</td>
                  <td className="py-3 px-4 text-gray-800">{car.version}</td>
                  <td className="py-3 px-4 text-gray-800">{car.createdAt}</td>
                  <td className="py-3 px-4 text-gray-800">{formatPrice(car.costPrice)}</td>
                  <td className="py-3 px-4 text-gray-800">{formatPrice(car.sellingPrice)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      car.status === 'Còn hàng' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {car.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800">{car.quantity}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Info className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(car.code)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <ChevronUp className="w-4 h-4 transform -rotate-90" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-4 py-2 border rounded-lg ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <ChevronUp className="w-4 h-4 transform rotate-90" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CarManagement;

