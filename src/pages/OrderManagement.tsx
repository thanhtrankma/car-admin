import { useRef, useState } from 'react';
import { Button, Card, Input, Select, Table, Space, Modal, Form, InputNumber, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

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

interface OrderFormValues {
  customerName: string;
  customerPhone: string;
  carCode?: string;
  quantity?: number;
}

const OrderManagement = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchField, setSearchField] = useState<'id' | 'customerName' | 'customerPhone'>('id');
  const [searchValue, setSearchValue] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');
  const invoiceCounterRef = useRef(0);

  const availableCars = [
    { code: 'H001', name: 'Wave Alpha', price: 19380000 },
    { code: 'H002', name: 'Vision', price: 32490000 },
    { code: 'H003', name: 'SH Mode', price: 58350000 },
    { code: 'H004', name: 'Air Blade', price: 45190000 },
    { code: 'H005', name: 'Winner X', price: 48210000 },
  ];

  const addItem = (values: Pick<OrderFormValues, 'carCode' | 'quantity'>) => {
    const car = availableCars.find(c => c.code === values.carCode);
    if (!car) return;
    const quantity = values.quantity || 1;

    const existingItem = orderItems.find(item => item.carCode === values.carCode);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.carCode === values.carCode
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
    form.setFieldsValue({ carCode: undefined, quantity: 1 });
  };

  const isWithinTimeFilter = (dateString: string) => {
    if (timeFilter === 'all') return true;
    const targetDate = new Date(dateString);
    const now = new Date();

    if (timeFilter === 'day') {
      return targetDate.toDateString() === now.toDateString();
    }

    if (timeFilter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      return targetDate >= startOfWeek && targetDate < endOfWeek;
    }

    return (
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getFullYear() === now.getFullYear()
    );
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const keyword = searchValue.trim().toLowerCase();
    const matchesSearch = keyword
      ? String(invoice[searchField]).toLowerCase().includes(keyword)
      : true;

    return matchesSearch && isWithinTimeFilter(invoice.createdAt);
  });

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
  const vat = subtotal * 0.1;
  const total = subtotal + vat;

  const handleSave = (values: OrderFormValues) => {
    if (orderItems.length === 0) {
      message.warning('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }
    invoiceCounterRef.current += 1;

    const newInvoice: Invoice = {
      id: `INV${invoiceCounterRef.current}`,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      items: [...orderItems],
      subtotal,
      vat,
      total,
      createdAt: new Date().toISOString(),
    };

    setInvoices([newInvoice, ...invoices]);
    setIsModalOpen(false);
    setOrderItems([]);
    form.resetFields();
    message.success('Tạo hóa đơn thành công!');
  };

  const handleExport = (invoice: Invoice) => {
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
    message.success('Xuất hóa đơn thành công!');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const itemColumns: ColumnsType<OrderItem> = [
    {
      title: 'Mã xe',
      dataIndex: 'carCode',
      key: 'carCode',
    },
    {
      title: 'Tên xe',
      dataIndex: 'carName',
      key: 'carName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => updateItemQuantity(record.carCode, value || 1)}
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => formatPrice(price) + ' VNĐ',
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <strong>{formatPrice(total)} VNĐ</strong>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.carCode)}
        />
      ),
    },
  ];

  const invoiceColumns: ColumnsType<Invoice> = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'SĐT',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items.length,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <strong>{formatPrice(total)} VNĐ</strong>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleExport(record)}
        >
          Xuất
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: window.innerWidth < 768 ? 'flex-start' : 'center', 
        marginBottom: 24,
        gap: window.innerWidth < 768 ? 16 : 0,
      }}>
        <div>
          <h1 style={{ fontSize: window.innerWidth < 576 ? 20 : 24, fontWeight: 'bold', marginBottom: 8 }}>Quản lý đơn hàng</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Tạo và quản lý hóa đơn bán hàng</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          block={window.innerWidth < 768}
        >
          Tạo hóa đơn mới
        </Button>
      </div>

      <Modal
        title="Tạo hóa đơn mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setOrderItems([]);
          form.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ quantity: 1 }}
        >
          <Form.Item
            label="Tên khách hàng"
            name="customerName"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input placeholder="Nhập tên khách hàng" size="large" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="customerPhone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="Nhập số điện thoại" size="large" />
          </Form.Item>

          <Card title="Thêm sản phẩm" style={{ marginBottom: 16 }}>
            <Form.Item
              label="Chọn xe"
              name="carCode"
            >
              <Select placeholder="Chọn xe" size="large" style={{ width: '100%' }}>
                {availableCars.map(car => (
                  <Option key={car.code} value={car.code}>
                    {car.name} ({car.code}) - {formatPrice(car.price)} VNĐ
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Số lượng"
              name="quantity"
            >
              <InputNumber min={1} style={{ width: '100%' }} size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={() => {
                form.validateFields(['carCode', 'quantity']).then((values) => {
                  addItem(values);
                });
              }}>
                Thêm
              </Button>
            </Form.Item>
          </Card>

          {orderItems.length > 0 && (
            <Card title="Danh sách sản phẩm" style={{ marginBottom: 16 }}>
              <div style={{ overflowX: 'auto' }}>
                <Table
                  columns={itemColumns}
                  dataSource={orderItems}
                  rowKey="carCode"
                  pagination={false}
                  size="small"
                  scroll={{ x: 'max-content' }}
                />
              </div>
            </Card>
          )}

          {orderItems.length > 0 && (
            <Card style={{ marginBottom: 16, background: '#e6f7ff' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tạm tính:</span>
                  <strong>{formatPrice(subtotal)} VNĐ</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>VAT (10%):</span>
                  <strong>{formatPrice(vat)} VNĐ</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #d9d9d9', paddingTop: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 'bold' }}>TỔNG CỘNG:</span>
                  <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                    {formatPrice(total)} VNĐ
                  </span>
                </div>
              </Space>
            </Card>
          )}

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => {
                setIsModalOpen(false);
                setOrderItems([]);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Lưu hóa đơn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Card style={{ marginBottom: 16 }}>
        <Space direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'} size="middle" style={{ width: '100%' }}>
          <Select
            value={searchField}
            onChange={(value) => setSearchField(value)}
            style={{ minWidth: 160 }}
            size="large"
          >
            <Option value="id">Mã hóa đơn</Option>
            <Option value="customerName">Tên khách hàng</Option>
            <Option value="customerPhone">SĐT</Option>
          </Select>
          <Input
            placeholder="Nhập từ khóa tìm kiếm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size="large"
          />
          <Select
            value={timeFilter}
            onChange={(value) => setTimeFilter(value)}
            style={{ minWidth: 180 }}
            size="large"
          >
            <Option value="all">Tất cả thời gian</Option>
            <Option value="day">Trong ngày</Option>
            <Option value="week">Trong tuần</Option>
            <Option value="month">Trong tháng</Option>
          </Select>
        </Space>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={invoiceColumns}
            dataSource={filteredInvoices}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: 'Chưa có hóa đơn nào. Hãy tạo hóa đơn mới!',
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default OrderManagement;
