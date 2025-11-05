'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Alert {
  id: string
  email: string
  name: string
  isActive: boolean
  createdAt: string
}

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/alerts')
      const result = await response.json()

      if (result.success) {
        setAlerts(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      alert('알림 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email) {
      alert('이메일을 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        alert('알림이 생성되었습니다.')
        setFormData({ email: '', name: '' })
        await fetchAlerts()
      } else {
        alert('알림 생성에 실패했습니다: ' + result.error)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('알림 생성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAlert = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentState })
      })

      const result = await response.json()

      if (result.success) {
        await fetchAlerts()
      } else {
        alert('상태 변경에 실패했습니다: ' + result.error)
      }
    } catch (error) {
      console.error('Toggle error:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  const deleteAlert = async (id: string) => {
    if (!confirm('정말로 이 알림을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/alerts?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await fetchAlerts()
      } else {
        alert('삭제에 실패했습니다: ' + result.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔔 이메일 알림 관리</h1>
          <button
            onClick={() => router.push('/admin')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            관리자 페이지로
          </button>
        </div>

        {/* 알림 생성 폼 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">새 알림 추가</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  알림 이름 (선택)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 개인 알림"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? '생성 중...' : '알림 추가'}
            </button>
          </form>
        </div>

        {/* 알림 조건 설명 */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">📋 알림 조건</h2>
          <p className="text-gray-700 mb-3">다음 조건 중 하나라도 충족되면 이메일이 발송됩니다:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>종합 점수 ≥ 7점 (강한 매수 신호)</li>
            <li>종합 점수 ≤ 3점 (강한 매도 신호)</li>
            <li>외국인 순매수 &gt; 5000억 원</li>
            <li>원/달러 환율 &gt; 1,400원 (약세 우려)</li>
            <li>KOSPI PBR &lt; 0.9 (저평가 구간)</li>
          </ul>
        </div>

        {/* 알림 목록 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            등록된 알림 ({alerts.length})
          </h2>

          {alerts.length === 0 ? (
            <p className="text-gray-600 text-center py-4">등록된 알림이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{alert.name || alert.email}</div>
                    <div className="text-sm text-gray-600">{alert.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      생성일: {new Date(alert.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id, alert.isActive)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        alert.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {alert.isActive ? '활성화' : '비활성화'}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
