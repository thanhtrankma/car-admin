import { useState } from 'react';
import { Search, Mail, Phone, MapPin, Edit, Trash2, Plus, X, Save, Car } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  carUsing?: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567', address: 'Hà Nội', carUsing: 'Honda Vision 2025', totalOrders: 3, totalSpent: 2500000000, joinDate: '2024-01-15' },
    { id: '2', name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0902345678', address: 'TP.HCM', carUsing: 'Honda SH Mode 2025', totalOrders: 2, totalSpent: 2400000000, joinDate: '2024-02-20' },
    { id: '3', name: 'Lê Văn C', email: 'levanc@email.com', phone: '0903456789', address: 'Đà Nẵng', carUsing: 'Air Blade', totalOrders: 1, totalSpent: 950000000, joinDate: '2024-03-10' },
    { id: '4', name: 'Phạm Thị D', email: 'phamthid@email.com', phone: '0904567890', address: 'Hải Phòng', totalOrders: 1, totalSpent: 750000000, joinDate: '2024-04-05' },
    { id: '5', name: 'Hoàng Văn E', email: 'hoangvane@email.com', phone: '0905678901', address: 'Cần Thơ', carUsing: 'Wave Alpha 110', totalOrders: 2, totalSpent: 1760000000, joinDate: '2024-05-12' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    carUsing: '',
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      setCustomers(customers.filter(customer => customer.id !== id));
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      carUsing: customer.carUsing || '',
    });
  };

  const handleSave = () => {
    if (editingId) {
      setCustomers(customers.map(customer =>
        customer.id === editingId
          ? { ...customer, ...formData }
          : customer
      ));
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', address: '', carUsing: '' });
    } else {
      const newCustomer: Customer = {
        id: String(customers.length + 1),
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        carUsing: formData.carUsing,
        totalOrders: 0,
        totalSpent: 0,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setCustomers([...customers, newCustomer]);
      setShowAddForm(false);
      setFormData({ name: '', email: '', phone: '', address: '', carUsing: '' });
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', address: '', carUsing: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý khách hàng</h1>
          <p className="text-gray-500 text-sm">Quản lý thông tin khách hàng trong hệ thống</p>
        </div>
        {!showAddForm && !editingId && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm mới
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {editingId ? 'Sửa thông tin khách hàng' : 'Thêm mới khách hàng'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Tên khách hàng *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                placeholder="Nhập tên khách hàng"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                placeholder="Nhập email"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Số điện thoại *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Địa chỉ *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                placeholder="Nhập địa chỉ"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">Xe đang dùng</label>
              <input
                type="text"
                value={formData.carUsing}
                onChange={(e) => setFormData({ ...formData, carUsing: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
                placeholder="Nhập tên xe đang dùng (nếu có)"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Lưu
            </button>
          </div>
        </div>
      )}

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{customer.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Thành viên từ {formatDate(customer.joinDate)}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(customer)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">{customer.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">{customer.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">{customer.address}</span>
              </div>
              {customer.carUsing && (
                <div className="flex items-center text-gray-600">
                  <Car className="w-4 h-4 mr-2" />
                  <span className="text-sm">{customer.carUsing}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                  <p className="text-lg font-bold text-gray-800">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                  <p className="text-lg font-bold text-blue-600">{formatPrice(customer.totalSpent)} VNĐ</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Không tìm thấy khách hàng nào
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;

