-- AlterTable
ALTER TABLE `sizes` ADD COLUMN `status` ENUM('Active', 'Deactivated') NOT NULL DEFAULT 'Active';
