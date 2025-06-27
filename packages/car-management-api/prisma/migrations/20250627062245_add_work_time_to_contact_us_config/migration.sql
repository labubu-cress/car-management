-- AlterTable
ALTER TABLE `ContactUsConfig` ADD COLUMN `workEndTime` INTEGER NULL,
    ADD COLUMN `workStartTime` INTEGER NULL,
    ADD COLUMN `workdays` JSON NULL;
