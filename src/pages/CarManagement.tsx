import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Button, Card, Space, Select, Tag, Pagination, message, Popconfirm, Row, Col, Image, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, InfoCircleOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { listProducts, deleteProduct, type ProductDto, getProductRemainState, listProductRemain } from '../services/productService';

const { Option } = Select;

interface Car {
  id: string;
  sku?: string;
  code: string;
  name: string;
  type: string;
  version: string;
  createdAt: string;
  costPrice: number;
  sellingPrice: number;
  status: string;
  quantity: number;
  vehicleType?: number;
  warehouseStatus?: number;
  images?: string[];
}

const VEHICLE_TYPE_LABELS: Record<number, string> = {
  1: 'Xe tay ga',
  2: 'Xe số',
  3: 'Xe côn tay',
};

const WAREHOUSE_STATUS_META: Record<number, { label: string; color: string }> = {
  1: { label: 'Còn hàng', color: 'green' },
  2: { label: 'Hết hàng', color: 'red' },
  3: { label: 'Sắp về', color: 'blue' },
  4: { label: 'Đang bảo hành', color: 'orange' },
};

const formatDateTime = (value?: string) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('vi-VN', {
      hour12: false,
    });
  } catch {
    return value;
  }
};

const formatImageUrl = (url?: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `http://${url}`;
};

const mapProductToCar = (product: ProductDto): Car => ({
  id: product.id,
  sku: product.sku,
  code: product.code,
  name: product.name,
  type: VEHICLE_TYPE_LABELS[product.vehicleType] ?? `Loại ${product.vehicleType}`,
  version: product.version,
  createdAt: formatDateTime(product.created_at),
  costPrice: product.cost,
  sellingPrice: product.price,
  status: WAREHOUSE_STATUS_META[product.warehouseStatus]?.label ?? `Trạng thái ${product.warehouseStatus}`,
  quantity: product.quantity,
  vehicleType: product.vehicleType,
  warehouseStatus: product.warehouseStatus,
  images: product.images,
});

const CarManagement = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined);
  const [nameFilter, setNameFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRemain, setTotalRemain] = useState(0);
  const [pendingList, setPendingList] = useState<Array<{ name: string; remain: number }>>([]);
  const [loadingRemain, setLoadingRemain] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      message.success('Xóa xe thành công!');
      await fetchCars();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Xóa xe thất bại';
      message.error(errorMessage);
    }
  };

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const searchValue = (nameFilter ?? searchTerm).trim();
      const response = await listProducts({
        search: searchValue || undefined,
        warehouseStatus: statusFilter,
        vehicleType: typeFilter,
        page: currentPage,
        limit: pageSize,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      setCars(response.data.map(mapProductToCar));
      setTotalItems(response.pagination.total);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách xe';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, nameFilter, statusFilter, typeFilter]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const fetchRemainState = useCallback(async () => {
    setLoadingRemain(true);
    try {
      const response = await getProductRemainState();
      setTotalRemain(response.data.totalRemain);
      
      if (response.data.totalRemain > 0) {
        const remainList = await listProductRemain({
          page: 1,
          limit: 100,
          sortBy: 'created_at',
          sortOrder: 'desc',
        });
        
        // Group by name and sum remain
        const grouped = remainList.data.reduce((acc, item) => {
          const existing = acc.find(g => g.name === item.name);
          if (existing) {
            existing.remain += item.remain;
          } else {
            acc.push({ name: item.name, remain: item.remain });
          }
          return acc;
        }, [] as Array<{ name: string; remain: number }>);
        
        setPendingList(grouped);
      } else {
        setPendingList([]);
      }
      } catch {
      // Silently fail - don't show error for this
    } finally {
      setLoadingRemain(false);
    }
  }, []);

  useEffect(() => {
    fetchRemainState();
    const interval = setInterval(fetchRemainState, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchRemainState]);

  const uniqueStatuses = useMemo(() => {
    const statusMap = new Map<number, string>();
    cars.forEach(car => {
      if (typeof car.warehouseStatus === 'number' && !statusMap.has(car.warehouseStatus)) {
        statusMap.set(car.warehouseStatus, car.status);
      }
    });
    return Array.from(statusMap.entries());
  }, [cars]);

  const uniqueTypes = useMemo(() => {
    const typeMap = new Map<number, string>();
    cars.forEach(car => {
      if (typeof car.vehicleType === 'number' && !typeMap.has(car.vehicleType)) {
        typeMap.set(car.vehicleType, car.type);
      }
    });
    return Array.from(typeMap.entries());
  }, [cars]);

  const uniqueNames = useMemo(() => Array.from(new Set(cars.map(car => car.name))), [cars]);

  const columns: ColumnsType<Car> = [
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images: string[] | undefined, record) => {
        const firstImage = formatImageUrl(images?.[0]);
        if (!firstImage) {
          return <div style={{ width: 48, height: 48, background: '#f5f5f5', borderRadius: 8 }} />;
        }
        return (
          <Image
            src={firstImage}
            alt={record.name}
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            preview={false}
          />
        );
      },
    },
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
      render: (status, record) => {
        const meta = record.warehouseStatus ? WAREHOUSE_STATUS_META[record.warehouseStatus] : undefined;
        return (
          <Tag color={meta?.color ?? 'default'}>
            {status}
          </Tag>
        );
      },
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
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/cars/${record.code}/edit`)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa xe này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];


  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Danh sách sản phẩm</h1>
            <p style={{ color: '#666', fontSize: 14 }}>Quản lý thông tin xe trong hệ thống</p>
          </div>
        </Col>
      </Row>

      {totalRemain > 0 && (
        <Alert
          message={
            <Space>
              <ExclamationCircleOutlined />
              <span>
                Có <strong>{totalRemain}</strong> xe chưa hoàn tất thông tin
              </span>
            </Space>
          }
          description={
            <div style={{ marginTop: 8 }}>
              {pendingList.length > 0 ? (
                <Space wrap>
                  {pendingList.map((item, index) => (
                    <Tag key={index} color="orange" style={{ marginBottom: 4 }}>
                      <strong>{item.name}</strong> - Cần nhập thông tin: <strong>{item.remain} xe</strong>
                    </Tag>
                  ))}
                </Space>
              ) : (
                <span>Có xe cần nhập thông tin số khung/số máy</span>
              )}
            </div>
          }
          type="warning"
          showIcon
          action={
            <Button
              type="primary"
              danger
              onClick={() => navigate('/pending-cars')}
              loading={loadingRemain}
            >
              Cập nhật ngay
            </Button>
          }
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      <Card style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo mã, tên xe..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          size="large"
        />
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <span style={{ fontWeight: 500 }}>Bộ lọc nhanh:</span>
          <Button
            type={!typeFilter && !statusFilter && !nameFilter ? 'primary' : 'default'}
            onClick={() => {
              setTypeFilter(undefined);
              setStatusFilter(undefined);
              setNameFilter(undefined);
              setCurrentPage(1);
            }}
          >
            Tất cả
          </Button>
          <Button
            type={typeFilter === 2 ? 'primary' : 'default'}
            onClick={() => {
              setTypeFilter(2);
              setStatusFilter(undefined);
              setNameFilter(undefined);
              setCurrentPage(1);
            }}
          >
            Xe số
          </Button>
          <Button
            type={typeFilter === 1 ? 'primary' : 'default'}
            onClick={() => {
              setTypeFilter(1);
              setStatusFilter(undefined);
              setNameFilter(undefined);
              setCurrentPage(1);
            }}
          >
            Xe tay ga
          </Button>
          <Button
            type={typeFilter === 3 ? 'primary' : 'default'}
            onClick={() => {
              setTypeFilter(3);
              setStatusFilter(undefined);
              setNameFilter(undefined);
              setCurrentPage(1);
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
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            allowClear
            style={{ width: window.innerWidth < 576 ? '100%' : 150 }}
          >
            {uniqueStatuses.map(([value, label]) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Loại xe"
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
            allowClear
            style={{ width: window.innerWidth < 576 ? '100%' : 150 }}
          >
            {uniqueTypes.map(([value, label]) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Tên xe"
            value={nameFilter}
            onChange={(value) => {
              setNameFilter(value);
              setCurrentPage(1);
            }}
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
            dataSource={cars}
            rowKey={(record) => record.id || record.code}
            pagination={false}
            scroll={{ x: 1200 }}
            loading={loading}
          />
        </div>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size || pageSize);
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
