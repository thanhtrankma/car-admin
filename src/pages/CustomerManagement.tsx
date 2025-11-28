import { useCallback, useEffect, useState } from 'react';
import { Input, Button, Card, Space, Row, Col, Modal, Form, message, Popconfirm, Spin, Pagination } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
  type CustomerDto,
} from '../services/customerService';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listCustomers({
        search: debouncedSearch || undefined,
        page,
        limit,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setCustomers(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách khách hàng';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, limit]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      message.success('Xóa khách hàng thành công!');
      fetchCustomers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa khách hàng';
      message.error(errorMessage);
    }
  };

  const handleEdit = async (id: string) => {
    setModalLoading(true);
    try {
      const response = await getCustomerById(id);
      const customer = response.data;
      setEditingId(id);
      form.setFieldsValue({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
      setIsModalOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải thông tin khách hàng';
      message.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSave = async (values: { name: string; email: string; phone: string; address: string }) => {
    setSaving(true);
    try {
      if (editingId) {
        await updateCustomer(editingId, values);
        message.success('Cập nhật khách hàng thành công!');
      } else {
        await createCustomer(values);
        message.success('Thêm khách hàng thành công!');
      }
      setIsModalOpen(false);
      setEditingId(null);
      form.resetFields();
      fetchCustomers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể lưu khách hàng';
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  // const handleAdd = () => {
  //   setEditingId(null);
  //   form.resetFields();
  //   setIsModalOpen(true);
  // };

  const handlePageChange = (newPage: number, newLimit: number) => {
    setPage(newPage);
    setLimit(newLimit);
  };

  const hasCustomers = customers.length > 0;

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
        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          block={window.innerWidth < 768}
        >
          Thêm mới
        </Button> */}
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

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {customers.map((customer) => (
            <Col xs={24} sm={12} lg={8} key={customer.id}>
              <Card
                hoverable
                actions={[
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(customer.id)}
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
                    Thành viên từ {formatDate(customer.created_at) || '—'}
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
                  </Space>

                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 16 }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <p style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Tổng đơn hàng</p>
                        <p style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>{customer.totalOrders ?? 0}</p>
                      </Col>
                      <Col span={12}>
                        <p style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Tổng chi tiêu</p>
                        <p style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', margin: 0 }}>
                          {formatPrice(customer.totalSpent ?? 0)} VNĐ
                        </p>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      {!loading && !hasCustomers && (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Không tìm thấy khách hàng nào
          </div>
        </Card>
      )}

      {hasCustomers && (
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Pagination
            current={page}
            pageSize={limit}
            total={total}
            onChange={(newPage, newSize) => handlePageChange(newPage, newSize || limit)}
            showSizeChanger
            showTotal={(value) => `Tổng ${value} khách hàng`}
            responsive
          />
        </div>
      )}

      <Modal
        title={editingId ? 'Sửa thông tin khách hàng' : 'Thêm mới khách hàng'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={window.innerWidth < 768 ? '90%' : 600}
      >
        <Spin spinning={modalLoading}>
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

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                Lưu
              </Button>
            </Space>
          </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
