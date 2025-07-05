-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'admin', 'tenant_viewer');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "UserMessageStatus" AS ENUM ('PENDING', 'PROCESSED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "appSecret" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'active',
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "openId" TEXT NOT NULL,
    "unionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleScenario" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarCategory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "maxPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL,
    "badge" TEXT,
    "tags" JSONB NOT NULL,
    "highlights" JSONB NOT NULL,
    "interiorImages" JSONB NOT NULL,
    "exteriorImages" JSONB NOT NULL,
    "offerPictures" JSONB NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vehicleScenarioId" TEXT NOT NULL,

    CONSTRAINT "CarCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarTrim" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "configImageUrl" TEXT,
    "badge" TEXT,
    "originalPrice" DECIMAL(65,30) NOT NULL,
    "currentPrice" DECIMAL(65,30) NOT NULL,
    "priceOverrideText" TEXT,
    "features" JSONB NOT NULL,
    "categoryId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarTrim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firstTitle" TEXT NOT NULL,
    "firstTitleIcon" TEXT NOT NULL,
    "secondTitle" TEXT NOT NULL,
    "secondTitleIcon" TEXT NOT NULL,
    "bannerImage" TEXT NOT NULL,
    "benefitsImage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavoriteCarTrim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "carTrimId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavoriteCarTrim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactUsConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contactPhoneDescription" TEXT,
    "contactPhoneNumber" TEXT,
    "contactEmailDescription" TEXT,
    "contactEmail" TEXT,
    "workdays" JSONB,
    "workStartTime" INTEGER,
    "workEndTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactUsConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMessage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "UserMessageStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "processedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_appId_key" ON "Tenant"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE INDEX "AdminUser_tenantId_idx" ON "AdminUser"("tenantId");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_openId_key" ON "User"("tenantId", "openId");

-- CreateIndex
CREATE INDEX "VehicleScenario_tenantId_idx" ON "VehicleScenario"("tenantId");

-- CreateIndex
CREATE INDEX "CarCategory_tenantId_idx" ON "CarCategory"("tenantId");

-- CreateIndex
CREATE INDEX "CarCategory_vehicleScenarioId_idx" ON "CarCategory"("vehicleScenarioId");

-- CreateIndex
CREATE INDEX "CarTrim_tenantId_idx" ON "CarTrim"("tenantId");

-- CreateIndex
CREATE INDEX "CarTrim_categoryId_idx" ON "CarTrim"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageConfig_tenantId_key" ON "HomepageConfig"("tenantId");

-- CreateIndex
CREATE INDEX "UserFavoriteCarTrim_userId_idx" ON "UserFavoriteCarTrim"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavoriteCarTrim_userId_carTrimId_key" ON "UserFavoriteCarTrim"("userId", "carTrimId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactUsConfig_tenantId_key" ON "ContactUsConfig"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Faq_tenantId_question_key" ON "Faq"("tenantId", "question");

-- CreateIndex
CREATE INDEX "UserMessage_userId_idx" ON "UserMessage"("userId");

-- CreateIndex
CREATE INDEX "UserMessage_tenantId_idx" ON "UserMessage"("tenantId");

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleScenario" ADD CONSTRAINT "VehicleScenario_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarCategory" ADD CONSTRAINT "CarCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarCategory" ADD CONSTRAINT "CarCategory_vehicleScenarioId_fkey" FOREIGN KEY ("vehicleScenarioId") REFERENCES "VehicleScenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarTrim" ADD CONSTRAINT "CarTrim_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarTrim" ADD CONSTRAINT "CarTrim_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CarCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageConfig" ADD CONSTRAINT "HomepageConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteCarTrim" ADD CONSTRAINT "UserFavoriteCarTrim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteCarTrim" ADD CONSTRAINT "UserFavoriteCarTrim_carTrimId_fkey" FOREIGN KEY ("carTrimId") REFERENCES "CarTrim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactUsConfig" ADD CONSTRAINT "ContactUsConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMessage" ADD CONSTRAINT "UserMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMessage" ADD CONSTRAINT "UserMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMessage" ADD CONSTRAINT "UserMessage_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
