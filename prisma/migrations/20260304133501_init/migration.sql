-- CreateTable
CREATE TABLE "Tenant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cpuQuota" INTEGER NOT NULL,
    "ramQuota" INTEGER NOT NULL,
    "diskQuota" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ComputeNode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cpuTotal" INTEGER NOT NULL,
    "ramTotal" INTEGER NOT NULL,
    "cpuUsed" INTEGER NOT NULL DEFAULT 0,
    "ramUsed" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "VM" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cpu" INTEGER NOT NULL,
    "ram" INTEGER NOT NULL,
    "disk" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'stopped',
    "ip" TEXT,
    "tenantId" INTEGER NOT NULL,
    "nodeId" INTEGER,
    CONSTRAINT "VM_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VM_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "ComputeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
