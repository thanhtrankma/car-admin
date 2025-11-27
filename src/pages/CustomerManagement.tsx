import { useState } from 'react';
import { Car } from 'lucide-react';
import { Input, Button, Card, Space, Row, Col, Modal, Form, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

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
    setCustomers(customers.filter(customer => customer.id !== id));
    message.success('Xóa khách hàng thành công!');
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    form.setFieldsValue({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      carUsing: customer.carUsing || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (values: { name: string; email: string; phone: string; address: string; carUsing?: string }) => {
    if (editingId) {
      setCustomers(customers.map(customer =>
        customer.id === editingId
          ? { ...customer, ...values }
          : customer
      ));
      message.success('Cập nhật khách hàng thành công!');
    } else {
      const newCustomer: Customer = {
        id: String(customers.length + 1),
        ...values,
        totalOrders: 0,
        totalSpent: 0,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setCustomers([...customers, newCustomer]);
      message.success('Thêm khách hàng thành công!');
    }
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

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
          <h1 style={{ fontSize: window.innerWidth < 576 ? 20 : 24, fontWeight: 'bold', marginBottom: 8 }}>Quản lý khách hàng</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Quản lý thông tin khách hàng trong hệ thống</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          block={window.innerWidth < 768}
        >
          Thêm mới
        </Button>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Input
          placeholder="Tìm kiếm khách hàng..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="large"
        />
      </Card>

      <Row gutter={[16, 16]}>
        {filteredCustomers.map((customer) => (
          <Col xs={24} sm={12} lg={8} key={customer.id}>
            <Card
              hoverable
              actions={[
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(customer)}
                />,
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa khách hàng này?"
                  onConfirm={() => handleDelete(customer.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{customer.name}</h3>
                <p style={{ color: '#999', fontSize: 12, marginBottom: 16 }}>
                  Thành viên từ {formatDate(customer.joinDate)}
                </p>

                <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 16 }}>
                  <div>
                    <MailOutlined style={{ marginRight: 8, color: '#666' }} />
                    <span style={{ fontSize: 14 }}>{customer.email}</span>
                  </div>
                  <div>
                    <PhoneOutlined style={{ marginRight: 8, color: '#666' }} />
                    <span style={{ fontSize: 14 }}>{customer.phone}</span>
                  </div>
                  <div>
                    <EnvironmentOutlined style={{ marginRight: 8, color: '#666' }} />
                    <span style={{ fontSize: 14 }}>{customer.address}</span>
                  </div>
                  {customer.carUsing && (
                    <div>
                      <Car style={{ width: 14, height: 14, marginRight: 8, color: '#666' }} />
                      <span style={{ fontSize: 14 }}>{customer.carUsing}</span>
                    </div>
                  )}
                </Space>

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <p style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Tổng đơn hàng</p>
                      <p style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>{customer.totalOrders}</p>
                    </Col>
                    <Col span={12}>
                      <p style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Tổng chi tiêu</p>
                      <p style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', margin: 0 }}>
                        {formatPrice(customer.totalSpent)} VNĐ
                      </p>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredCustomers.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Không tìm thấy khách hàng nào
          </div>
        </Card>
      )}

      <Modal
        title={editingId ? 'Sửa thông tin khách hàng' : 'Thêm mới khách hàng'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={window.innerWidth < 768 ? '90%' : 600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            label="Tên khách hàng"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input placeholder="Nhập tên khách hàng" size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email" size="large" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="Nhập số điện thoại" size="large" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input placeholder="Nhập địa chỉ" size="large" />
          </Form.Item>

          <Form.Item
            label="Xe đang dùng"
            name="carUsing"
          >
            <Input placeholder="Nhập tên xe đang dùng (nếu có)" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
