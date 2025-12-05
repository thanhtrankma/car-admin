import { useEffect, useState, useCallback } from 'react';
import { Modal, Row, Col, List, Card, Form, Input, InputNumber, Select, Button, message, Space, Tag, Spin, Typography, Upload as AntUpload } from 'antd';
import type { UploadFile } from 'antd';
import { ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { listProductRemain, type ProductRemainDto, createProduct, uploadProductImages } from '../services/productService';

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

const generateSKU = () => {
  const prefix = 'SKU';
  const timestamp = Date.now().toString().slice(-6);
  const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${timestamp}${randomNum}`;
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
  receiptDate?: Dayjs;
  price?: number;
  warehouseStatus: number;
}


interface PendingCarUpdateModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface GroupedBatch {
  warehouseId: string;
  publicCode: string;
  batches: ProductRemainDto[];
  totalRemain: number;
}

const VEHICLE_TYPE_LABELS: Record<number, string> = {
  1: 'Xe tay ga',
  2: 'Xe số',
  3: 'Xe côn tay',
};

const PendingCarUpdateModal = ({ open, onClose, onUpdate }: PendingCarUpdateModalProps) => {
  const [form] = Form.useForm();
  const [groupedBatches, setGroupedBatches] = useState<GroupedBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ProductRemainDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage] = useState(1);
  const pageSize = 50;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [sku] = useState<string>(generateSKU());

  const fetchBatches = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await listProductRemain({
        page,
        limit: pageSize,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      
      // Group by warehouse
      const grouped = response.data.reduce((acc, batch) => {
        const existing = acc.find(g => g.warehouseId === batch.wareHouseId);
        if (existing) {
          existing.batches.push(batch);
          existing.totalRemain += batch.remain;
        } else {
          acc.push({
            warehouseId: batch.wareHouseId,
            publicCode: batch.publicCode,
            batches: [batch],
            totalRemain: batch.remain,
          });
        }
        return acc;
      }, [] as GroupedBatch[]);
      
      setGroupedBatches(grouped);
      
      // Auto-select first batch if available
      if (grouped.length > 0 && grouped[0].batches.length > 0) {
        const firstBatchWithRemain = grouped[0].batches.find(b => b.remain > 0);
        if (firstBatchWithRemain) {
          setSelectedBatch(firstBatchWithRemain);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách xe chờ nhập liệu';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchBatches(1);
      setSelectedBatch(null);
      form.resetFields();
      setFileList([]);
    }
  }, [open, fetchBatches, form]);

  const handleBatchSelect = (batch: ProductRemainDto) => {
    if (batch.remain > 0) {
      setSelectedBatch(batch);
      const vehicleType = batch.types[0] || 1;
      form.setFieldsValue({
        name: batch.name,
        vehicleType,
        version: '',
        price: batch.cost,
        warehouseStatus: 1, // Còn hàng
        chassisNumber: '',
        engineNumber: '',
      });
      setFileList([]);
    }
  };

  const handleImageChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
  };

  const beforeUpload = () => {
    return false;
  };

  const handleSubmit = async (values: CarFormValues) => {
    if (!selectedBatch) {
      message.warning('Vui lòng chọn một lô xe');
      return;
    }

    if (selectedBatch.remain <= 0) {
      message.warning('Lô xe này đã hoàn tất thông tin');
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
        weight: values.weight,
        cc: values.cc,
        manufacturedDate: values.manufacturedDate,
        color: values.color,
        chassisNumber: values.chassisNumber,
        engineNumber: values.engineNumber,
        price: values.price ?? 0,
        warehouseStatus: values.warehouseStatus,
        images: [...existingImageUrls, ...uploadedImageUrls],
        wareHouseId: selectedBatch.wareHouseId,
      };

      await createProduct(payload);
      message.success('Lưu thông tin xe thành công!');
      form.resetFields();
      setFileList([]);
      onUpdate();
      
      // Refresh batches to update remain count
      const updatedResponse = await listProductRemain({
        page: currentPage,
        limit: pageSize,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      
      // Group by warehouse
      const grouped = updatedResponse.data.reduce((acc, batch) => {
        const existing = acc.find(g => g.warehouseId === batch.wareHouseId);
        if (existing) {
          existing.batches.push(batch);
          existing.totalRemain += batch.remain;
        } else {
          acc.push({
            warehouseId: batch.wareHouseId,
            publicCode: batch.publicCode,
            batches: [batch],
            totalRemain: batch.remain,
          });
        }
        return acc;
      }, [] as GroupedBatch[]);
      
      setGroupedBatches(grouped);
      
      // Auto-select the same batch if it still has remain, otherwise find next
      const updatedBatch = updatedResponse.data.find(b => b.id === selectedBatch.id);
      if (updatedBatch && updatedBatch.remain > 0) {
        setSelectedBatch(updatedBatch);
        const vehicleType = updatedBatch.types[0] || 1;
        form.setFieldsValue({
          name: updatedBatch.name,
          vehicleType,
          version: '',
          price: updatedBatch.cost,
          warehouseStatus: 1,
          chassisNumber: '',
          engineNumber: '',
        });
      } else {
        const nextBatch = updatedResponse.data.find(b => b.remain > 0);
        if (nextBatch) {
          setSelectedBatch(nextBatch);
          const vehicleType = nextBatch.types[0] || 1;
          form.setFieldsValue({
            name: nextBatch.name,
            vehicleType,
            version: '',
            price: nextBatch.cost,
            warehouseStatus: 1,
            chassisNumber: '',
            engineNumber: '',
          });
        } else {
          setSelectedBatch(null);
          form.resetFields();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể lưu thông tin xe';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1400}
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Cập nhật thông tin xe chưa hoàn tất</span>
        </Space>
      }
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Row gutter={16} style={{ minHeight: 500 }}>
          <Col span={10}>
            <Card title="Danh sách lô xe chờ nhập liệu" size="small">
              <List
                dataSource={groupedBatches}
                renderItem={(group) => (
                  <List.Item key={group.warehouseId} style={{ padding: '8px 0' }}>
                    <Card
                      size="small"
                      style={{
                        width: '100%',
                        border: selectedBatch && group.batches.includes(selectedBatch) ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        const firstBatch = group.batches.find(b => b.remain > 0);
                        if (firstBatch) {
                          handleBatchSelect(firstBatch);
                        }
                      }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <div>
                          <Text strong>Mã lô: {group.publicCode}</Text>
                        </div>
                        <div>
                          {group.batches.map((batch) => (
                            <div key={batch.id} style={{ marginBottom: 8 }}>
                              <Space>
                                <Text>{batch.name}</Text>
                                <Tag color={batch.remain > 0 ? 'red' : 'green'}>
                                  Còn thiếu: {batch.remain}/{batch.quantity}
                                </Tag>
                                {batch.types.length > 0 && (
                                  <Tag>{VEHICLE_TYPE_LABELS[batch.types[0]] || `Loại ${batch.types[0]}`}</Tag>
                                )}
                              </Space>
                            </div>
                          ))}
                        </div>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Tổng còn thiếu: {group.totalRemain} xe
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
              {groupedBatches.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  Không có xe nào cần nhập liệu
                </div>
              )}
            </Card>
          </Col>
          
          <Col span={14}>
            <Card title="Nhập thông tin chi tiết" size="small">
              {selectedBatch ? (
                <>
                  <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                    <div>
                      <Text strong>Mã lô: </Text>
                      <Text>{selectedBatch.publicCode}</Text>
                    </div>
                    <div>
                      <Text strong>Số lượng còn thiếu: </Text>
                      <Tag color="red">{selectedBatch.remain}/{selectedBatch.quantity}</Tag>
                    </div>
                  </Space>
                  
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                  >
                    <Row gutter={[16, 0]}>
                      <Col xs={24} md={12}>
                        <Form.Item label="Mã nội bộ (SKU)">
                          <Input value={sku} size="large" disabled />
                        </Form.Item>

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

                        <Form.Item label="Số khung" name="chassisNumber">
                          <Input placeholder="Nhập số khung" size="large" />
                        </Form.Item>

                        <Form.Item label="Số máy" name="engineNumber">
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
                          label={
                            <>
                              Trạng thái trong kho <span style={{ color: 'red' }}>*</span>
                            </>
                          }
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

                    <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                      <Space style={{ width: '100%', justifyContent: 'flex-end' }} wrap>
                        <Button onClick={onClose}>Đóng</Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={submitting}
                          disabled={selectedBatch.remain <= 0}
                        >
                          Lưu
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  Vui lòng chọn một lô xe từ danh sách bên trái
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </Modal>
  );
};

export default PendingCarUpdateModal;

