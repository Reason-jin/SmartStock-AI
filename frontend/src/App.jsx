import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, BarChart3, Package, TrendingUp, FlaskConical } from 'lucide-react';
import { ChatBot } from './components/ChatBot';
import { InventoryProvider } from './context/InventoryContext';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import UploadProfile from './pages/UploadProfile';
import Order from './pages/Order';
import Prediction from './pages/Prediction';
import Help from './pages/Help';
import Login from './pages/Login';
import Settings from './pages/Settings';
import DataLab from './pages/DataLab';
import Policy from './pages/Policy';

// ✅ Layout 컴포넌트 (관리자 관련 코드 제거)
function Layout({ children, isLoggedIn, setIsLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  // Home (랜딩) 페이지 - Public Header
  if (location.pathname === '/' && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to="/home" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">SmStock AI</h1>
              </Link>
              <div className="flex items-center gap-3">
                <Link to="/upload">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    무료로 시작하기
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <ChatBot />
      </div>
    );
  }

  // 로그인 후 Layout
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">SmartStock AI</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex-shrink-0">
          <nav className="p-4 space-y-1">
            <Link
              to="/upload"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive('/upload') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UploadIcon size={20} />
              업로드
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive('/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={20} />
              대시보드
            </Link>
            <Link
              to="/prediction"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive('/prediction') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingUp size={20} />
              머신러닝
            </Link>
            <Link
              to="/order"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive('/order') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package size={20} />
              발주추천
            </Link>
            <Link
              to="/datalab"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive('/datalab') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FlaskConical size={20} />
              DataLab
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>

      {/* ChatBot */}
      <ChatBot />
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <InventoryProvider>
      <Router>
        <Layout isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/help" element={<Help />} />
            <Route path="/policy" element={<Policy />} />

            {/* User Routes */}
            <Route path="/upload" element={<Upload />} />
            <Route path="/upload/:id" element={<UploadProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/order" element={<Order />} />
            <Route path="/datalab" element={<DataLab />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </InventoryProvider>
  );
}

export default App;
