-- CreateTable
CREATE TABLE "AppRelease" (
    "id" TEXT NOT NULL,
    "appName" TEXT NOT NULL DEFAULT 'HealthApp',
    "platform" TEXT NOT NULL DEFAULT 'ANDROID',
    "versionName" TEXT NOT NULL,
    "versionCode" INTEGER NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "releaseNotes" TEXT,
    "isForceUpdate" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppRelease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppRelease_platform_isActive_idx" ON "AppRelease"("platform", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AppRelease_platform_versionCode_key" ON "AppRelease"("platform", "versionCode");
