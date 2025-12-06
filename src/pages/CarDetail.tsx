import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, Button, Space, Row, Col, Descriptions, Tag, Image, Spin, message } from 'antd';
import { getProductById, type ProductDto } from '../services/productService';

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

const formatImageUrl = (url: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `http://${url}`;
};

const CarDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState<ProductDto | null>(null);

  useEffect(() => {
    const fetchCarDetail = async () => {
      setLoading(true);
      try {
        if (!id) {
          navigate('/cars');
          return;
        }
        const product = await getProductById(id);
        setCar(product);
      } catch {
        message.error('Không thể tải thông tin xe');
        navigate('/cars');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarDetail();
    } else {
      navigate('/cars');
    }
  }, [id, navigate]);

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getVehicleTypeLabel = (value?: number) => {
    if (!value) return 'N/A';
    return VEHICLE_TYPE_LABELS[value] ?? `Loại ${value}`;
  };

  const getWarehouseStatusMeta = (value?: number) => {
    if (!value) return undefined;
    return WAREHOUSE_STATUS_META[value];
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!car) {
    return null;
  }

  return (
    <div>
      <Space align="center" style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeft />}
          onClick={() => navigate('/cars')}
          type="text"
        />
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Chi tiết xe</h1>
      </Space>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Thông tin cơ bản" style={{ marginBottom: 24 }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Mã nội bộ (SKU)">
                <strong>{car.sku || 'N/A'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Mã xe">
                <strong>{car.id || 'N/A'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Tên xe">
                <strong style={{ fontSize: 18 }}>{car.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Loại xe">
                {getVehicleTypeLabel(car.vehicleType)}
              </Descriptions.Item>
              <Descriptions.Item label="Phiên bản">{car.version}</Descriptions.Item>
              <Descriptions.Item label="Trọng lượng">
                {car.weight || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Dung tích">
                {car.cc || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Năm sản xuất">
                {car.manufacturedDate || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Màu sắc">{car.color || 'N/A'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Thông tin kỹ thuật" style={{ marginBottom: 24 }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Số khung">
                {car.chassisNumber || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Số máy">
                {car.engineNumber || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Thông tin kho và giá" style={{ marginBottom: 24 }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Ngày nhập kho">
                {formatDate(car.receiptDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái trong kho">
                <Tag color={getWarehouseStatusMeta(car.warehouseStatus)?.color ?? 'default'}>
                  {getWarehouseStatusMeta(car.warehouseStatus)?.label || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Giá vốn">
                <strong style={{ color: '#1890ff' }}>{formatPrice(car.cost)}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Giá bán">
                <strong style={{ color: '#52c41a', fontSize: 18 }}>
                  {formatPrice(car.price)}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                {car.quantity ?? 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Hình ảnh" style={{ marginBottom: 24 }}>
            {car.images && car.images.length > 0 ? (
              <Image.PreviewGroup>
                <Row gutter={[8, 8]}>
                  {car.images.map((img, index) => (
                    <Col xs={12} sm={8} key={index}>
                      <Image
                        src={formatImageUrl(img)}
                        alt={`${car.name} - ${index + 1}`}
                        style={{ width: '100%', borderRadius: 4 }}
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <p>Chưa có hình ảnh</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/cars')}>
            Quay lại
          </Button>
          <Button type="primary" onClick={() => navigate(`/cars/${id}/edit`)}>
            Chỉnh sửa
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default CarDetail;

