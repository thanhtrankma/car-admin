import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  ShoppingCart, 
  Users, 
  BarChart3,
  LogOut,
  Package
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const Layout = ({ children, onLogout }: LayoutProps) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/cars', label: 'Quản lý xe', icon: Car },
    { path: '/stock-in', label: 'Nhập kho', icon: Package },
    { path: '/orders', label: 'Quản lý đơn hàng', icon: ShoppingCart },
    { path: '/customers', label: 'Khách hàng', icon: Users },
    { path: '/reports', label: 'Báo cáo', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            CarDealer Admin
          </h1>
          <p className="text-xs text-gray-500 mt-1">Quản lý hệ thống</p>
        </div>
        <nav className="mt-2 flex-1 px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/cars' && location.pathname.startsWith('/cars'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mb-1 text-gray-700 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30' 
                    : 'hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
                <span className={`font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-lg group"
          >
            <LogOut className="w-5 h-5 mr-3 text-gray-500 group-hover:text-red-600" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

