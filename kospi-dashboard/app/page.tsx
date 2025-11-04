// 메인 대시보드 페이지
import { prisma } from '@/lib/prisma'
import { getScenarioText, getSignalColor, getImpactDirection } from '@/lib/score-calculator'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getLatestIndicator() {
  try {
    const latest = await prisma.indicator.findFirst({
      orderBy: { date: 'desc' }
    })
    return latest
  } catch (error) {
    console.error('Failed to fetch indicator:', error)
    return null
  }
}

export default async function HomePage() {
  const indicator = await getLatestIndicator()

  if (!indicator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">📊 KOSPI 모니터링 대시보드</h1>
          <p className="text-gray-600 mb-4">아직 수집된 데이터가 없습니다.</p>
          <form action="/api/collect" method="POST">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              데이터 수집 시작
            </button>
          </form>
        </div>
      </div>
    )
  }

  const indicators = [
    {
      category: '거시환경',
      items: [
        {
          name: '외국인 순매수',
          value: indicator.foreignNetBuying
            ? `${(indicator.foreignNetBuying / 100000000).toFixed(1)}조원`
            : 'N/A',
          signal: indicator.foreignNetBuyingSignal,
          impact: getImpactDirection(indicator.foreignNetBuyingSignal)
        },
        {
          name: '원/달러 환율',
          value: indicator.usdKrwRate ? `${indicator.usdKrwRate.toFixed(0)}원` : 'N/A',
          signal: indicator.usdKrwRateSignal,
          impact: getImpactDirection(indicator.usdKrwRateSignal)
        },
        {
          name: '미 10년물 금리',
          value: indicator.us10YearRate ? `${indicator.us10YearRate.toFixed(2)}%` : 'N/A',
          signal: indicator.us10YearRateSignal,
          impact: getImpactDirection(indicator.us10YearRateSignal)
        }
      ]
    },
    {
      category: '펀더멘털',
      items: [
        {
          name: '메모리 가격',
          value: indicator.memoryPrice ? `$${indicator.memoryPrice.toFixed(1)}` : 'N/A',
          signal: indicator.memoryPriceSignal,
          impact: getImpactDirection(indicator.memoryPriceSignal)
        },
        {
          name: '반도체 영업이익',
          value: indicator.semiconductorProfit
            ? `${indicator.semiconductorProfit.toFixed(1)}조원`
            : 'N/A',
          signal: indicator.semiconductorProfitSignal,
          impact: getImpactDirection(indicator.semiconductorProfitSignal)
        },
        {
          name: '코스피 PBR',
          value: indicator.kospiPbr ? `${indicator.kospiPbr.toFixed(2)}배` : 'N/A',
          signal: indicator.kospiPbrSignal,
          impact: getImpactDirection(indicator.kospiPbrSignal)
        },
        {
          name: 'S&P500 PBR',
          value: indicator.sp500Pbr ? `${indicator.sp500Pbr.toFixed(2)}배` : 'N/A',
          signal: indicator.sp500PbrSignal,
          impact: getImpactDirection(indicator.sp500PbrSignal)
        }
      ]
    },
    {
      category: '정책/수급',
      items: [
        {
          name: '밸류업 지수',
          value: indicator.valuationIndex ? `${indicator.valuationIndex}점` : 'N/A',
          signal: indicator.valuationIndexSignal,
          impact: getImpactDirection(indicator.valuationIndexSignal)
        },
        {
          name: '개인 순매수',
          value: indicator.individualNetBuying
            ? `${(indicator.individualNetBuying / 100000000).toFixed(1)}조원`
            : 'N/A',
          signal: indicator.individualNetBuyingSignal,
          impact: getImpactDirection(indicator.individualNetBuyingSignal)
        },
        {
          name: 'AI CapEx 성장률',
          value: indicator.aiCapexGrowth ? `${indicator.aiCapexGrowth.toFixed(1)}%` : 'N/A',
          signal: indicator.aiCapexGrowthSignal,
          impact: getImpactDirection(indicator.aiCapexGrowthSignal)
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 KOSPI 모니터링 대시보드</h1>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              관리자
            </Link>
            <Link
              href="/charts"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              차트 보기
            </Link>
          </div>
        </div>

        {/* 종합 판정 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">📈 종합 판정</h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-blue-600">{indicator.score}/10</div>
                <div className="text-2xl">{getScenarioText(indicator.scenario)}</div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>업데이트: {new Date(indicator.updatedAt).toLocaleString('ko-KR')}</div>
            </div>
          </div>
        </div>

        {/* 지표 카테고리별 표시 */}
        {indicators.map((category) => (
          <div key={category.category} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {category.category} ({category.items.filter((i) => i.signal).length}/
              {category.items.length})
            </h3>
            <div className="space-y-2">
              {category.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center p-3 rounded ${getSignalColor(
                    item.signal
                  )}`}
                >
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-lg font-semibold">{item.value}</span>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="font-medium">{item.signal || '-'}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <span className="text-xl">{item.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 푸터 액션 */}
        <div className="flex justify-center gap-4">
          <form action="/api/collect" method="POST">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              🔄 데이터 갱신
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
