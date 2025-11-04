'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    memoryPrice: '',
    semiconductorProfit: '',
    valuationIndex: '3',
    sp500Pbr: '',
    aiCapexGrowth: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setError('비밀번호가 올바르지 않습니다.')
      }
    } catch (err) {
      setError('인증 오류가 발생했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/manual-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          memoryPrice: formData.memoryPrice ? parseFloat(formData.memoryPrice) : undefined,
          semiconductorProfit: formData.semiconductorProfit
            ? parseFloat(formData.semiconductorProfit)
            : undefined,
          valuationIndex: parseInt(formData.valuationIndex),
          sp500Pbr: formData.sp500Pbr ? parseFloat(formData.sp500Pbr) : undefined,
          aiCapexGrowth: formData.aiCapexGrowth ? parseFloat(formData.aiCapexGrowth) : undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('✅ 데이터가 성공적으로 저장되었습니다!')
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        setError(data.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      memoryPrice: '',
      semiconductorProfit: '',
      valuationIndex: '3',
      sp500Pbr: '',
      aiCapexGrowth: ''
    })
    setError('')
    setSuccess('')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">🔐 관리자 로그인</h1>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="관리자 비밀번호 입력"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              로그인
            </button>
          </form>

          <button
            onClick={() => router.push('/')}
            className="w-full mt-3 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">⚙️ 관리자 패널</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/admin/alerts')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              알림 관리
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              대시보드로
            </button>
          </div>
        </div>

        {/* 수동 데이터 입력 폼 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 수동 데이터 입력</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 날짜 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 메모리 가격 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모리(HBM/DDR5) 평균 가격 (USD)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.memoryPrice}
                  onChange={(e) => setFormData({ ...formData, memoryPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 8.5"
                />
                <p className="text-xs text-gray-500 mt-1">출처: DRAMeXchange 또는 뉴스 기사</p>
              </div>

              {/* 반도체 영업이익 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  삼성전자+SK하이닉스 영업이익 (조원)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.semiconductorProfit}
                  onChange={(e) =>
                    setFormData({ ...formData, semiconductorProfit: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 15.2"
                />
                <p className="text-xs text-gray-500 mt-1">출처: 기업 IR 자료</p>
              </div>

              {/* 밸류업 지수 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  코리아 밸류업 추진 지수 (0-5점)
                </label>
                <select
                  value={formData.valuationIndex}
                  onChange={(e) => setFormData({ ...formData, valuationIndex: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">0점 - 정체</option>
                  <option value="1">1점 - 매우 느림</option>
                  <option value="2">2점 - 느림</option>
                  <option value="3">3점 - 보통</option>
                  <option value="4">4점 - 진척</option>
                  <option value="5">5점 - 매우 진척</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">자체 평가</p>
              </div>

              {/* S&P500 PBR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  S&P500 PBR (배)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sp500Pbr}
                  onChange={(e) => setFormData({ ...formData, sp500Pbr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 5.2"
                />
                <p className="text-xs text-gray-500 mt-1">출처: YCharts</p>
              </div>

              {/* AI CapEx 성장률 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI CapEx 성장률 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.aiCapexGrowth}
                  onChange={(e) => setFormData({ ...formData, aiCapexGrowth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 25.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  출처: NVDA, TSMC, MS, AMZN 실적 발표
                </p>
              </div>
            </div>

            {/* 에러/성공 메시지 */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            {/* 버튼 */}
            <div className="mt-6 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? '저장 중...' : '💾 저장하기'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
              >
                🔄 초기화
              </button>
            </div>
          </form>
        </div>

        {/* 도움말 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 입력 가이드</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 모든 필드는 선택사항입니다. 입력하지 않은 항목은 N/A로 표시됩니다.</li>
            <li>• 날짜는 데이터가 적용될 기준일입니다.</li>
            <li>• 중복 날짜 입력 시 기존 데이터가 업데이트됩니다.</li>
            <li>• 저장 후 자동으로 종합 점수가 재계산됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
