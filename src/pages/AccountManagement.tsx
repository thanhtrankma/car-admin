import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Input,
  Button,
  Card,
  Space,
  Row,
  Col,
  Modal,
  Form,
  message,
  Popconfirm,
  Select,
  Tag,
  Spin,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  type UserDto,
  type UserPayload,
} from '../services/userService'

interface FormValues {
  username: string
  fullName: string
  email: string
  phone_number?: string
  password?: string
  role: string
  status: string
  avatar_url?: string
}

const DEFAULT_ROLE = 'USER'
const DEFAULT_STATUS = 'ACTIVE'

const AccountManagement = () => {
  const [accounts, setAccounts] = useState<UserDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [form] = Form.useForm<FormValues>()

  const passwordRules = useMemo(() => {
    if (editingId) {
      return [
        {
          validator: (_: unknown, value?: string) => {
            if (!value) {
              return Promise.resolve()
            }
            if (value.length < 6) {
              return Promise.reject(new Error('Mật khẩu tối thiểu 6 ký tự'))
            }
            return Promise.resolve()
          },
        },
      ]
    }
    return [
      { required: true, message: 'Vui lòng nhập mật khẩu' },
      { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
    ]
  }, [editingId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return 'green'
    if (status === 'INACTIVE') return 'red'
    return 'default'
  }

  const fetchAccounts = useCallback(async () => {
    try {
      setListLoading(true)
      const response = await listUsers({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        page: 1,
        limit: 12,
        sortBy: 'created_at',
        sortOrder: 'desc',
      })
      setAccounts(response.data)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể tải danh sách tài khoản'
      message.error(errorMessage)
    } finally {
      setListLoading(false)
    }
  }, [searchTerm, statusFilter])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAccounts()
    }, 400)
    return () => clearTimeout(timeout)
  }, [fetchAccounts])

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id)
      message.success('Xóa tài khoản thành công!')
      fetchAccounts()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa tài khoản'
      message.error(errorMessage)
    }
  }

  const handleEdit = (account: UserDto) => {
    setEditingId(account.id)
    form.setFieldsValue({
      username: account.username,
      email: account.email,
      fullName: account.fullName,
      phone_number: account.phone_number,
      role: account.role,
      status: account.status,
      avatar_url: account.avatar_url,
    })
    setIsModalOpen(true)
  }

  const buildPayload = (values: FormValues): UserPayload => {
    const payload: UserPayload = {
      username: values.username,
      email: values.email,
      fullName: values.fullName,
      role: values.role,
      status: values.status,
      avatar_url: values.avatar_url || undefined,
      phone_number: values.phone_number || undefined,
    }
    if (values.password) {
      payload.password = values.password
    }
    return payload
  }

  const handleSave = async (values: FormValues) => {
    try {
      setModalLoading(true)
      const payload = buildPayload(values)
      if (editingId) {
        await updateUser(editingId, payload)
        message.success('Cập nhật tài khoản thành công!')
      } else {
        await createUser(payload)
        message.success('Tạo tài khoản thành công!')
      }
      setIsModalOpen(false)
      setEditingId(null)
      form.resetFields()
      fetchAccounts()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể lưu tài khoản'
      message.error(errorMessage)
    } finally {
      setModalLoading(false)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setEditingId(null)
    form.resetFields()
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      role: DEFAULT_ROLE,
      status: DEFAULT_STATUS,
    })
    setIsModalOpen(true)
  }

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
            Quản lý tài khoản
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>Tạo, chỉnh sửa và phân quyền người dùng</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          block={window.innerWidth < 768}
        >
          Thêm tài khoản
        </Button>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space
          direction={window.innerWidth < 576 ? 'vertical' : 'horizontal'}
          style={{ width: '100%' }}
        >
          <Input
            placeholder="Tìm kiếm theo tên, email hoặc username..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            size="large"
            allowClear
          />
          <Select
            allowClear
            size="large"
            placeholder="Trạng thái"
            style={{ minWidth: 160 }}
            value={statusFilter}
            onChange={value => setStatusFilter(value)}
            options={[
              { value: 'ACTIVE', label: 'Đang hoạt động' },
              { value: 'INACTIVE', label: 'Ngừng hoạt động' },
            ]}
          />
        </Space>
      </Card>

      <Spin spinning={listLoading}>
        <Row gutter={[16, 16]}>
          {accounts.map(account => (
            <Col xs={24} sm={12} lg={8} key={account.id}>
              <Card
                hoverable
                actions={[
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(account)}
                  />,
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa tài khoản này?"
                    onConfirm={() => handleDelete(account.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    {account.fullName || account.username}
                  </h3>
                  <p style={{ color: '#999', fontSize: 12, marginBottom: 16 }}>
                    Tham gia từ {formatDate(account.created_at)}
                  </p>

                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: '100%', marginBottom: 16 }}
                  >
                    <div>
                      <MailOutlined style={{ marginRight: 8, color: '#666' }} />
                      <span style={{ fontSize: 14 }}>{account.email}</span>
                    </div>
                    <div>
                      <PhoneOutlined style={{ marginRight: 8, color: '#666' }} />
                      <span style={{ fontSize: 14 }}>
                        {account.phone_number || 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div>
                      <UserOutlined style={{ marginRight: 8, color: '#666' }} />
                      <span style={{ fontSize: 14 }}>{account.username}</span>
                    </div>
                  </Space>

                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 16 }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <p style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Vai trò</p>
                        <Tag color="blue">{account.role}</Tag>
                      </Col>
                      <Col span={12}>
                        <p style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Trạng thái</p>
                        <Tag color={getStatusColor(account.status)}>{account.status}</Tag>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      {!listLoading && accounts.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Không tìm thấy tài khoản
          </div>
        </Card>
      )}

      <Modal
        title={editingId ? 'Sửa tài khoản' : 'Tạo mới tài khoản'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={window.innerWidth < 768 ? '90%' : 600}
        confirmLoading={modalLoading}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input placeholder="Nhập tên đăng nhập" size="large" />
          </Form.Item>

          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nhập họ và tên" size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email" size="large" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone_number">
            <Input placeholder="Nhập số điện thoại" size="large" />
          </Form.Item>

          <Form.Item label="Mật khẩu" name="password" rules={passwordRules}>
            <Input.Password
              placeholder={editingId ? 'Để trống nếu không đổi' : 'Nhập mật khẩu'}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              placeholder="Chọn vai trò"
              size="large"
              options={[
                { value: 'ADMIN', label: 'ADMIN' },
                { value: 'USER', label: 'USER' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select
              placeholder="Chọn trạng thái"
              size="large"
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Ảnh đại diện" name="avatar_url">
            <Input placeholder="Nhập đường dẫn ảnh (nếu có)" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={modalLoading}>
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AccountManagement
