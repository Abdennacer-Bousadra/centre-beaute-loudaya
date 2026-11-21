-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(64) NOT NULL,
    `nameFr` VARCHAR(120) NOT NULL,
    `nameAr` VARCHAR(120) NOT NULL,
    `icon` VARCHAR(32) NOT NULL DEFAULT 'Sparkles',
    `descriptionFr` TEXT NULL,
    `descriptionAr` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(80) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `nameFr` VARCHAR(160) NOT NULL,
    `nameAr` VARCHAR(160) NOT NULL,
    `descriptionFr` TEXT NULL,
    `descriptionAr` TEXT NULL,
    `price` INTEGER NOT NULL,
    `priceNote` VARCHAR(40) NOT NULL DEFAULT 'DH',
    `duration` VARCHAR(20) NOT NULL DEFAULT '30 min',
    `popular` BOOLEAN NOT NULL DEFAULT false,
    `badge` VARCHAR(80) NULL,
    `available` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Service_slug_key`(`slug`),
    INDEX `Service_categoryId_idx`(`categoryId`),
    INDEX `Service_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ref` VARCHAR(16) NOT NULL,
    `clientName` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(24) NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `time` VARCHAR(5) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `extraOptionSlug` VARCHAR(40) NULL,
    `extraOptionName` VARCHAR(160) NULL,
    `extraOptionPrice` INTEGER NOT NULL DEFAULT 0,
    `totalPrice` INTEGER NOT NULL DEFAULT 0,
    `durationMinutes` INTEGER NOT NULL DEFAULT 30,
    `whatsappLink` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Booking_ref_key`(`ref`),
    INDEX `Booking_date_time_idx`(`date`, `time`),
    INDEX `Booking_status_idx`(`status`),
    INDEX `Booking_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `nameFr` VARCHAR(160) NOT NULL,
    `nameAr` VARCHAR(160) NOT NULL,
    `price` INTEGER NOT NULL,
    `duration` VARCHAR(20) NOT NULL DEFAULT '30 min',

    INDEX `BookingItem_bookingId_idx`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(160) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingItem` ADD CONSTRAINT `BookingItem_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingItem` ADD CONSTRAINT `BookingItem_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
