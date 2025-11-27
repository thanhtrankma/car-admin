import { useState } from 'react';
import { Button, Card, Select, Table, Space, Modal, Form, InputNumber, DatePicker, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const availableCars = [
    { code: 'H001', name: 'Wave Alpha' },
    { code: 'H002', name: 'Vision' },
    { code: 'H003', name: 'SH Mode' },
    { code: 'H004', name: 'Air Blade' },
    { code: 'H005', name: 'Winner X' },
    { code: 'H006', name: 'Lead' },
    { code: 'H007', name: 'SH 150i' },
  ];

  const handleSave = (values: { carCode: string; quantity: number; unitPrice: number; date: dayjs.Dayjs }) => {
    const car = availableCars.find(c => c.code === values.carCode);
    if (!car) return;

    const newItem: StockInItem = {
      id: `ST${Date.now()}`,
      carCode: values.carCode,
      carName: car.name,
      quantity: values.quantity,
      unitPrice: values.unitPrice,
      total: values.quantity * values.unitPrice,
      date: values.date.format('YYYY-MM-DD'),
    };

    setStockInList([newItem, ...stockInList]);
    setIsModalOpen(false);
    form.resetFields();
    message.success('Nhập kho thành công!');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const columns: ColumnsType<StockInItem> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'id',
      key: 'id',
    },
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
    },
    {
      title: 'Giá nhập',
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
      title: 'Ngày nhập',
      dataIndex: 'date',
      key: 'date',
      render: (date) => formatDate(date),
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
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            date: dayjs(),
            quantity: 1,
          }}
        >
          <Form.Item
            label="Chọn xe"
            name="carCode"
            rules={[{ required: true, message: 'Vui lòng chọn xe' }]}
          >
            <Select placeholder="Chọn xe" size="large">
              {availableCars.map(car => (
                <Option key={car.code} value={car.code}>
                  {car.name} ({car.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày nhập"
            name="date"
            rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
          >
            <DatePicker style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item
            label="Số lượng nhập"
            name="quantity"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber<number> min={1} style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item
            label="Giá nhập (VNĐ)"
            name="unitPrice"
            rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}
          >
            <InputNumber<number>
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number((value || '0').replace(/\$\s?|(,*)/g, '')) || 0}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>

          <Form.Item shouldUpdate>
            {({ getFieldValue }) => {
              const quantity = getFieldValue('quantity') || 0;
              const unitPrice = getFieldValue('unitPrice') || 0;
              const total = quantity * unitPrice;
              return total > 0 ? (
                <Card style={{ background: '#e6f7ff', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>Tổng tiền:</span>
                    <span style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                      {formatPrice(total)} VNĐ
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
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
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
            scroll={{ x: 'max-content' }}
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
