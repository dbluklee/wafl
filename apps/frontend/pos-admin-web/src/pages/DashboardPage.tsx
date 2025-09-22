import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !user) {
      navigate('/login');
      return;
    }
    setIsLoading(false);
  }, [accessToken, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-400 mt-1">실시간 매장 현황</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              홈으로
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 테이블 상태 카드 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">테이블 현황</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span>테이블 1</span>
                <span className="px-2 py-1 bg-green-600 rounded text-sm">빈 테이블</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span>테이블 2</span>
                <span className="px-2 py-1 bg-yellow-600 rounded text-sm">손님 있음</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span>테이블 3</span>
                <span className="px-2 py-1 bg-red-600 rounded text-sm">주문 완료</span>
              </div>
            </div>
          </div>

          {/* POS 로그 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <div className="text-sm text-gray-300">
                <span className="text-gray-500">14:30</span> - 테이블 2 주문 접수
              </div>
              <div className="text-sm text-gray-300">
                <span className="text-gray-500">14:25</span> - 카테고리 추가: 디저트
              </div>
              <div className="text-sm text-gray-300">
                <span className="text-gray-500">14:20</span> - 메뉴 수정: 아메리카노 가격 변경
              </div>
              <div className="text-sm text-gray-300">
                <span className="text-gray-500">14:15</span> - 테이블 1 결제 완료
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 액션 버튼들 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">빠른 액션</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/management')}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🏪</div>
                <div>매장 관리</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/ai-agent')}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🤖</div>
                <div>AI 상담</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div>분석</div>
              </div>
            </button>
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <div>설정</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}