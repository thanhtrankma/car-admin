import { useState, useEffect } from 'react';
import { Button, Card, Table, Space, Modal, Form, InputNumber, DatePicker, message, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { listProductTypes, listWarehouses, type ProductTypeDto, type WarehouseDto } from '../services/productService';
import { apiRequest, ApiError } from '../services/apiClient';

interface WarehouseItem {
  productTypeId: string;
  quantity: number;
  cost: number;
}

interface WarehousePayload {
  receiptDate: string;
  items: WarehouseItem[];
}

const StockIn = () => {
  const [stockInList, setStockInList] = useState<WarehouseDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [productTypes, setProductTypes] = useState<ProductTypeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchWarehouses = async (page = 1, limit = 10) => {
    try {
      setTableLoading(true);
      const response = await listWarehouses({
        page,
        limit,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setStockInList(response.data);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch {
      message.error('Không thể tải danh sách phiếu nhập kho');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        setLoading(true);
        const response = await listProductTypes(1, 100);
        setProductTypes(response.data);
        if (response.data.length > 0) {
          setActiveTab(response.data[0].id);
        }
      } catch {
        message.error('Không thể tải danh sách loại sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (isModalOpen) {
      fetchProductTypes();
    }
  }, [isModalOpen]);

  const handleSave = async (values: { receiptDate: dayjs.Dayjs; [key: string]: unknown }) => {
    try {
      const items: WarehouseItem[] = productTypes
        .map((type) => {
          const quantity = Number(values[`quantity_${type.id}`]) || 0;
          const cost = Number(values[`cost_${type.id}`]) || 0;
          if (quantity > 0 && cost > 0) {
            return {
              productTypeId: type.id,
              quantity,
              cost,
            };
          }
          return null;
        })
        .filter((item): item is WarehouseItem => item !== null);

      if (items.length === 0) {
        message.warning('Vui lòng nhập ít nhất một sản phẩm');
        return;
      }

      const payload: WarehousePayload = {
        receiptDate: values.receiptDate.format('YYYY-MM-DD'),
        items,
      };

      await apiRequest<{ message: string }>('/warehouses', {
        method: 'POST',
        data: payload,
      });

      message.success('Tạo phiếu nhập kho thành công');
      setIsModalOpen(false);
      form.resetFields();
      if (productTypes.length > 0) {
        setActiveTab(productTypes[0].id);
      }
      fetchWarehouses(pagination.current, pagination.pageSize);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Có lỗi xảy ra khi tạo phiếu nhập kho';
      message.error(errorMessage);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const columns: ColumnsType<WarehouseDto> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'publicCode',
      key: 'publicCode',
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'receiptDate',
      key: 'receiptDate',
      render: (date) => formatDate(date),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => formatDateTime(date),
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
          <h1 style={{ fontSize: window.innerWidth < 576 ? 20 : 24, fontWeight: 'bold', marginBottom: 8 }}>Nhập kho</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Quản lý phiếu nhập kho và tồn kho</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          block={window.innerWidth < 768}
        >
          Tạo phiếu nhập kho
        </Button>
      </div>

      <Modal
        title="Phiếu nhập kho"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          if (productTypes.length > 0) {
            setActiveTab(productTypes[0].id);
          }
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            receiptDate: dayjs(),
          }}
        >
          <Form.Item
            label="Ngày nhập"
            name="receiptDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
          >
            <DatePicker style={{ width: '100%' }} size="large" format="DD/MM/YYYY" />
          </Form.Item>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>
          ) : productTypes.length > 0 ? (
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={productTypes.map((type) => ({
                key: type.id,
                label: type.name,
                children: (
                  <div style={{ padding: '16px 0' }}>
                    <Form.Item
                      label="Số lượng nhập"
                      name={`quantity_${type.id}`}
                      rules={[{ required: false }]}
                    >
                      <InputNumber<number>
                        min={0}
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="Nhập số lượng"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Giá nhập (VNĐ)"
                      name={`cost_${type.id}`}
                      rules={[{ required: false }]}
                    >
                      <InputNumber<number>
                        min={0}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => Number((value || '0').replace(/\$\s?|(,*)/g, '')) || 0}
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="Nhập giá nhập"
                      />
                    </Form.Item>

                    <Form.Item shouldUpdate>
                      {({ getFieldValue }) => {
                        const quantity = getFieldValue(`quantity_${type.id}`) || 0;
                        const cost = getFieldValue(`cost_${type.id}`) || 0;
                        const total = quantity * cost;
                        return total > 0 ? (
                          <Card style={{ background: '#e6f7ff', marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 500 }}>Thành tiền:</span>
                              <span style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
                                {formatPrice(total)} VNĐ
                              </span>
                            </div>
                          </Card>
                        ) : null;
                      }}
                    </Form.Item>
                  </div>
                ),
              }))}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>Không có loại sản phẩm nào</div>
          )}

          <Form.Item shouldUpdate>
            {({ getFieldValue }) => {
              let totalAmount = 0;
              productTypes.forEach((type) => {
                const quantity = getFieldValue(`quantity_${type.id}`) || 0;
                const cost = getFieldValue(`cost_${type.id}`) || 0;
                totalAmount += quantity * cost;
              });
              return totalAmount > 0 ? (
                <Card style={{ background: '#f0f9ff', marginTop: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, fontSize: 16 }}>Tổng tiền:</span>
                    <span style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                      {formatPrice(totalAmount)} VNĐ
                    </span>
                  </div>
                </Card>
              ) : null;
            }}
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
                if (productTypes.length > 0) {
                  setActiveTab(productTypes[0].id);
                }
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu phiếu nhập
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <InboxOutlined style={{ fontSize: 20, marginRight: 8 }} />
          <h2 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>Danh sách phiếu nhập kho</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={stockInList}
            rowKey="id"
            loading={tableLoading}
            scroll={{ x: 'max-content' }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} phiếu nhập kho`,
              onChange: (page, pageSize) => {
                fetchWarehouses(page, pageSize);
              },
              onShowSizeChange: (current, size) => {
                fetchWarehouses(current, size);
              },
            }}
            locale={{
              emptyText: 'Chưa có phiếu nhập kho nào. Hãy tạo phiếu nhập kho mới!',
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default StockIn;
