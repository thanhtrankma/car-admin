import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, Input, InputNumber, Select, Button, message, Space, Tag, Spin, Typography, Upload as AntUpload, Input as AntInput } from 'antd';
import type { UploadFile } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
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



const PendingCarUpdate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [allBatches, setAllBatches] = useState<ProductRemainDto[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ProductRemainDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage] = useState(1);
  const pageSize = 50;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [sku] = useState<string>(generateSKU());
  const [selectedVehicleType, setSelectedVehicleType] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedPublicCode, setSelectedPublicCode] = useState<string | null>(null);

  const fetchBatches = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await listProductRemain({
        page,
        limit: pageSize,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      
      setAllBatches(response.data);
      
      // Auto-select first batch if available
      const firstBatchWithRemain = response.data.find(b => b.remain > 0);
      if (firstBatchWithRemain) {
        setSelectedBatch(firstBatchWithRemain);
        setSelectedPublicCode(firstBatchWithRemain.publicCode);
        const defaultVehicleType = firstBatchWithRemain.types.length > 0 ? firstBatchWithRemain.types[0] : 1;
        setSelectedVehicleType(defaultVehicleType);
        form.setFieldsValue({
          name: firstBatchWithRemain.name,
          vehicleType: defaultVehicleType,
          version: '',
          price: firstBatchWithRemain.cost,
          warehouseStatus: 1,
          chassisNumber: '',
          engineNumber: '',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách xe chờ nhập liệu';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchBatches(1);
  }, [fetchBatches]);

  const handleBatchSelect = (batch: ProductRemainDto) => {
    if (batch.remain > 0) {
      setSelectedBatch(batch);
      setSelectedPublicCode(batch.publicCode);
      // Set default vehicle type to first available type
      const defaultVehicleType = batch.types.length > 0 ? batch.types[0] : 1;
      setSelectedVehicleType(defaultVehicleType);
      form.setFieldsValue({
        name: batch.name,
        vehicleType: defaultVehicleType,
        version: '',
        price: batch.cost,
        warehouseStatus: 1, // Còn hàng
        chassisNumber: '',
        engineNumber: '',
      });
      setFileList([]);
    }
  };

  // Get unique public codes with summary info for filter
  const publicCodeOptions = useMemo(() => {
    const codeMap = new Map<string, { batches: ProductRemainDto[]; totalRemain: number }>();
    
    allBatches.forEach(batch => {
      const existing = codeMap.get(batch.publicCode);
      if (existing) {
        existing.batches.push(batch);
        existing.totalRemain += batch.remain;
      } else {
        codeMap.set(batch.publicCode, {
          batches: [batch],
          totalRemain: batch.remain,
        });
      }
    });
    
    return Array.from(codeMap.entries())
      .map(([code, info]) => ({
        code,
        batchCount: info.batches.length,
        totalRemain: info.totalRemain,
        batches: info.batches,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [allBatches]);

  // Filter batches
  // const filteredBatches = useMemo(() => {
  //   let filtered = allBatches;
    
  //   if (selectedPublicCode) {
  //     filtered = filtered.filter(b => b.publicCode === selectedPublicCode);
  //   }
    
  //   if (searchText) {
  //     const searchLower = searchText.toLowerCase();
  //     filtered = filtered.filter(b => 
  //       b.name.toLowerCase().includes(searchLower) ||
  //       b.publicCode.toLowerCase().includes(searchLower) ||
  //       b.code.toLowerCase().includes(searchLower)
  //     );
  //   }
    
  //   return filtered.filter(b => b.remain > 0);
  // }, [allBatches, selectedPublicCode, searchText]);

  // Group filtered batches by publicCode
  // const groupedFilteredBatches = useMemo(() => {
  //   const groups = new Map<string, ProductRemainDto[]>();
    
  //   filteredBatches.forEach(batch => {
  //     const existing = groups.get(batch.publicCode);
  //     if (existing) {
  //       existing.push(batch);
  //     } else {
  //       groups.set(batch.publicCode, [batch]);
  //     }
  //   });
    
  //   return Array.from(groups.entries())
  //     .map(([code, batches]) => ({
  //       publicCode: code,
  //       batches: batches.sort((a, b) => a.name.localeCompare(b.name)),
  //       totalRemain: batches.reduce((sum, b) => sum + b.remain, 0),
  //       totalQuantity: batches.reduce((sum, b) => sum + b.quantity, 0),
  //     }))
  //     .sort((a, b) => a.publicCode.localeCompare(b.publicCode));
  // }, [filteredBatches]);

  // Total statistics
  // const totalStats = useMemo(() => {
  //   return {
  //     totalBatches: filteredBatches.length,
  //     totalRemain: filteredBatches.reduce((sum, b) => sum + b.remain, 0),
  //     totalGroups: groupedFilteredBatches.length,
  //   };
  // }, [filteredBatches, groupedFilteredBatches]);



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

    if (!selectedVehicleType || !selectedBatch.types.includes(selectedVehicleType)) {
      message.warning('Vui lòng chọn loại xe');
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
        productRemainId: selectedBatch.id,
      };

      await createProduct(payload);
      message.success('Lưu thông tin xe thành công!');
      // Chỉ xóa số khung và số máy, giữ nguyên các trường khác
      form.setFieldsValue({
        chassisNumber: '',
        engineNumber: '',
      });
      setFileList([]);
      
      // Refresh batches to update remain count
      const updatedResponse = await listProductRemain({
        page: currentPage,
        limit: pageSize,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      
      setAllBatches(updatedResponse.data);
      
      // Auto-select the same batch if it still has remain, otherwise find next
      const updatedBatch = updatedResponse.data.find(b => b.id === selectedBatch.id);
      if (updatedBatch && updatedBatch.remain > 0) {
        setSelectedBatch(updatedBatch);
        const vehicleType = selectedVehicleType && updatedBatch.types.includes(selectedVehicleType)
          ? selectedVehicleType
          : updatedBatch.types[0] || 1;
        setSelectedVehicleType(vehicleType);
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
            setSelectedPublicCode(nextBatch.publicCode);
            const vehicleType = nextBatch.types[0] || 1;
            setSelectedVehicleType(vehicleType);
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
            setSelectedPublicCode(null);
            setSelectedVehicleType(null);
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
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Cập nhật thông tin xe chưa hoàn tất
        </Typography.Title>
      </Space>

      <Spin spinning={loading}>
        <div style={{ overflowX: 'hidden' }}>
          <Row gutter={16} style={{ margin: 0 }}>
            <Col span={10}>
            <Card 
              title="Danh sách lô xe chờ nhập liệu" 
              size="small"
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* Search */}
                <AntInput
                  placeholder="Tìm kiếm theo mã lô..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                />

                {/* Statistics */}
                {/* {totalStats.totalBatches > 0 && (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card size="small" style={{ textAlign: 'center' }}>
                        <Statistic
                          title="Số lô"
                          value={totalStats.totalGroups}
                          valueStyle={{ fontSize: 18, fontWeight: 'bold' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" style={{ textAlign: 'center' }}>
                        <Statistic
                          title="Số loại xe"
                          value={totalStats.totalBatches}
                          valueStyle={{ fontSize: 18, fontWeight: 'bold' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" style={{ textAlign: 'center' }}>
                        <Statistic
                          title="Tổng còn thiếu"
                          value={totalStats.totalRemain}
                          valueStyle={{ fontSize: 18, fontWeight: 'bold', color: '#ff4d4f' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                )} */}

                {/* Public Code Cards */}
                <div style={{ maxHeight: 550, overflowY: 'auto', overflowX: 'hidden' }}>
                  {publicCodeOptions.length > 0 ? (
                    <Row gutter={[12, 12]} style={{ margin: 0 }}>
                      {publicCodeOptions
                        .filter(option => 
                          !searchText || 
                          option.code.toLowerCase().includes(searchText.toLowerCase())
                        )
                        .map((option) => (
                          <Col xs={24} sm={12} md={8} key={option.code}>
                            <Card
                              size="small"
                              hoverable
                              style={{
                                border: selectedPublicCode === option.code 
                                  ? '2px solid #1890ff' 
                                  : '1px solid #d9d9d9',
                                backgroundColor: selectedPublicCode === option.code 
                                  ? '#e6f7ff' 
                                  : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                              onClick={() => {
                                setSelectedPublicCode(option.code);
                                const batch = allBatches.find(b => b.publicCode === option.code && b.remain > 0);
                                if (batch) {
                                  handleBatchSelect(batch);
                                }
                              }}
                            >
                              <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Text strong style={{ fontSize: 16 }}>{option.code}</Text>
                                  {selectedPublicCode === option.code && (
                                    <Tag color="blue">Đã chọn</Tag>
                                  )}
                                </div>
                                <Space size={4} wrap>
                                  <Tag color="blue">{option.batchCount} loại</Tag>
                                  <Tag color="red">Còn: {option.totalRemain}</Tag>
                                </Space>
                              </Space>
                            </Card>
                          </Col>
                        ))}
                    </Row>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                      {searchText 
                        ? 'Không tìm thấy mã lô nào phù hợp' 
                        : 'Không có lô xe nào cần nhập liệu'}
                    </div>
                  )}
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col span={14}>
            <Card title="Nhập thông tin chi tiết" size="small">
              {selectedBatch ? (
                <>
                  <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="middle">
                    <Row gutter={16} style={{ margin: 0 }}>
                      <Col span={12}>
                        <div>
                          <Text strong>Mã lô: </Text>
                          <Text>{selectedBatch.publicCode}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div>
                          <Text strong>Tên xe: </Text>
                          <Text>{selectedBatch.name}</Text>
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ margin: 0 }}>
                      <Col span={12}>
                        <div>
                          <Text strong>Số lượng còn thiếu: </Text>
                          <Tag color="red">{selectedBatch.remain}/{selectedBatch.quantity}</Tag>
                        </div>
                      </Col>
                    </Row>
                    {/* {selectedBatch.types.length > 0 && (
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                          Chọn loại xe cần nhập:
                        </Text>
                        <Segmented
                          options={selectedBatch.types.map((type) => ({
                            label: VEHICLE_TYPE_LABELS[type] || `Loại ${type}`,
                            value: type,
                          }))}
                          value={selectedVehicleType ?? undefined}
                          onChange={(value) => handleVehicleTypeChange(value as number)}
                          size="large"
                          block
                        />
                      </div>
                    )} */}
                  </Space>
                  
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                  >
                    <Row gutter={[16, 0]} style={{ margin: 0 }}>
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

                    <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                      <Space style={{ width: '100%', justifyContent: 'flex-end' }} wrap>
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
        </div>
      </Spin>
    </div>
  );
};

export default PendingCarUpdate;

