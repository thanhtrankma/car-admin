import { useState } from 'react';
import { Search, Plus, X, FileText, Download, Trash2 } from 'lucide-react';

interface OrderItem {
  carCode: string;
  carName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  vat: number;
  total: number;
  createdAt: string;
}

const OrderManagement = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCar, setSelectedCar] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Mock car data - in production, this would come from API
  const availableCars = [
    { code: 'H001', name: 'Wave Alpha', price: 19380000 },
    { code: 'H002', name: 'Vision', price: 32490000 },
    { code: 'H003', name: 'SH Mode', price: 58350000 },
    { code: 'H004', name: 'Air Blade', price: 45190000 },
    { code: 'H005', name: 'Winner X', price: 48210000 },
  ];

  const addItem = () => {
    if (!selectedCar || quantity <= 0) return;
    
    const car = availableCars.find(c => c.code === selectedCar);
    if (!car) return;

    const existingItem = orderItems.find(item => item.carCode === selectedCar);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.carCode === selectedCar
          ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.unitPrice }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        carCode: car.code,
        carName: car.name,
        quantity,
        unitPrice: car.price,
        total: quantity * car.price,
      }]);
    }
    setSelectedCar('');
    setQuantity(1);
  };

  const removeItem = (carCode: string) => {
    setOrderItems(orderItems.filter(item => item.carCode !== carCode));
  };

  const updateItemQuantity = (carCode: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(carCode);
      return;
    }
    setOrderItems(orderItems.map(item =>
      item.carCode === carCode
        ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
        : item
    ));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const vat = subtotal * 0.1; // 10% VAT
  const total = subtotal + vat;

  const handleSave = () => {
    if (!customerName || !customerPhone || orderItems.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin khách hàng và thêm ít nhất một sản phẩm');
      return;
    }

    const newInvoice: Invoice = {
      id: `INV${Date.now()}`,
      customerName,
      customerPhone,
      items: [...orderItems],
      subtotal,
      vat,
      total,
      createdAt: new Date().toISOString(),
    };

    setInvoices([newInvoice, ...invoices]);
    setShowForm(false);
    setCustomerName('');
    setCustomerPhone('');
    setOrderItems([]);
    setSelectedCar('');
    setQuantity(1);
    alert('Tạo hóa đơn thành công!');
  };

  const handleExport = (invoice: Invoice) => {
    // In production, this would generate a PDF
    const invoiceText = `
HÓA ĐƠN BÁN HÀNG
Mã hóa đơn: ${invoice.id}
Ngày tạo: ${new Date(invoice.createdAt).toLocaleString('vi-VN')}

Khách hàng: ${invoice.customerName}
SĐT: ${invoice.customerPhone}

Chi tiết:
${invoice.items.map(item => `
  ${item.carName} (${item.carCode})
  Số lượng: ${item.quantity} x ${formatPrice(item.unitPrice)} = ${formatPrice(item.total)} VNĐ
`).join('')}

Tạm tính: ${formatPrice(invoice.subtotal)} VNĐ
VAT (10%): ${formatPrice(invoice.vat)} VNĐ
TỔNG CỘNG: ${formatPrice(invoice.total)} VNĐ
    `;
    
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HoaDon_${invoice.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý đơn hàng</h1>
          <p className="text-gray-500 text-sm">Tạo và quản lý hóa đơn bán hàng</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo hóa đơn mới
          </button>
        )}
      </div>

      {/* Create Invoice Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Tạo hóa đơn mới</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setCustomerName('');
                setCustomerPhone('');
                setOrderItems([]);
                setSelectedCar('');
                setQuantity(1);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Tên khách hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                placeholder="Nhập tên khách hàng"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          {/* Add Item */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thêm sản phẩm</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-2">Chọn xe</label>
                <select
                  value={selectedCar}
                  onChange={(e) => setSelectedCar(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                >
                  <option value="">Chọn xe</option>
                  {availableCars.map(car => (
                    <option key={car.code} value={car.code}>
                      {car.name} ({car.code}) - {formatPrice(car.price)} VNĐ
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Số lượng</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addItem}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {orderItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Danh sách sản phẩm</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-700 font-medium">Mã xe</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-medium">Tên xe</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-medium">Số lượng</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-medium">Đơn giá</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-medium">Thành tiền</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item.carCode} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-800">{item.carCode}</td>
                        <td className="py-3 px-4 text-gray-800">{item.carName}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.carCode, Number(e.target.value))}
                            min="1"
                            className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                          />
                        </td>
                        <td className="py-3 px-4 text-gray-800">{formatPrice(item.unitPrice)} VNĐ</td>
                        <td className="py-3 px-4 text-gray-800 font-medium">{formatPrice(item.total)} VNĐ</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => removeItem(item.carCode)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary */}
          {orderItems.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Tạm tính:</span>
                <span className="text-gray-800 font-semibold">{formatPrice(subtotal)} VNĐ</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">VAT (10%):</span>
                <span className="text-gray-800 font-semibold">{formatPrice(vat)} VNĐ</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-blue-200">
                <span className="text-xl font-bold text-gray-800">TỔNG CỘNG:</span>
                <span className="text-2xl font-bold text-blue-600">{formatPrice(total)} VNĐ</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setShowForm(false);
                setCustomerName('');
                setCustomerPhone('');
                setOrderItems([]);
                setSelectedCar('');
                setQuantity(1);
              }}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
            >
              Lưu hóa đơn
            </button>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Danh sách hóa đơn</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Mã hóa đơn</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Khách hàng</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">SĐT</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Số sản phẩm</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Tổng tiền</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Ngày tạo</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Chưa có hóa đơn nào. Hãy tạo hóa đơn mới!
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800 font-medium">{invoice.id}</td>
                    <td className="py-3 px-4 text-gray-800">{invoice.customerName}</td>
                    <td className="py-3 px-4 text-gray-800">{invoice.customerPhone}</td>
                    <td className="py-3 px-4 text-gray-800">{invoice.items.length}</td>
                    <td className="py-3 px-4 text-gray-800 font-semibold">{formatPrice(invoice.total)} VNĐ</td>
                    <td className="py-3 px-4 text-gray-800">{formatDate(invoice.createdAt)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleExport(invoice)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                        title="Xuất hóa đơn"
                      >
                        <Download className="w-5 h-5 mr-1" />
                        Xuất
                      </button>
                    </td>
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

export default OrderManagement;
