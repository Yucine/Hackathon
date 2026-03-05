-- CreateTable
CREATE TABLE "Network" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cidr" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    CONSTRAINT "Network_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VM" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cpu" INTEGER NOT NULL,
    "ram" INTEGER NOT NULL,
    "disk" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "ip" TEXT,
    "containerId" TEXT,
    "tenantId" INTEGER NOT NULL,
    "nodeId" INTEGER,
    "networkId" INTEGER,
    CONSTRAINT "VM_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VM_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "ComputeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VM_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VM" ("cpu", "disk", "id", "ip", "name", "nodeId", "ram", "status", "tenantId") SELECT "cpu", "disk", "id", "ip", "name", "nodeId", "ram", "status", "tenantId" FROM "VM";
DROP TABLE "VM";
ALTER TABLE "new_VM" RENAME TO "VM";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
