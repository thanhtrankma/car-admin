
import { Form, Input, Button, Card, Image } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

interface LoginProps {
  onLogin: (role: 'manager' | 'staff') => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: Record<string, string>) => {
    if (values.username && values.password) {
      onLogin('staff');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          margin: '0 16px',
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image src="/images/honda.png" alt="logo" width={150} />
          <p style={{ color: '#666', margin: 0, fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>Đăng nhập vào hệ thống</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập tên đăng nhập"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>


          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ height: 48, fontSize: 16 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
