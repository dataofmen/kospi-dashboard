-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "foreignNetBuying" REAL,
    "usdKrwRate" REAL,
    "kospiPbr" REAL,
    "us10YearRate" REAL,
    "individualNetBuying" REAL,
    "memoryPrice" REAL,
    "semiconductorProfit" REAL,
    "valuationIndex" INTEGER,
    "sp500Pbr" REAL,
    "aiCapexGrowth" REAL,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AlertHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "conditionsMet" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlertHistory_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CollectionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "indicator" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "value" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
