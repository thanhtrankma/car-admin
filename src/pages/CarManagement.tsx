import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Button, Card, Space, Select, Tag, Pagination, message, Popconfirm, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, PlusOutlined, DownloadOutlined, InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

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
  const [pageSize, setPageSize] = useState(10);

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
    setCars(cars.filter(car => car.code !== code));
    message.success('Xóa xe thành công!');
  };

  const uniqueStatuses = Array.from(new Set(cars.map(car => car.status)));
  const uniqueTypes = Array.from(new Set(cars.map(car => car.type)));
  const uniqueNames = Array.from(new Set(cars.map(car => car.name)));

  const columns: ColumnsType<Car> = [
    {
      title: 'Mã xe',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Tên xe',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại xe',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Giá vốn',
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (price) => formatPrice(price),
    },
    {
      title: 'Giá bán',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      render: (price) => formatPrice(price),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Còn hàng' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right' as const,
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<InfoCircleOutlined />} 
            onClick={() => navigate(`/cars/${record.code}`)}
            title="Xem chi tiết"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa xe này?"
            onConfirm={() => handleDelete(record.code)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const paginatedCars = filteredCars.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Danh sách sản phẩm</h1>
            <p style={{ color: '#666', fontSize: 14 }}>Quản lý thông tin xe trong hệ thống</p>
          </div>
        </Col>
        <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space wrap>
            <Button icon={<DownloadOutlined />}>
              <span style={{ display: window.innerWidth < 576 ? 'none' : 'inline' }}>Nhập từ Excel</span>
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/cars/add')}
            >
              <span style={{ display: window.innerWidth < 576 ? 'none' : 'inline' }}>Thêm mới</span>
            </Button>
          </Space>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo mã, tên xe..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="large"
        />
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <span style={{ fontWeight: 500 }}>Bộ lọc nhanh:</span>
          <Button
            type={typeFilter === '' && statusFilter === '' && nameFilter === '' ? 'primary' : 'default'}
            onClick={() => {
              setTypeFilter('');
              setStatusFilter('');
              setNameFilter('');
            }}
          >
            Tất cả
          </Button>
          <Button
            type={typeFilter === 'Xe số' ? 'primary' : 'default'}
            onClick={() => {
              setTypeFilter('Xe số');
              setStatusFilter('');
              setNameFilter('');
            }}
          >
            Xe số
          </Button>
          <Button
            type={typeFilter === 'Xe tay ga' ? 'primary' : 'default'}
            onClick={() => {
              setTypeFilter('Xe tay ga');
              setStatusFilter('');
              setNameFilter('');
            }}
          >
            Xe tay ga
          </Button>
          <Button
            type={typeFilter === 'Xe côn tay' ? 'primary' : 'default'}
            onClick={() => {
              setTypeFilter('Xe côn tay');
              setStatusFilter('');
              setNameFilter('');
            }}
          >
            Xe côn tay
          </Button>
        </Space>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <span style={{ fontWeight: 500 }}>Bộ lọc chi tiết:</span>
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: window.innerWidth < 576 ? '100%' : 150 }}
          >
            {uniqueStatuses.map((status) => (
              <Option key={status} value={status}>{status}</Option>
            ))}
          </Select>
          <Select
            placeholder="Loại xe"
            value={typeFilter}
            onChange={setTypeFilter}
            allowClear
            style={{ width: window.innerWidth < 576 ? '100%' : 150 }}
          >
            {uniqueTypes.map((type) => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
          <Select
            placeholder="Tên xe"
            value={nameFilter}
            onChange={setNameFilter}
            allowClear
            style={{ width: window.innerWidth < 576 ? '100%' : 200 }}
          >
            {uniqueNames.map((name) => (
              <Option key={name} value={name}>{name}</Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={paginatedCars}
            rowKey="code"
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </div>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredCars.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            showTotal={(total) => `Tổng ${total} xe`}
            responsive
          />
        </div>
      </Card>
    </div>
  );
};

export default CarManagement;
