import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Form, Input, InputNumber, Select, Button, Card, Upload as AntUpload, message, Space, Row, Col, DatePicker } from 'antd';
import type { UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';

const { Option } = Select;

const generateSKU = () => {
  const prefix = 'SKU';
  const timestamp = Date.now().toString().slice(-6);
  const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${timestamp}${randomNum}`;
};

const AddCar = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [sku] = useState<string>(generateSKU());

  const handleSubmit = (values: Record<string, unknown>) => {
    const submitData = {
      sku,
      ...values,
      stockInDate: values.stockInDate ? dayjs(values.stockInDate as Dayjs).format('YYYY-MM-DD') : null,
      images: fileList.map(file => file.originFileObj),
    };
    console.log('Car data:', submitData);
    message.success('Thêm xe thành công!');
    navigate('/cars');
  };

  const handleImageChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
  };

  const beforeUpload = () => {
    return false;
  };

  return (
    <div>
      <Space align="center" style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeft />}
          onClick={() => navigate('/cars')}
          type="text"
        />
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Thêm mới xe</h1>
      </Space>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mã nội bộ (SKU)"
              >
                <Input value={sku} size="large" disabled />
              </Form.Item>

              <Form.Item
                label={
                  <>
                    Tên xe <span style={{ color: 'red' }}>*</span>
                  </>
                }
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên xe' }]}
              >
                <Input placeholder="Nhập tên xe" size="large" />
              </Form.Item>

              <Form.Item
                label={
                  <>
                    Loại xe <span style={{ color: 'red' }}>*</span>
                  </>
                }
                name="type"
                rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
              >
                <Select placeholder="Chọn loại xe" size="large">
                  <Option value="Xe số">Xe số</Option>
                  <Option value="Xe tay ga">Xe tay ga</Option>
                  <Option value="Xe côn tay">Xe côn tay</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <>
                    Phiên bản <span style={{ color: 'red' }}>*</span>
                  </>
                }
                name="version"
                rules={[{ required: true, message: 'Vui lòng nhập phiên bản' }]}
              >
                <Input placeholder="Ví dụ: 2024, 2023 ABS" size="large" />
              </Form.Item>

              <Form.Item
                label="Trọng lượng (kg)"
                name="weight"
              >
                <InputNumber
                  placeholder="Nhập trọng lượng"
                  size="large"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label="Dung tích (cc)"
                name="capacity"
              >
                <InputNumber
                  placeholder="Nhập dung tích"
                  size="large"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label="Năm sản xuất"
                name="manufacturingYear"
              >
                <InputNumber
                  placeholder="Nhập năm sản xuất"
                  size="large"
                  style={{ width: '100%' }}
                  min={1900}
                  max={new Date().getFullYear() + 1}
                />
              </Form.Item>

              <Form.Item
                label="Màu sắc"
                name="color"
              >
                <Input placeholder="Nhập màu sắc" size="large" />
              </Form.Item>

              <Form.Item
                label="Số khung"
                name="chassisNumber"
              >
                <Input placeholder="Nhập số khung" size="large" />
              </Form.Item>

              <Form.Item
                label="Số máy"
                name="engineNumber"
              >
                <Input placeholder="Nhập số máy" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Ngày nhập kho"
                name="stockInDate"
              >
                <DatePicker
                  placeholder="Chọn ngày nhập kho"
                  size="large"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              <Form.Item
                label="Giá vốn (VNĐ)"
                name="costPrice"
              >
                <InputNumber
                  placeholder="Nhập giá vốn"
                  size="large"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label="Giá bán (VNĐ)"
                name="sellingPrice"
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
                name="stockStatus"
              >
                <Select placeholder="Chọn trạng thái" size="large">
                  <Option value="Còn hàng">Còn hàng</Option>
                  <Option value="Hết hàng">Hết hàng</Option>
                  <Option value="Sắp về">Sắp về</Option>
                  <Option value="Đang bảo hành">Đang bảo hành</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Hình ảnh"
                name="images"
              >
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

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }} wrap>
              <Button onClick={() => navigate('/cars')}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddCar;
