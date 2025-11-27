import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, Button, Space, Row, Col, Descriptions, Tag, Image, Spin, message } from 'antd';

interface CarDetail {
  sku: string;
  name: string;
  type: string;
  version: string;
  weight?: number;
  capacity?: number;
  manufacturingYear?: number;
  color?: string;
  chassisNumber?: string;
  engineNumber?: string;
  stockInDate?: string;
  costPrice?: number;
  sellingPrice?: number;
  stockStatus?: string;
  images?: string[];
}

const CarDetail = () => {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState<CarDetail | null>(null);

  useEffect(() => {
    // Simulate API call - in real app, fetch from API using code
    const fetchCarDetail = async () => {
      setLoading(true);
      try {
        // Mock data based on code - replace with actual API call
        const mockCars: Record<string, CarDetail> = {
          'H001': {
            sku: 'SKU001',
            name: 'Wave Alpha',
            type: 'Xe số',
            version: '2023',
            weight: 97,
            capacity: 110,
            manufacturingYear: 2023,
            color: 'Đỏ',
            chassisNumber: 'CH123456789',
            engineNumber: 'EN987654321',
            stockInDate: '2024-01-15',
            costPrice: 18240000,
            sellingPrice: 19380000,
            stockStatus: 'Còn hàng',
            images: [],
          },
          'H002': {
            sku: 'SKU002',
            name: 'Vision',
            type: 'Xe tay ga',
            version: '2024',
            weight: 105,
            capacity: 125,
            manufacturingYear: 2024,
            color: 'Xanh',
            chassisNumber: 'CH234567890',
            engineNumber: 'EN876543210',
            stockInDate: '2024-02-20',
            costPrice: 30960000,
            sellingPrice: 32490000,
            stockStatus: 'Còn hàng',
            images: [],
          },
          'H003': {
            sku: 'SKU003',
            name: 'SH Mode',
            type: 'Xe tay ga',
            version: '2023 ABS',
            weight: 118,
            capacity: 150,
            manufacturingYear: 2023,
            color: 'Trắng',
            chassisNumber: 'CH345678901',
            engineNumber: 'EN765432109',
            stockInDate: '2024-03-10',
            costPrice: 55420000,
            sellingPrice: 58350000,
            stockStatus: 'Còn hàng',
            images: [],
          },
          'H004': {
            sku: 'SKU004',
            name: 'Air Blade',
            type: 'Xe tay ga',
            version: '2024 160cc',
            weight: 115,
            capacity: 160,
            manufacturingYear: 2024,
            color: 'Đen',
            chassisNumber: 'CH456789012',
            engineNumber: 'EN654321098',
            stockInDate: '2024-04-05',
            costPrice: 42780000,
            sellingPrice: 45190000,
            stockStatus: 'Còn hàng',
            images: [],
          },
          'H005': {
            sku: 'SKU005',
            name: 'Winner X',
            type: 'Xe côn tay',
            version: '2023',
            weight: 142,
            capacity: 150,
            manufacturingYear: 2023,
            color: 'Xanh dương',
            chassisNumber: 'CH567890123',
            engineNumber: 'EN543210987',
            stockInDate: '2024-05-12',
            costPrice: 45360000,
            sellingPrice: 48210000,
            stockStatus: 'Còn hàng',
            images: [],
          },
          'H006': {
            sku: 'SKU006',
            name: 'Lead',
            type: 'Xe tay ga',
            version: '2024 Smartkey',
            weight: 108,
            capacity: 125,
            manufacturingYear: 2024,
            color: 'Bạc',
            chassisNumber: 'CH678901234',
            engineNumber: 'EN432109876',
            stockInDate: '2024-06-18',
            costPrice: 38540000,
            sellingPrice: 40890000,
            stockStatus: 'Còn hàng',
            images: [],
          },
          'H007': {
            sku: 'SKU007',
            name: 'SH 150i',
            type: 'Xe tay ga',
            version: '2024 CBS',
            weight: 125,
            capacity: 150,
            manufacturingYear: 2024,
            color: 'Trắng',
            chassisNumber: 'CH789012345',
            engineNumber: 'EN321098765',
            stockInDate: '2024-07-25',
            costPrice: 85120000,
            sellingPrice: 89480000,
            stockStatus: 'Còn hàng',
            images: [],
          },
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const carData = code ? mockCars[code] : null;
        if (carData) {
          setCar(carData);
        } else {
          // Fallback for unknown codes
          setCar({
            sku: code || 'N/A',
            name: 'Không tìm thấy',
            type: 'N/A',
            version: 'N/A',
            stockStatus: 'N/A',
            images: [],
          });
        }
      } catch (error) {
        message.error('Không thể tải thông tin xe');
        navigate('/cars');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchCarDetail();
    } else {
      navigate('/cars');
    }
  }, [code, navigate]);

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Còn hàng':
        return 'green';
      case 'Hết hàng':
        return 'red';
      case 'Sắp về':
        return 'blue';
      case 'Đang bảo hành':
        return 'orange';
      default:
        return 'default';
    }
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
                <strong>{car.sku}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Tên xe">
                <strong style={{ fontSize: 18 }}>{car.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Loại xe">{car.type}</Descriptions.Item>
              <Descriptions.Item label="Phiên bản">{car.version}</Descriptions.Item>
              <Descriptions.Item label="Trọng lượng">
                {car.weight ? `${car.weight} kg` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Dung tích">
                {car.capacity ? `${car.capacity} cc` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Năm sản xuất">
                {car.manufacturingYear || 'N/A'}
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
                {formatDate(car.stockInDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái trong kho">
                <Tag color={getStatusColor(car.stockStatus)}>
                  {car.stockStatus || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Giá vốn">
                <strong style={{ color: '#1890ff' }}>{formatPrice(car.costPrice)}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Giá bán">
                <strong style={{ color: '#52c41a', fontSize: 18 }}>
                  {formatPrice(car.sellingPrice)}
                </strong>
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
                        src={img}
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
          <Button type="primary" onClick={() => navigate('/cars')}>
            Chỉnh sửa
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default CarDetail;

