import { useState } from 'react'
import { Form, Input, Button, Image, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login as loginService } from '../services/authService'

interface LoginProps {
  onLogin: (role: 'manager' | 'staff') => void
}

const Login = ({ onLogin }: LoginProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: Record<string, string>) => {
    if (!values.username || !values.password) {
      return
    }

    try {
      setLoading(true)
      const response = await loginService({
        username: values.username,
        password: values.password,
      })

      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('currentUser', JSON.stringify(response.user))

      message.success(response.message || 'Đăng nhập thành công')
      form.resetFields()
      onLogin(response.user.role === 'ADMIN' ? 'manager' : 'staff')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .login-card {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          border: 1px solid rgba(255, 255, 255, 0.18);
          transition: all 0.3s ease;
        }
        .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
        }
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          animation: float 6s ease-in-out infinite;
        }
        .logo-container {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Animated background shapes */}
      <div
        className="floating-shape"
        style={{
          width: '300px',
          height: '300px',
          top: '10%',
          left: '10%',
          animationDelay: '0s',
        }}
      />
      <div
        className="floating-shape"
        style={{
          width: '200px',
          height: '200px',
          bottom: '15%',
          right: '15%',
          animationDelay: '2s',
        }}
      />
      <div
        className="floating-shape"
        style={{
          width: '150px',
          height: '150px',
          top: '50%',
          right: '10%',
          animationDelay: '4s',
        }}
      />

      <div
        className="login-card"
        style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 16px',
          borderRadius: 24,
          padding: '48px 40px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo Section */}
        <div
          className="logo-container"
          style={{
            textAlign: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '20px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              marginBottom: 20,
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
            }}
          >
            <Image
              src="/images/honda.png"
              alt="logo"
              width={120}
              preview={false}
              style={{
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>
          <h1
            style={{
              color: '#1a1a1a',
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.5px',
              marginTop: 16,
            }}
          >
            Chào mừng trở lại
          </h1>
          <p
            style={{
              color: '#666',
              margin: '8px 0 0 0',
              fontSize: 15,
              fontWeight: 400,
            }}
          >
            Đăng nhập để tiếp tục quản lý hệ thống
          </p>
        </div>

        {/* Form Section */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          style={{ marginTop: 8 }}
        >
          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#333' }}>Tên đăng nhập</span>}
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            style={{ marginBottom: 20 }}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#667eea' }} />}
              placeholder="Nhập tên đăng nhập"
              style={{
                height: 50,
                borderRadius: 12,
                fontSize: 15,
                border: '2px solid #e8e8e8',
                transition: 'all 0.3s ease',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#667eea'
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e8e8e8'
                e.target.style.boxShadow = 'none'
              }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 600, color: '#333' }}>Mật khẩu</span>}
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            style={{ marginBottom: 8 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#667eea' }} />}
              placeholder="Nhập mật khẩu"
              style={{
                height: 50,
                borderRadius: 12,
                fontSize: 15,
                border: '2px solid #e8e8e8',
                transition: 'all 0.3s ease',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#667eea'
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e8e8e8'
                e.target.style.boxShadow = 'none'
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 52,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Login
