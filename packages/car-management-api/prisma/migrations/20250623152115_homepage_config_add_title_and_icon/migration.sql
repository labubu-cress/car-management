/*
  Warnings:

  - You are about to drop the column `welcomeDescription` on the `HomepageConfig` table. All the data in the column will be lost.
  - You are about to drop the column `welcomeTitle` on the `HomepageConfig` table. All the data in the column will be lost.
  - Added the required column `firstTitle` to the `HomepageConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstTitleIcon` to the `HomepageConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondTitle` to the `HomepageConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondTitleIcon` to the `HomepageConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `HomepageConfig` DROP COLUMN `welcomeDescription`,
    DROP COLUMN `welcomeTitle`,
    ADD COLUMN `firstTitle` VARCHAR(191) NOT NULL,
    ADD COLUMN `firstTitleIcon` VARCHAR(191) NOT NULL,
    ADD COLUMN `secondTitle` VARCHAR(191) NOT NULL,
    ADD COLUMN `secondTitleIcon` VARCHAR(191) NOT NULL;
