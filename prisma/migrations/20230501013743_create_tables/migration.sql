-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "githubUsername" TEXT,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" SERIAL NOT NULL,
    "parentEntityId" INTEGER,
    "entityName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "hierarchyIds" TEXT NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityTool" (
    "entityId" INTEGER NOT NULL,
    "toolId" INTEGER NOT NULL,
    "toolRefIds" TEXT NOT NULL,

    CONSTRAINT "EntityTool_pkey" PRIMARY KEY ("entityId","toolId")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" SERIAL NOT NULL,
    "toolName" TEXT NOT NULL,
    "toolCode" TEXT NOT NULL,
    "toolRefDescription" TEXT NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolResource" (
    "id" SERIAL NOT NULL,
    "parentToolResourceId" INTEGER,
    "toolId" INTEGER NOT NULL,
    "actionName" TEXT NOT NULL,
    "endpointUrl" TEXT NOT NULL,

    CONSTRAINT "ToolResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolResourceAccessLevel" (
    "id" SERIAL NOT NULL,
    "toolResourceId" INTEGER NOT NULL,
    "accessName" TEXT NOT NULL,
    "accessKey" TEXT NOT NULL,

    CONSTRAINT "ToolResourceAccessLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleToolPermission" (
    "roleId" INTEGER NOT NULL,
    "toolResourceAccessId" INTEGER NOT NULL,

    CONSTRAINT "RoleToolPermission_pkey" PRIMARY KEY ("roleId","toolResourceAccessId")
);

-- CreateTable
CREATE TABLE "UserEntityRole" (
    "userId" INTEGER NOT NULL,
    "entityId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "UserEntityRole_pkey" PRIMARY KEY ("userId","entityId","roleId")
);

-- CreateTable
CREATE TABLE "UserToolAccount" (
    "userId" INTEGER NOT NULL,
    "toolId" INTEGER NOT NULL,
    "userToolUsername" TEXT NOT NULL,

    CONSTRAINT "UserToolAccount_pkey" PRIMARY KEY ("userId","toolId")
);

-- AddForeignKey
ALTER TABLE "EntityTool" ADD CONSTRAINT "EntityTool_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityTool" ADD CONSTRAINT "EntityTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolResource" ADD CONSTRAINT "ToolResource_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolResourceAccessLevel" ADD CONSTRAINT "ToolResourceAccessLevel_toolResourceId_fkey" FOREIGN KEY ("toolResourceId") REFERENCES "ToolResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleToolPermission" ADD CONSTRAINT "RoleToolPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleToolPermission" ADD CONSTRAINT "RoleToolPermission_toolResourceAccessId_fkey" FOREIGN KEY ("toolResourceAccessId") REFERENCES "ToolResourceAccessLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntityRole" ADD CONSTRAINT "UserEntityRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntityRole" ADD CONSTRAINT "UserEntityRole_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEntityRole" ADD CONSTRAINT "UserEntityRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToolAccount" ADD CONSTRAINT "UserToolAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToolAccount" ADD CONSTRAINT "UserToolAccount_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
