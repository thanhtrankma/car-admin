import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Drawer, Avatar, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuOutlined,
  IdcardOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const Layout = ({ children, onLogout }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'currentUser') {
        try {
          setCurrentUser(event.newValue ? JSON.parse(event.newValue) : null);
        } catch {
          setCurrentUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const menuItems = useMemo<MenuProps['items']>(() => {
    const items: MenuProps['items'] = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Tổng quan',
      },
      {
        key: '/cars',
        icon: <CarOutlined />,
        label: 'Quản lý xe',
      },
      {
        key: '/stock-in',
        icon: <InboxOutlined />,
        label: 'Nhập kho',
      },
      {
        key: '/orders',
        icon: <ShoppingCartOutlined />,
        label: 'Quản lý đơn hàng',
      },
      {
        key: '/customers',
        icon: <UserOutlined />,
        label: 'Khách hàng',
      },
      ...(currentUser?.role === 'ADMIN'
        ? [
            {
              key: '/accounts',
              icon: <TeamOutlined />,
              label: 'Quản lý tài khoản',
            },
          ]
        : []),
      {
        key: '/reports',
        icon: <BarChartOutlined />,
        label: 'Báo cáo',
      },
      {
        key: '/profile',
        icon: <IdcardOutlined />,
        label: 'Thông tin cá nhân',
      },
    ];
    return items;
  }, [currentUser?.role]);

  const getSelectedKeys = () => {
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      return ['/dashboard'];
    }
    if (location.pathname.startsWith('/cars')) {
      return ['/cars'];
    }
    return [location.pathname];
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    setMobileMenuOpen(false);
  };

  const menuContent = (
    <Menu
      mode="inline"
      selectedKeys={getSelectedKeys()}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ border: 'none', height: '100%' }}
    />
  );

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={256}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
          theme="light"
          trigger={null}
          >
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
          {!collapsed && (
            <>
              <h1 style={{ 
                fontSize: 20, 
                fontWeight: 'bold', 
                margin: 0,
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                CarDealer Admin
              </h1>
              <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0 0' }}>
                Quản lý hệ thống
              </p>
            </>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {menuContent}
        </div>
        <div style={{ padding: 16, borderTop: '1px solid #f0f0f0' }}>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={onLogout}
            block
            style={{ textAlign: 'left', height: 40 }}
          >
            {!collapsed && 'Đăng xuất'}
          </Button>
        </div>
      </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div>
            <h1 style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              margin: 0,
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              CarDealer Admin
            </h1>
            <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0 0' }}>
              Quản lý hệ thống
            </p>
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        bodyStyle={{ padding: 0 }}
        width={256}
        extra={
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={onLogout}
          >
            Đăng xuất
          </Button>
        }
        >
        {menuContent}
      </Drawer>

      {/* Main Layout */}
      <AntLayout 
        style={{ 
          marginLeft: isMobile ? 0 : (collapsed ? 80 : 256), 
          transition: 'margin-left 0.2s' 
        }}
      >
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => {
              if (isMobile) {
                setMobileMenuOpen(true);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            style={{
              fontSize: 16,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isMobile && currentUser && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>{currentUser.fullName || currentUser.username}</div>
              </div>
            )}
            <Tooltip title="Thông tin cá nhân">
              <Avatar
                size="large"
                style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                onClick={() => navigate('/profile')}
              >
                {(currentUser?.fullName || currentUser?.username || 'U')
                  .toString()
                  .charAt(0)
                  .toUpperCase()}
              </Avatar>
            </Tooltip>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
