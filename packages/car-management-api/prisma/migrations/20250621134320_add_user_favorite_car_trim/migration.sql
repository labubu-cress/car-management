-- CreateTable
CREATE TABLE `UserFavoriteCarTrim` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `carTrimId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserFavoriteCarTrim_userId_idx`(`userId`),
    UNIQUE INDEX `UserFavoriteCarTrim_userId_carTrimId_key`(`userId`, `carTrimId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserFavoriteCarTrim` ADD CONSTRAINT `UserFavoriteCarTrim_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFavoriteCarTrim` ADD CONSTRAINT `UserFavoriteCarTrim_carTrimId_fkey` FOREIGN KEY (`carTrimId`) REFERENCES `CarTrim`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
