/*
  Warnings:

  - You are about to drop the column `contact` on the `UserMessage` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `UserMessage` table. All the data in the column will be lost.
  - Added the required column `message` to the `UserMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `UserMessage` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `UserMessage` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `UserMessage` DROP FOREIGN KEY `UserMessage_userId_fkey`;

-- AlterTable
ALTER TABLE `UserMessage` DROP COLUMN `contact`,
    DROP COLUMN `content`,
    ADD COLUMN `message` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL,
    ADD COLUMN `processedAt` DATETIME(3) NULL,
    ADD COLUMN `processedById` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'PROCESSED') NOT NULL DEFAULT 'PENDING',
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `UserMessage` ADD CONSTRAINT `UserMessage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMessage` ADD CONSTRAINT `UserMessage_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
