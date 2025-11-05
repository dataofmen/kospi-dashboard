-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "foreignNetBuying" DOUBLE PRECISION,
    "usdKrwRate" DOUBLE PRECISION,
    "kospiPbr" DOUBLE PRECISION,
    "us10YearRate" DOUBLE PRECISION,
    "individualNetBuying" DOUBLE PRECISION,
    "memoryPrice" DOUBLE PRECISION,
    "semiconductorProfit" DOUBLE PRECISION,
    "valuationIndex" INTEGER,
    "sp500Pbr" DOUBLE PRECISION,
    "aiCapexGrowth" DOUBLE PRECISION,
    "score" INTEGER NOT NULL DEFAULT 0,
    "scenario" TEXT NOT NULL DEFAULT 'neutral',
    "foreignNetBuyingSignal" TEXT,
    "usdKrwRateSignal" TEXT,
    "kospiPbrSignal" TEXT,
    "us10YearRateSignal" TEXT,
    "individualNetBuyingSignal" TEXT,
    "memoryPriceSignal" TEXT,
    "semiconductorProfitSignal" TEXT,
    "valuationIndexSignal" TEXT,
    "sp500PbrSignal" TEXT,
    "aiCapexGrowthSignal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertHistory" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "conditionsMet" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "indicator" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "value" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_date_key" ON "Indicator"("date");

-- CreateIndex
CREATE INDEX "Indicator_date_idx" ON "Indicator"("date");

-- CreateIndex
CREATE INDEX "AlertHistory_alertId_idx" ON "AlertHistory"("alertId");

-- CreateIndex
CREATE INDEX "AlertHistory_createdAt_idx" ON "AlertHistory"("createdAt");

-- CreateIndex
CREATE INDEX "CollectionLog_date_indicator_idx" ON "CollectionLog"("date", "indicator");

-- AddForeignKey
ALTER TABLE "AlertHistory" ADD CONSTRAINT "AlertHistory_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
