-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreAccount" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "planName" TEXT NOT NULL DEFAULT '',
    "planStartDate" TIMESTAMP(3),
    "managerName" TEXT NOT NULL DEFAULT '',
    "managerEmail" TEXT NOT NULL DEFAULT '',
    "managerPhone" TEXT NOT NULL DEFAULT '',
    "portalUrl" TEXT NOT NULL DEFAULT '',
    "serviceWebsite" BOOLEAN NOT NULL DEFAULT false,
    "serviceSEO" BOOLEAN NOT NULL DEFAULT false,
    "serviceAdvertising" BOOLEAN NOT NULL DEFAULT false,
    "serviceGEO" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreAccount_shop_key" ON "StoreAccount"("shop");
