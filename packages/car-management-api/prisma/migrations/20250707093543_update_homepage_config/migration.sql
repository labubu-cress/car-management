-- AlterTable
ALTER TABLE "HomepageConfig" ADD COLUMN     "bannerDescription" TEXT,
ADD COLUMN     "bannerTitle" TEXT,
ADD COLUMN     "bannerVideo" TEXT,
ALTER COLUMN "bannerImage" DROP NOT NULL;
