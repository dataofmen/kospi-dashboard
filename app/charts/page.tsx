'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface Indicator {
  date: string
  score: number
  foreignNetBuying: number | null
  usdKrwRate: number | null
  kospiPbr: number | null
  us10YearRate: number | null
}

export default function ChartsPage() {
  const router = useRouter()
  const [data, setData] = useState<Indicator[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/indicators?days=${period}`)
      const result = await response.json()

      if (result.success) {
        const formattedData = result.data.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric'
          }),
          score: item.score,
          foreignNetBuying: item.foreignNetBuying
            ? item.foreignNetBuying / 100000000
            : null,
          usdKrwRate: item.usdKrwRate,
          kospiPbr: item.kospiPbr,
          us10YearRate: item.us10YearRate
        }))
        setData(formattedData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">데이터 로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📈 추세 분석</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            대시보드로
          </button>
        </div>

        {/* 기간 선택 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod(7)}
              className={`px-4 py-2 rounded ${
                period === 7 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              1주일
            </button>
            <button
              onClick={() => setPeriod(30)}
              className={`px-4 py-2 rounded ${
                period === 30 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              1개월
            </button>
            <button
              onClick={() => setPeriod(90)}
              className={`px-4 py-2 rounded ${
                period === 90 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              3개월
            </button>
            <button
              onClick={() => setPeriod(180)}
              className={`px-4 py-2 rounded ${
                period === 180 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              6개월
            </button>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">아직 수집된 데이터가 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 종합 점수 차트 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">종합 점수 추세</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="종합 점수"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 환율 차트 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">원/달러 환율</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="usdKrwRate"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="환율 (원)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 외국인 순매수 차트 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">외국인 순매수</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="foreignNetBuying"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="순매수 (조원)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 코스피 PBR 차트 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">코스피 PBR</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="kospiPbr"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="PBR (배)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 미국 금리 차트 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">미 10년물 금리</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="us10YearRate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="금리 (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
