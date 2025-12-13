import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Upload as AntUpload,
  message,
  Space,
  Row,
  Col,
  DatePicker,
  Spin,
} from 'antd'
import type { UploadFile } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import {
  createProduct,
  getProductByCode,
  updateProduct,
  uploadProductImages,
  listProductTypes,
  type ProductTypeDto,
} from '../services/productService'
import { formatImageUrl } from '../utils/imageUtils'

const { Option } = Select

const VEHICLE_TYPES = [
  { value: 1, label: 'Xe tay ga' },
  { value: 2, label: 'Xe số' },
  { value: 3, label: 'Xe côn tay' },
]

const WAREHOUSE_STATUSES = [
  { value: 1, label: 'Còn hàng' },
  { value: 2, label: 'Hết hàng' },
  { value: 3, label: 'Sắp về' },
  { value: 4, label: 'Đang bảo hành' },
]

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
]

const generateSKU = () => {
  const prefix = 'SKU'
  const timestamp = Date.now().toString().slice(-6)
  const randomNum = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0')
  return `${prefix}${timestamp}${randomNum}`
}

interface AddCarFormValues {
  name: string
  vehicleType: number
  version: string
  line?: string
  weight?: number
  cc?: number
  manufacturedDate?: number
  color?: string
  chassisNumber?: string
  engineNumber?: string
  receiptDate?: Dayjs
  cost?: number
  price?: number
  quantity?: number
  warehouseStatus: number
}

const AddCar = () => {
  const navigate = useNavigate()
  const { code } = useParams<{ code?: string }>()
  const isEditMode = Boolean(code)
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [sku, setSku] = useState<string>(generateSKU())
  const [submitting, setSubmitting] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [productId, setProductId] = useState<string | null>(null)
  const [productTypes, setProductTypes] = useState<ProductTypeDto[]>([])
  const [productTypesLoading, setProductTypesLoading] = useState(false)

  const handleSubmit = async (values: AddCarFormValues) => {
    const existingImageUrls = fileList
      .filter(file => !file.originFileObj)
      .map(file => (file.response as string) || file.name || '')
      .filter(Boolean)

    const newFiles = fileList
      .filter((file): file is UploadFile & { originFileObj: File } => Boolean(file.originFileObj))
      .map(file => file.originFileObj as File)

    let uploadedImageUrls: string[] = []
    if (newFiles.length) {
      uploadedImageUrls = await uploadProductImages(newFiles)
    }

    const payload = {
      name: values.name,
      vehicleType: values.vehicleType,
      version: values.version,
      line: values.line,
      weight: values.weight !== undefined ? String(values.weight) : undefined,
      cc: values.cc !== undefined ? String(values.cc) : undefined,
      manufacturedDate:
        values.manufacturedDate !== undefined ? String(values.manufacturedDate) : undefined,
      color: values.color,
      chassisNumber: values.chassisNumber,
      engineNumber: values.engineNumber,
      receiptDate: values.receiptDate ? dayjs(values.receiptDate).format('YYYY-MM-DD') : undefined,
      cost: values.cost ?? 0,
      price: values.price ?? 0,
      quantity: values.quantity ?? 0,
      warehouseStatus: values.warehouseStatus,
      images: [...existingImageUrls, ...uploadedImageUrls],
    }

    setSubmitting(true)
    try {
      if (isEditMode) {
        if (!productId) {
          throw new Error('Không tìm thấy mã sản phẩm')
        }
        await updateProduct(productId, payload)
        message.success('Cập nhật xe thành công!')
      } else {
        await createProduct(payload)
        message.success('Thêm xe thành công!')
      }
      navigate('/cars')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể lưu xe'
      message.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageChange = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList)
  }

  const beforeUpload = () => {
    return false
  }

  useEffect(() => {
    const fetchProductTypes = async () => {
      setProductTypesLoading(true)
      try {
        const response = await listProductTypes(1, 100)
        setProductTypes(response.data)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Không thể tải danh sách tên xe'
        message.error(errorMessage)
      } finally {
        setProductTypesLoading(false)
      }
    }

    fetchProductTypes()
  }, [])

  useEffect(() => {
    if (!isEditMode || !code) return

    const fetchProduct = async () => {
      setInitialLoading(true)
      try {
        const product = await getProductByCode(code)
        setProductId(product.id)
        setSku(product.sku || generateSKU())
        form.setFieldsValue({
          name: product.name,
          vehicleType: product.vehicleType,
          version: product.version,
          line: product.line,
          weight: product.weight ? parseFloat(product.weight.toString()) : undefined,
          cc: product.cc ? parseFloat(product.cc.toString()) : undefined,
          manufacturedDate: product.manufacturedDate
            ? parseInt(product.manufacturedDate, 10)
            : undefined,
          color: product.color,
          chassisNumber: product.chassisNumber,
          engineNumber: product.engineNumber,
          receiptDate: product.receiptDate ? dayjs(product.receiptDate) : undefined,
          cost: product.cost,
          price: product.price,
          quantity: product.quantity,
          warehouseStatus: product.warehouseStatus,
        })
        setFileList(
          (product.images ?? []).map((url, index) => ({
            uid: `${index}`,
            name: url,
            status: 'done',
            url: formatImageUrl(url),
            response: url,
          })) as UploadFile[]
        )
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Không thể tải thông tin xe'
        message.error(errorMessage)
        navigate('/cars')
      } finally {
        setInitialLoading(false)
      }
    }

    fetchProduct()
  }, [code, form, isEditMode, navigate])

  return (
    <div>
      <Space align="center" style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeft />} onClick={() => navigate('/cars')} type="text" />
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
          {isEditMode ? 'Chỉnh sửa xe' : 'Thêm mới xe'}
        </h1>
      </Space>

      <Card>
        <Spin spinning={initialLoading}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Mã nội bộ (SKU)">
                  <Input value={sku} size="large" disabled />
                </Form.Item>

                <Form.Item
                  label={
                    <>
                      Tên xe <span style={{ color: 'red' }}>*</span>
                    </>
                  }
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng chọn tên xe' }]}
                >
                  <Select
                    placeholder="Chọn tên xe"
                    size="large"
                    loading={productTypesLoading}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => {
                      const labelText = typeof option?.children === 'string' ? option.children : ''
                      return labelText.toLowerCase().includes(input.toLowerCase())
                    }}
                  >
                    {productTypes.map(type => (
                      <Option key={type.id} value={type.name}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <>
                      Loại xe <span style={{ color: 'red' }}>*</span>
                    </>
                  }
                  name="vehicleType"
                  rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
                >
                  <Select placeholder="Chọn loại xe" size="large">
                    {VEHICLE_TYPES.map(type => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Phiên bản"
                  name="version"
                  rules={[{ required: true, message: 'Vui lòng nhập phiên bản' }]}
                >
                  <Input placeholder="Ví dụ: 2024, 2023 ABS" size="large" />
                </Form.Item>

                <Form.Item
                  label="Dòng"
                  name="line"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.resolve()
                        }
                        return /^[A-Za-z]{12,25}$/.test(value)
                          ? Promise.resolve()
                          : Promise.reject(new Error('Dòng chỉ gồm chữ cái, từ 12-25 ký tự'))
                      },
                    },
                  ]}
                >
                  <Input placeholder="Nhập dòng xe" size="large" />
                </Form.Item>

                <Form.Item label="Trọng lượng (kg)" name="weight">
                  <InputNumber
                    placeholder="Nhập trọng lượng"
                    size="large"
                    style={{ width: '100%' }}
                    min={0}
                  />
                </Form.Item>

                <Form.Item label="Dung tích (cc)" name="cc">
                  <InputNumber
                    placeholder="Nhập dung tích"
                    size="large"
                    style={{ width: '100%' }}
                    min={0}
                  />
                </Form.Item>

                <Form.Item label="Năm sản xuất" name="manufacturedDate">
                  <InputNumber
                    placeholder="Nhập năm sản xuất"
                    size="large"
                    style={{ width: '100%' }}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                  />
                </Form.Item>

                <Form.Item label="Màu sắc" name="color">
                  <Select placeholder="Chọn màu sắc" size="large" allowClear>
                    {COLOR_OPTIONS.map(color => (
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
                <Form.Item label="Ngày nhập kho" name="receiptDate">
                  <DatePicker
                    placeholder="Chọn ngày nhập kho"
                    size="large"
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>

                <Form.Item
                  label="Giá vốn (VNĐ)"
                  name="cost"
                  rules={[{ required: true, message: 'Vui lòng nhập giá vốn' }]}
                >
                  <InputNumber
                    placeholder="Nhập giá vốn"
                    size="large"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    min={0}
                  />
                </Form.Item>

                <Form.Item
                  label="Giá bán (VNĐ)"
                  name="price"
                  rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                >
                  <InputNumber
                    placeholder="Nhập giá bán"
                    size="large"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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
                    {WAREHOUSE_STATUSES.map(status => (
                      <Option key={status.value} value={status.value}>
                        {status.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <>
                      Số lượng <span style={{ color: 'red' }}>*</span>
                    </>
                  }
                  name="quantity"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                >
                  <InputNumber
                    placeholder="Nhập số lượng"
                    size="large"
                    style={{ width: '100%' }}
                    min={0}
                  />
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
                <Button onClick={() => navigate('/cars')}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  disabled={isEditMode && initialLoading}
                >
                  {isEditMode ? 'Cập nhật' : 'Lưu'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  )
}

export default AddCar
