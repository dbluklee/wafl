import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { DESIGN_TOKENS } from '../types/design-tokens';
import { API_ENDPOINTS } from '@/utils/constants';
import api from '@/utils/axios';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  activeOrders: number;
  activeTables: number;
  completedOrders: number;
  averageOrderValue: number;
  peakHour: string;
  popularItems?: Array<{
    name: string;
    count: number;
  }>;
}

interface OrderSummary {
  id: string;
  tableNumber: number;
  items: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: string;
}

interface POSLog {
  id: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: any;
}

interface TableStatus {
  tableNumber: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrder?: string;
  occupiedSince?: string;
}

const DashboardPage: React.FC = () => {
  const { colors } = DESIGN_TOKENS;
  const { user, store } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [posLogs, setPosLogs] = useState<POSLog[]>([]);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 대시보드 통계 가져오기
      const statsResponse = await api.get(API_ENDPOINTS.DASHBOARD_STATS);
      setStats(statsResponse.data.data);

      // POS 로그 가져오기
      const logsResponse = await api.get(`${API_ENDPOINTS.POS_LOGS}?limit=10`);
      setPosLogs(logsResponse.data.data);

      // 최근 주문 가져오기 (기존 API 유지)
      try {
        const ordersResponse = await api.get('/api/v1/dashboard/recent-orders?limit=10');
        setRecentOrders(ordersResponse.data.data);
      } catch (orderError) {
        console.warn('Recent orders API not available:', orderError);
        setRecentOrders([]);
      }

      // 테이블 상태 가져오기 (기존 API 유지)
      try {
        const tablesResponse = await api.get('/api/v1/dashboard/table-status');
        setTables(tablesResponse.data.data);
      } catch (tableError) {
        console.warn('Table status API not available:', tableError);
        setTables([]);
      }

      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      setError(error.response?.data?.message || '대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // 30초마다 데이터 새로고침
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-orange-600 dark:text-orange-400',
      preparing: 'text-blue-600 dark:text-blue-400',
      ready: 'text-green-600 dark:text-green-400',
      completed: 'text-gray-600 dark:text-gray-400',
      available: 'text-green-600 dark:text-green-400',
      occupied: 'text-red-600 dark:text-red-400',
      reserved: 'text-yellow-600 dark:text-yellow-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 dark:text-gray-400';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: '대기중',
      preparing: '준비중',
      ready: '완료',
      completed: '완료됨',
      available: '사용가능',
      occupied: '사용중',
      reserved: '예약됨'
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bgBlack }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: colors.basicWhite }}>실시간 현황을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bgBlack }}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p style={{ color: colors.basicWhite }} className="mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bgBlack }}>
      {/* Header */}
      <header style={{ backgroundColor: colors.buttonBackground, borderBottom: `1px solid ${colors.buttonBorder}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold" style={{ color: colors.basicWhite }}>실시간 현황</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm" style={{ color: '#ccc' }}>
                <span className="font-medium">{store?.name}</span>
                <span className="mx-2">|</span>
                <span>{user?.name}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>실시간</span>
              </div>
              <button
                onClick={fetchDashboardData}
                style={{
                  backgroundColor: colors.buttonBackground,
                  border: `1px solid ${colors.buttonBorder}`,
                  color: colors.basicWhite,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">
            {store?.name} 실시간 현황
          </h2>
          <p className="text-dark-600 dark:text-dark-400">
            현재 운영 상태를 실시간으로 확인하세요
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 오늘 매출 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600 dark:text-dark-400">오늘 매출</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-white">
                  {stats ? formatCurrency(stats.totalSales) : '₩0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-600 dark:text-green-400">
                평균 주문금액: {stats ? formatCurrency(stats.averageOrderValue) : '₩0'}
              </span>
            </div>
          </div>

          {/* 진행중인 주문 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600 dark:text-dark-400">진행중인 주문</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-white">
                  {stats?.activeOrders || 0}건
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m9-9h-4v10h4" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-dark-600 dark:text-dark-400">
                총 주문: {stats?.totalOrders || 0}건
              </span>
            </div>
          </div>

          {/* 사용중인 테이블 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600 dark:text-dark-400">사용중인 테이블</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-white">
                  {stats?.activeTables || 0}개
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-dark-600 dark:text-dark-400">
                피크시간: {stats?.peakHour || 'N/A'}
              </span>
            </div>
          </div>

          {/* 완료된 주문 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600 dark:text-dark-400">완료된 주문</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-white">
                  {stats?.completedOrders || 0}건
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 인기 메뉴 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700 p-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">오늘의 인기 메뉴</h3>
            <div className="space-y-3">
              {stats?.popularItems && stats.popularItems.length > 0 ? (
                stats.popularItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-dark-900 dark:text-white">{item.name}</span>
                    </div>
                    <span className="text-sm text-dark-600 dark:text-dark-400">{item.count}회</span>
                  </div>
                ))
              ) : (
                <p className="text-dark-600 dark:text-dark-400">아직 주문 데이터가 없습니다.</p>
              )}
            </div>
          </div>

          {/* 최근 POS 활동 */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white">최근 POS 활동</h3>
              <button
                onClick={fetchDashboardData}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                새로고침
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {posLogs.length > 0 ? (
                posLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg bg-dark-50 dark:bg-dark-700">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-900 dark:text-white">{log.action}</p>
                      <p className="text-sm text-dark-600 dark:text-dark-400">{log.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-dark-500 dark:text-dark-500">{log.userName}</span>
                        <span className="text-xs text-dark-400 dark:text-dark-400">•</span>
                        <span className="text-xs text-dark-500 dark:text-dark-500">{formatTime(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-dark-600 dark:text-dark-400">최근 활동이 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 기존 최근 주문과 테이블 상태는 백엔드 API가 준비되면 표시 */}
        {(recentOrders.length > 0 || tables.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Recent Orders */}
            {recentOrders.length > 0 && (
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700 p-6">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">최근 주문</h3>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                            {order.tableNumber}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark-900 dark:text-white">
                            테이블 {order.tableNumber} · {order.items}개 항목
                          </p>
                          <p className="text-xs text-dark-600 dark:text-dark-400">
                            {formatTime(order.createdAt)} · {formatCurrency(order.total)}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Table Status */}
            {tables.length > 0 && (
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700 p-6">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">테이블 현황</h3>
                <div className="grid grid-cols-4 gap-3">
                  {tables.map((table) => (
                    <div
                      key={table.tableNumber}
                      className={`p-3 rounded-lg border-2 text-center ${
                        table.status === 'available'
                          ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900'
                          : table.status === 'occupied'
                          ? 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900'
                          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900'
                      }`}
                    >
                      <div className="text-lg font-bold text-dark-900 dark:text-white">
                        {table.tableNumber}
                      </div>
                      <div className={`text-xs ${getStatusColor(table.status)}`}>
                        {getStatusText(table.status)}
                      </div>
                      {table.occupiedSince && (
                        <div className="text-xs text-dark-600 dark:text-dark-400 mt-1">
                          {formatTime(table.occupiedSince)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;