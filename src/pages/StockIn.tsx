import { useState, useEffect } from 'react'
import {
  Button,
  Card,
  Table,
  Space,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  message,
  Select,
  Input,
  Row,
  Col,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, InboxOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  listProductTypes,
  listWarehouses,
  getWarehouseById,
  type ProductTypeDto,
  type WarehouseDto,
  type WarehouseDetailDto,
} from '../services/productService'
import { apiRequest, ApiError } from '../services/apiClient'

interface WarehouseItem {
  productTypeId: string
  quantity: number
  cost: number
}

interface WarehousePayload {
  receiptDate: string
  items: WarehouseItem[]
}

const StockIn = () => {
  const [stockInList, setStockInList] = useState<WarehouseDto[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [warehouseDetail, setWarehouseDetail] = useState<WarehouseDetailDto | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [form] = Form.useForm()
  const [productTypes, setProductTypes] = useState<ProductTypeDto[]>([])
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const fetchWarehouses = async (page = 1, limit = 10) => {
    try {
      setTableLoading(true)
      const response = await listWarehouses({
        page,
        limit,
        sortBy: 'created_at',
        sortOrder: 'desc',
      })
      setStockInList(response.data)
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      })
    } catch {
      message.error('Không thể tải danh sách phiếu nhập kho')
    } finally {
      setTableLoading(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        setLoading(true)
        const response = await listProductTypes(1, 100)
        setProductTypes(response.data)
      } catch {
        message.error('Không thể tải danh sách loại sản phẩm')
      } finally {
        setLoading(false)
      }
    }

    if (isModalOpen) {
      fetchProductTypes()
    }
  }, [isModalOpen])

  const handleSave = async (values: {
    receiptDate: dayjs.Dayjs
    vehicles?: Array<{ productTypeId?: string; quantity?: number; cost?: number }>
  }) => {
    try {
      const vehicles = values.vehicles || []
      const items: WarehouseItem[] = vehicles
        .map(vehicle => {
          const quantity = Number(vehicle.quantity) || 0
          const cost = Number(vehicle.cost) || 0
          if (vehicle.productTypeId && quantity > 0 && cost > 0) {
            return {
              productTypeId: vehicle.productTypeId,
              quantity,
              cost,
            }
          }
          return null
        })
        .filter((item): item is WarehouseItem => item !== null)

      if (items.length === 0) {
        message.warning('Vui lòng nhập ít nhất một sản phẩm')
        return
      }

      const payload: WarehousePayload = {
        receiptDate: values.receiptDate.format('YYYY-MM-DD'),
        items,
      }

      await apiRequest<{ message: string }>('/warehouses', {
        method: 'POST',
        data: payload,
      })

      message.success('Tạo phiếu nhập kho thành công')
      setIsModalOpen(false)
      form.resetFields()
      fetchWarehouses(pagination.current, pagination.pageSize)
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Có lỗi xảy ra khi tạo phiếu nhập kho'
      message.error(errorMessage)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const handleViewDetail = async (id: string) => {
    try {
      setDetailLoading(true)
      const response = await getWarehouseById(id)
      setWarehouseDetail(response.data)
      setIsDetailModalOpen(true)
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Không thể tải chi tiết phiếu nhập kho'
      message.error(errorMessage)
    } finally {
      setDetailLoading(false)
    }
  }

  const columns: ColumnsType<WarehouseDto> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'publicCode',
      key: 'publicCode',
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'receiptDate',
      key: 'receiptDate',
      render: date => formatDate(date),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
          marginBottom: 24,
          gap: window.innerWidth < 768 ? 16 : 0,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: window.innerWidth < 576 ? 20 : 24,
              fontWeight: 'bold',
              marginBottom: 8,
            }}
          >
            Nhập kho
          </h1>
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
          setIsModalOpen(false)
          form.resetFields()
          form.setFieldsValue({
            receiptDate: dayjs(),
            vehicles: [{ quantity: 1, cost: 0 }],
          })
        }}
        footer={null}
        width={window.innerWidth < 768 ? '95%' : 800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            receiptDate: dayjs(),
            vehicles: [{ quantity: 1, cost: 0 }],
          }}
        >
          <Form.Item
            label="Ngày nhập"
            name="receiptDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
          >
            <DatePicker style={{ width: '100%' }} size="large" format="DD/MM/YYYY" />
          </Form.Item>

          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={() => {
                  const vehicles = form.getFieldValue('vehicles') || []
                  form.setFieldsValue({
                    vehicles: [...vehicles, { quantity: 1, cost: 0 }],
                  })
                }}
                style={{ borderColor: '#1890ff', color: '#1890ff', backgroundColor: '#e6f7ff' }}
              >
                Thêm xe
              </Button>
            </Form.Item>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>
          ) : (
            <Form.List name="vehicles">
              {(fields, { remove }) => (
                <>
                  {fields.map(field => (
                    <Card
                      key={field.key}
                      style={{
                        marginBottom: 16,
                        border: '1px solid #e8e8e8',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <Button
                          type="text"
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => remove(field.name)}
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            zIndex: 1,
                            padding: '4px 8px',
                          }}
                        />
                        <Form.Item
                          label="Chọn xe"
                          name={[field.name, 'productTypeId']}
                          style={{ marginBottom: 16 }}
                        >
                          <Select
                            placeholder="Chọn xe"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={productTypes.map(type => ({
                              value: type.id,
                              label: type.name,
                            }))}
                          />
                        </Form.Item>

                        <Row gutter={16}>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              label="Số lượng"
                              name={[field.name, 'quantity']}
                              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                              style={{ marginBottom: 16 }}
                            >
                              <InputNumber<number>
                                min={0}
                                style={{ width: '100%' }}
                                size="large"
                                placeholder="1"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              label="Giá nhập (VNĐ)"
                              name={[field.name, 'cost']}
                              style={{ marginBottom: 16 }}
                            >
                              <InputNumber<number>
                                min={0}
                                formatter={value =>
                                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                }
                                parser={value => Number((value || '0').replace(/,/g, '')) || 0}
                                style={{ width: '100%' }}
                                size="large"
                                placeholder="0"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item label="Thành tiền" style={{ marginBottom: 16 }}>
                              <Form.Item shouldUpdate noStyle>
                                {({ getFieldValue }) => {
                                  const quantity =
                                    getFieldValue(['vehicles', field.name, 'quantity']) || 0
                                  const cost = getFieldValue(['vehicles', field.name, 'cost']) || 0
                                  const total = quantity * cost
                                  return (
                                    <Input
                                      value={`${formatPrice(total)} VNĐ`}
                                      readOnly
                                      size="large"
                                      style={{
                                        backgroundColor: '#f5f5f5',
                                        cursor: 'not-allowed',
                                      }}
                                    />
                                  )
                                }}
                              </Form.Item>
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </Form.List>
          )}

          <Form.Item shouldUpdate>
            {({ getFieldValue }) => {
              const vehicles = getFieldValue('vehicles') || []
              let totalAmount = 0
              vehicles.forEach((vehicle: { quantity?: number; cost?: number }) => {
                const quantity = Number(vehicle?.quantity) || 0
                const cost = Number(vehicle?.cost) || 0
                totalAmount += quantity * cost
              })
              return totalAmount > 0 ? (
                <Card style={{ background: '#f0f9ff', marginTop: 16, marginBottom: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 500, fontSize: 16 }}>Tổng tiền:</span>
                    <span style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                      {formatPrice(totalAmount)} VNĐ
                    </span>
                  </div>
                </Card>
              ) : null
            }}
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ float: 'right' }}>
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  form.resetFields()
                  form.setFieldsValue({
                    receiptDate: dayjs(),
                    vehicles: [{ quantity: 1, cost: 0 }],
                  })
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
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
            loading={tableLoading}
            scroll={{ x: 'max-content' }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: total => `Tổng ${total} phiếu nhập kho`,
              onChange: (page, pageSize) => {
                fetchWarehouses(page, pageSize)
              },
              onShowSizeChange: (current, size) => {
                fetchWarehouses(current, size)
              },
            }}
            locale={{
              emptyText: 'Chưa có phiếu nhập kho nào. Hãy tạo phiếu nhập kho mới!',
            }}
          />
        </div>
      </Card>

      <Modal
        title="Chi tiết phiếu nhập kho"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false)
          setWarehouseDetail(null)
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsDetailModalOpen(false)
            setWarehouseDetail(null)
          }}>
            Đóng
          </Button>,
        ]}
        width={window.innerWidth < 768 ? '95%' : 900}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>
        ) : warehouseDetail ? (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div>
                    <strong>Mã phiếu:</strong> {warehouseDetail.publicCode}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <strong>Ngày nhập:</strong> {formatDate(warehouseDetail.receiptDate)}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <strong>Tổng số lượng:</strong> {warehouseDetail.quantity}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <strong>Người tạo:</strong> {warehouseDetail.createdBy.username} ({warehouseDetail.createdBy.email})
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <strong>Ngày tạo:</strong> {formatDateTime(warehouseDetail.created_at)}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <strong>Cập nhật lần cuối:</strong> {formatDateTime(warehouseDetail.updated_at)}
                  </div>
                </Col>
              </Row>
            </Card>

            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                Chi tiết sản phẩm
              </h3>
            </div>

            {warehouseDetail.warehouseDetails && warehouseDetail.warehouseDetails.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <Table
                  columns={[
                    {
                      title: 'Mã sản phẩm',
                      dataIndex: 'code',
                      key: 'code',
                    },
                    {
                      title: 'Tên sản phẩm',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: 'Số lượng',
                      dataIndex: 'quantity',
                      key: 'quantity',
                    },
                    {
                      title: 'Giá nhập',
                      dataIndex: 'cost',
                      key: 'cost',
                      render: (cost: number) => `${formatPrice(cost)} VNĐ`,
                    },
                    {
                      title: 'Thành tiền',
                      dataIndex: 'totalCost',
                      key: 'totalCost',
                      render: (totalCost: number) => `${formatPrice(totalCost)} VNĐ`,
                    },
                    {
                      title: 'Tồn kho',
                      dataIndex: 'remain',
                      key: 'remain',
                    },
                    {
                      title: 'Đã tạo sản phẩm',
                      dataIndex: 'totalProductCreated',
                      key: 'totalProductCreated',
                    },
                  ]}
                  dataSource={warehouseDetail.warehouseDetails}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                Không có chi tiết sản phẩm
              </div>
            )}

            {warehouseDetail.warehouseDetails && warehouseDetail.warehouseDetails.length > 0 && (
              <Card style={{ marginTop: 16, background: '#f0f9ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, fontSize: 16 }}>Tổng giá trị:</span>
                  <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                    {formatPrice(
                      warehouseDetail.warehouseDetails.reduce((sum, item) => sum + item.totalCost, 0)
                    )}{' '}
                    VNĐ
                  </span>
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default StockIn
