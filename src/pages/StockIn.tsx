import { useState } from 'react';
import { Plus, X, Package, Calendar } from 'lucide-react';

interface StockInItem {
  id: string;
  carCode: string;
  carName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
}

const StockIn = () => {
  const [stockInList, setStockInList] = useState<StockInItem[]>([
    { id: '1', carCode: 'H001', carName: 'Wave Alpha', quantity: 10, unitPrice: 18240000, total: 182400000, date: '2024-11-20' },
    { id: '2', carCode: 'H002', carName: 'Vision', quantity: 10, unitPrice: 30960000, total: 309600000, date: '2024-11-21' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    carCode: '',
    carName: '',
    quantity: '',
    unitPrice: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Mock car data - in production, this would come from API
  const availableCars = [
    { code: 'H001', name: 'Wave Alpha' },
    { code: 'H002', name: 'Vision' },
    { code: 'H003', name: 'SH Mode' },
    { code: 'H004', name: 'Air Blade' },
    { code: 'H005', name: 'Winner X' },
    { code: 'H006', name: 'Lead' },
    { code: 'H007', name: 'SH 150i' },
  ];

  const handleCarSelect = (code: string) => {
    const car = availableCars.find(c => c.code === code);
    if (car) {
      setFormData({ ...formData, carCode: code, carName: car.name });
    }
  };

  const handleSave = () => {
    if (!formData.carCode || !formData.quantity || !formData.unitPrice) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const newItem: StockInItem = {
      id: `ST${Date.now()}`,
      carCode: formData.carCode,
      carName: formData.carName,
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice.replace(/\D/g, '')),
      total: Number(formData.quantity) * Number(formData.unitPrice.replace(/\D/g, '')),
      date: formData.date,
    };

    setStockInList([newItem, ...stockInList]);
    setShowForm(false);
    setFormData({
      carCode: '',
      carName: '',
      quantity: '',
      unitPrice: '',
      date: new Date().toISOString().split('T')[0],
    });
    alert('Nhập kho thành công!');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, unitPrice: value });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Nhập kho</h1>
          <p className="text-gray-500 text-sm">Quản lý phiếu nhập kho và tồn kho</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo phiếu nhập kho
          </button>
        )}
      </div>

      {/* Stock In Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Phiếu nhập kho</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({
                  carCode: '',
                  carName: '',
                  quantity: '',
                  unitPrice: '',
                  date: new Date().toISOString().split('T')[0],
                });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Chọn xe <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.carCode}
                onChange={(e) => handleCarSelect(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
              >
                <option value="">Chọn xe</option>
                {availableCars.map(car => (
                  <option key={car.code} value={car.code}>
                    {car.name} ({car.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Ngày nhập <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Số lượng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                placeholder="Nhập số lượng"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Giá nhập (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.unitPrice ? formatPrice(Number(formData.unitPrice)) : ''}
                onChange={handlePriceChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                placeholder="Nhập giá nhập"
                required
              />
            </div>
          </div>

          {formData.quantity && formData.unitPrice && (
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Tổng tiền:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(Number(formData.quantity) * Number(formData.unitPrice.replace(/\D/g, '')))} VNĐ
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({
                  carCode: '',
                  carName: '',
                  quantity: '',
                  unitPrice: '',
                  date: new Date().toISOString().split('T')[0],
                });
              }}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
            >
              Lưu phiếu nhập
            </button>
          </div>
        </div>
      )}

      {/* Stock In List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Package className="w-6 h-6 mr-2" />
            Danh sách phiếu nhập kho
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Mã phiếu</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Mã xe</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Tên xe</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Số lượng</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Giá nhập</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Thành tiền</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Ngày nhập</th>
              </tr>
            </thead>
            <tbody>
              {stockInList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Chưa có phiếu nhập kho nào. Hãy tạo phiếu nhập kho mới!
                  </td>
                </tr>
              ) : (
                stockInList.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800 font-medium">{item.id}</td>
                    <td className="py-3 px-4 text-gray-800">{item.carCode}</td>
                    <td className="py-3 px-4 text-gray-800">{item.carName}</td>
                    <td className="py-3 px-4 text-gray-800">{item.quantity}</td>
                    <td className="py-3 px-4 text-gray-800">{formatPrice(item.unitPrice)} VNĐ</td>
                    <td className="py-3 px-4 text-gray-800 font-semibold">{formatPrice(item.total)} VNĐ</td>
                    <td className="py-3 px-4 text-gray-800">{formatDate(item.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockIn;

