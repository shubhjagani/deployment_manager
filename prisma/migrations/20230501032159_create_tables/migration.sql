/*
  Warnings:

  - The primary key for the `Entity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Entity` table. All the data in the column will be lost.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Role` table. All the data in the column will be lost.
  - The primary key for the `Tool` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Tool` table. All the data in the column will be lost.
  - The primary key for the `ToolResource` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ToolResource` table. All the data in the column will be lost.
  - The primary key for the `ToolResourceAccessLevel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ToolResourceAccessLevel` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EntityTool" DROP CONSTRAINT "EntityTool_entityId_fkey";

-- DropForeignKey
ALTER TABLE "EntityTool" DROP CONSTRAINT "EntityTool_toolId_fkey";

-- DropForeignKey
ALTER TABLE "RoleToolPermission" DROP CONSTRAINT "RoleToolPermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "RoleToolPermission" DROP CONSTRAINT "RoleToolPermission_toolResourceAccessId_fkey";

-- DropForeignKey
ALTER TABLE "ToolResource" DROP CONSTRAINT "ToolResource_toolId_fkey";

-- DropForeignKey
ALTER TABLE "ToolResourceAccessLevel" DROP CONSTRAINT "ToolResourceAccessLevel_toolResourceId_fkey";

-- DropForeignKey
ALTER TABLE "UserEntityRole" DROP CONSTRAINT "UserEntityRole_entityId_fkey";

-- DropForeignKey
ALTER TABLE "UserEntityRole" DROP CONSTRAINT "UserEntityRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserEntityRole" DROP CONSTRAINT "UserEntityRole_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserToolAccount" DROP CONSTRAINT "UserToolAccount_toolId_fkey";

-- DropForeignKey
ALTER TABLE "UserToolAccount" DROP CONSTRAINT "UserToolAccount_userId_fkey";

-- AlterTable
ALTER TABLE "Entity" DROP CONSTRAINT "Entity_pkey",
DROP COLUMN "id",
ADD COLUMN     "entityId" SERIAL NOT NULL,
ADD CONSTRAINT "Entity_pkey" PRIMARY KEY ("entityId");

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
DROP COLUMN "id",
ADD COLUMN     "roleId" SERIAL NOT NULL,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("roleId");

-- AlterTable
ALTER TABLE "Tool" DROP CONSTRAINT "Tool_pkey",
DROP COLUMN "id",
ADD COLUMN     "toolId" SERIAL NOT NULL,
ADD CONSTRAINT "Tool_pkey" PRIMARY KEY ("toolId");

-- AlterTable
ALTER TABLE "ToolResource" DROP CONSTRAINT "ToolResource_pkey",
DROP COLUMN "id",
ADD COLUMN     "toolResourceId" SERIAL NOT NULL,
ADD CONSTRAINT "ToolResource_pkey" PRIMARY KEY ("toolResourceId");

-- AlterTable
ALTER TABLE "ToolResourceAccessLevel" DROP CONSTRAINT "ToolResourceAccessLevel_pkey",
DROP COLUMN "id",
ADD COLUMN     "toolResourceAccessId" SERIAL NOT NULL,
ADD CONSTRAINT "ToolResourceAccessLevel_pkey" PRIMARY KEY ("toolResourceAccessId");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "userId" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userId");

-- AddForeignKey
ALTER TABLE "EntityTool" ADD CONSTRAINT "EntityTool_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("entityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityTool" ADD CONSTRAINT "EntityTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("toolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolResource" ADD CONSTRAINT "ToolResource_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("toolId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolResourceAccessLevel" ADD CONSTRAINT "ToolResourceAccessLevel_toolResourceId_fkey" FOREIGN KEY ("toolResourceId") REFERENCES "ToolResource"("toolResourceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleToolPermission" ADD CONSTRAINT "RoleToolPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("roleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleToolPermission" ADD CONSTRAINT "RoleToolPermission_toolResourceAccessId_fkey" FOREIGN KEY ("toolResourceAccessId") REFERENCES "ToolResourceAccessLevel"("toolResourceAccessId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntityRole" ADD CONSTRAINT "UserEntityRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntityRole" ADD CONSTRAINT "UserEntityRole_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("entityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntityRole" ADD CONSTRAINT "UserEntityRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("roleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToolAccount" ADD CONSTRAINT "UserToolAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToolAccount" ADD CONSTRAINT "UserToolAccount_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("toolId") ON DELETE RESTRICT ON UPDATE CASCADE;
