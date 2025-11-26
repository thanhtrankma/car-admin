import { useState } from 'react';
import { Car, User, Shield } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'manager' | 'staff') => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'staff'>('staff');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication - in production, this would call an API
    if (username && password) {
      onLogin(role);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
            <Car className="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          CarDealer Admin
        </h2>
        <p className="text-center text-gray-600 mb-8">Đăng nhập vào hệ thống</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Phân quyền
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('manager')}
                className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                  role === 'manager'
                    ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-5 h-5 mr-2" />
                <span className="font-medium">Quản lý</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('staff')}
                className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-all duration-200 ${
                  role === 'staff'
                    ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5 mr-2" />
                <span className="font-medium">Nhân viên</span>
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

