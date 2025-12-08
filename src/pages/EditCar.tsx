import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Card, Form, Input, InputNumber, Select, Button, message, Space, Spin, Typography, Upload as AntUpload } from 'antd';
import type { UploadFile } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { getProductById, updateProduct, uploadProductImages, type ProductDto } from '../services/productService';

const { Text } = Typography;
const { Option } = Select;

const WAREHOUSE_STATUSES = [
  { value: 1, label: 'Còn hàng' },
  { value: 2, label: 'Hết hàng' },
];

const VERSION_OPTIONS = [
  'Đặc biệt',
  'Thể thao',
  'Tiêu chuẩn',
  'Cao cấp (Phanh đĩa - vành đúc)',
  'Đặc biệt (Phanh đĩa - vành đúc)',
  'Tiêu chuẩn (Phanh đĩa - vành nan hoa)',
];

const getManufacturedYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 2020; year--) {
    years.push(year);
  }
  return years;
};

const COLOR_OPTIONS = [
  'Đỏ',
  'Đen đỏ',
  'Trắng',
  'Trắng đen',
  'Xanh',
  'Xanh đen đỏ',
  'Xanh đen bạc',
  'Xám',
  'Xám trắng',
  'Xám đen',
  'Xám đen đỏ',
  'Đen',
  'Đen nhám',
  'Đen xanh',
  'Bạc',
];

const normalizeImageUrl = (url: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `http://${url}`;
};

interface CarFormValues {
  name: string;
  vehicleType: number;
  version: string;
  line?: string;
  weight?: string;
  cc?: string;
  manufacturedDate?: string;
  color?: string;
  chassisNumber?: string;
  engineNumber?: string;
  price?: number;
  warehouseStatus: number;
}

const EditCar = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [product, setProduct] = useState<ProductDto | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) {
      message.error('Không tìm thấy ID xe');
      navigate('/cars');
      return;
    }

    setLoading(true);
    try {
      const productData = await getProductById(id);
      setProduct(productData);
      
      form.setFieldsValue({
        name: productData.name,
        vehicleType: productData.vehicleType,
        version: productData.version,
        line: productData.line,
        weight: productData.weight,
        cc: productData.cc,
        manufacturedDate: productData.manufacturedDate,
        color: productData.color,
        chassisNumber: productData.chassisNumber,
        engineNumber: productData.engineNumber,
        price: productData.price,
        warehouseStatus: productData.warehouseStatus,
      });

      // Set existing images
      if (productData.images && productData.images.length > 0) {
        setFileList(
          productData.images.map((url, index) => ({
            uid: `${index}`,
            name: url,
            status: 'done',
            url: normalizeImageUrl(url),
            response: url,
          })) as UploadFile[]
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải thông tin xe';
      message.error(errorMessage);
      navigate('/cars');
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleImageChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
  };

  const beforeUpload = () => {
    return false;
  };

  const handleSubmit = async (values: CarFormValues) => {
    if (!id) {
      message.warning('Không tìm thấy ID xe');
      return;
    }

    setSubmitting(true);
    try {
      const existingImageUrls = fileList
        .filter((file) => !file.originFileObj)
        .map((file) => (file.response as string) || file.name || '')
        .filter(Boolean);

      const newFiles = fileList
        .filter((file): file is UploadFile & { originFileObj: File } => Boolean(file.originFileObj))
        .map((file) => file.originFileObj as File);

      let uploadedImageUrls: string[] = [];
      if (newFiles.length) {
        uploadedImageUrls = await uploadProductImages(newFiles);
      }

      const payload = {
        name: values.name,
        vehicleType: values.vehicleType,
        version: values.version,
        line: values.line,
        weight: values.weight,
        cc: values.cc,
        manufacturedDate: values.manufacturedDate,
        color: values.color,
        chassisNumber: values.chassisNumber,
        engineNumber: values.engineNumber,
        price: values.price ?? 0,
        warehouseStatus: values.warehouseStatus,
        images: [...existingImageUrls, ...uploadedImageUrls],
      };

      await updateProduct(id, payload);
      message.success('Cập nhật thông tin xe thành công!');
      navigate(`/cars/${id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật thông tin xe';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between' }} wrap>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Chỉnh sửa thông tin xe
          </Typography.Title>
        </Space>
        <Space>
          <Button onClick={() => navigate(`/cars/${id}`)}>
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={submitting}
          >
            Cập nhật
          </Button>
        </Space>
      </Space>

      <Spin spinning={loading}>
        <Card title="Nhập thông tin chi tiết" size="small">
          {product ? (
            <>
              <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="middle">
                <Row gutter={16} style={{ margin: 0 }}>
                  <Col span={12}>
                    <div>
                      <Text strong>Mã xe: </Text>
                      <Text>{product.code}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>SKU: </Text>
                      <Text>{product.sku || 'N/A'}</Text>
                    </div>
                  </Col>
                </Row>
                <Row gutter={16} style={{ margin: 0 }}>
                  <Col span={12}>
                    <div>
                      <Text strong>Tên xe: </Text>
                      <Text>{product.name}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>Loại xe: </Text>
                      <Text>
                        {product.vehicleType === 1 ? 'Xe tay ga' : 
                         product.vehicleType === 2 ? 'Xe số' : 
                         product.vehicleType === 3 ? 'Xe côn tay' : 
                         `Loại ${product.vehicleType}`}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Space>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Row gutter={[16, 0]} style={{ margin: 0 }}>
                  <Col xs={24} md={12}>
                    <Form.Item name="name" hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item name="vehicleType" hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Phiên bản"
                      name="version"
                      rules={[{ required: true, message: 'Vui lòng chọn phiên bản' }]}
                    >
                      <Select placeholder="Chọn phiên bản" size="large">
                        {VERSION_OPTIONS.map((version) => (
                          <Option key={version} value={version}>
                            {version}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Dòng"
                      name="line"
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value) {
                              return Promise.resolve();
                            }
                            // Cho phép chữ cái tiếng Việt có dấu, chữ cái không dấu, chữ số
                            // Tối đa 20 ký tự
                            if (value.length > 20) {
                              return Promise.reject(
                                new Error('Dòng tối đa 20 ký tự')
                              );
                            }
                            // Regex cho phép chữ cái tiếng Việt, chữ cái không dấu, chữ số
                            return /^[a-zA-Z0-9ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐđ\s]*$/.test(value)
                              ? Promise.resolve()
                              : Promise.reject(
                                  new Error('Dòng chỉ được chứa chữ cái (có dấu/không dấu) và chữ số')
                                );
                          },
                        },
                      ]}
                    >
                      <Input placeholder="Nhập dòng xe" size="large" maxLength={20} />
                    </Form.Item>

                    <Form.Item label="Trọng lượng" name="weight">
                      <Input
                        placeholder="Ví dụ: 110kg"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item label="Dung tích" name="cc">
                      <Input
                        placeholder="Ví dụ: 125cc"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item label="Năm sản xuất" name="manufacturedDate">
                      <Select placeholder="Chọn năm sản xuất" size="large" allowClear>
                        {getManufacturedYears().map((year) => (
                          <Option key={year} value={String(year)}>
                            {year}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item label="Màu sắc" name="color">
                      <Select placeholder="Chọn màu sắc" size="large" allowClear>
                        {COLOR_OPTIONS.map((color) => (
                          <Option key={color} value={color}>
                            {color}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item label="Số khung" name="chassisNumber" rules={[{ required: true, message: 'Vui lòng nhập số khung' }]}>
                      <Input placeholder="Nhập số khung" size="large" />
                    </Form.Item>

                    <Form.Item label="Số máy" name="engineNumber" rules={[{ required: true, message: 'Vui lòng nhập số máy' }]}>
                      <Input placeholder="Nhập số máy" size="large" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Giá bán (VNĐ)"
                      name="price"
                      rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                    >
                      <InputNumber
                        placeholder="Nhập giá bán"
                        size="large"
                        style={{ width: '100%' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        min={0}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Trạng thái trong kho"
                      name="warehouseStatus"
                      rules={[{ required: true, message: 'Vui lòng chọn trạng thái kho' }]}
                    >
                      <Select placeholder="Chọn trạng thái" size="large">
                        {WAREHOUSE_STATUSES.map((status) => (
                          <Option key={status.value} value={status.value}>
                            {status.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item label="Hình ảnh" name="images">
                      <AntUpload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleImageChange}
                        beforeUpload={beforeUpload}
                        multiple
                        accept="image/*"
                      >
                        {fileList.length < 10 && (
                          <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                          </div>
                        )}
                      </AntUpload>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              Đang tải thông tin xe...
            </div>
          )}
        </Card>
      </Spin>
    </div>
  );
};

export default EditCar;

