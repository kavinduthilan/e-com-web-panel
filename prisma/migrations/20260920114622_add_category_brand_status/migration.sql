-- AlterTable
ALTER TABLE `brands` ADD COLUMN `status` ENUM('Active', 'Deactivated') NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE `categories` ADD COLUMN `status` ENUM('Active', 'Deactivated') NOT NULL DEFAULT 'Active';
