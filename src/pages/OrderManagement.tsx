import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Select, Table, Space, Modal, Form, message, Divider, Row, Col, Typography, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, DownloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { listProducts, type ProductDto } from '../services/productService';
import { listInvoices, createInvoice, getInvoiceById, type InvoiceDto, type InvoiceDetailResponse } from '../services/invoiceService';

const { Option } = Select;

interface OrderItem {
  productId: string;
  carCode: string;
  carName: string;
  sku?: string;
  version?: string;
  color?: string;
  cc?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderFormValues {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  productId?: string;
  quantity?: number;
}

const OrderManagement = () => {
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceDetailResponse | null>(null);
  const { Title, Text } = Typography;

  const fetchProducts = useCallback(async () => {
    setProductLoading(true);
    try {
      const response = await listProducts({
        page: 1,
        limit: 100,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setProducts(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách sản phẩm';
      message.error(errorMessage);
    } finally {
      setProductLoading(false);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setInvoiceLoading(true);
    try {
      const response = await listInvoices({
        page,
        limit,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setInvoices(response.data);
      setTotalInvoices(response.pagination.total);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách hóa đơn';
      message.error(errorMessage);
    } finally {
      setInvoiceLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const addItem = (values: Pick<OrderFormValues, 'productId'>) => {
    const product = products.find((c) => c.id === values.productId);
    if (!product) {
      message.warning('Không tìm thấy sản phẩm');
      return;
    }
    const quantity = 1;

    const existingItem = orderItems.find(item => item.productId === product.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      setOrderItems(orderItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
          : item
      ));
      message.success(`Đã cập nhật ${product.name}: ${existingItem.quantity} → ${newQuantity}`);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          carCode: product.code,
          carName: product.name,
          sku: product.sku,
          version: product.version,
          color: product.color,
          cc: product.cc,
          quantity,
          unitPrice: product.price,
          total: quantity * product.price,
        },
      ]);
      message.success(`Đã thêm ${product.name} (x${quantity}) vào hóa đơn`);
    }
    form.setFieldsValue({ productId: undefined });
  };

  const isWithinTimeFilter = useCallback((dateString: string) => {
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
  }, [timeFilter]);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const keyword = searchValue.trim().toLowerCase();
        const matchesSearch = keyword
          ? invoice.invoiceNumber?.toLowerCase().includes(keyword) ||
            invoice.customerName?.toLowerCase().includes(keyword)
          : true;

        return matchesSearch && isWithinTimeFilter(invoice.created_at);
      }),
    [invoices, searchValue, isWithinTimeFilter]
  );

  const removeItem = (carCode: string) => {
    setOrderItems(orderItems.filter(item => item.carCode !== carCode));
  };


  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;

  const handleSave = (values: OrderFormValues) => {
    if (orderItems.length === 0) {
      message.warning('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }
    setCreatingInvoice(true);
    const payload = {
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail,
      customerAddress: values.customerAddress,
      items: orderItems.map((item) => ({
        productId: item.productId,
      })),
    };

    createInvoice(payload)
      .then(() => {
        message.success('Tạo hóa đơn thành công!');
        setIsModalOpen(false);
        setOrderItems([]);
        form.resetFields();
        fetchInvoices();
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'Không thể tạo hóa đơn';
        message.error(errorMessage);
      })
      .finally(() => {
        setCreatingInvoice(false);
      });
  };

  const handleExport = async (invoice: InvoiceDto) => {
    try {
      const detail = await getInvoiceById(invoice.id);
      const invoiceText = `
HÓA ĐƠN BÁN HÀNG
Mã hóa đơn: ${detail.invoice.invoiceNumber}
Ngày tạo: ${new Date(detail.invoice.created_at).toLocaleString('vi-VN')}

Khách hàng: ${detail.invoice.customerName}
SĐT: ${detail.invoice.customerPhone}
Email: ${detail.invoice.customerEmail || ''}
Địa chỉ: ${detail.invoice.customerAddress || ''}

Chi tiết:
${detail.details.map(item => `
  ${item.productName} (${item.productSku})
  Số lượng: ${item.quantity} x ${formatPrice(item.productPrice)} = ${formatPrice(item.totalPrice)} VNĐ
`).join('')}

TỔNG CỘNG: ${formatPrice(detail.invoice.totalAmount)} VNĐ
      `;

      const blob = new Blob([invoiceText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HoaDon_${detail.invoice.invoiceNumber}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Xuất hóa đơn thành công!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể xuất hóa đơn';
      message.error(errorMessage);
    }
  };

  const handleViewDetail = async (invoice: InvoiceDto) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const detail = await getInvoiceById(invoice.id);
      setInvoiceDetail(detail);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải chi tiết hóa đơn';
      message.error(errorMessage);
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const invoiceSubtotal = useMemo(() => {
    if (!invoiceDetail?.details) return 0;
    return invoiceDetail.details.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }, [invoiceDetail]);

  const grandTotal = useMemo(() => {
    if (invoiceDetail?.invoice?.totalAmount) return invoiceDetail.invoice.totalAmount;
    return invoiceSubtotal;
  }, [invoiceDetail, invoiceSubtotal]);

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setInvoiceDetail(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const itemColumns: ColumnsType<OrderItem> = [
    {
      title: 'Thông tin sản phẩm',
      key: 'productInfo',
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{record.carName}</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
            <strong>Mã:</strong> {record.carCode} {record.sku && `• SKU: ${record.sku}`}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {[record.version && `Phiên bản: ${record.version}`, record.color && `Màu: ${record.color}`, record.cc && `${record.cc}cc`]
              .filter(Boolean)
              .join(' • ')}
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      render: (price) => formatPrice(price) + ' VNĐ',
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      render: (total) => <strong>{formatPrice(total)} VNĐ</strong>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
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

  const invoiceColumns: ColumnsType<InvoiceDto> = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
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
      dataIndex: 'productCount',
      key: 'productCount',
      render: (count) => count ?? 0,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (total) => <strong>{formatPrice(total)} VNĐ</strong>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleExport(record)}
          >
            Xuất
          </Button>
        </Space>
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
          initialValues={{}}
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

          <Form.Item
            label="Email khách hàng"
            name="customerEmail"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="Nhập email khách hàng" size="large" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ khách hàng"
            name="customerAddress"
          >
            <Input placeholder="Nhập địa chỉ khách hàng" size="large" />
          </Form.Item>

          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Thêm sản phẩm</span>
                {orderItems.length > 0 && (
                  <span style={{ fontSize: 14, color: '#666', fontWeight: 'normal' }}>
                    Đã thêm: {orderItems.length} sản phẩm
                  </span>
                )}
              </div>
            } 
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={12} md={10}>
                <Form.Item
                  name="productId"
                  rules={[{ required: orderItems.length > 0 ? false : true, message: 'Vui lòng chọn xe' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    placeholder="Chọn xe"
                    size="large"
                    style={{ width: '100%' }}
                    loading={productLoading}
                    showSearch
                    optionFilterProp="label"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && form.getFieldValue('productId')) {
                        e.preventDefault();
                        form.validateFields(['productId']).then((values) => {
                          addItem(values);
                        }).catch(() => {});
                      }
                    }}
                  >
                    {products.map((product) => {
                      const infoParts = [];
                      if (product.version) infoParts.push(`Phiên bản: ${product.version}`);
                      if (product.color) infoParts.push(`Màu: ${product.color}`);
                      if (product.cc) infoParts.push(`${product.cc}cc`);
                      const infoText = infoParts.length > 0 ? infoParts.join(' • ') : '';
                      
                      return (
                        <Option 
                          key={product.id} 
                          value={product.id} 
                          label={`${product.name} ${product.code} ${product.version || ''} ${product.color || ''}`}
                        >
                          <div style={{ padding: '4px 0' }}>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                              <strong>Mã:</strong> {product.code} {product.sku && `• SKU: ${product.sku}`}
                            </div>
                            {infoText && (
                              <div style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>
                                {infoText}
                              </div>
                            )}
                            <div style={{ fontSize: 13, color: '#1890ff', fontWeight: 500, marginTop: 4 }}>
                              {formatPrice(product.price)} VNĐ
                              {product.quantity !== undefined && (
                                <span style={{ marginLeft: 8, color: product.quantity > 0 ? '#52c41a' : '#ff4d4f', fontSize: 11 }}>
                                  • Tồn kho: {product.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={4} md={4}>
                <Button 
                  type="primary" 
                  size="large"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => {
                    form.validateFields(['productId']).then((values) => {
                      addItem(values);
                      // Focus back to select after adding
                      setTimeout(() => {
                        const selectElement = document.querySelector('[name="productId"]') as HTMLElement;
                        if (selectElement) {
                          selectElement.focus();
                        }
                      }, 100);
                    }).catch(() => {
                      message.warning('Vui lòng chọn xe trước khi thêm');
                    });
                  }}
                >
                  Thêm
                </Button>
              </Col>
              <Col xs={24} sm={24} md={4}>
                <Button 
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    const productId = form.getFieldValue('productId');
                    if (!productId) {
                      message.warning('Vui lòng chọn xe trước');
                      return;
                    }
                    form.validateFields(['productId']).then((values) => {
                      addItem(values);
                      form.setFieldsValue({ productId: undefined });
                    }).catch(() => {});
                  }}
                >
                  Thêm nhanh (x1)
                </Button>
              </Col>
            </Row>
            <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
              💡 Mẹo: Nhấn Enter sau khi chọn xe để thêm nhanh
            </div>
          </Card>

          {orderItems.length > 0 && (
            <Card title="Danh sách sản phẩm" style={{ marginBottom: 16 }}>
              <div style={{ overflowX: 'auto' }}>
                <Table
                  columns={itemColumns}
                  dataSource={orderItems}
                  rowKey="productId"
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
              <Button type="primary" htmlType="submit" loading={creatingInvoice}>
                Lưu hóa đơn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Card style={{ marginBottom: 16 }}>
        <Space direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'} size="middle" style={{ width: '100%' }}>
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
            loading={invoiceLoading}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: 'Chưa có hóa đơn nào. Hãy tạo hóa đơn mới!',
            }}
            pagination={{
              current: page,
              pageSize: limit,
              total: totalInvoices,
              showSizeChanger: true,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setLimit(newPageSize || limit);
              },
              showTotal: (value) => `Tổng ${value} hóa đơn`,
            }}
          />
        </div>
      </Card>

      <Modal
        open={detailModalOpen}
        onCancel={handleCloseDetail}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 720}
        title="Chi tiết hóa đơn"
      >
        <Spin spinning={detailLoading}>
          {invoiceDetail ? (
            <div style={{ padding: window.innerWidth < 768 ? 8 : 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <Title level={4} style={{ marginBottom: 0 }}>
                    Honda Dealership
                  </Title>
                  <Text>123 Nguyễn Văn Linh, TP.HCM</Text>
                  <br />
                  <Text>Hotline: 1900 1234</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text>Mã hóa đơn</Text>
                  <Title level={5} style={{ margin: 0 }}>
                    {invoiceDetail.invoice.invoiceNumber}
                  </Title>
                  <Text>
                    Ngày lập: {formatDate(invoiceDetail.invoice.created_at)}
                  </Text>
                </div>
              </div>

              <Divider dashed />

              <Row gutter={32} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                  <Title level={5}>Thông tin người mua</Title>
                  <Space direction="vertical" size={2}>
                    <Text strong>{invoiceDetail.invoice.customerName}</Text>
                    <Text>SĐT: {invoiceDetail.invoice.customerPhone}</Text>
                    {invoiceDetail.invoice.customerEmail && <Text>Email: {invoiceDetail.invoice.customerEmail}</Text>}
                    {invoiceDetail.invoice.customerAddress && <Text>Địa chỉ: {invoiceDetail.invoice.customerAddress}</Text>}
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <Title level={5}>Thông tin thanh toán</Title>
                  <Space direction="vertical" size={2}>
                    <Text>Hình thức: Chuyển khoản/ Tiền mặt</Text>
                    <Text>Nhân viên: System</Text>
                    <Text>Trạng thái: Đã tạo</Text>
                  </Space>
                </Col>
              </Row>

              <Divider />

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: 16,
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'left' }}>#</th>
                      <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'left' }}>Sản phẩm</th>
                      <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'center' }}>Số lượng</th>
                      <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'right' }}>Đơn giá</th>
                      <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'right' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceDetail.details.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ padding: 8, border: '1px solid #e8e8e8' }}>{index + 1}</td>
                        <td style={{ padding: 8, border: '1px solid #e8e8e8' }}>
                          <Text strong>{item.productName}</Text>
                          <br />
                          <Text type="secondary">SKU: {item.productSku}</Text>
                        </td>
                        <td style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'center' }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'right' }}>
                          {formatPrice(item.productPrice)} VNĐ
                        </td>
                        <td style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'right' }}>
                          {formatPrice(item.totalPrice)} VNĐ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Row justify="end">
                <Col xs={24} md={12}>
                  <div style={{ padding: 16, background: '#fafafa', borderRadius: 8 }}>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong style={{ fontSize: 16 }}>TỔNG CỘNG:</Text>
                      <Text strong style={{ fontSize: 18, color: '#d4380d' }}>
                        {formatPrice(grandTotal)} VNĐ
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider dashed />

              <Row gutter={32}>
                <Col xs={24} md={12}>
                  <Text>Người lập hóa đơn</Text>
                  <div style={{ height: 60, border: '1px dashed #d9d9d9', marginTop: 8, borderRadius: 6 }} />
                </Col>
                <Col xs={24} md={12}>
                  <Text>Khách hàng</Text>
                  <div style={{ height: 60, border: '1px dashed #d9d9d9', marginTop: 8, borderRadius: 6 }} />
                </Col>
              </Row>
            </div>
          ) : (
            !detailLoading && <Text>Không có dữ liệu hóa đơn</Text>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default OrderManagement;
