-- CreateTable
CREATE TABLE "CafeTable" (
    "id" SERIAL NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "tableToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CafeTable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CafeTable_tableNumber_key" ON "CafeTable"("tableNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CafeTable_tableToken_key" ON "CafeTable"("tableToken");
